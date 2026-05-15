<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Transaction;
use App\Models\Category;
use App\Models\Allowance;
use App\Models\Loan;
use App\Models\SavingsGoal;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
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
        $currentBalance = $totalIncome - $totalExpenses - $spentIncome;
        
        // Remaining budget for current month
        $now = Carbon::now();
        $totalMonthlyBudget = Auth::user()->budgets()
            ->where('month', $now->month)
            ->where('year', $now->year)
            ->sum('amount_limit');
        
        $monthlyExpenses = Transaction::where('user_id', $userId)
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

        // Spending for Chart (last 7 days)
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

        // Top Categories
        $topCategories = Transaction::query()
            ->where('user_id', $userId)
            ->where('type', 'expense')
            ->whereMonth('date', $now->month)
            ->whereYear('date', $now->year)
            ->selectRaw('category_id, sum(amount) as total')
            ->groupBy('category_id')
            ->with('category:id,name')
            ->orderBy('total', 'desc')
            ->limit(3)
            ->get()
            ->map(function ($item) use ($totalMonthlyBudget) {
                return [
                    'name' => $item->category->name ?? 'Uncategorized',
                    'percentage' => $totalMonthlyBudget > 0 ? ($item->total / $totalMonthlyBudget) * 100 : 0,
                    'amount' => (float)$item->total,
                ];
            });

        $totalSavings = (float) SavingsGoal::where('user_id', $userId)->sum('current_amount');
        $totalLoansOutstanding = (float) Loan::where('user_id', $userId)->sum('remaining_amount');
        $totalAllowances = (float) Allowance::where('user_id', $userId)->sum('amount');

        return Inertia::render('dashboard', [
            'summary' => [
                'currentBalance' => (float) $currentBalance,
                'totalIncome' => (float) $totalIncome,
                'totalExpenses' => (float) ($totalExpenses + $spentIncome),
                'remainingBudget' => (float) $remainingBudget,
                'totalAllowances' => $totalAllowances,
                'totalLoansOutstanding' => $totalLoansOutstanding,
                'totalSavings' => $totalSavings,
            ],
            'recentTransactions' => $recentTransactions,
            'spendingChart' => $spendingChart,
            'topCategories' => $topCategories,
        ]);
    }

    public function reports()
    {
        $userId = Auth::id();
        $now = Carbon::now();

        // 1. Spending by Category for current month
        $categorySummary = Transaction::query()
            ->where('user_id', $userId)
            ->where('type', 'expense')
            ->whereMonth('date', $now->month)
            ->whereYear('date', $now->year)
            ->selectRaw('category_id, sum(amount) as value')
            ->groupBy('category_id')
            ->with('category:id,name')
            ->get()
            ->map(function ($item) {
                return [
                    'name' => $item->category->name ?? 'Uncategorized',
                    'value' => (float)$item->value,
                ];
            });

        // 2. Monthly Trend (Income vs Expense - last 6 months)
        $trendTransactions = Transaction::query()
            ->where('user_id', $userId)
            ->whereBetween('date', [$now->copy()->subMonths(5)->startOfMonth(), $now->copy()->endOfMonth()])
            ->get(['date', 'amount', 'type', 'is_spent']);

        $trendByMonth = $trendTransactions->groupBy(function (Transaction $transaction): string {
            return Carbon::parse($transaction->date)->format('Y-n');
        });

        $trend = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = $now->copy()->subMonths($i);
            $monthTotals = $trendByMonth->get($date->format('Y-n'), collect());

            $trend[] = [
                'month' => $date->format('M'),
                'income' => (float) $monthTotals->where('type', 'income')->sum('amount'),
                'expense' => (float) (
                    $monthTotals->where('type', 'expense')->sum('amount') +
                    $monthTotals->where('type', 'income')->where('is_spent', true)->sum('amount')
                ),
            ];
        }

        // 3. Loan Summary
        $loans = Loan::query()
            ->where('user_id', $userId)
            ->select(['amount', 'remaining_amount'])
            ->get();
        $loanSummary = [
            'total_original' => (float)$loans->sum('amount'),
            'total_remaining' => (float)$loans->sum('remaining_amount'),
            'total_paid' => (float)($loans->sum('amount') - $loans->sum('remaining_amount')),
        ];

        // 4. Savings progress
        $savings = SavingsGoal::query()
            ->where('user_id', $userId)
            ->select(['target_amount', 'current_amount'])
            ->get();
        $savingsSummary = [
            'total_target' => (float)$savings->sum('target_amount'),
            'total_current' => (float)$savings->sum('current_amount'),
            'total_needed' => (float)($savings->sum('target_amount') - $savings->sum('current_amount')),
        ];

        return Inertia::render('reports/index', [
            'categorySummary' => $categorySummary,
            'trend' => $trend,
            'loanSummary' => $loanSummary,
            'savingsSummary' => $savingsSummary,
        ]);
    }
}
