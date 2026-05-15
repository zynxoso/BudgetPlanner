<?php

namespace App\Http\Controllers;

use App\Services\Ai\AiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AiController extends Controller
{
    public function __construct(private readonly AiService $ai)
    {
    }

    public function chat(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'message' => ['required', 'string', 'max:2000'],
            'history' => ['array', 'max:10'],
            'history.*.role' => ['required', Rule::in(['user', 'assistant'])],
            'history.*.content' => ['required', 'string', 'max:2000'],
        ]);

        $result = $this->ai->chat($request->user(), $validated['message'], $validated['history'] ?? []);

        return response()->json($result);
    }

    public function insights(Request $request): JsonResponse
    {
        $result = $this->ai->insights($request->user());

        return response()->json($result);
    }

    public function categorize(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string', 'max:500'],
            'date' => ['nullable', 'date'],
        ]);

        $result = $this->ai->categorize($request->user(), $validated);

        return response()->json($result);
    }
}
