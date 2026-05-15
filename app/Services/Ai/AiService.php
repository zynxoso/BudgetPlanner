<?php

namespace App\Services\Ai;

use App\Models\Allowance;
use App\Models\Category;
use App\Models\Loan;
use App\Models\SavingsGoal;
use App\Models\Transaction;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class AiService
{
    public function __construct(private readonly GeminiClient $client)
    {
    }

    public function chat(User $user, string $message, array $history = []): array
    {
        $summary = $this->buildSummary($user);

        $system = implode("\n", [
            'You are a budgeting assistant inside a personal finance app.',
            'Use only the provided context. If data is missing, say so.',
            'Write in a blunt, direct, no-fluff tone. Short sentences.',
            'Be ethical and avoid harm.',
            'Avoid legal, tax, or investment advice. Provide informational guidance only.',
            'Do not claim compliance or certification with any standard.',
            'If referencing standards, keep it general and avoid promises.',
            'Output plain text only. No markdown, no bullets, no asterisks.',
            'Always respond in two parts:',
            'Summary: one sentence.',
            'Actions: 1. ... 2. ... 3. ... (numbered, short, direct).',
            'If helpful, prefix actions with a short label like "Expense cut:".',
            'Do not request secrets, passwords, or API keys.',
        ]);

        $contents = $this->buildHistoryContents($history);
        $contextText = $this->formatContext([
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
            'max_output_tokens' => 450,
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

        $system = implode("\n", [
            'You are a financial insights assistant.',
            'Return JSON only in the format: {"insights":["..."]}.',
            'Each insight must be <= 20 words and based only on provided data.',
            'If data is insufficient, include a single insight explaining that.',
        ]);

        $contents = [
            [
                'role' => 'user',
                'parts' => [
                    ['text' => $this->formatContext(['summary' => $summary, 'reports' => $reports])],
                ],
            ],
        ];

        $result = $this->client->generate($contents, [
            'temperature' => 0.3,
            'max_output_tokens' => 320,
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
            ->map(fn ($item) => trim($item))
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
            ->where('user_id', $user->id)
            ->orWhereNull('user_id')
            ->orderBy('name')
            ->get();

        if ($categories->isEmpty()) {
            return [
                'status' => 'unavailable',
                'message' => 'No categories available yet. Please create a category first.',
                'fallback' => true,
            ];
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

        $result = $this->client->generate($contents, [
            'temperature' => 0.2,
            'max_output_tokens' => 200,
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

    private function buildSummary(User $user): array
    {
        $userId = $user->id;

        $transactionTotals = Transaction::query()
            ->ownedBy($userId)
            ->selectRaw("COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income")
            ->selectRaw("COALESCE(SUM(CASE WHEN type = 'income' AND is_spent = 1 THEN amount ELSE 0 END), 0) as spent_income")
            ->selectRaw("COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expenses")
            ->first();

        $totalIncome = (float) $transactionTotals->total_income;
        $spentIncome = (float) $transactionTotals->spent_income;
        $totalExpenses = (float) $transactionTotals->total_expenses;
        $effectiveExpenses = $totalExpenses + $spentIncome;
        $currentBalance = $totalIncome - $effectiveExpenses;

        $now = Carbon::now();
        $totalMonthlyBudget = (float) $user->budgets()
            ->where('month', $now->month)
            ->where('year', $now->year)
            ->sum('amount_limit');

        $monthlyExpenses = (float) Transaction::query()
            ->ownedBy($userId)
            ->ofType('expense')
            ->whereMonth('date', $now->month)
            ->whereYear('date', $now->year)
            ->sum('amount');

        $remainingBudget = $totalMonthlyBudget - $monthlyExpenses;

        $topCategories = Transaction::query()
            ->ownedBy($userId)
            ->ofType('expense')
            ->whereMonth('date', $now->month)
            ->whereYear('date', $now->year)
            ->selectRaw('category_id, sum(amount) as total')
            ->groupBy('category_id')
            ->with('category:id,name')
            ->orderByDesc('total')
            ->limit(3)
            ->get()
            ->map(function ($item) use ($totalMonthlyBudget) {
                return [
                    'name' => $item->category->name ?? 'Uncategorized',
                    'percentage' => $totalMonthlyBudget > 0 ? ($item->total / $totalMonthlyBudget) * 100 : 0,
                    'amount' => (float) $item->total,
                ];
            })
            ->values()
            ->all();

        return [
            'current_balance' => $currentBalance,
            'total_income' => $totalIncome,
            'total_expenses' => $effectiveExpenses,
            'remaining_budget' => $remainingBudget,
            'top_categories' => $topCategories,
            'total_savings' => (float) SavingsGoal::where('user_id', $userId)->sum('current_amount'),
            'total_loans_outstanding' => (float) Loan::where('user_id', $userId)->sum('remaining_amount'),
            'total_allowances' => (float) Allowance::where('user_id', $userId)->sum('amount'),
        ];
    }

    private function buildReportsContext(User $user): array
    {
        $userId = $user->id;
        $now = Carbon::now();

        $categorySummary = Transaction::query()
            ->ownedBy($userId)
            ->ofType('expense')
            ->whereMonth('date', $now->month)
            ->whereYear('date', $now->year)
            ->selectRaw('category_id, sum(amount) as total')
            ->groupBy('category_id')
            ->with('category:id,name')
            ->get()
            ->map(function ($item) {
                return [
                    'name' => $item->category->name ?? 'Uncategorized',
                    'value' => (float) $item->total,
                ];
            })
            ->values()
            ->all();

        $trendTransactions = Transaction::query()
            ->ownedBy($userId)
            ->whereBetween('date', [$now->copy()->subMonths(5)->startOfMonth(), $now->copy()->endOfMonth()])
            ->get(['date', 'amount', 'type', 'is_spent']);

        $trendByMonth = $trendTransactions->groupBy(function (Transaction $transaction): string {
            return Carbon::parse($transaction->date)->format('Y-n');
        });

        $trend = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = $now->copy()->subMonths($i);
            $monthTotals = $trendByMonth->get($month->format('Y-n'), collect());

            $trend[] = [
                'month' => $month->format('M'),
                'income' => (float) $monthTotals->where('type', 'income')->sum('amount'),
                'expense' => (float) (
                    $monthTotals->where('type', 'expense')->sum('amount') +
                    $monthTotals->where('type', 'income')->where('is_spent', true)->sum('amount')
                ),
            ];
        }

        $loans = Loan::query()
            ->where('user_id', $userId)
            ->select(['amount', 'remaining_amount'])
            ->get();

        $savings = SavingsGoal::query()
            ->where('user_id', $userId)
            ->select(['target_amount', 'current_amount'])
            ->get();

        return [
            'category_summary' => $categorySummary,
            'trend' => $trend,
            'loan_summary' => [
                'total_original' => (float) $loans->sum('amount'),
                'total_remaining' => (float) $loans->sum('remaining_amount'),
                'total_paid' => (float) ($loans->sum('amount') - $loans->sum('remaining_amount')),
            ],
            'savings_summary' => [
                'total_target' => (float) $savings->sum('target_amount'),
                'total_current' => (float) $savings->sum('current_amount'),
                'total_needed' => (float) ($savings->sum('target_amount') - $savings->sum('current_amount')),
            ],
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
            'AI is temporarily unavailable. Current balance: %.2f. Remaining budget: %.2f. Top categories: %s.',
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
            sprintf('Current balance is %.2f with remaining budget %.2f.', $summary['current_balance'] ?? 0, $summary['remaining_budget'] ?? 0),
        ];

        $topCategory = $summary['top_categories'][0]['name'] ?? null;
        if ($topCategory) {
            $insights[] = "Top spending category this month: {$topCategory}.";
        }

        $loanRemaining = $reports['loan_summary']['total_remaining'] ?? null;
        if ($loanRemaining !== null) {
            $insights[] = sprintf('Outstanding loans remaining: %.2f.', $loanRemaining);
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
        $cleaned = str_replace('*', '', $text);
        $cleaned = preg_replace('/\s+/', ' ', $cleaned) ?? $cleaned;

        return $this->ensureStructuredReply(trim($cleaned));
    }

    private function ensureStructuredReply(string $text): string
    {
        $hasSummary = stripos($text, 'Summary:') !== false;
        $hasActions = stripos($text, 'Actions:') !== false;

        if ($hasSummary && $hasActions) {
            return $text;
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

        return "Summary: {$summary}\nActions: ".implode(' ', $actionLines);
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
