<?php

namespace Tests\Feature;

use App\Models\Loan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LoanTest extends TestCase
{
    use RefreshDatabase;

    private function makeLoan(User $user, float $amount = 1000, float $remaining = 1000): Loan
    {
        return Loan::create([
            'user_id' => $user->id,
            'name' => 'Test Loan',
            'amount' => $amount,
            'remaining_amount' => $remaining,
            'interest_rate' => 0,
            'date_borrowed' => now()->subMonth(),
            'due_date' => now()->addMonth(),
            'status' => 'active',
        ]);
    }

    public function test_user_can_create_loan(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post('/loans', [
                'name' => 'Bank Loan',
                'amount' => 2500,
                'date_borrowed' => now()->toDateString(),
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('loans', [
            'user_id' => $user->id,
            'name' => 'Bank Loan',
            'amount' => 2500,
            'remaining_amount' => 2500,
            'status' => 'active',
        ]);
    }

    public function test_payment_reduces_remaining_amount(): void
    {
        $user = User::factory()->create();
        $loan = $this->makeLoan($user, 1000, 1000);

        $this->actingAs($user)
            ->patch("/loans/{$loan->id}/payment", ['amount' => 300])
            ->assertRedirect();

        $loan->refresh();
        $this->assertEquals(700, $loan->remaining_amount);
        $this->assertEquals('active', $loan->status);
    }

    public function test_overpayment_clamps_to_zero_and_marks_paid(): void
    {
        $user = User::factory()->create();
        $loan = $this->makeLoan($user, 1000, 200);

        $this->actingAs($user)
            ->patch("/loans/{$loan->id}/payment", ['amount' => 999999])
            ->assertRedirect();

        $loan->refresh();
        $this->assertEquals(0, $loan->remaining_amount);
        $this->assertEquals('paid', $loan->status);
    }

    public function test_full_payment_marks_loan_paid(): void
    {
        $user = User::factory()->create();
        $loan = $this->makeLoan($user, 500, 500);

        $this->actingAs($user)
            ->patch("/loans/{$loan->id}/payment", ['amount' => 500]);

        $loan->refresh();
        $this->assertEquals(0, $loan->remaining_amount);
        $this->assertEquals('paid', $loan->status);
    }

    public function test_user_cannot_pay_another_users_loan(): void
    {
        $owner = User::factory()->create();
        $attacker = User::factory()->create();
        $loan = $this->makeLoan($owner, 1000, 1000);

        $this->actingAs($attacker)
            ->patch("/loans/{$loan->id}/payment", ['amount' => 100])
            ->assertForbidden();

        $this->assertEquals(1000, $loan->fresh()->remaining_amount);
    }

    public function test_user_cannot_delete_another_users_loan(): void
    {
        $owner = User::factory()->create();
        $attacker = User::factory()->create();
        $loan = $this->makeLoan($owner);

        $this->actingAs($attacker)
            ->delete("/loans/{$loan->id}")
            ->assertForbidden();

        $this->assertDatabaseHas('loans', ['id' => $loan->id]);
    }

    public function test_payment_amount_is_validated(): void
    {
        $user = User::factory()->create();
        $loan = $this->makeLoan($user);

        $this->actingAs($user)
            ->patch("/loans/{$loan->id}/payment", ['amount' => 0])
            ->assertSessionHasErrors('amount');

        $this->actingAs($user)
            ->patch("/loans/{$loan->id}/payment", ['amount' => -50])
            ->assertSessionHasErrors('amount');
    }
}
