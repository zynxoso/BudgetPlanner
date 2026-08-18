<?php

namespace Tests\Feature;

use App\Models\SavingsGoal;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SavingsGoalTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_a_savings_goal(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post('/savings-goals', [
                'name' => 'Vacation Fund',
                'target_amount' => 5000,
                'deadline' => now()->addMonths(6)->toDateString(),
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('savings_goals', [
            'user_id' => $user->id,
            'name' => 'Vacation Fund',
            'target_amount' => 5000,
            'current_amount' => 0,
        ]);
    }

    public function test_user_can_add_amount_to_their_own_goal(): void
    {
        $user = User::factory()->create();
        $goal = SavingsGoal::create([
            'user_id' => $user->id,
            'name' => 'Camera',
            'target_amount' => 1000,
            'current_amount' => 100,
            'deadline' => now()->addMonth(),
        ]);

        $this->actingAs($user)
            ->patch("/savings-goals/{$goal->id}/add-amount", ['amount' => 250])
            ->assertRedirect();

        $this->assertEquals(350, $goal->fresh()->current_amount);
    }

    public function test_user_cannot_add_amount_to_another_users_goal(): void
    {
        $owner = User::factory()->create();
        $attacker = User::factory()->create();

        $goal = SavingsGoal::create([
            'user_id' => $owner->id,
            'name' => 'Owner goal',
            'target_amount' => 1000,
            'current_amount' => 0,
            'deadline' => now()->addMonth(),
        ]);

        $this->actingAs($attacker)
            ->patch("/savings-goals/{$goal->id}/add-amount", ['amount' => 999])
            ->assertForbidden();

        $this->assertEquals(0, $goal->fresh()->current_amount);
    }

    public function test_user_cannot_delete_another_users_goal(): void
    {
        $owner = User::factory()->create();
        $attacker = User::factory()->create();

        $goal = SavingsGoal::create([
            'user_id' => $owner->id,
            'name' => 'Owner goal',
            'target_amount' => 1000,
            'current_amount' => 0,
            'deadline' => now()->addMonth(),
        ]);

        $this->actingAs($attacker)
            ->delete("/savings-goals/{$goal->id}")
            ->assertForbidden();

        $this->assertDatabaseHas('savings_goals', ['id' => $goal->id]);
    }

    public function test_create_validation_requires_future_deadline(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post('/savings-goals', [
                'name' => 'Past goal',
                'target_amount' => 100,
                'deadline' => now()->subDay()->toDateString(),
            ])
            ->assertSessionHasErrors('deadline');
    }

    public function test_uploading_image_stores_hashed_file_and_replaces_old_image(): void
    {
        \Illuminate\Support\Facades\Storage::fake('public');

        $user = User::factory()->create();
        $file1 = \Illuminate\Http\UploadedFile::fake()->image('goal.png');

        $this->actingAs($user)
            ->post('/savings-goals', [
                'name' => 'New Car',
                'target_amount' => 20000,
                'deadline' => now()->addYear()->toDateString(),
                'image' => $file1,
            ])
            ->assertRedirect();

        $goal = SavingsGoal::where('name', 'New Car')->firstOrFail();
        $this->assertNotNull($goal->image);
        $this->assertStringStartsWith('/storage/savings-goals/', $goal->image);

        $storedPath1 = str_replace('/storage/', '', $goal->image);
        \Illuminate\Support\Facades\Storage::disk('public')->assertExists($storedPath1);

        // Update with new image
        $file2 = \Illuminate\Http\UploadedFile::fake()->image('newer_car.webp');

        $this->actingAs($user)
            ->post("/savings-goals/{$goal->id}", [
                'name' => 'New Car Updated',
                'target_amount' => 25000,
                'deadline' => now()->addYear()->toDateString(),
                'image' => $file2,
            ])
            ->assertRedirect();

        $goal->refresh();
        $storedPath2 = str_replace('/storage/', '', $goal->image);

        // Old file must be deleted, new file must exist
        \Illuminate\Support\Facades\Storage::disk('public')->assertMissing($storedPath1);
        \Illuminate\Support\Facades\Storage::disk('public')->assertExists($storedPath2);
    }
}
