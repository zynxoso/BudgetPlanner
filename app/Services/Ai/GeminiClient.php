<?php

namespace App\Services\Ai;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class GeminiClient
{
    private string $failureKey = 'ai:gemini:failures';
    private string $disabledUntilKey = 'ai:gemini:disabled_until';

    public function generate(array $contents, array $options = []): array
    {
        $config = config('services.gemini', []);
        $apiKey = $config['key'] ?? null;
        $model = $options['model'] ?? ($config['model'] ?? null);

        if (! $apiKey || ! $model) {
            return [
                'ok' => false,
                'error' => 'missing_config',
            ];
        }

        if ($this->isCircuitOpen()) {
            return [
                'ok' => false,
                'error' => 'circuit_open',
            ];
        }

        $payload = [
            'contents' => $contents,
            'generationConfig' => [
                'temperature' => $options['temperature'] ?? ($config['temperature'] ?? 0.2),
                'maxOutputTokens' => $options['max_output_tokens'] ?? ($config['max_output_tokens'] ?? 512),
                'topP' => $options['top_p'] ?? ($config['top_p'] ?? 0.95),
            ],
        ];

        if (! empty($options['system_instruction'])) {
            $payload['systemInstruction'] = [
                'parts' => [
                    ['text' => $options['system_instruction']],
                ],
            ];
        }

        if (! empty($options['response_mime_type'])) {
            $payload['generationConfig']['responseMimeType'] = $options['response_mime_type'];
        }

        $baseUrl = rtrim($config['base_url'] ?? 'https://generativelanguage.googleapis.com/v1beta', '/');
        $url = $baseUrl.'/models/'.$model.':generateContent';

        $timeout = (int) ($config['timeout'] ?? 20);
        $retries = (int) ($config['retry'] ?? 1);

        $start = microtime(true);

        try {
            $response = Http::timeout($timeout)
                ->withHeaders([
                    'x-goog-api-key' => $apiKey,
                ])
                ->retry($retries, 200, null, false)
                ->acceptJson()
                ->post($url, $payload);
        } catch (\Throwable $e) {
            $this->recordFailure(null);

            return [
                'ok' => false,
                'error' => 'connection_error',
                'latency_ms' => (int) round((microtime(true) - $start) * 1000),
            ];
        }

        $latencyMs = (int) round((microtime(true) - $start) * 1000);

        if (! $response->ok()) {
            $this->recordFailure($response->status());

            return [
                'ok' => false,
                'error' => 'http_error',
                'status' => $response->status(),
                'latency_ms' => $latencyMs,
            ];
        }

        $data = $response->json();
        $candidate = data_get($data, 'candidates.0');
        $text = data_get($candidate, 'content.parts.0.text');
        $finishReason = data_get($candidate, 'finishReason');

        if (! is_string($text) || trim($text) === '') {
            $blockReason = data_get($data, 'promptFeedback.blockReason');
            $this->recordFailure(null);

            return [
                'ok' => false,
                'error' => $blockReason ? 'safety_blocked' : 'empty_response',
                'finish_reason' => $finishReason,
                'latency_ms' => $latencyMs,
            ];
        }

        $this->clearFailures();

        return [
            'ok' => true,
            'text' => trim($text),
            'raw' => $data,
            'finish_reason' => $finishReason,
            'latency_ms' => $latencyMs,
            'model' => $model,
        ];
    }

    public function isCircuitOpen(): bool
    {
        $disabledUntil = Cache::get($this->disabledUntilKey);

        if (! $disabledUntil) {
            return false;
        }

        return now()->lessThan($disabledUntil);
    }

    public function recordFailure(?int $status = null): void
    {
        // 4xx errors (except 429 Too Many Requests) are client errors and must not open the circuit
        if ($status !== null && $status >= 400 && $status < 500 && $status !== 429) {
            return;
        }

        $threshold = (int) (config('services.gemini.failure_threshold') ?? 3);
        
        // 429 Rate Limit can use a shorter cooldown to recover faster once rate limits reset
        $cooldownSeconds = $status === 429
            ? (int) (config('services.gemini.rate_limit_cooldown_seconds') ?? 60)
            : (int) (config('services.gemini.cooldown_seconds') ?? 300);

        $failures = (int) Cache::get($this->failureKey, 0);
        $failures++;
        Cache::put($this->failureKey, $failures, $cooldownSeconds);
        if ($failures >= $threshold) {
            Cache::put($this->disabledUntilKey, now()->addSeconds($cooldownSeconds), $cooldownSeconds);
        }
    }

    public function clearFailures(): void
    {
        Cache::forget($this->failureKey);
        Cache::forget($this->disabledUntilKey);
    }
}
