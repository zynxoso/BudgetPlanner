<?php

namespace App\Http\Controllers;

use App\Models\Allowance;
use App\Models\Loan;
use App\Models\SavingsGoal;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $userId = Auth::id();

        $transactionTotals = Transaction::query()
            ->where('user_id', $userId)
            ->selectRaw("COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income")
            ->selectRaw("COALESCE(SUM(CASE WHEN type = 'income' AND is_spent = 1 THEN amount ELSE 0 END), 0) as spent_income")
            ->selectRaw("COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expenses")
            ->first();

        $totalIncome = (float) $transactionTotals->total_income;
        $spentIncome = (float) $transactionTotals->spent_income;
        $totalExpenses = (float) $transactionTotals->total_expenses;
        // Spent income is treated as an off-the-books expense, so it reduces the balance
        // and is included in the "total expenses" figure shown on the dashboard.
        $effectiveExpenses = $totalExpenses + $spentIncome;
        $currentBalance = $totalIncome - $effectiveExpenses;

        // Remaining budget for current month
        $now = Carbon::now();
        $totalMonthlyBudget = (float) Auth::user()->budgets()
            ->where('month', $now->month)
            ->where('year', $now->year)
            ->sum('amount_limit');

        $monthlyExpenses = (float) Transaction::where('user_id', $userId)
            ->where('type', 'expense')
            ->whereMonth('date', $now->month)
            ->whereYear('date', $now->year)
            ->sum('amount');

        $remainingBudget = $totalMonthlyBudget - $monthlyExpenses;

        $recentTransactions = Transaction::query()
            ->select(['id', 'category_id', 'amount', 'type', 'source', 'date', 'notes', 'is_spent'])
            ->with('category:id,name')
            ->where('user_id', $userId)
            ->orderByDesc('date')
            ->limit(5)
            ->get();

        // Spending for chart (last 7 days)
        $sevenDaysAgo = Carbon::now()->subDays(6);
        $spendingByDate = Transaction::query()
            ->where('user_id', $userId)
            ->whereBetween('date', [$sevenDaysAgo->copy()->startOfDay(), $now->copy()->endOfDay()])
            ->selectRaw('DATE(date) as activity_date')
            ->selectRaw("COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as expense_total")
            ->selectRaw("COALESCE(SUM(CASE WHEN type = 'income' AND is_spent = 1 THEN amount ELSE 0 END), 0) as spent_income_total")
            ->groupByRaw('DATE(date)')
            ->get()
            ->keyBy('activity_date');

        $spendingChart = [];
        for ($i = 0; $i < 7; $i++) {
            $date = $sevenDaysAgo->copy()->addDays($i);
            $dayTotals = $spendingByDate->get($date->toDateString());

            $spendingChart[] = [
                'date' => $date->format('D'),
                'amount' => (float) (($dayTotals->expense_total ?? 0) + ($dayTotals->spent_income_total ?? 0)),
            ];
        }

        // Top categories for the current month
        $topCategories = Transaction::query()
            ->where('user_id', $userId)
            ->where('type', 'expense')
            ->whereMonth('date', $now->month)
            ->whereYear('date', $now->year)
            ->selectRaw('category_id, sum(amount) as total')
            ->groupBy('category_id')
            ->with('category:id,name')
            ->orderByDesc('total')
            ->limit(3)
            ->get()
            ->map(function ($item) use ($totalMonthlyBudget) {
                return [
                    'name' => $item->category->name ?? 'Uncategorized',
                    'percentage' => $totalMonthlyBudget > 0 ? ($item->total / $totalMonthlyBudget) * 100 : 0,
                    'amount' => (float) $item->total,
                ];
            });

        $totalSavings = (float) SavingsGoal::where('user_id', $userId)->sum('current_amount');
        $totalLoansOutstanding = (float) Loan::where('user_id', $userId)->sum('remaining_amount');
        $totalAllowances = (float) Allowance::where('user_id', $userId)->sum('amount');

        return Inertia::render('dashboard', [
            'summary' => [
                'currentBalance' => $currentBalance,
                'totalIncome' => $totalIncome,
                'totalExpenses' => $effectiveExpenses,
                'spentIncome' => $spentIncome,
                'remainingBudget' => $remainingBudget,
                'totalAllowances' => $totalAllowances,
                'totalLoansOutstanding' => $totalLoansOutstanding,
                'totalSavings' => $totalSavings,
            ],
            'recentTransactions' => $recentTransactions,
            'spendingChart' => $spendingChart,
            'topCategories' => $topCategories,
        ]);
    }
}
