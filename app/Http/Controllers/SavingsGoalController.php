<?php

namespace App\Http\Controllers;

use App\Http\Requests\SavingsGoal\AddSavingsGoalAmountRequest;
use App\Http\Requests\SavingsGoal\StoreSavingsGoalRequest;
use App\Models\SavingsGoal;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class SavingsGoalController extends Controller
{
    public function index(): Response
    {
        $goals = SavingsGoal::query()
            ->select(['id', 'name', 'target_amount', 'current_amount', 'deadline'])
            ->where('user_id', Auth::id())
            ->orderBy('deadline', 'asc')
            ->get();

        return Inertia::render('savings-goals/index', [
            'goals' => $goals,
        ]);
    }

    public function store(StoreSavingsGoalRequest $request): RedirectResponse
    {
        SavingsGoal::create(array_merge($request->validated(), [
            'user_id' => Auth::id(),
            'current_amount' => 0,
        ]));

        return redirect()->back()->with('success', 'Savings goal created successfully');
    }

    public function updateAddAmount(AddSavingsGoalAmountRequest $request, SavingsGoal $savingsGoal): RedirectResponse
    {
        // CRITICAL: this previously had no ownership check — fixed by policy authorization.
        $this->authorize('update', $savingsGoal);

        $savingsGoal->increment('current_amount', (float) $request->validated('amount'));

        return redirect()->back()->with('success', 'Goal progress updated');
    }

    public function destroy(SavingsGoal $savingsGoal): RedirectResponse
    {
        $this->authorize('delete', $savingsGoal);

        $savingsGoal->delete();

        return redirect()->back()->with('success', 'Savings goal deleted successfully');
    }
}
