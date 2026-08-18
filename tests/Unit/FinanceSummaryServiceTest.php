<?php

namespace Tests\Unit;

use App\Models\Allowance;
use App\Models\Category;
use App\Models\Loan;
use App\Models\SavingsGoal;
use App\Models\Transaction;
use App\Models\User;
use App\Services\FinanceSummaryService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FinanceSummaryServiceTest extends TestCase
{
    use RefreshDatabase;

    private FinanceSummaryService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(FinanceSummaryService::class);
    }

    public function test_empty_data_returns_zeroes(): void
    {
        $user = User::factory()->create();
        $now = Carbon::parse('2026-08-17');

        // 1. getTransactionTotals
        $totals = $this->service->getTransactionTotals($user->id, $now);
        $this->assertEquals([
            'total_income' => 0.0,
            'spent_income' => 0.0,
            'total_expenses' => 0.0,
            'effective_expenses' => 0.0,
            'current_balance' => 0.0,
            'monthly_expenses' => 0.0,
        ], $totals);

        // 2. getBudgetSummary
        $budget = $this->service->getBudgetSummary($user->id, $now, 0.0);
        $this->assertEquals([
            'total_monthly_budget' => 0.0,
            'remaining_budget' => 0.0,
        ], $budget);

        // 3. getCategorySummary
        $categorySummary = $this->service->getCategorySummary($user->id, $now);
        $this->assertTrue($categorySummary->isEmpty());

        // 4. getTopCategories
        $topCategories = $this->service->getTopCategories($user->id, $now);
        $this->assertEmpty($topCategories);

        // 5. getLoanSummary
        $loanSummary = $this->service->getLoanSummary($user->id);
        $this->assertEquals([
            'total_original' => 0.0,
            'total_remaining' => 0.0,
            'total_paid' => 0.0,
        ], $loanSummary);

        // 6. getSavingsSummary
        $savingsSummary = $this->service->getSavingsSummary($user->id);
        $this->assertEquals([
            'total_target' => 0.0,
            'total_current' => 0.0,
            'total_needed' => 0.0,
        ], $savingsSummary);

        // 7. getEntitySums
        $entitySums = $this->service->getEntitySums($user->id);
        $this->assertEquals([
            'total_savings' => 0.0,
            'total_loans_outstanding' => 0.0,
            'total_allowances' => 0.0,
        ], $entitySums);
    }

    public function test_get_entity_sums_shape(): void
    {
        $user = User::factory()->create();

        SavingsGoal::create([
            'user_id' => $user->id,
            'name' => 'Emergency Fund',
            'target_amount' => 50000,
            'current_amount' => 15000,
            'deadline' => now()->addYear()->toDateString(),
        ]);

        Loan::create([
            'user_id' => $user->id,
            'name' => 'Gadget Loan',
            'amount' => 20000,
            'remaining_amount' => 8000,
            'interest_rate' => 5.0,
            'date_borrowed' => now()->subMonth()->toDateString(),
            'due_date' => now()->addMonths(5)->toDateString(),
            'status' => 'active',
        ]);

        Allowance::create([
            'user_id' => $user->id,
            'name' => 'Monthly Allowance',
            'amount' => 3500,
            'frequency' => 'monthly',
        ]);

        $sums = $this->service->getEntitySums($user->id);

        $this->assertIsArray($sums);
        $this->assertArrayHasKey('total_savings', $sums);
        $this->assertArrayHasKey('total_loans_outstanding', $sums);
        $this->assertArrayHasKey('total_allowances', $sums);

        $this->assertSame(15000.0, $sums['total_savings']);
        $this->assertSame(8000.0, $sums['total_loans_outstanding']);
        $this->assertSame(3500.0, $sums['total_allowances']);
    }

    public function test_get_monthly_trend_returns_exact_entries_in_chronological_order(): void
    {
        $user = User::factory()->create();
        $now = Carbon::parse('2026-08-15');

        // Test with 6 months
        $trend6 = $this->service->getMonthlyTrend($user->id, $now, 6);
        $this->assertCount(6, $trend6['trend']);

        $expectedMonths6 = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
        $actualMonths6 = array_column($trend6['trend'], 'month');
        $this->assertEquals($expectedMonths6, $actualMonths6);

        // Test with 12 months
        $trend12 = $this->service->getMonthlyTrend($user->id, $now, 12);
        $this->assertCount(12, $trend12['trend']);

        $firstMonth = $now->copy()->subMonths(11)->format('M');
        $lastMonth = $now->format('M');
        $this->assertEquals($firstMonth, $trend12['trend'][0]['month']);
        $this->assertEquals($lastMonth, $trend12['trend'][11]['month']);
    }

    public function test_negative_loan_remaining_cannot_occur(): void
    {
        $user = User::factory()->create();

        $loan = Loan::create([
            'user_id' => $user->id,
            'name' => 'Overpaid Loan',
            'amount' => 1000,
            'remaining_amount' => 200,
            'interest_rate' => 0,
            'date_borrowed' => now()->toDateString(),
            'due_date' => now()->addMonth()->toDateString(),
            'status' => 'active',
        ]);

        // Simulating overpayment through payment endpoint
        $this->actingAs($user)->patch("/loans/{$loan->id}/payment", ['amount' => 500])->assertRedirect();

        $loan->refresh();
        $this->assertEquals(0, $loan->remaining_amount);
        $this->assertEquals('paid', $loan->status);

        $loanSummary = $this->service->getLoanSummary($user->id);
        $this->assertGreaterThanOrEqual(0, $loanSummary['total_remaining']);
        $this->assertEquals(0.0, $loanSummary['total_remaining']);
        $this->assertEquals(1000.0, $loanSummary['total_paid']);

        $entitySums = $this->service->getEntitySums($user->id);
        $this->assertGreaterThanOrEqual(0, $entitySums['total_loans_outstanding']);
        $this->assertEquals(0.0, $entitySums['total_loans_outstanding']);
    }
}
