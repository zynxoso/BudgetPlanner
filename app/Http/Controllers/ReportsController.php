<?php

namespace App\Http\Controllers;

use App\Models\BankAccount;
use App\Models\Loan;
use App\Models\SavingsGoal;
use App\Models\Transaction;
use App\Services\FinanceSummaryService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportsController extends Controller
{
    public function __construct(private readonly FinanceSummaryService $financeSummary)
    {
    }

    public function index(): Response
    {
        $userId = (int) Auth::id();
        $now = Carbon::now();

        $categorySummary = $this->financeSummary->getCategorySummary($userId, $now)
            ->map(fn ($item) => [
                'name' => $item['name'],
                'value' => (float) $item['value'],
            ]);

        $monthlyTrend = $this->financeSummary->getMonthlyTrend($userId, $now, 6);

        return Inertia::render('reports/index', [
            'categorySummary' => $categorySummary,
            'trend' => $monthlyTrend['trend'],
            'loanSummary' => $this->financeSummary->getLoanSummary($userId),
            'savingsSummary' => $this->financeSummary->getSavingsSummary($userId),
        ]);
    }

    public function statement(): Response
    {
        $userId = (int) Auth::id();
        $user = Auth::user();
        $now = Carbon::now();

        // 1. Bank Accounts and Total Balances
        $bankAccounts = BankAccount::query()
            ->where('user_id', $userId)
            ->orderBy('account_type', 'asc')
            ->get();

        $totalChecking = (float) $bankAccounts->whereIn('account_type', ['checking', 'ewallet'])->sum('balance');
        $totalSavings = (float) $bankAccounts->where('account_type', 'savings')->sum('balance');
        $totalCreditDebt = (float) $bankAccounts->where('account_type', 'credit_card')->sum('balance');
        $closingBalance = $totalChecking + $totalSavings - $totalCreditDebt;

        // 2. Spending by category for current month
        $categorySummary = $this->financeSummary->getCategorySummary($userId, $now)
            ->map(fn ($item) => [
                'name' => $item['name'],
                'value' => (float) $item['value'],
            ]);

        $totalCategorySpent = (float) $categorySummary->sum('value');

        // 3. Current Month Transactions & Running Balance Ledger
        $monthTransactions = Transaction::query()
            ->where('user_id', $userId)
            ->whereMonth('date', $now->month)
            ->whereYear('date', $now->year)
            ->with('category:id,name')
            ->orderBy('date', 'asc')
            ->orderBy('id', 'asc')
            ->get();

        $totalDeposits = (float) $monthTransactions->where('type', 'income')->sum('amount');
        $totalWithdrawals = (float) $monthTransactions->where('type', 'expense')->sum('amount');
        $netChange = $totalDeposits - $totalWithdrawals;
        $openingBalance = $closingBalance - $netChange;

        $running = $openingBalance;
        $transactionLedger = $monthTransactions->map(function ($tx) use (&$running) {
            $amt = (float) $tx->amount;
            if ($tx->type === 'income') {
                $running += $amt;
                $debit = 0;
                $credit = $amt;
            } else {
                $running -= $amt;
                $debit = $amt;
                $credit = 0;
            }

            return [
                'id' => $tx->id,
                'refNo' => 'TXN-' . Carbon::parse($tx->date)->format('ymd') . '-' . str_pad((string) $tx->id, 4, '0', STR_PAD_LEFT),
                'date' => Carbon::parse($tx->date)->format('Y-m-d'),
                'displayDate' => Carbon::parse($tx->date)->format('d M Y'),
                'valueDate' => Carbon::parse($tx->date)->format('d M Y'),
                'description' => $tx->type === 'income' ? ($tx->source ?? 'Funds Received / Deposit') : ($tx->category->name ?? 'Point of Sale Debit'),
                'notes' => $tx->notes,
                'type' => $tx->type,
                'debit' => $debit,
                'credit' => $credit,
                'runningBalance' => $running,
            ];
        })->reverse()->values();

        // 4. Loans & Credit Facilities
        $loans = Loan::query()
            ->where('user_id', $userId)
            ->orderBy('due_date', 'asc')
            ->get();

        $loanSummary = $this->financeSummary->getLoanSummary($userId, $loans);

        // 5. Savings Goals
        $savings = SavingsGoal::query()
            ->where('user_id', $userId)
            ->orderBy('deadline', 'asc')
            ->get();

        $savingsSummary = $this->financeSummary->getSavingsSummary($userId, $savings);

        return Inertia::render('reports/statement', [
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
                'customerSince' => $user->created_at ? Carbon::parse($user->created_at)->format('F Y') : 'January 2026',
            ],
            'statementMeta' => [
                'statementNo' => 'BP-STMT-' . $now->format('Ym') . '-' . str_pad((string) $userId, 5, '0', STR_PAD_LEFT),
                'accountNumber' => 'BP-08' . str_pad((string) $userId, 6, '0', STR_PAD_LEFT) . '-PHP',
                'issueDate' => $now->format('d F Y'),
                'periodStart' => $now->copy()->startOfMonth()->format('d M Y'),
                'periodEnd' => $now->copy()->endOfMonth()->format('d M Y'),
                'statementPeriod' => $now->copy()->startOfMonth()->format('d M Y') . ' - ' . $now->copy()->endOfMonth()->format('d M Y'),
                'month' => $now->format('F Y'),
                'currency' => 'PHP (₱)',
            ],
            'balanceSummary' => [
                'openingBalance' => $openingBalance,
                'totalDeposits' => $totalDeposits,
                'totalWithdrawals' => $totalWithdrawals,
                'closingBalance' => $closingBalance,
                'netChange' => $netChange,
                'totalSavingsBalance' => $totalSavings,
                'totalCheckingBalance' => $totalChecking,
                'totalCreditDebt' => $totalCreditDebt,
            ],
            'bankAccounts' => $bankAccounts,
            'categorySummary' => $categorySummary,
            'totalCategorySpent' => $totalCategorySpent,
            'loans' => $loans,
            'loanSummary' => $loanSummary,
            'savings' => $savings,
            'savingsSummary' => $savingsSummary,
            'ledger' => $transactionLedger,
        ]);
    }

    public function export(Request $request): StreamedResponse
    {
        $userId = (int) Auth::id();
        $user = Auth::user();
        $now = Carbon::now();
        $fileName = 'financial-report-' . $now->format('Y-m-d') . '.csv';

        // Fetch all report data
        $categorySummary = $this->financeSummary->getCategorySummary($userId, $now);
        $totalCategorySpent = (float) $categorySummary->sum('value');

        $monthlyTrend = $this->financeSummary->getMonthlyTrend($userId, $now, 6);
        $trendData = $monthlyTrend['trendData'];

        $loans = Loan::query()
            ->where('user_id', $userId)
            ->orderBy('due_date', 'asc')
            ->get();

        $savings = SavingsGoal::query()
            ->where('user_id', $userId)
            ->orderBy('deadline', 'asc')
            ->get();

        $currentMonthTotals = $trendData->get($now->format('Y-m'));
        $latestIncome = (float) ($currentMonthTotals->total_income ?? 0);
        $latestExpense = (float) (($currentMonthTotals->total_expense ?? 0) + ($currentMonthTotals->total_spent_income ?? 0));
        $netCashFlow = $latestIncome - $latestExpense;

        return response()->streamDownload(function () use (
            $userId,
            $now,
            $user,
            $categorySummary,
            $totalCategorySpent,
            $trendData,
            $loans,
            $savings,
            $latestIncome,
            $latestExpense,
            $netCashFlow
        ) {
            $handle = fopen('php://output', 'w');
            
            // UTF-8 BOM for proper rendering in Microsoft Excel
            fprintf($handle, chr(0xEF).chr(0xBB).chr(0xBF));

            // Header Section
            fputcsv($handle, ['BUDGET PLANNER - COMPLETE FINANCIAL STATEMENT & ANALYTICS REPORT']);
            fputcsv($handle, ['Generated On:', $now->format('F j, Y g:i A')]);
            fputcsv($handle, ['Account Holder:', ($user->name ?? 'User') . ' (' . ($user->email ?? '') . ')']);
            fputcsv($handle, ['Report Period:', $now->format('F Y')]);
            fputcsv($handle, []);

            // 1. Executive Summary & KPIs
            fputcsv($handle, ['=== 1. EXECUTIVE SUMMARY & KEY FINANCIAL KPIS ===']);
            fputcsv($handle, ['Metric', 'Amount (PHP)', 'Notes / Status']);
            fputcsv($handle, ['Total Spent (Current Month)', number_format($totalCategorySpent, 2, '.', ''), 'Across all active expense categories']);
            fputcsv($handle, ['Latest Month Inflow', number_format($latestIncome, 2, '.', ''), 'Total recorded income']);
            fputcsv($handle, ['Latest Month Outflow', number_format($latestExpense, 2, '.', ''), 'Total recorded expenses']);
            fputcsv($handle, ['Net Cash Flow', number_format($netCashFlow, 2, '.', ''), $netCashFlow >= 0 ? 'Surplus / Positive Net Flow' : 'Deficit / Overspending']);
            fputcsv($handle, ['Total Loan Borrowed', number_format((float) $loans->sum('amount'), 2, '.', ''), 'Historical total debt taken']);
            fputcsv($handle, ['Total Loan Repaid', number_format((float) ($loans->sum('amount') - $loans->sum('remaining_amount')), 2, '.', ''), 'Settled principal amount']);
            fputcsv($handle, ['Outstanding Loan Balance', number_format((float) $loans->sum('remaining_amount'), 2, '.', ''), 'Remaining active debt to pay']);
            fputcsv($handle, ['Total Savings Target', number_format((float) $savings->sum('target_amount'), 2, '.', ''), 'Global savings target goal']);
            fputcsv($handle, ['Total Current Savings', number_format((float) $savings->sum('current_amount'), 2, '.', ''), 'Total accumulated savings funds']);
            fputcsv($handle, ['Savings Needed', number_format(max(0, (float) ($savings->sum('target_amount') - $savings->sum('current_amount'))), 2, '.', ''), 'Remaining amount to reach goal']);
            fputcsv($handle, []);

            // 2. Category Breakdown
            fputcsv($handle, ['=== 2. MONTHLY EXPENSES BY CATEGORY ===']);
            fputcsv($handle, ['Category Name', 'Amount Spent (PHP)', 'Share of Spending (%)']);
            if ($categorySummary->isEmpty()) {
                fputcsv($handle, ['No expense categories recorded for this month', '0.00', '0%']);
            } else {
                foreach ($categorySummary as $cat) {
                    $catName = is_array($cat) ? ($cat['name'] ?? 'Uncategorized') : ($cat->category->name ?? 'Uncategorized');
                    $catAmount = is_array($cat) ? (float) ($cat['value'] ?? $cat['total'] ?? 0) : (float) $cat->total;
                    $percentage = $totalCategorySpent > 0 ? round(($catAmount / $totalCategorySpent) * 100, 1) : 0;
                    fputcsv($handle, [
                        $catName,
                        number_format($catAmount, 2, '.', ''),
                        $percentage . '%',
                    ]);
                }
            }
            fputcsv($handle, []);

            // 3. 6-Month Trend
            fputcsv($handle, ['=== 3. 6-MONTH INCOME VS EXPENSE TREND ===']);
            fputcsv($handle, ['Month', 'Income (PHP)', 'Expenses (PHP)', 'Net Cashflow (PHP)']);
            for ($i = 5; $i >= 0; $i--) {
                $month = $now->copy()->subMonths($i);
                $monthTotals = $trendData->get($month->format('Y-m'));
                $inc = (float) ($monthTotals->total_income ?? 0);
                $exp = (float) (
                    ($monthTotals->total_expense ?? 0) +
                    ($monthTotals->total_spent_income ?? 0)
                );
                $net = $inc - $exp;
                fputcsv($handle, [
                    $month->format('F Y'),
                    number_format($inc, 2, '.', ''),
                    number_format($exp, 2, '.', ''),
                    number_format($net, 2, '.', ''),
                ]);
            }
            fputcsv($handle, []);

            // 4. Active Loans Breakdown
            fputcsv($handle, ['=== 4. ACTIVE LOANS & PAYLATER SCHEDULE ===']);
            fputcsv($handle, ['Loan / Account Name', 'Total Borrowed (PHP)', 'Remaining Balance (PHP)', 'Interest Rate (%)', 'Date Borrowed', 'Due Date', 'Status']);
            if ($loans->isEmpty()) {
                fputcsv($handle, ['No active loan obligations found', '0.00', '0.00', '0.00', 'N/A', 'N/A', 'Settled']);
            } else {
                foreach ($loans as $loan) {
                    fputcsv($handle, [
                        $loan->name,
                        number_format((float) $loan->amount, 2, '.', ''),
                        number_format((float) $loan->remaining_amount, 2, '.', ''),
                        number_format((float) ($loan->interest_rate ?? 0), 2, '.', '') . '%',
                        $loan->date_borrowed ? Carbon::parse($loan->date_borrowed)->format('Y-m-d') : 'N/A',
                        $loan->due_date ? Carbon::parse($loan->due_date)->format('Y-m-d') : 'N/A',
                        ucfirst($loan->status ?? 'active'),
                    ]);
                }
            }
            fputcsv($handle, []);

            // 5. Savings Goals Progress
            fputcsv($handle, ['=== 5. SAVINGS GOALS & ASSET ALLOCATION ===']);
            fputcsv($handle, ['Goal Name', 'Target Amount (PHP)', 'Current Saved (PHP)', 'Progress (%)', 'Target Deadline']);
            if ($savings->isEmpty()) {
                fputcsv($handle, ['No savings goals created yet', '0.00', '0.00', '0%', 'N/A']);
            } else {
                foreach ($savings as $sg) {
                    $target = (float) $sg->target_amount;
                    $current = (float) $sg->current_amount;
                    $prog = $target > 0 ? min(100, round(($current / $target) * 100, 1)) : 0;
                    fputcsv($handle, [
                        $sg->name,
                        number_format($target, 2, '.', ''),
                        number_format($current, 2, '.', ''),
                        $prog . '%',
                        $sg->deadline ? Carbon::parse($sg->deadline)->format('Y-m-d') : 'Ongoing',
                    ]);
                }
            }
            fputcsv($handle, []);

            // 6. Current Month Transactions (streamed via cursor to minimize memory footprint)
            fputcsv($handle, ['=== 6. CURRENT MONTH TRANSACTION DETAILS ===']);
            fputcsv($handle, ['Date', 'Type', 'Category / Source', 'Amount (PHP)', 'Notes']);

            $txCursor = Transaction::query()
                ->where('user_id', $userId)
                ->whereMonth('date', $now->month)
                ->whereYear('date', $now->year)
                ->with('category:id,name')
                ->orderByDesc('date')
                ->cursor();

            $hasTransactions = false;
            foreach ($txCursor as $tx) {
                $hasTransactions = true;
                $name = $tx->type === 'income' ? ($tx->source ?? 'Income') : ($tx->category->name ?? 'Expense');
                fputcsv($handle, [
                    Carbon::parse($tx->date)->format('Y-m-d'),
                    strtoupper($tx->type),
                    $name,
                    ($tx->type === 'income' ? '+' : '-') . number_format((float) $tx->amount, 2, '.', ''),
                    $tx->notes ?? '',
                ]);
            }

            if (! $hasTransactions) {
                fputcsv($handle, ['No transactions recorded this month', '', '', '0.00', '']);
            }

            fclose($handle);
        }, $fileName, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$fileName}\"",
        ]);
    }
}
