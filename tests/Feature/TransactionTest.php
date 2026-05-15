<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TransactionTest extends TestCase
{
    use RefreshDatabase;

    private function makeOwnCategory(User $user): Category
    {
        return Category::create([
            'user_id' => $user->id,
            'name' => 'Personal',
            'icon' => 'wallet',
            'color' => '#000',
        ]);
    }

    private function makeGlobalCategory(): Category
    {
        return Category::create([
            'user_id' => null,
            'name' => 'Default',
            'icon' => 'tag',
            'color' => '#fff',
        ]);
    }

    public function test_user_can_create_income(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post('/income', [
                'amount' => 1500,
                'source' => 'Salary',
                'date' => now()->toDateString(),
                'is_spent' => false,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('transactions', [
            'user_id' => $user->id,
            'type' => 'income',
            'source' => 'Salary',
            'amount' => 1500,
        ]);
    }

    public function test_user_can_create_expense_in_their_own_category(): void
    {
        $user = User::factory()->create();
        $category = $this->makeOwnCategory($user);

        $this->actingAs($user)
            ->post('/expenses', [
                'amount' => 200,
                'category_id' => $category->id,
                'date' => now()->toDateString(),
                'notes' => 'Lunch',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('transactions', [
            'user_id' => $user->id,
            'type' => 'expense',
            'category_id' => $category->id,
            'amount' => 200,
        ]);
    }

    public function test_user_can_create_expense_in_global_category(): void
    {
        $user = User::factory()->create();
        $category = $this->makeGlobalCategory();

        $this->actingAs($user)
            ->post('/expenses', [
                'amount' => 50,
                'category_id' => $category->id,
                'date' => now()->toDateString(),
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('transactions', [
            'user_id' => $user->id,
            'category_id' => $category->id,
        ]);
    }

    public function test_user_cannot_use_another_users_category(): void
    {
        $owner = User::factory()->create();
        $attacker = User::factory()->create();
        $category = $this->makeOwnCategory($owner);

        $this->actingAs($attacker)
            ->post('/expenses', [
                'amount' => 50,
                'category_id' => $category->id,
                'date' => now()->toDateString(),
            ])
            ->assertSessionHasErrors('category_id');
    }

    public function test_user_can_update_their_own_transaction(): void
    {
        $user = User::factory()->create();
        $category = $this->makeOwnCategory($user);
        $transaction = Transaction::create([
            'user_id' => $user->id,
            'category_id' => $category->id,
            'amount' => 100,
            'type' => 'expense',
            'date' => now(),
        ]);

        $this->actingAs($user)
            ->put("/transactions/{$transaction->id}", [
                'amount' => 250,
                'category_id' => $category->id,
                'date' => now()->toDateString(),
                'notes' => 'updated',
            ])
            ->assertRedirect();

        $this->assertEquals(250, $transaction->fresh()->amount);
    }

    public function test_user_cannot_update_another_users_transaction(): void
    {
        $owner = User::factory()->create();
        $attacker = User::factory()->create();
        $category = $this->makeOwnCategory($owner);
        $transaction = Transaction::create([
            'user_id' => $owner->id,
            'category_id' => $category->id,
            'amount' => 100,
            'type' => 'expense',
            'date' => now(),
        ]);

        $this->actingAs($attacker)
            ->put("/transactions/{$transaction->id}", [
                'amount' => 1,
                'category_id' => $category->id,
                'date' => now()->toDateString(),
            ])
            ->assertForbidden();

        $this->assertEquals(100, $transaction->fresh()->amount);
    }

    public function test_user_cannot_delete_another_users_transaction(): void
    {
        $owner = User::factory()->create();
        $attacker = User::factory()->create();
        $transaction = Transaction::create([
            'user_id' => $owner->id,
            'amount' => 50,
            'type' => 'income',
            'source' => 'Gift',
            'date' => now(),
        ]);

        $this->actingAs($attacker)
            ->delete("/transactions/{$transaction->id}")
            ->assertForbidden();

        $this->assertDatabaseHas('transactions', ['id' => $transaction->id]);
    }

    public function test_amount_must_be_positive(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post('/income', [
                'amount' => -10,
                'source' => 'Bad',
                'date' => now()->toDateString(),
            ])
            ->assertSessionHasErrors('amount');
    }
}
