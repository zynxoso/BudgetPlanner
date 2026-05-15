<?php

namespace App\Http\Controllers;

use App\Models\Loan;
use App\Models\SavingsGoal;
use App\Models\Transaction;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class ReportsController extends Controller
{
    public function index()
    {
        $userId = Auth::id();
        if (!$userId) {
            return redirect()->route('login');
        }
        
        // Category breakdown for current month
        $now = Carbon::now();
        $categorySummary = Transaction::query()
            ->where('user_id', $userId)
            ->where('type', 'expense')
            ->whereMonth('date', $now->month)
            ->whereYear('date', $now->year)
            ->selectRaw('category_id, sum(amount) as total')
            ->groupBy('category_id')
            ->with('category:id,name')
            ->get()
            ->map(function ($item) {
                return [
                    'name' => $item->category->name ?? 'Uncategorized',
                    'value' => (float)$item->total,
                ];
            });
            
        // Monthly trend for last 6 months
        $trendTransactions = Transaction::query()
            ->where('user_id', $userId)
            ->whereBetween('date', [$now->copy()->subMonths(5)->startOfMonth(), $now->copy()->endOfMonth()])
            ->get(['date', 'amount', 'type', 'is_spent']);

        $trendByMonth = $trendTransactions->groupBy(function (Transaction $transaction): string {
            return Carbon::parse($transaction->date)->format('Y-n');
        });

        $trend = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = $now->copy()->subMonths($i);
            $monthTotals = $trendByMonth->get($month->format('Y-n'), collect());
                
            $trend[] = [
                'month' => $month->format('M'),
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
