<?php

namespace App\Http\Controllers;

use App\Http\Requests\BankAccount\StoreBankAccountRequest;
use App\Http\Requests\BankAccount\TransferRequest;
use App\Http\Requests\BankAccount\UpdateBankAccountRequest;
use App\Models\BankAccount;
use App\Models\Transaction;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class BankAccountController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $accounts = $user->bankAccounts()->orderBy('created_at', 'desc')->get();

        $totalBalance = $accounts->where('account_type', '!=', 'credit_card')->sum('balance');
        $totalSavings = $accounts->whereIn('account_type', ['savings', 'investment'])->sum('balance');
        $totalChecking = $accounts->whereIn('account_type', ['checking', 'e_wallet'])->sum('balance');
        $totalCreditDebt = abs($accounts->where('account_type', 'credit_card')->where('balance', '<', 0)->sum('balance'));

        return Inertia::render('banks/index', [
            'bankAccounts' => $accounts,
            'stats' => [
                'totalBalance' => (float) $totalBalance,
                'totalSavings' => (float) $totalSavings,
                'totalChecking' => (float) $totalChecking,
                'totalCreditDebt' => (float) $totalCreditDebt,
                'accountCount' => $accounts->count(),
            ],
        ]);
    }

    public function store(StoreBankAccountRequest $request): RedirectResponse
    {
        $request->user()->bankAccounts()->create($request->validated());

        return back()->with('success', 'Bank account created successfully.');
    }

    public function update(UpdateBankAccountRequest $request, BankAccount $bankAccount): RedirectResponse
    {
        $this->authorize('update', $bankAccount);

        $bankAccount->update($request->validated());

        return back()->with('success', 'Bank account updated successfully.');
    }

    public function destroy(Request $request, BankAccount $bankAccount): RedirectResponse
    {
        $this->authorize('delete', $bankAccount);

        $bankAccount->delete();

        return back()->with('success', 'Bank account deleted successfully.');
    }

    public function transfer(TransferRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $userId = $request->user()->id;

        $fromAcc = BankAccount::where('id', $validated['from_account_id'])
            ->where('user_id', $userId)
            ->firstOrFail();

        $toAcc = BankAccount::where('id', $validated['to_account_id'])
            ->where('user_id', $userId)
            ->firstOrFail();

        if ((float) $validated['amount'] > (float) $fromAcc->balance) {
            throw ValidationException::withMessages([
                'amount' => ['Transfer amount exceeds available account balance.'],
            ]);
        }

        DB::transaction(function () use ($fromAcc, $toAcc, $userId, $validated) {
            $lockedFrom = BankAccount::where('id', $fromAcc->id)
                ->where('user_id', $userId)
                ->lockForUpdate()
                ->firstOrFail();

            $lockedTo = BankAccount::where('id', $toAcc->id)
                ->where('user_id', $userId)
                ->lockForUpdate()
                ->firstOrFail();

            if ((float) $validated['amount'] > (float) $lockedFrom->balance) {
                throw ValidationException::withMessages([
                    'amount' => ['Transfer amount exceeds available account balance.'],
                ]);
            }

            $lockedFrom->decrement('balance', $validated['amount']);
            $lockedTo->increment('balance', $validated['amount']);
        });

        return back()->with('success', 'Funds transferred successfully.');
    }
}
