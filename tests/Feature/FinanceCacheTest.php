<?php

namespace Tests\Feature;

use App\Models\Loan;
use App\Models\SavingsGoal;
use App\Models\Transaction;
use App\Models\User;
use App\Services\FinanceSummaryService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class FinanceCacheTest extends TestCase
{
    use RefreshDatabase;

    public function test_transaction_totals_are_cached_and_invalidated_on_new_transaction(): void
    {
        $user = User::factory()->create();
        $service = app(FinanceSummaryService::class);
        $now = Carbon::now();

        Transaction::create([
            'user_id' => $user->id,
            'amount' => 5000,
            'type' => 'income',
            'date' => $now->toDateString(),
        ]);

        $totals1 = $service->getTransactionTotals($user->id, $now);
        $this->assertEquals(5000, $totals1['total_income']);

        $startOfMonth = $now->copy()->startOfMonth()->toDateString();
        $endOfMonth = $now->copy()->endOfMonth()->toDateString();
        $cacheKey = "finance:{$user->id}:transaction_totals:{$startOfMonth}_{$endOfMonth}";

        $this->assertTrue(Cache::has($cacheKey));

        // Create new transaction (triggers model saved hook -> invalidates cache)
        Transaction::create([
            'user_id' => $user->id,
            'amount' => 2500,
            'type' => 'income',
            'date' => $now->toDateString(),
        ]);

        $this->assertFalse(Cache::has($cacheKey));

        $totals2 = $service->getTransactionTotals($user->id, $now);
        $this->assertEquals(7500, $totals2['total_income']);
        $this->assertTrue(Cache::has($cacheKey));
    }

    public function test_entity_sums_are_cached_and_invalidated_on_loan_or_savings_write(): void
    {
        $user = User::factory()->create();
        $service = app(FinanceSummaryService::class);

        $loan = Loan::create([
            'user_id' => $user->id,
            'name' => 'Test Loan',
            'amount' => 10000,
            'remaining_amount' => 10000,
            'interest_rate' => 0,
            'date_borrowed' => now()->toDateString(),
            'due_date' => now()->addMonths(3)->toDateString(),
            'status' => 'active',
        ]);

        $goal = SavingsGoal::create([
            'user_id' => $user->id,
            'name' => 'Test Goal',
            'target_amount' => 20000,
            'current_amount' => 5000,
            'deadline' => now()->addYear()->toDateString(),
        ]);

        $sums1 = $service->getEntitySums($user->id);
        $this->assertEquals(10000, $sums1['total_loans_outstanding']);
        $this->assertEquals(5000, $sums1['total_savings']);

        $cacheKey = "finance:{$user->id}:entity_sums";
        $this->assertTrue(Cache::has($cacheKey));

        // Pay loan (triggers Loan / LoanPayment saved hook -> invalidates cache)
        $this->actingAs($user)->patch("/loans/{$loan->id}/payment", ['amount' => 4000])->assertRedirect();

        $this->assertFalse(Cache::has($cacheKey));

        $sums2 = $service->getEntitySums($user->id);
        $this->assertEquals(6000, $sums2['total_loans_outstanding']);
    }
}
