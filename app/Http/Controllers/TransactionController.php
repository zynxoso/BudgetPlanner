<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Transaction;
use App\Models\Category;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class TransactionController extends Controller
{
    public function incomeIndex()
    {
        $incomes = Transaction::query()
            ->select(['id', 'amount', 'type', 'source', 'date', 'notes', 'is_spent'])
            ->where('user_id', Auth::id())
            ->where('type', 'income')
            ->orderByDesc('date')
            ->get();

        return Inertia::render('transactions/income', [
            'incomes' => $incomes
        ]);
    }

    public function storeIncome(Request $request)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0',
            'source' => 'required|string|max:255',
            'date' => 'required|date',
            'notes' => 'nullable|string',
            'is_spent' => 'nullable|boolean',
        ]);

        Transaction::create(array_merge($validated, [
            'user_id' => Auth::id(),
            'type' => 'income',
        ]));

        return redirect()->back()->with('success', 'Income added successfully');
    }

    public function expenseIndex()
    {
        $expenses = Transaction::query()
            ->select(['id', 'category_id', 'amount', 'type', 'date', 'notes'])
            ->with('category:id,name')
            ->where('user_id', Auth::id())
            ->where('type', 'expense')
            ->orderByDesc('date')
            ->get();

        $categories = Category::query()
            ->select(['id', 'name'])
            ->where('user_id', Auth::id())
            ->orWhereNull('user_id')
            ->get();

        return Inertia::render('transactions/expenses', [
            'expenses' => $expenses,
            'categories' => $categories
        ]);
    }

    public function storeExpense(Request $request)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0',
            'category_id' => 'required|exists:categories,id',
            'date' => 'required|date',
            'notes' => 'nullable|string',
        ]);

        Transaction::create(array_merge($validated, [
            'user_id' => Auth::id(),
            'type' => 'expense',
        ]));

        return redirect()->back()->with('success', 'Expense added successfully');
    }

    public function allIndex()
    {
        $transactions = Transaction::query()
            ->select(['id', 'category_id', 'amount', 'type', 'source', 'date', 'notes', 'is_spent'])
            ->with('category:id,name')
            ->where('user_id', Auth::id())
            ->orderByDesc('date')
            ->paginate(15);

        $categories = Category::query()
            ->select(['id', 'name'])
            ->where('user_id', Auth::id())
            ->orWhereNull('user_id')
            ->get();

        return Inertia::render('transactions/index', [
            'transactions' => $transactions,
            'categories' => $categories
        ]);
    }

    public function update(Request $request, Transaction $transaction)
    {
        if ($transaction->user_id !== Auth::id()) {
            abort(403);
        }

        $rules = [
            'amount' => 'required|numeric|min:0',
            'date' => 'required|date',
            'notes' => 'nullable|string',
        ];

        if ($transaction->type === 'income') {
            $rules['source'] = 'required|string|max:255';
            $rules['is_spent'] = 'nullable|boolean';
        } else {
            $rules['category_id'] = 'required|exists:categories,id';
        }

        $validated = $request->validate($rules);

        $transaction->update($validated);

        return redirect()->back()->with('success', 'Transaction updated successfully');
    }

    public function destroy(Transaction $transaction)
    {
        if ($transaction->user_id !== Auth::id()) {
            abort(403);
        }

        $transaction->delete();

        return redirect()->back()->with('success', 'Transaction deleted successfully');
    }
}
