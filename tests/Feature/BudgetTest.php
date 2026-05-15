<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BudgetTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_a_budget_for_their_category(): void
    {
        $user = User::factory()->create();
        $category = Category::create([
            'user_id' => $user->id,
            'name' => 'Food',
            'icon' => 'u',
            'color' => '#000',
        ]);

        $this->actingAs($user)
            ->post('/budget', [
                'category_id' => $category->id,
                'amount_limit' => 750,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('budgets', [
            'user_id' => $user->id,
            'category_id' => $category->id,
            'amount_limit' => 750,
            'month' => now()->month,
            'year' => now()->year,
        ]);
    }

    public function test_resubmitting_budget_for_same_month_updates_existing_row(): void
    {
        $user = User::factory()->create();
        $category = Category::create([
            'user_id' => $user->id,
            'name' => 'Food',
            'icon' => 'u',
            'color' => '#000',
        ]);

        $this->actingAs($user)
            ->post('/budget', ['category_id' => $category->id, 'amount_limit' => 100]);

        $this->actingAs($user)
            ->post('/budget', ['category_id' => $category->id, 'amount_limit' => 250]);

        $this->assertDatabaseCount('budgets', 1);
        $this->assertDatabaseHas('budgets', [
            'user_id' => $user->id,
            'category_id' => $category->id,
            'amount_limit' => 250,
        ]);
    }

    public function test_user_cannot_set_budget_on_another_users_category(): void
    {
        $owner = User::factory()->create();
        $attacker = User::factory()->create();
        $category = Category::create([
            'user_id' => $owner->id,
            'name' => 'Owner Cat',
            'icon' => 'u',
            'color' => '#000',
        ]);

        $this->actingAs($attacker)
            ->post('/budget', ['category_id' => $category->id, 'amount_limit' => 100])
            ->assertSessionHasErrors('category_id');
    }

    public function test_user_can_set_budget_on_global_category(): void
    {
        $user = User::factory()->create();
        $category = Category::create([
            'user_id' => null,
            'name' => 'Global Cat',
            'icon' => 'u',
            'color' => '#000',
        ]);

        $this->actingAs($user)
            ->post('/budget', ['category_id' => $category->id, 'amount_limit' => 100])
            ->assertRedirect();

        $this->assertDatabaseHas('budgets', [
            'user_id' => $user->id,
            'category_id' => $category->id,
        ]);
    }
}
