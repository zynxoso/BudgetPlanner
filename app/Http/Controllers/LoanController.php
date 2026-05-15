<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Loan;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class LoanController extends Controller
{
    public function index()
    {
        $loans = Loan::query()
            ->select(['id', 'name', 'amount', 'remaining_amount', 'interest_rate', 'due_date', 'date_borrowed', 'status'])
            ->where('user_id', Auth::id())
            ->orderByDesc('date_borrowed')
            ->get();

        return Inertia::render('loans/index', [
            'loans' => $loans,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
            'interest_rate' => 'nullable|numeric|min:0',
            'due_date' => 'nullable|date',
            'date_borrowed' => 'required|date',
        ]);

        Loan::create(array_merge($validated, [
            'user_id' => Auth::id(),
            'remaining_amount' => $validated['amount'],
            'status' => 'active',
        ]));

        return redirect()->back()->with('success', 'Loan added successfully');
    }

    public function destroy(Loan $loan)
    {
        if ($loan->user_id !== Auth::id()) {
            abort(403);
        }

        $loan->delete();

        return redirect()->back()->with('success', 'Loan deleted successfully');
    }

    public function makePayment(Request $request, Loan $loan)
    {
        if ($loan->user_id !== Auth::id()) {
            abort(403);
        }

        $validated = $request->validate([
            'amount' => 'required|numeric|min:0',
        ]);

        $loan->decrement('remaining_amount', $validated['amount']);

        if ($loan->remaining_amount <= 0) {
            $loan->update([
                'remaining_amount' => 0,
                'status' => 'paid'
            ]);
        }

        return redirect()->back()->with('success', 'Payment recorded');
    }
}
