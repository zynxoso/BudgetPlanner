<?php

namespace App\Http\Controllers;

use App\Http\Requests\Budget\StoreBudgetRequest;
use App\Models\Budget;
use App\Models\Category;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class BudgetController extends Controller
{
    public function index(): Response
    {
        $now = Carbon::now();
        $userId = Auth::id();

        $categories = Category::query()
            ->select(['id', 'name', 'icon', 'color'])
            ->where(function ($query) use ($userId) {
                $query->where('user_id', $userId)->orWhereNull('user_id');
            })
            ->get();

        $budgets = Budget::query()
            ->where('user_id', $userId)
            ->where('month', $now->month)
            ->where('year', $now->year)
            ->get()
            ->keyBy('category_id');

        $usedByCategory = Transaction::query()
            ->where('user_id', $userId)
            ->where('type', 'expense')
            ->whereMonth('date', $now->month)
            ->whereYear('date', $now->year)
            ->selectRaw('category_id, COALESCE(SUM(amount), 0) as used_amount')
            ->groupBy('category_id')
            ->pluck('used_amount', 'category_id');

        $budgetData = $categories->map(function ($category) use ($budgets, $usedByCategory) {
            $budget = $budgets->get($category->id);
            $limit = $budget ? (float) $budget->amount_limit : 0.0;
            $used = (float) ($usedByCategory->get($category->id) ?? 0);

            return [
                'id' => $category->id,
                'name' => $category->name,
                'icon' => $category->icon,
                'color' => $category->color,
                'limit' => $limit,
                'used' => $used,
                'remaining' => $limit - $used,
                'percentage' => $limit > 0 ? ($used / $limit) * 100 : 0,
            ];
        });

        return Inertia::render('budget/index', [
            'budgetData' => $budgetData,
            'currentMonth' => $now->format('F Y'),
        ]);
    }

    public function updateOrCreate(StoreBudgetRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $now = Carbon::now();

        Budget::updateOrCreate(
            [
                'user_id' => Auth::id(),
                'category_id' => $validated['category_id'],
                'month' => $now->month,
                'year' => $now->year,
            ],
            ['amount_limit' => $validated['amount_limit']]
        );

        return redirect()->back()->with('success', 'Budget updated successfully');
    }
}
