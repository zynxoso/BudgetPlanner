<?php

namespace App\Services;

use App\Models\Allowance;
use App\Models\Budget;
use App\Models\Loan;
use App\Models\SavingsGoal;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class FinanceSummaryService
{
    /**
     * Clear cached aggregations for a user across all standard cache keys.
     */
    public static function clearUserCache(int $userId): void
    {
        Cache::forget("finance:{$userId}:entity_sums");

        $now = Carbon::now();
        for ($i = -6; $i <= 6; $i++) {
            $month = $now->copy()->addMonths($i);
            $startOfMonth = $month->copy()->startOfMonth()->toDateString();
            $endOfMonth = $month->copy()->endOfMonth()->toDateString();
            $monthKey = $month->format('Y-m');

            Cache::forget("finance:{$userId}:transaction_totals:{$startOfMonth}_{$endOfMonth}");
            Cache::forget("finance:{$userId}:category_summary:{$startOfMonth}_{$endOfMonth}");
            Cache::forget("finance:{$userId}:monthly_trend:{$monthKey}:6");
        }
    }

    /**
     * Compute transaction totals and current-month expenses in a single query.
     *
     * @return array{
     *     total_income: float,
     *     spent_income: float,
     *     total_expenses: float,
     *     effective_expenses: float,
     *     current_balance: float,
     *     monthly_expenses: float
     * }
     */
    public function getTransactionTotals(int $userId, ?Carbon $now = null): array
    {
        $now = $now ?? Carbon::now();
        $startOfMonth = $now->copy()->startOfMonth()->toDateString();
        $endOfMonth = $now->copy()->endOfMonth()->toDateString();
        $cacheKey = "finance:{$userId}:transaction_totals:{$startOfMonth}_{$endOfMonth}";

        return Cache::remember($cacheKey, now()->addSeconds(60), function () use ($userId, $startOfMonth, $endOfMonth) {
            $totals = Transaction::query()
                ->where('user_id', $userId)
                ->selectRaw("COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income")
                ->selectRaw("COALESCE(SUM(CASE WHEN type = 'income' AND is_spent = 1 THEN amount ELSE 0 END), 0) as spent_income")
                ->selectRaw("COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expenses")
                ->selectRaw(
                    "COALESCE(SUM(CASE WHEN type = 'expense' AND date >= ? AND date <= ? THEN amount ELSE 0 END), 0) as monthly_expenses",
                    [$startOfMonth, $endOfMonth]
                )
                ->first();

            $totalIncome = (float) ($totals->total_income ?? 0);
            $spentIncome = (float) ($totals->spent_income ?? 0);
            $totalExpenses = (float) ($totals->total_expenses ?? 0);
            $effectiveExpenses = $totalExpenses + $spentIncome;
            $currentBalance = $totalIncome - $effectiveExpenses;
            $monthlyExpenses = (float) ($totals->monthly_expenses ?? 0);

            return [
                'total_income' => $totalIncome,
                'spent_income' => $spentIncome,
                'total_expenses' => $totalExpenses,
                'effective_expenses' => $effectiveExpenses,
                'current_balance' => $currentBalance,
                'monthly_expenses' => $monthlyExpenses,
            ];
        });
    }

    /**
     * Compute total monthly budget limit and remaining budget.
     *
     * @return array{
     *     total_monthly_budget: float,
     *     remaining_budget: float
     * }
     */
    public function getBudgetSummary(int $userId, ?Carbon $now = null, float $monthlyExpenses = 0.0): array
    {
        $now = $now ?? Carbon::now();

        $totalMonthlyBudget = (float) Budget::query()
            ->where('user_id', $userId)
            ->where('month', $now->month)
            ->where('year', $now->year)
            ->sum('amount_limit');

        return [
            'total_monthly_budget' => $totalMonthlyBudget,
            'remaining_budget' => $totalMonthlyBudget - $monthlyExpenses,
        ];
    }

    /**
     * Category summary for the specified month (1 query with leftJoin).
     *
     * @return Collection<int, array{category_id: int|null, name: string, value: float, total: float}>
     */
    public function getCategorySummary(int $userId, ?Carbon $now = null): Collection
    {
        $now = $now ?? Carbon::now();
        $startOfMonth = $now->copy()->startOfMonth()->toDateString();
        $endOfMonth = $now->copy()->endOfMonth()->toDateString();
        $cacheKey = "finance:{$userId}:category_summary:{$startOfMonth}_{$endOfMonth}";

        $cached = Cache::remember($cacheKey, now()->addSeconds(60), function () use ($userId, $startOfMonth, $endOfMonth) {
            return Transaction::query()
                ->where('transactions.user_id', $userId)
                ->where('transactions.type', 'expense')
                ->whereBetween('transactions.date', [$startOfMonth, $endOfMonth])
                ->leftJoin('categories', 'transactions.category_id', '=', 'categories.id')
                ->selectRaw('transactions.category_id, categories.name as category_name, COALESCE(SUM(transactions.amount), 0) as total')
                ->groupBy('transactions.category_id', 'categories.name')
                ->orderByDesc('total')
                ->get()
                ->map(function ($item) {
                    $total = (float) $item->total;

                    return [
                        'category_id' => $item->category_id ? (int) $item->category_id : null,
                        'name' => $item->category_name ?? 'Uncategorized',
                        'value' => $total,
                        'total' => $total,
                    ];
                })
                ->all();
        });

        return collect($cached);
    }

    /**
     * Top spending categories with percentage share of monthly budget.
     *
     * @param Collection<int, array{category_id: int|null, name: string, value: float, total: float}>|null $categorySummary
     * @return list<array{name: string, percentage: float, amount: float}>
     */
    public function getTopCategories(
        int $userId,
        ?Carbon $now = null,
        float $totalMonthlyBudget = 0.0,
        int $limit = 3,
        ?Collection $categorySummary = null
    ): array {
        $categories = $categorySummary ?? $this->getCategorySummary($userId, $now);

        return $categories
            ->take($limit)
            ->map(function ($item) use ($totalMonthlyBudget) {
                return [
                    'name' => $item['name'],
                    'percentage' => $totalMonthlyBudget > 0 ? ($item['value'] / $totalMonthlyBudget) * 100 : 0.0,
                    'amount' => (float) $item['value'],
                ];
            })
            ->values()
            ->all();
    }

    /**
     * 7-day activity chart data.
     *
     * @return list<array{date: string, amount: float}>
     */
    public function get7DaySpendingChart(int $userId, ?Carbon $now = null): array
    {
        $now = $now ?? Carbon::now();
        $sevenDaysAgo = $now->copy()->subDays(6);

        $spendingByDate = Transaction::query()
            ->where('user_id', $userId)
            ->whereBetween('date', [
                $sevenDaysAgo->copy()->startOfDay()->toDateTimeString(),
                $now->copy()->endOfDay()->toDateTimeString(),
            ])
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
                'amount' => (float) (
                    ($dayTotals->expense_total ?? 0) +
                    ($dayTotals->spent_income_total ?? 0)
                ),
            ];
        }

        return $spendingChart;
    }

    /**
     * 6-month trend aggregation via SQL.
     *
     * @return array{
     *     trend: list<array{month: string, income: float, expense: float}>,
     *     trendData: \Illuminate\Support\Collection<string, mixed>
     * }
     */
    public function getMonthlyTrend(int $userId, ?Carbon $now = null, int $months = 6): array
    {
        $now = $now ?? Carbon::now();
        $monthKey = $now->format('Y-m');
        $cacheKey = "finance:{$userId}:monthly_trend:{$monthKey}:{$months}";

        return Cache::remember($cacheKey, now()->addSeconds(60), function () use ($userId, $now, $months) {
            $isSqlite = DB::getDriverName() === 'sqlite';
            $dateExpr = $isSqlite ? "strftime('%Y-%m', date)" : "DATE_FORMAT(date, '%Y-%m')";

            $trendData = Transaction::query()
                ->where('user_id', $userId)
                ->whereBetween('date', [
                    $now->copy()->subMonths($months - 1)->startOfMonth()->toDateString(),
                    $now->copy()->endOfMonth()->toDateString(),
                ])
                ->selectRaw("{$dateExpr} as month_key")
                ->selectRaw("COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income")
                ->selectRaw("COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expense")
                ->selectRaw("COALESCE(SUM(CASE WHEN type = 'income' AND is_spent = 1 THEN amount ELSE 0 END), 0) as total_spent_income")
                ->groupByRaw($dateExpr)
                ->get()
                ->keyBy('month_key');

            $trend = [];
            for ($i = $months - 1; $i >= 0; $i--) {
                $month = $now->copy()->subMonths($i);
                $monthTotals = $trendData->get($month->format('Y-m'));

                $trend[] = [
                    'month' => $month->format('M'),
                    'income' => (float) ($monthTotals->total_income ?? 0),
                    'expense' => (float) (
                        ($monthTotals->total_expense ?? 0) +
                        ($monthTotals->total_spent_income ?? 0)
                    ),
                ];
            }

            return [
                'trend' => $trend,
                'trendData' => $trendData,
            ];
        });
    }

    /**
     * Loan summary aggregations.
     *
     * @param Collection<int, Loan>|null $loans
     * @return array{total_original: float, total_remaining: float, total_paid: float}
     */
    public function getLoanSummary(int $userId, ?Collection $loans = null): array
    {
        if ($loans === null) {
            $loans = Loan::query()
                ->where('user_id', $userId)
                ->select(['amount', 'remaining_amount'])
                ->get();
        }

        $totalOriginal = (float) $loans->sum('amount');
        $totalRemaining = (float) $loans->sum('remaining_amount');

        return [
            'total_original' => $totalOriginal,
            'total_remaining' => $totalRemaining,
            'total_paid' => (float) ($totalOriginal - $totalRemaining),
        ];
    }

    /**
     * Savings summary aggregations.
     *
     * @param Collection<int, SavingsGoal>|null $savings
     * @return array{total_target: float, total_current: float, total_needed: float}
     */
    public function getSavingsSummary(int $userId, ?Collection $savings = null): array
    {
        if ($savings === null) {
            $savings = SavingsGoal::query()
                ->where('user_id', $userId)
                ->select(['target_amount', 'current_amount'])
                ->get();
        }

        $totalTarget = (float) $savings->sum('target_amount');
        $totalCurrent = (float) $savings->sum('current_amount');

        return [
            'total_target' => $totalTarget,
            'total_current' => $totalCurrent,
            'total_needed' => (float) max(0, $totalTarget - $totalCurrent),
        ];
    }

    /**
     * Entity sums for secondary cards and AI context (1 query).
     *
     * @return array{total_savings: float, total_loans_outstanding: float, total_allowances: float}
     */
    public function getEntitySums(int $userId): array
    {
        $cacheKey = "finance:{$userId}:entity_sums";

        return Cache::remember($cacheKey, now()->addSeconds(60), function () use ($userId) {
            $sums = DB::selectOne(
                "SELECT 
                    (SELECT COALESCE(SUM(current_amount), 0) FROM savings_goals WHERE user_id = ?) as total_savings,
                    (SELECT COALESCE(SUM(remaining_amount), 0) FROM loans WHERE user_id = ?) as total_loans_outstanding,
                    (SELECT COALESCE(SUM(amount), 0) FROM allowances WHERE user_id = ?) as total_allowances",
                [$userId, $userId, $userId]
            );

            return [
                'total_savings' => (float) ($sums->total_savings ?? 0),
                'total_loans_outstanding' => (float) ($sums->total_loans_outstanding ?? 0),
                'total_allowances' => (float) ($sums->total_allowances ?? 0),
            ];
        });
    }

    /**
     * High-level dashboard data aggregator.
     *
     * @return array{
     *     summary: array{
     *         currentBalance: float,
     *         totalIncome: float,
     *         totalExpenses: float,
     *         spentIncome: float,
     *         remainingBudget: float,
     *         totalAllowances: float,
     *         totalLoansOutstanding: float,
     *         totalSavings: float
     *     },
     *     recentTransactions: \Illuminate\Database\Eloquent\Collection<int, Transaction>,
     *     spendingChart: list<array{date: string, amount: float}>,
     *     topCategories: list<array{name: string, percentage: float, amount: float}>
     * }
     */
    public function getDashboardData(int $userId, ?Carbon $now = null): array
    {
        $now = $now ?? Carbon::now();

        $totals = $this->getTransactionTotals($userId, $now);
        $budget = $this->getBudgetSummary($userId, $now, $totals['monthly_expenses']);
        $categorySummary = $this->getCategorySummary($userId, $now);
        $topCategories = $this->getTopCategories($userId, $now, $budget['total_monthly_budget'], 3, $categorySummary);
        $entitySums = $this->getEntitySums($userId);
        $spendingChart = $this->get7DaySpendingChart($userId, $now);

        $recentTransactions = Transaction::query()
            ->select(['id', 'category_id', 'amount', 'type', 'source', 'date', 'notes', 'is_spent'])
            ->with('category:id,name')
            ->where('user_id', $userId)
            ->orderByDesc('date')
            ->limit(5)
            ->get();

        return [
            'summary' => [
                'currentBalance' => $totals['current_balance'],
                'totalIncome' => $totals['total_income'],
                'totalExpenses' => $totals['effective_expenses'],
                'spentIncome' => $totals['spent_income'],
                'remainingBudget' => $budget['remaining_budget'],
                'totalAllowances' => $entitySums['total_allowances'],
                'totalLoansOutstanding' => $entitySums['total_loans_outstanding'],
                'totalSavings' => $entitySums['total_savings'],
            ],
            'recentTransactions' => $recentTransactions,
            'spendingChart' => $spendingChart,
            'topCategories' => $topCategories,
        ];
    }

    /**
     * AI context summary aggregator (bounded to ≤ 6 queries).
     *
     * @return array{
     *     current_balance: float,
     *     total_income: float,
     *     total_expenses: float,
     *     remaining_budget: float,
     *     top_categories: list<array{name: string, percentage: float, amount: float}>,
     *     total_savings: float,
     *     total_loans_outstanding: float,
     *     total_allowances: float
     * }
     */
    public function getAiSummary(int $userId, ?Carbon $now = null): array
    {
        $now = $now ?? Carbon::now();

        $totals = $this->getTransactionTotals($userId, $now);
        $budget = $this->getBudgetSummary($userId, $now, $totals['monthly_expenses']);
        $categorySummary = $this->getCategorySummary($userId, $now);
        $topCategories = $this->getTopCategories($userId, $now, $budget['total_monthly_budget'], 3, $categorySummary);
        $entitySums = $this->getEntitySums($userId);

        return [
            'current_balance' => $totals['current_balance'],
            'total_income' => $totals['total_income'],
            'total_expenses' => $totals['effective_expenses'],
            'remaining_budget' => $budget['remaining_budget'],
            'top_categories' => $topCategories,
            'total_savings' => $entitySums['total_savings'],
            'total_loans_outstanding' => $entitySums['total_loans_outstanding'],
            'total_allowances' => $entitySums['total_allowances'],
        ];
    }
}
