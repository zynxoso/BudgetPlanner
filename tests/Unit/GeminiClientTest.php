<?php

namespace Tests\Unit;

use App\Services\Ai\GeminiClient;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class GeminiClientTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        config([
            'services.gemini.key' => 'test-api-key-12345',
            'services.gemini.model' => 'gemini-1.5-flash',
            'services.gemini.base_url' => 'https://generativelanguage.googleapis.com/v1beta',
            'services.gemini.failure_threshold' => 3,
            'services.gemini.cooldown_seconds' => 300,
        ]);

        Cache::forget('ai:gemini:failures');
        Cache::forget('ai:gemini:disabled_until');
    }

    public function test_client_sends_api_key_in_x_goog_api_key_header_without_url_query_key(): void
    {
        Http::fake([
            'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent' => Http::response([
                'candidates' => [
                    [
                        'content' => [
                            'parts' => [
                                ['text' => 'Response text'],
                            ],
                        ],
                    ],
                ],
            ], 200),
        ]);

        $client = new GeminiClient();
        $result = $client->generate([['parts' => [['text' => 'Hello']]]]);

        $this->assertTrue($result['ok']);
        $this->assertEquals('Response text', $result['text']);

        Http::assertSent(function ($request) {
            $hasAuthHeader = $request->hasHeader('x-goog-api-key', 'test-api-key-12345');
            $noKeyInUrl = !str_contains($request->url(), 'key=');
            return $hasAuthHeader && $noKeyInUrl;
        });
    }

    public function test_400_response_does_not_open_circuit_breaker(): void
    {
        Http::fake([
            '*' => Http::response(['error' => ['message' => 'Bad Request']], 400),
        ]);

        $client = new GeminiClient();

        for ($i = 0; $i < 5; $i++) {
            $result = $client->generate([['parts' => [['text' => 'Invalid prompt']]]]);
            $this->assertFalse($result['ok']);
            $this->assertEquals(400, $result['status']);
        }

        // Circuit breaker should NOT be opened for 400 Bad Request
        $this->assertFalse($client->isCircuitOpen());
        $this->assertEquals(0, (int) Cache::get('ai:gemini:failures', 0));
    }

    public function test_503_response_increments_failure_and_opens_circuit_breaker_after_threshold(): void
    {
        Http::fake([
            '*' => Http::response(['error' => ['message' => 'Service Unavailable']], 503),
        ]);

        $client = new GeminiClient();

        // Failure 1
        $client->generate([['parts' => [['text' => 'Prompt 1']]]]);
        $this->assertFalse($client->isCircuitOpen());
        $this->assertEquals(1, (int) Cache::get('ai:gemini:failures'));

        // Failure 2
        $client->generate([['parts' => [['text' => 'Prompt 2']]]]);
        $this->assertFalse($client->isCircuitOpen());
        $this->assertEquals(2, (int) Cache::get('ai:gemini:failures'));

        // Failure 3 (hits threshold 3)
        $client->generate([['parts' => [['text' => 'Prompt 3']]]]);
        $this->assertTrue($client->isCircuitOpen());

        // 4th request gets fast-failed by circuit breaker without calling Http
        $result = $client->generate([['parts' => [['text' => 'Prompt 4']]]]);
        $this->assertFalse($result['ok']);
        $this->assertEquals('circuit_open', $result['error']);
    }

    public function test_missing_api_key_or_model_returns_missing_config_error(): void
    {
        config(['services.gemini.key' => null]);

        $client = new GeminiClient();
        $result = $client->generate([['parts' => [['text' => 'Hello']]]]);

        $this->assertFalse($result['ok']);
        $this->assertEquals('missing_config', $result['error']);
    }

    public function test_429_response_increments_failure_and_opens_circuit_breaker(): void
    {
        Http::fake([
            '*' => Http::response(['error' => ['message' => 'Resource Exhausted']], 429),
        ]);

        $client = new GeminiClient();

        for ($i = 0; $i < 3; $i++) {
            $client->generate([['parts' => [['text' => 'Rate limited prompt']]]]);
        }

        $this->assertTrue($client->isCircuitOpen());
    }

    public function test_clear_failures_resets_circuit_breaker(): void
    {
        Http::fake([
            '*' => Http::response(['error' => ['message' => 'Service Unavailable']], 503),
        ]);

        $client = new GeminiClient();

        for ($i = 0; $i < 3; $i++) {
            $client->generate([['parts' => [['text' => 'Failing prompt']]]]);
        }

        $this->assertTrue($client->isCircuitOpen());

        $client->clearFailures();
        $this->assertFalse($client->isCircuitOpen());
        $this->assertNull(Cache::get('ai:gemini:failures'));
        $this->assertNull(Cache::get('ai:gemini:disabled_until'));
    }

    public function test_safety_blocked_response_returns_safety_blocked_error(): void
    {
        Http::fake([
            '*' => Http::response([
                'promptFeedback' => [
                    'blockReason' => 'SAFETY',
                ],
                'candidates' => [],
            ], 200),
        ]);

        $client = new GeminiClient();
        $result = $client->generate([['parts' => [['text' => 'Safety violating prompt']]]]);

        $this->assertFalse($result['ok']);
        $this->assertEquals('safety_blocked', $result['error']);
    }

    public function test_finish_reason_is_captured_in_successful_response(): void
    {
        Http::fake([
            '*' => Http::response([
                'candidates' => [
                    [
                        'finishReason' => 'STOP',
                        'content' => [
                            'parts' => [
                                ['text' => 'Valid output text'],
                            ],
                        ],
                    ],
                ],
            ], 200),
        ]);

        $client = new GeminiClient();
        $result = $client->generate([['parts' => [['text' => 'Normal prompt']]]]);

        $this->assertTrue($result['ok']);
        $this->assertEquals('STOP', $result['finish_reason']);
    }
}
