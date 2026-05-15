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
        $url = $baseUrl.'/models/'.$model.':generateContent?key='.$apiKey;

        $timeout = (int) ($config['timeout'] ?? 20);
        $retries = (int) ($config['retry'] ?? 1);

        $start = microtime(true);

        $response = Http::timeout($timeout)
            ->retry($retries, 200, null, false)
            ->acceptJson()
            ->post($url, $payload);

        $latencyMs = (int) round((microtime(true) - $start) * 1000);

        if (! $response->ok()) {
            $this->recordFailure();

            return [
                'ok' => false,
                'error' => 'http_error',
                'status' => $response->status(),
                'latency_ms' => $latencyMs,
            ];
        }

        $data = $response->json();
        $text = data_get($data, 'candidates.0.content.parts.0.text');

        if (! is_string($text) || trim($text) === '') {
            $this->recordFailure();

            return [
                'ok' => false,
                'error' => 'empty_response',
                'latency_ms' => $latencyMs,
            ];
        }

        $this->clearFailures();

        return [
            'ok' => true,
            'text' => trim($text),
            'raw' => $data,
            'latency_ms' => $latencyMs,
            'model' => $model,
        ];
    }

    private function isCircuitOpen(): bool
    {
        $disabledUntil = Cache::get($this->disabledUntilKey);

        if (! $disabledUntil) {
            return false;
        }

        return now()->lessThan($disabledUntil);
    }

    private function recordFailure(): void
    {
        $threshold = (int) (config('services.gemini.failure_threshold') ?? 3);
        $cooldownSeconds = (int) (config('services.gemini.cooldown_seconds') ?? 300);

        $failures = (int) Cache::get($this->failureKey, 0);
        $failures++;
        Cache::put($this->failureKey, $failures, $cooldownSeconds);
        if ($failures >= $threshold) {
            Cache::put($this->disabledUntilKey, now()->addSeconds($cooldownSeconds), $cooldownSeconds);
        }
    }

    private function clearFailures(): void
    {
        Cache::forget($this->failureKey);
        Cache::forget($this->disabledUntilKey);
    }
}
