<?php

namespace App\Http\Controllers;

use App\Http\Requests\Loan\MakeLoanPaymentRequest;
use App\Http\Requests\Loan\StoreLoanRequest;
use App\Models\Loan;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class LoanController extends Controller
{
    public function index(): Response
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

    public function store(StoreLoanRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        Loan::create(array_merge($validated, [
            'user_id' => Auth::id(),
            'remaining_amount' => $validated['amount'],
            'status' => 'active',
        ]));

        return redirect()->back()->with('success', 'Loan added successfully');
    }

    public function destroy(Loan $loan): RedirectResponse
    {
        $this->authorize('delete', $loan);

        $loan->delete();

        return redirect()->back()->with('success', 'Loan deleted successfully');
    }

    public function makePayment(MakeLoanPaymentRequest $request, Loan $loan): RedirectResponse
    {
        $this->authorize('update', $loan);

        $payment = (float) $request->validated('amount');
        $remaining = (float) $loan->remaining_amount;
        $overpayment = max(0.0, $payment - $remaining);
        $newRemaining = max(0.0, $remaining - $payment);

        DB::transaction(function () use ($loan, $payment, $overpayment, $newRemaining) {
            $loan->payments()->create([
                'amount' => $payment,
                'overpayment_amount' => $overpayment,
                'date' => now()->toDateString(),
                'notes' => 'Loan payment',
            ]);

            $loan->update([
                'remaining_amount' => $newRemaining,
                'status' => $newRemaining <= 0 ? 'paid' : $loan->status,
            ]);
        });

        $message = $overpayment > 0
            ? 'Payment recorded. Overpayment of ' . number_format($overpayment, 2) . ' stored.'
            : 'Payment recorded';

        return redirect()->back()->with('success', $message);
    }
}
