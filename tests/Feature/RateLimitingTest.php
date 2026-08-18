<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RateLimitingTest extends TestCase
{
    use RefreshDatabase;

    public function test_ai_route_is_rate_limited(): void
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

        // Hit the AI endpoint up to the 15 per minute limit
        for ($i = 0; $i < 15; $i++) {
            $response = $this->actingAs($user)->postJson('/ai/chat', [
                'message' => 'Hello',
                'history' => [],
            ]);
            $this->assertNotEquals(429, $response->status());
        }

        // 16th request must be throttled with HTTP 429 Too Many Requests
        $response = $this->actingAs($user)->postJson('/ai/chat', [
            'message' => 'Hello again',
            'history' => [],
        ]);

        $response->assertStatus(429);
        $response->assertJson([
            'ok' => false,
            'message' => 'You are sending AI prompts too quickly. Please wait a few seconds.',
        ]);
    }

    public function test_reports_export_route_is_rate_limited(): void
    {
        $user = User::factory()->create();

        // 6 exports allowed per minute
        for ($i = 0; $i < 6; $i++) {
            $response = $this->actingAs($user)->get('/reports/export');
            $this->assertNotEquals(429, $response->getStatusCode());
        }

        // 7th request must be throttled
        $response = $this->actingAs($user)->get('/reports/export');
        $response->assertStatus(429);
    }
}

