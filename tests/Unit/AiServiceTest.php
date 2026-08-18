<?php

namespace Tests\Unit;

use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use App\Services\Ai\AiService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class AiServiceTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config([
            'services.gemini.key' => 'test-api-key',
            'services.gemini.model' => 'gemini-1.5-flash',
            'services.gemini.base_url' => 'https://generativelanguage.googleapis.com/v1beta',
        ]);

        Cache::flush();
    }

    public function test_categorize_uses_history_match_instantly_without_calling_gemini(): void
    {
        Http::fake();

        $user = User::factory()->create();
        $category = Category::create([
            'user_id' => $user->id,
            'name' => 'Coffee & Snacks',
            'icon' => 'coffee',
            'color' => '#6F4E37',
        ]);

        Transaction::create([
            'user_id' => $user->id,
            'category_id' => $category->id,
            'type' => 'expense',
            'amount' => 250,
            'date' => now()->toDateString(),
            'notes' => 'Starbucks Reserve',
        ]);

        $aiService = app(AiService::class);
        $result = $aiService->categorize($user, [
            'amount' => 220,
            'notes' => 'starbucks reserve',
        ]);

        $this->assertEquals('suggested', $result['status']);
        $this->assertEquals($category->id, $result['suggestion']['category_id']);
        $this->assertEquals(0.95, $result['suggestion']['confidence']);
        $this->assertEquals('history_match', $result['meta']['model']);
        $this->assertFalse($result['fallback']);

        // Gemini API must not be called
        Http::assertNothingSent();
    }

    public function test_categorize_uses_keyword_match_instantly_without_calling_gemini(): void
    {
        Http::fake();

        $user = User::factory()->create();
        $category = Category::create([
            'user_id' => $user->id,
            'name' => 'Groceries',
            'icon' => 'shopping-cart',
            'color' => '#10B981',
        ]);

        $aiService = app(AiService::class);
        $result = $aiService->categorize($user, [
            'amount' => 1500,
            'notes' => 'Weekly groceries trip at market',
        ]);

        $this->assertEquals('suggested', $result['status']);
        $this->assertEquals($category->id, $result['suggestion']['category_id']);
        $this->assertEquals(0.90, $result['suggestion']['confidence']);
        $this->assertEquals('keyword_match', $result['meta']['model']);
        $this->assertFalse($result['fallback']);

        // Gemini API must not be called
        Http::assertNothingSent();
    }

    public function test_categorize_calls_gemini_when_no_rule_match_found(): void
    {
        $user = User::factory()->create();
        $category = Category::create([
            'user_id' => $user->id,
            'name' => 'Software & Subs',
            'icon' => 'laptop',
            'color' => '#6366F1',
        ]);

        Http::fake([
            '*' => Http::response([
                'candidates' => [
                    [
                        'content' => [
                            'parts' => [
                                ['text' => json_encode(['category_id' => $category->id, 'confidence' => 0.85, 'reason' => 'Online SaaS service'])],
                            ],
                        ],
                    ],
                ],
            ], 200),
        ]);

        $aiService = app(AiService::class);
        $result = $aiService->categorize($user, [
            'amount' => 499,
            'notes' => 'UnknownSaaSMonthlySubscriptionFee',
        ]);

        $this->assertEquals('suggested', $result['status']);
        $this->assertEquals($category->id, $result['suggestion']['category_id']);
        $this->assertEquals(0.85, $result['suggestion']['confidence']);

        Http::assertSentCount(1);
    }

    public function test_insights_caches_result_for_identical_financial_state(): void
    {
        $user = User::factory()->create();

        Http::fake([
            '*' => Http::response([
                'candidates' => [
                    [
                        'content' => [
                            'parts' => [
                                ['text' => json_encode(['insights' => ['Spending is well controlled this month.']])],
                            ],
                        ],
                    ],
                ],
            ], 200),
        ]);

        $aiService = app(AiService::class);

        // First call generates from Gemini
        $result1 = $aiService->insights($user);
        $this->assertEquals('ok', $result1['status']);
        $this->assertEquals(['Spending is well controlled this month.'], $result1['insights']);
        Http::assertSentCount(1);

        // Second call retrieves from cache without invoking Gemini API
        $result2 = $aiService->insights($user);
        $this->assertEquals('ok', $result2['status']);
        $this->assertEquals(['Spending is well controlled this month.'], $result2['insights']);
        Http::assertSentCount(1);
    }

    public function test_chat_sanitizes_dollar_currency_to_peso_symbol(): void
    {
        $user = User::factory()->create();

        Http::fake([
            '*' => Http::response([
                'candidates' => [
                    [
                        'content' => [
                            'parts' => [
                                ['text' => "Summary: Your total outstanding loans are $51,900, with a current balance of $31,188.\n\nActions:\n1. Debt payment: Pay $5,000 toward principal.\n2. Review: Check interest rates.\n3. Expense cut: Cut non-essentials."],
                            ],
                        ],
                    ],
                ],
            ], 200),
        ]);

        $aiService = app(AiService::class);
        $result = $aiService->chat($user, 'How about my loan?');

        $this->assertEquals('ok', $result['status']);
        $this->assertStringContainsString('₱51,900', $result['reply']);
        $this->assertStringContainsString('₱31,188', $result['reply']);
        $this->assertStringContainsString('₱5,000', $result['reply']);
        $this->assertStringNotContainsString('$51,900', $result['reply']);
        $this->assertStringNotContainsString('$31,188', $result['reply']);
    }

    public function test_fallback_chat_formats_with_peso_symbol(): void
    {
        $user = User::factory()->create();

        // Trigger connection error to activate fallback
        Http::fake([
            '*' => Http::response([], 503),
        ]);

        $aiService = app(AiService::class);
        $result = $aiService->chat($user, 'What is my budget?');

        $this->assertEquals('fallback', $result['status']);
        $this->assertTrue($result['fallback']);
        $this->assertStringContainsString('₱', $result['reply']);
    }

    public function test_categorize_matches_philippine_merchants_with_zero_api_calls(): void
    {
        Http::fake();

        $user = User::factory()->create();
        $foodCategory = Category::create([
            'user_id' => $user->id,
            'name' => 'Food & Dining',
            'icon' => 'utensils',
            'color' => '#EF4444',
        ]);
        $utilitiesCategory = Category::create([
            'user_id' => $user->id,
            'name' => 'Utilities & Bills',
            'icon' => 'zap',
            'color' => '#F59E0B',
        ]);
        $transportCategory = Category::create([
            'user_id' => $user->id,
            'name' => 'Transportation',
            'icon' => 'car',
            'color' => '#3B82F6',
        ]);

        $aiService = app(AiService::class);

        // 1. Jollibee -> Food
        $jollibeeResult = $aiService->categorize($user, ['amount' => 350, 'notes' => 'Jollibee delivery']);
        $this->assertEquals($foodCategory->id, $jollibeeResult['suggestion']['category_id']);
        $this->assertEquals('merchant_dictionary', $jollibeeResult['meta']['model']);

        // 2. Meralco -> Utilities
        $meralcoResult = $aiService->categorize($user, ['amount' => 4500, 'notes' => 'Meralco electricity bill']);
        $this->assertEquals($utilitiesCategory->id, $meralcoResult['suggestion']['category_id']);
        $this->assertEquals('merchant_dictionary', $meralcoResult['meta']['model']);

        // 3. Grab -> Transportation
        $grabResult = $aiService->categorize($user, ['amount' => 280, 'notes' => 'Grab ride to office']);
        $this->assertEquals($transportCategory->id, $grabResult['suggestion']['category_id']);
        $this->assertEquals('merchant_dictionary', $grabResult['meta']['model']);

        // Zero external API calls made
        Http::assertNothingSent();
    }

    public function test_chat_caps_history_to_sliding_window_of_4_turns(): void
    {
        $user = User::factory()->create();

        Http::fake([
            '*' => Http::response([
                'candidates' => [
                    [
                        'content' => [
                            'parts' => [
                                ['text' => "Summary: Status is stable.\n\nActions:\n1. Log expenses."],
                            ],
                        ],
                    ],
                ],
            ], 200),
        ]);

        $longHistory = [
            ['role' => 'user', 'content' => 'Old message 1'],
            ['role' => 'assistant', 'content' => 'Old reply 1'],
            ['role' => 'user', 'content' => 'Old message 2'],
            ['role' => 'assistant', 'content' => 'Old reply 2'],
            ['role' => 'user', 'content' => 'Old message 3'],
            ['role' => 'assistant', 'content' => 'Old reply 3'],
            ['role' => 'user', 'content' => 'Recent message 1'],
            ['role' => 'assistant', 'content' => 'Recent reply 1'],
            ['role' => 'user', 'content' => 'Recent message 2'],
            ['role' => 'assistant', 'content' => 'Recent reply 2'],
        ];

        $aiService = app(AiService::class);
        $aiService->chat($user, 'Current question', $longHistory);

        Http::assertSent(function ($request) {
            $payload = $request->data();
            $contents = $payload['contents'] ?? [];
            // Last 4 history items + 1 current message = 5 total contents items
            return count($contents) === 5;
        });
    }
}
