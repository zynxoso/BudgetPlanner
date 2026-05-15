<?php

namespace Tests\Feature;

use App\Models\Allowance;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AllowanceTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_allowance(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post('/allowance', [
                'amount' => 500,
                'frequency' => 'monthly',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('allowances', [
            'user_id' => $user->id,
            'amount' => 500,
            'frequency' => 'monthly',
        ]);
    }

    public function test_invalid_frequency_is_rejected(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post('/allowance', [
                'amount' => 500,
                'frequency' => 'hourly',
            ])
            ->assertSessionHasErrors('frequency');
    }

    public function test_user_cannot_update_another_users_allowance(): void
    {
        $owner = User::factory()->create();
        $attacker = User::factory()->create();
        $allowance = Allowance::create([
            'user_id' => $owner->id,
            'amount' => 100,
            'frequency' => 'weekly',
        ]);

        $this->actingAs($attacker)
            ->put("/allowance/{$allowance->id}", [
                'amount' => 9999,
                'frequency' => 'daily',
            ])
            ->assertForbidden();

        $this->assertEquals(100, $allowance->fresh()->amount);
    }

    public function test_user_cannot_delete_another_users_allowance(): void
    {
        $owner = User::factory()->create();
        $attacker = User::factory()->create();
        $allowance = Allowance::create([
            'user_id' => $owner->id,
            'amount' => 100,
            'frequency' => 'weekly',
        ]);

        $this->actingAs($attacker)
            ->delete("/allowance/{$allowance->id}")
            ->assertForbidden();

        $this->assertDatabaseHas('allowances', ['id' => $allowance->id]);
    }
}
