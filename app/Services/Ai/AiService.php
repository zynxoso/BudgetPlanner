<?php

namespace App\Services\Ai;

use App\Models\Allowance;
use App\Models\Category;
use App\Models\Loan;
use App\Models\SavingsGoal;
use App\Models\Transaction;
use App\Models\User;
use App\Services\FinanceSummaryService;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;

class AiService
{
    public function __construct(
        private readonly GeminiClient $client,
        private readonly FinanceSummaryService $financeSummary
    ) {
    }

    public function chat(User $user, string $message, array $history = []): array
    {
        $summary = $this->buildSummary($user);

        $system = implode("\n", [
            'You are a budgeting assistant inside a personal finance app for the Philippines.',
            'The currency is Philippine Peso (₱ / PHP). Always format monetary amounts with the ₱ symbol (e.g. ₱1,200.00, ₱51,900). Never use $ or USD.',
            'Use only the provided context. If data is missing, say so.',
            'Write in a blunt, direct, no-fluff tone. Short sentences.',
            'Be ethical and avoid harm.',
            'Avoid legal, tax, or investment advice. Provide informational guidance only.',
            'Do not claim compliance or certification with any standard.',
            'If referencing standards, keep it general and avoid promises.',
            'Output clean plain text with organized spacing and line breaks.',
            'Always respond in two sections:',
            'Summary: [one clear sentence summarizing the status]',
            '',
            'Actions:',
            '1. [Action 1]',
            '2. [Action 2]',
            '3. [Action 3]',
            'If helpful, prefix actions with a short label like "Expense cut:".',
            'Do not request secrets, passwords, or API keys.',
        ]);

        // Sliding window of last 4 turns (2 user, 2 assistant) to minimize context token usage
        $contents = $this->buildHistoryContents(array_slice($history, -4));
        $contextText = $this->formatContext([
            'currency' => 'PHP (₱)',
            'summary' => $summary,
        ]);

        $contents[] = [
            'role' => 'user',
            'parts' => [
                ['text' => "Context:\n{$contextText}\n\nUser message:\n{$message}"],
            ],
        ];

        $result = $this->client->generate($contents, [
            'temperature' => 0.4,
            'max_output_tokens' => 350,
            'system_instruction' => $system,
        ]);

        if (! $result['ok']) {
            return $this->fallbackChat($summary, $result);
        }

        return [
            'status' => 'ok',
            'reply' => $this->sanitizeChatReply($result['text']),
            'fallback' => false,
            'meta' => $this->buildMeta($result),
        ];
    }

    public function insights(User $user): array
    {
        $summary = $this->buildSummary($user);
        $reports = $this->buildReportsContext($user);

        $contextHash = md5(serialize($summary).serialize($reports));
        $cacheKey = "finance:{$user->id}:ai_insights:{$contextHash}";

        return Cache::remember($cacheKey, now()->addHours(6), function () use ($user, $summary, $reports) {
            return $this->generateInsights($user, $summary, $reports);
        });
    }

    private function generateInsights(User $user, array $summary, array $reports): array
    {
        $system = implode("\n", [
            'You are a financial insights assistant for the Philippines.',
            'The currency is Philippine Peso (₱ / PHP). Always format currency amounts with the ₱ symbol (e.g. ₱1,200). Never use $ or USD.',
            'Return JSON only in the format: {"insights":["..."]}.',
            'Each insight must be <= 20 words and based only on provided data.',
            'If data is insufficient, include a single insight explaining that.',
        ]);

        $contents = [
            [
                'role' => 'user',
                'parts' => [
                    ['text' => $this->formatContext(['currency' => 'PHP (₱)', 'summary' => $summary, 'reports' => $reports])],
                ],
            ],
        ];

        $result = $this->client->generate($contents, [
            'temperature' => 0.3,
            'max_output_tokens' => 250,
            'response_mime_type' => 'application/json',
            'system_instruction' => $system,
        ]);

        if (! $result['ok']) {
            return $this->fallbackInsights($summary, $reports, $result);
        }

        $decoded = $this->decodeJsonFromText($result['text']);
        $insights = is_array($decoded) ? ($decoded['insights'] ?? null) : null;

        if (! is_array($insights)) {
            return $this->fallbackInsights($summary, $reports, $result);
        }

        $cleanInsights = collect($insights)
            ->filter(fn ($item) => is_string($item) && trim($item) !== '')
            ->map(fn ($item) => preg_replace('/\$(\d)/', '₱$1', trim($item)))
            ->values()
            ->all();

        if ($cleanInsights === []) {
            return $this->fallbackInsights($summary, $reports, $result);
        }

        return [
            'status' => 'ok',
            'insights' => $cleanInsights,
            'fallback' => false,
            'meta' => $this->buildMeta($result),
        ];
    }

    public function categorize(User $user, array $payload): array
    {
        $categories = Category::query()
            ->select(['id', 'name'])
            ->where(function ($query) use ($user) {
                $query->where('user_id', $user->id)
                    ->orWhereNull('user_id');
            })
            ->orderBy('name')
            ->get();

        if ($categories->isEmpty()) {
            return [
                'status' => 'unavailable',
                'message' => 'No categories available yet. Please create a category first.',
                'fallback' => true,
            ];
        }

        // Fast rule-based categorization before external LLM call
        $fastMatch = $this->matchFastCategory($user, $categories, $payload);
        if ($fastMatch !== null) {
            return $fastMatch;
        }

        $system = implode("\n", [
            'You are a transaction categorization assistant.',
            'Return JSON only: {"category_id": number, "confidence": 0-1, "reason": "..."}.',
            'Choose only from the provided category IDs. Keep reason <= 12 words.',
        ]);

        $transaction = [
            'amount' => (float) $payload['amount'],
            'date' => $payload['date'] ?? null,
            'notes' => $payload['notes'] ?? null,
        ];

        $context = [
            'transaction' => $transaction,
            'categories' => $categories->map(fn (Category $category) => [
                'id' => $category->id,
                'name' => $category->name,
            ])->values()->all(),
        ];

        $contents = [
            [
                'role' => 'user',
                'parts' => [
                    ['text' => $this->formatContext($context)],
                ],
            ],
        ];

        // Model tiering: Use lightweight/fast model with tightened token cap for simple classification
        $liteModel = config('services.gemini.model_lite') ?: config('services.gemini.model');
        $result = $this->client->generate($contents, [
            'model' => $liteModel,
            'temperature' => 0.2,
            'max_output_tokens' => 100,
            'response_mime_type' => 'application/json',
            'system_instruction' => $system,
        ]);

        if (! $result['ok']) {
            return $this->fallbackCategorize($user, $categories, $payload, $result);
        }

        $decoded = $this->decodeJsonFromText($result['text']) ?? [];
        $categoryId = isset($decoded['category_id']) ? (int) $decoded['category_id'] : null;
        $confidence = $this->normalizeConfidence($decoded['confidence'] ?? null);
        $reason = is_string($decoded['reason'] ?? null) ? trim($decoded['reason']) : '';

        $category = $categoryId
            ? $categories->firstWhere('id', $categoryId)
            : null;

        if (! $category) {
            return $this->fallbackCategorize($user, $categories, $payload, $result);
        }

        $status = $confidence >= 0.6 ? 'suggested' : 'needs_review';

        return [
            'status' => $status,
            'suggestion' => [
                'category_id' => $category->id,
                'category_name' => $category->name,
                'confidence' => $confidence,
                'reason' => $reason,
            ],
            'message' => $status === 'needs_review' ? 'Low confidence. Please review before applying.' : null,
            'fallback' => false,
            'meta' => $this->buildMeta($result),
        ];
    }

    private const MERCHANT_CATEGORY_MAP = [
        // Food & Fast Food
        'jollibee' => ['Food', 'Dining', 'Fast Food', 'Meals'],
        'mcdo' => ['Food', 'Dining', 'Fast Food', 'Meals'],
        'mcdonald' => ['Food', 'Dining', 'Fast Food', 'Meals'],
        'chowking' => ['Food', 'Dining', 'Fast Food', 'Meals'],
        'mang inasal' => ['Food', 'Dining', 'Fast Food', 'Meals'],
        'kfc' => ['Food', 'Dining', 'Fast Food', 'Meals'],
        'greenwich' => ['Food', 'Dining', 'Fast Food', 'Meals'],
        'starbucks' => ['Coffee', 'Food', 'Beverage', 'Dining', 'Snacks'],
        'foodpanda' => ['Food', 'Delivery', 'Dining'],
        'grabfood' => ['Food', 'Delivery', 'Dining'],

        // Groceries & Supermarkets
        'puregold' => ['Groceries', 'Food', 'Supermarket', 'Supplies'],
        'sm supermarket' => ['Groceries', 'Food', 'Shopping'],
        'sm hypermarket' => ['Groceries', 'Food', 'Shopping'],
        'robinsons supermarket' => ['Groceries', 'Food', 'Shopping'],
        'waltermart' => ['Groceries', 'Food', 'Shopping'],
        'landers' => ['Groceries', 'Food', 'Shopping'],
        'snr' => ['Groceries', 'Food', 'Shopping'],
        's&r' => ['Groceries', 'Food', 'Shopping'],
        '7-eleven' => ['Snacks', 'Food', 'Groceries', 'Convenience'],
        '7eleven' => ['Snacks', 'Food', 'Groceries', 'Convenience'],
        'uncle john' => ['Snacks', 'Food', 'Groceries'],

        // Utilities & Telecom
        'meralco' => ['Utilities', 'Electricity', 'Bills', 'Housing'],
        'maynilad' => ['Utilities', 'Water', 'Bills', 'Housing'],
        'manila water' => ['Utilities', 'Water', 'Bills', 'Housing'],
        'pldt' => ['Utilities', 'Internet', 'Bills', 'Telecom'],
        'converge' => ['Utilities', 'Internet', 'Bills', 'Telecom'],
        'globe' => ['Utilities', 'Internet', 'Bills', 'Phone', 'Telecom'],
        'smart' => ['Utilities', 'Internet', 'Bills', 'Phone', 'Telecom'],
        'dito' => ['Utilities', 'Internet', 'Bills', 'Phone', 'Telecom'],

        // Transportation & Fuel
        'shell' => ['Transportation', 'Gas', 'Fuel', 'Auto'],
        'petron' => ['Transportation', 'Gas', 'Fuel', 'Auto'],
        'caltex' => ['Transportation', 'Gas', 'Fuel', 'Auto'],
        'seaoil' => ['Transportation', 'Gas', 'Fuel', 'Auto'],
        'cleanfuel' => ['Transportation', 'Gas', 'Fuel', 'Auto'],
        'grab' => ['Transportation', 'Travel', 'Commute'],
        'angkas' => ['Transportation', 'Travel', 'Commute'],
        'joyride' => ['Transportation', 'Travel', 'Commute'],
        'move it' => ['Transportation', 'Travel', 'Commute'],
        'lrt' => ['Transportation', 'Travel', 'Commute'],
        'mrt' => ['Transportation', 'Travel', 'Commute'],
        'easytrip' => ['Transportation', 'Toll', 'Auto'],
        'autosweep' => ['Transportation', 'Toll', 'Auto'],

        // Shopping & Retail
        'shopee' => ['Shopping', 'Online Shopping', 'Personal', 'Retail'],
        'lazada' => ['Shopping', 'Online Shopping', 'Personal', 'Retail'],
        'tiktok shop' => ['Shopping', 'Online Shopping', 'Personal'],
        'zalora' => ['Shopping', 'Clothing', 'Fashion'],
        'uniqlo' => ['Shopping', 'Clothing', 'Fashion'],
        'sm store' => ['Shopping', 'Department Store', 'Clothing'],

        // Healthcare & Pharmacy
        'mercury drug' => ['Healthcare', 'Medicine', 'Medical', 'Health'],
        'watsons' => ['Healthcare', 'Personal Care', 'Medicine', 'Beauty'],
        'generika' => ['Healthcare', 'Medicine', 'Medical'],

        // Subscriptions & Streaming
        'netflix' => ['Entertainment', 'Subscriptions', 'Media', 'Streaming'],
        'spotify' => ['Entertainment', 'Subscriptions', 'Music', 'Streaming'],
        'youtube premium' => ['Entertainment', 'Subscriptions', 'Streaming'],
        'disney' => ['Entertainment', 'Subscriptions', 'Streaming'],
        'hbo' => ['Entertainment', 'Subscriptions', 'Streaming'],
    ];

    private function matchFastCategory(User $user, Collection $categories, array $payload): ?array
    {
        $notes = is_string($payload['notes'] ?? null) ? trim($payload['notes']) : '';
        if ($notes === '') {
            return null;
        }

        // 1. History Match: Check if user previously categorized an expense with the same note/merchant
        $historyCategoryMatch = Transaction::query()
            ->ownedBy($user->id)
            ->ofType('expense')
            ->whereNotNull('category_id')
            ->whereRaw('LOWER(notes) = ?', [mb_strtolower($notes)])
            ->selectRaw('category_id, COUNT(*) as match_count')
            ->groupBy('category_id')
            ->orderByDesc('match_count')
            ->first();

        if ($historyCategoryMatch) {
            $category = $categories->firstWhere('id', (int) $historyCategoryMatch->category_id);
            if ($category) {
                return [
                    'status' => 'suggested',
                    'suggestion' => [
                        'category_id' => $category->id,
                        'category_name' => $category->name,
                        'confidence' => 0.95,
                        'reason' => 'Matched from your transaction history.',
                    ],
                    'message' => null,
                    'fallback' => false,
                    'meta' => [
                        'model' => 'history_match',
                        'latency_ms' => 0,
                    ],
                ];
            }
        }

        // 2. Keyword Match: Check if note contains any exact category name keyword
        foreach ($categories as $category) {
            if (stripos($notes, (string) $category->name) !== false) {
                return [
                    'status' => 'suggested',
                    'suggestion' => [
                        'category_id' => $category->id,
                        'category_name' => $category->name,
                        'confidence' => 0.90,
                        'reason' => "Keyword matched with '{$category->name}'.",
                    ],
                    'message' => null,
                    'fallback' => false,
                    'meta' => [
                        'model' => 'keyword_match',
                        'latency_ms' => 0,
                    ],
                ];
            }
        }

        // 3. Philippine Merchant / Utility Dictionary Match (0ms, 0 API Calls)
        $lowerNotes = mb_strtolower($notes);
        foreach (self::MERCHANT_CATEGORY_MAP as $brand => $targetCategoryKeywords) {
            if (str_contains($lowerNotes, $brand)) {
                foreach ($targetCategoryKeywords as $keyword) {
                    $matchedCategory = $categories->first(function ($cat) use ($keyword) {
                        return stripos($cat->name, $keyword) !== false || stripos($keyword, $cat->name) !== false;
                    });

                    if ($matchedCategory) {
                        return [
                            'status' => 'suggested',
                            'suggestion' => [
                                'category_id' => $matchedCategory->id,
                                'category_name' => $matchedCategory->name,
                                'confidence' => 0.95,
                                'reason' => "Matched Philippine brand '{$brand}'.",
                            ],
                            'message' => null,
                            'fallback' => false,
                            'meta' => [
                                'model' => 'merchant_dictionary',
                                'latency_ms' => 0,
                            ],
                        ];
                    }
                }
            }
        }

        return null;
    }

    private function buildSummary(User $user): array
    {
        return $this->financeSummary->getAiSummary($user->id);
    }

    private function buildReportsContext(User $user): array
    {
        $now = Carbon::now();
        $categorySummary = $this->financeSummary->getCategorySummary($user->id, $now)
            ->map(fn ($item) => [
                'name' => $item['name'],
                'value' => (float) $item['value'],
            ])
            ->values()
            ->all();

        $monthlyTrend = $this->financeSummary->getMonthlyTrend($user->id, $now, 6);

        return [
            'category_summary' => $categorySummary,
            'trend' => $monthlyTrend['trend'],
            'loan_summary' => $this->financeSummary->getLoanSummary($user->id),
            'savings_summary' => $this->financeSummary->getSavingsSummary($user->id),
        ];
    }

    private function buildHistoryContents(array $history): array
    {
        $contents = [];

        foreach ($history as $item) {
            if (! is_array($item)) {
                continue;
            }

            $role = ($item['role'] ?? '') === 'assistant' ? 'model' : 'user';
            $content = is_string($item['content'] ?? null) ? trim($item['content']) : '';

            if ($content === '') {
                continue;
            }

            $contents[] = [
                'role' => $role,
                'parts' => [
                    ['text' => $content],
                ],
            ];
        }

        return $contents;
    }

    private function formatContext(array $context): string
    {
        $encoded = json_encode($context, JSON_UNESCAPED_SLASHES);

        return $encoded === false ? '{}' : $encoded;
    }

    private function decodeJsonFromText(string $text): ?array
    {
        $trimmed = trim($text);
        $decoded = json_decode($trimmed, true);

        if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
            return $decoded;
        }

        if (preg_match('/\{.*\}/s', $text, $matches)) {
            $decoded = json_decode($matches[0], true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                return $decoded;
            }
        }

        return null;
    }

    private function normalizeConfidence(mixed $value): float
    {
        $confidence = is_numeric($value) ? (float) $value : 0.0;

        if ($confidence < 0) {
            return 0.0;
        }

        if ($confidence > 1) {
            return 1.0;
        }

        return $confidence;
    }

    private function fallbackChat(array $summary, array $result): array
    {
        $message = sprintf(
            'AI is temporarily unavailable. Current balance: ₱%.2f. Remaining budget: ₱%.2f. Top categories: %s.',
            $summary['current_balance'] ?? 0,
            $summary['remaining_budget'] ?? 0,
            $this->formatCategoryNames($summary['top_categories'] ?? [])
        );

        return [
            'status' => 'fallback',
            'reply' => $this->sanitizeChatReply($message),
            'fallback' => true,
            'message' => 'AI is unavailable. Showing a brief summary instead.',
            'meta' => $this->buildMeta($result),
        ];
    }

    private function fallbackInsights(array $summary, array $reports, array $result): array
    {
        $insights = [
            sprintf('Current balance is ₱%.2f with remaining budget ₱%.2f.', $summary['current_balance'] ?? 0, $summary['remaining_budget'] ?? 0),
        ];

        $topCategory = $summary['top_categories'][0]['name'] ?? null;
        if ($topCategory) {
            $insights[] = "Top spending category this month: {$topCategory}.";
        }

        $loanRemaining = $reports['loan_summary']['total_remaining'] ?? null;
        if ($loanRemaining !== null) {
            $insights[] = sprintf('Outstanding loans remaining: ₱%.2f.', $loanRemaining);
        }

        return [
            'status' => 'fallback',
            'insights' => $insights,
            'fallback' => true,
            'message' => 'AI is unavailable. Showing fallback insights instead.',
            'meta' => $this->buildMeta($result),
        ];
    }

    private function fallbackCategorize(User $user, Collection $categories, array $payload, array $result): array
    {
        $notes = is_string($payload['notes'] ?? null) ? strtolower($payload['notes']) : '';
        $fallbackCategory = null;

        if ($notes !== '') {
            foreach ($categories as $category) {
                if (str_contains($notes, strtolower($category->name))) {
                    $fallbackCategory = $category;
                    break;
                }
            }
        }

        if (! $fallbackCategory) {
            $fallbackCategoryId = Transaction::query()
                ->ownedBy($user->id)
                ->ofType('expense')
                ->whereNotNull('category_id')
                ->where('date', '>=', now()->subDays(90))
                ->selectRaw('category_id, sum(amount) as total')
                ->groupBy('category_id')
                ->orderByDesc('total')
                ->value('category_id');

            $fallbackCategory = $categories->firstWhere('id', $fallbackCategoryId) ?? $categories->first();
        }

        if (! $fallbackCategory) {
            return [
                'status' => 'unavailable',
                'message' => 'No category suggestion available yet.',
                'fallback' => true,
                'meta' => $this->buildMeta($result),
            ];
        }

        return [
            'status' => 'fallback',
            'suggestion' => [
                'category_id' => $fallbackCategory->id,
                'category_name' => $fallbackCategory->name,
                'confidence' => 0.35,
                'reason' => 'Fallback suggestion based on recent activity.',
            ],
            'message' => 'AI is unavailable. This is a best-effort suggestion.',
            'fallback' => true,
            'meta' => $this->buildMeta($result),
        ];
    }

    private function buildMeta(array $result): array
    {
        return [
            'model' => $result['model'] ?? null,
            'latency_ms' => $result['latency_ms'] ?? null,
        ];
    }

    private function sanitizeChatReply(string $text): string
    {
        $cleaned = str_replace(['*', '#', '`'], '', $text);
        // Normalize currency symbols: replace $ preceding numbers or USD with ₱
        $cleaned = preg_replace('/\$(\d)/', '₱$1', $cleaned) ?? $cleaned;
        $cleaned = preg_replace('/\bUSD\s*(\d)/i', '₱$1', $cleaned) ?? $cleaned;
        // Normalize line breaks
        $cleaned = str_replace(["\r\n", "\r"], "\n", $cleaned);
        // Replace horizontal whitespace runs on same line with a single space
        $cleaned = preg_replace('/[^\S\n]+/', ' ', $cleaned) ?? $cleaned;
        // Collapse excessive newlines
        $cleaned = preg_replace("/\n{3,}/", "\n\n", $cleaned) ?? $cleaned;

        return $this->ensureStructuredReply(trim($cleaned));
    }

    private function ensureStructuredReply(string $text): string
    {
        if (preg_match('/Summary:\s*(.+?)(?:\n+|\s+)Actions:\s*(.+)$/s', $text, $matches)) {
            $summary = trim($matches[1]);
            $actionsRaw = trim($matches[2]);

            $actionItems = preg_split('/(?=\b\d+\.\s+)/', $actionsRaw, -1, PREG_SPLIT_NO_EMPTY);
            $cleanActions = [];
            foreach ($actionItems as $item) {
                $trimmed = trim($item);
                if ($trimmed !== '') {
                    $cleanActions[] = $trimmed;
                }
            }

            if (! empty($cleanActions)) {
                return "Summary: {$summary}\n\nActions:\n".implode("\n", $cleanActions);
            }
        }

        $sentences = preg_split('/(?<=[.!?])\s+/', $text) ?: [];
        $summary = trim($sentences[0] ?? $text);
        $actionSentences = array_slice($sentences, 1, 3);

        if ($actionSentences === []) {
            $actionSentences = ['Log income and expenses to improve accuracy.'];
        }

        $actions = [];
        foreach ($actionSentences as $sentence) {
            $clean = trim($sentence);
            if ($clean === '') {
                continue;
            }
            $actions[] = rtrim($clean, '.').'.';
        }

        if ($actions === []) {
            $actions = ['Log income and expenses to improve accuracy.'];
        }

        $actionLines = [];
        foreach ($actions as $index => $action) {
            $actionLines[] = ($index + 1).'. '.$action;
        }

        return "Summary: {$summary}\n\nActions:\n".implode("\n", $actionLines);
    }

    private function formatCategoryNames(array $categories): string
    {
        $names = collect($categories)
            ->map(fn ($item) => $item['name'] ?? null)
            ->filter()
            ->values()
            ->all();

        if ($names === []) {
            return 'none';
        }

        return implode(', ', $names);
    }
}
