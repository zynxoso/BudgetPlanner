<?php

namespace Tests\Feature;

use App\Models\Allowance;
use App\Models\Budget;
use App\Models\Category;
use App\Models\Loan;
use App\Models\SavingsGoal;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class FinancePerformanceTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_query_count_is_bounded(): void
    {
        $user = User::factory()->create();
        $this->seedFinanceData($user);

        DB::flushQueryLog();
        DB::enableQueryLog();

        $this->actingAs($user)
            ->get('/dashboard')
            ->assertOk();

        $this->assertLessThanOrEqual(8, count(DB::getQueryLog()));
        DB::disableQueryLog();
    }

    public function test_ai_chat_query_count_is_bounded(): void
    {
        \Illuminate\Support\Facades\Http::fake([
            '*' => \Illuminate\Support\Facades\Http::response([
                'candidates' => [
                    [
                        'content' => [
                            'parts' => [
                                ['text' => "Summary: Budget is healthy.\nActions: 1. Keep saving."],
                            ],
                        ],
                    ],
                ],
            ], 200),
        ]);

        $user = User::factory()->create();
        $this->seedFinanceData($user);

        DB::flushQueryLog();
        DB::enableQueryLog();

        $this->actingAs($user)
            ->postJson('/ai/chat', [
                'message' => 'How is my budget?',
                'history' => [],
            ])
            ->assertOk();

        $this->assertLessThanOrEqual(6, count(DB::getQueryLog()));
        DB::disableQueryLog();
    }

    public function test_budget_query_count_is_bounded(): void
    {
        $user = User::factory()->create();
        $this->seedFinanceData($user);

        DB::flushQueryLog();
        DB::enableQueryLog();

        $this->actingAs($user)
            ->get('/budget')
            ->assertOk();

        $this->assertLessThanOrEqual(5, count(DB::getQueryLog()));
        DB::disableQueryLog();
    }

    public function test_reports_query_count_is_bounded(): void
    {
        $user = User::factory()->create();
        $this->seedFinanceData($user);

        DB::flushQueryLog();
        DB::enableQueryLog();

        $this->actingAs($user)
            ->get('/reports')
            ->assertOk();

        $this->assertLessThanOrEqual(7, count(DB::getQueryLog()));
        DB::disableQueryLog();
    }

    public function test_allowance_query_count_is_bounded(): void
    {
        $user = User::factory()->create();
        $this->seedFinanceData($user);

        DB::flushQueryLog();
        DB::enableQueryLog();

        $this->actingAs($user)
            ->get('/allowance')
            ->assertOk();

        $this->assertLessThanOrEqual(3, count(DB::getQueryLog()));
        DB::disableQueryLog();
    }

    public function test_loans_query_count_is_bounded(): void
    {
        $user = User::factory()->create();
        $this->seedFinanceData($user);

        DB::flushQueryLog();
        DB::enableQueryLog();

        $this->actingAs($user)
            ->get('/loans')
            ->assertOk();

        $this->assertLessThanOrEqual(3, count(DB::getQueryLog()));
        DB::disableQueryLog();
    }

    public function test_savings_goals_query_count_is_bounded(): void
    {
        $user = User::factory()->create();
        $this->seedFinanceData($user);

        DB::flushQueryLog();
        DB::enableQueryLog();

        $this->actingAs($user)
            ->get('/savings-goals')
            ->assertOk();

        $this->assertLessThanOrEqual(3, count(DB::getQueryLog()));
        DB::disableQueryLog();
    }

    public function test_banks_query_count_is_bounded(): void
    {
        $user = User::factory()->create();
        $this->seedFinanceData($user);

        DB::flushQueryLog();
        DB::enableQueryLog();

        $this->actingAs($user)
            ->get('/banks')
            ->assertOk();

        $this->assertLessThanOrEqual(5, count(DB::getQueryLog()));
        DB::disableQueryLog();
    }

    public function test_transactions_query_count_is_bounded(): void
    {
        $user = User::factory()->create();
        $this->seedFinanceData($user);

        DB::flushQueryLog();
        DB::enableQueryLog();

        $this->actingAs($user)
            ->get('/transactions')
            ->assertOk();

        $this->assertLessThanOrEqual(5, count(DB::getQueryLog()));
        DB::disableQueryLog();
    }

    public function test_income_query_count_is_bounded(): void
    {
        $user = User::factory()->create();
        $this->seedFinanceData($user);

        DB::flushQueryLog();
        DB::enableQueryLog();

        $this->actingAs($user)
            ->get('/income')
            ->assertOk();

        $this->assertLessThanOrEqual(5, count(DB::getQueryLog()));
        DB::disableQueryLog();
    }

    public function test_expenses_query_count_is_bounded(): void
    {
        $user = User::factory()->create();
        $this->seedFinanceData($user);

        DB::flushQueryLog();
        DB::enableQueryLog();

        $this->actingAs($user)
            ->get('/expenses')
            ->assertOk();

        $this->assertLessThanOrEqual(5, count(DB::getQueryLog()));
        DB::disableQueryLog();
    }

    private function seedFinanceData(User $user): Category
    {
        $category = Category::create([
            'user_id' => $user->id,
            'name' => 'Groceries',
            'icon' => 'cart',
            'color' => '#000000',
        ]);

        Budget::create([
            'user_id' => $user->id,
            'category_id' => $category->id,
            'amount_limit' => 1000,
            'month' => now()->month,
            'year' => now()->year,
        ]);

        Transaction::create([
            'user_id' => $user->id,
            'category_id' => $category->id,
            'amount' => 250,
            'type' => 'expense',
            'date' => now()->subDay(),
            'notes' => 'Weekly shopping',
        ]);

        Transaction::create([
            'user_id' => $user->id,
            'amount' => 1200,
            'type' => 'income',
            'source' => 'Salary',
            'date' => now()->subDays(2),
            'is_spent' => false,
            'notes' => 'Monthly salary',
        ]);

        Loan::create([
            'user_id' => $user->id,
            'name' => 'Car repair',
            'amount' => 5000,
            'remaining_amount' => 3200,
            'interest_rate' => 0,
            'due_date' => now()->addMonth(),
            'date_borrowed' => now()->subMonth(),
            'status' => 'active',
        ]);

        SavingsGoal::create([
            'user_id' => $user->id,
            'name' => 'Emergency fund',
            'target_amount' => 10000,
            'current_amount' => 3500,
            'deadline' => now()->addMonths(6),
        ]);

        Allowance::create([
            'user_id' => $user->id,
            'amount' => 500,
            'frequency' => 'monthly',
        ]);

        \App\Models\BankAccount::create([
            'user_id' => $user->id,
            'bank_name' => 'MariBank',
            'account_name' => 'Savings Account',
            'balance' => 25000,
            'account_type' => 'savings',
        ]);

        return $category;
    }
}