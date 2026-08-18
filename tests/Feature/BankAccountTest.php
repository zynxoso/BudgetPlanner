<?php

namespace Tests\Feature;

use App\Models\BankAccount;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BankAccountTest extends TestCase
{
    use RefreshDatabase;

    public function test_get_banks_is_idempotent(): void
    {
        $user = User::factory()->create();

        BankAccount::create([
            'user_id' => $user->id,
            'bank_name' => 'Test Bank',
            'account_name' => 'Savings',
            'account_type' => 'savings',
            'currency' => 'PHP',
            'balance' => 1000.00,
            'color' => 'emerald',
        ]);

        $this->assertEquals(1, BankAccount::where('user_id', $user->id)->count());

        // First GET
        $response1 = $this->actingAs($user)->get('/banks');
        $response1->assertOk();
        $this->assertEquals(1, BankAccount::where('user_id', $user->id)->count());

        // Second GET
        $response2 = $this->actingAs($user)->get('/banks');
        $response2->assertOk();
        $this->assertEquals(1, BankAccount::where('user_id', $user->id)->count());
    }

    public function test_transfer_more_than_balance_fails_with_422_and_zero_rows_changed(): void
    {
        $user = User::factory()->create();

        $fromAcc = BankAccount::create([
            'user_id' => $user->id,
            'bank_name' => 'Bank A',
            'account_name' => 'Checking',
            'account_type' => 'checking',
            'currency' => 'PHP',
            'balance' => 500.00,
            'color' => 'blue',
        ]);

        $toAcc = BankAccount::create([
            'user_id' => $user->id,
            'bank_name' => 'Bank B',
            'account_name' => 'Savings',
            'account_type' => 'savings',
            'currency' => 'PHP',
            'balance' => 200.00,
            'color' => 'green',
        ]);

        $response = $this->actingAs($user)->post('/banks/transfer', [
            'from_account_id' => $fromAcc->id,
            'to_account_id' => $toAcc->id,
            'amount' => 1000.00,
        ]);

        $response->assertSessionHasErrors('amount');

        $this->assertEquals(500.00, $fromAcc->fresh()->balance);
        $this->assertEquals(200.00, $toAcc->fresh()->balance);
    }

    public function test_transfer_moves_funds_between_accounts(): void
    {
        $user = User::factory()->create();

        $fromAcc = BankAccount::create([
            'user_id' => $user->id,
            'bank_name' => 'Bank A',
            'account_name' => 'Checking',
            'account_type' => 'checking',
            'currency' => 'PHP',
            'balance' => 500.00,
            'color' => 'blue',
        ]);

        $toAcc = BankAccount::create([
            'user_id' => $user->id,
            'bank_name' => 'Bank B',
            'account_name' => 'Savings',
            'account_type' => 'savings',
            'currency' => 'PHP',
            'balance' => 200.00,
            'color' => 'green',
        ]);

        $response = $this->actingAs($user)->post('/banks/transfer', [
            'from_account_id' => $fromAcc->id,
            'to_account_id' => $toAcc->id,
            'amount' => 300.00,
        ]);

        $response->assertRedirect();

        $this->assertEquals(200.00, $fromAcc->fresh()->balance);
        $this->assertEquals(500.00, $toAcc->fresh()->balance);
    }

    public function test_user_can_create_bank_account(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->post('/banks', [
            'bank_name' => 'Maya Bank',
            'account_name' => 'My Maya Savings',
            'account_type' => 'savings',
            'currency' => 'PHP',
            'balance' => 15000.00,
            'color' => 'emerald',
        ])->assertRedirect();

        $this->assertDatabaseHas('bank_accounts', [
            'user_id' => $user->id,
            'bank_name' => 'Maya Bank',
            'balance' => 15000.00,
        ]);
    }

    public function test_user_can_update_their_own_bank_account(): void
    {
        $user = User::factory()->create();
        $account = BankAccount::create([
            'user_id' => $user->id,
            'bank_name' => 'Old Bank',
            'account_name' => 'Old Name',
            'account_type' => 'savings',
            'currency' => 'PHP',
            'balance' => 5000.00,
            'color' => 'emerald',
        ]);

        $this->actingAs($user)->put("/banks/{$account->id}", [
            'bank_name' => 'Updated Bank',
            'account_name' => 'Updated Name',
            'account_type' => 'savings',
            'currency' => 'PHP',
            'balance' => 7500.00,
            'color' => 'blue',
        ])->assertRedirect();

        $this->assertEquals('Updated Bank', $account->fresh()->bank_name);
        $this->assertEquals(7500.00, $account->fresh()->balance);
    }

    public function test_user_cannot_update_another_users_bank_account(): void
    {
        $owner = User::factory()->create();
        $attacker = User::factory()->create();

        $account = BankAccount::create([
            'user_id' => $owner->id,
            'bank_name' => 'Owner Bank',
            'account_name' => 'Owner Name',
            'account_type' => 'savings',
            'currency' => 'PHP',
            'balance' => 5000.00,
            'color' => 'emerald',
        ]);

        $this->actingAs($attacker)->put("/banks/{$account->id}", [
            'bank_name' => 'Hacked Bank',
            'account_name' => 'Hacked Name',
            'account_type' => 'savings',
            'currency' => 'PHP',
            'balance' => 0.00,
            'color' => 'red',
        ])->assertForbidden();

        $this->assertEquals('Owner Bank', $account->fresh()->bank_name);
    }

    public function test_user_cannot_delete_another_users_bank_account(): void
    {
        $owner = User::factory()->create();
        $attacker = User::factory()->create();

        $account = BankAccount::create([
            'user_id' => $owner->id,
            'bank_name' => 'Owner Bank',
            'account_name' => 'Owner Name',
            'account_type' => 'savings',
            'currency' => 'PHP',
            'balance' => 5000.00,
            'color' => 'emerald',
        ]);

        $this->actingAs($attacker)->delete("/banks/{$account->id}")->assertForbidden();

        $this->assertDatabaseHas('bank_accounts', ['id' => $account->id]);
    }
}
