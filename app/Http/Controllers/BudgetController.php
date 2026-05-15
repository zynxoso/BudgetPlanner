<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Budget;
use App\Models\Category;
use App\Models\Transaction;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class BudgetController extends Controller
{
    public function index()
    {
        $now = Carbon::now();
        $userId = Auth::id();

        $categories = Category::query()
            ->select(['id', 'name', 'icon', 'color'])
            ->where('user_id', $userId)
            ->orWhereNull('user_id')
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
            $limit = $budget ? (float)$budget->amount_limit : 0;
            $used = (float) ($usedByCategory->get($category->id) ?? 0);

            return [
                'id' => $category->id,
                'name' => $category->name,
                'icon' => $category->icon,
                'color' => $category->color,
                'limit' => $limit,
                'used' => (float)$used,
                'remaining' => $limit - (float)$used,
                'percentage' => $limit > 0 ? ((float)$used / $limit) * 100 : 0,
            ];
        });

        return Inertia::render('budget/index', [
            'budgetData' => $budgetData,
            'currentMonth' => $now->format('F Y')
        ]);
    }

    public function updateOrCreate(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'amount_limit' => 'required|numeric|min:0',
        ]);

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
