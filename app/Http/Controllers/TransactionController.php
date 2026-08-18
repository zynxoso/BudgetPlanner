<?php

namespace App\Http\Controllers;

use App\Http\Requests\Transaction\StoreExpenseRequest;
use App\Http\Requests\Transaction\StoreIncomeRequest;
use App\Http\Requests\Transaction\UpdateTransactionRequest;
use App\Models\Category;
use App\Models\Transaction;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class TransactionController extends Controller
{
    public function incomeIndex(): Response
    {
        return $this->renderIndex('income');
    }

    public function storeIncome(StoreIncomeRequest $request): RedirectResponse
    {
        Transaction::create(array_merge($request->validated(), [
            'user_id' => Auth::id(),
            'type' => 'income',
        ]));

        return redirect()->back()->with('success', 'Income added successfully');
    }

    public function expenseIndex(): Response
    {
        return $this->renderIndex('expense');
    }

    public function storeExpense(StoreExpenseRequest $request): RedirectResponse
    {
        Transaction::create(array_merge($request->validated(), [
            'user_id' => Auth::id(),
            'type' => 'expense',
        ]));

        return redirect()->back()->with('success', 'Expense added successfully');
    }

    public function allIndex(): Response
    {
        return $this->renderIndex('all');
    }

    private function renderIndex(string $viewType): Response
    {
        $userId = (int) Auth::id();

        if ($viewType === 'income') {
            $incomes = Transaction::query()
                ->select(['id', 'amount', 'type', 'source', 'date', 'notes', 'is_spent'])
                ->where('user_id', $userId)
                ->where('type', 'income')
                ->orderByDesc('date')
                ->get();

            return Inertia::render('transactions/income', [
                'incomes' => $incomes,
            ]);
        }

        $categories = Category::query()
            ->select(['id', 'name'])
            ->where(function ($query) use ($userId) {
                $query->where('user_id', $userId)->orWhereNull('user_id');
            })
            ->get();

        if ($viewType === 'expense') {
            $expenses = Transaction::query()
                ->select(['id', 'category_id', 'amount', 'type', 'date', 'notes'])
                ->with('category:id,name')
                ->where('user_id', $userId)
                ->where('type', 'expense')
                ->orderByDesc('date')
                ->get();

            return Inertia::render('transactions/expenses', [
                'expenses' => $expenses,
                'categories' => $categories,
            ]);
        }

        $transactions = Transaction::query()
            ->select(['id', 'category_id', 'amount', 'type', 'source', 'date', 'notes', 'is_spent'])
            ->with('category:id,name')
            ->where('user_id', $userId)
            ->orderByDesc('date')
            ->paginate(15);

        return Inertia::render('transactions/index', [
            'transactions' => $transactions,
            'categories' => $categories,
        ]);
    }

    public function update(UpdateTransactionRequest $request, Transaction $transaction): RedirectResponse
    {
        $this->authorize('update', $transaction);

        $transaction->update($request->validated());

        return redirect()->back()->with('success', 'Transaction updated successfully');
    }

    public function destroy(Transaction $transaction): RedirectResponse
    {
        $this->authorize('delete', $transaction);

        $transaction->delete();

        return redirect()->back()->with('success', 'Transaction deleted successfully');
    }
}
