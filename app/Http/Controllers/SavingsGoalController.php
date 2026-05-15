<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\SavingsGoal;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class SavingsGoalController extends Controller
{
    public function index()
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

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'target_amount' => 'required|numeric|min:0',
            'deadline' => 'required|date|after:today',
        ]);

        SavingsGoal::create([
            'user_id' => Auth::id(),
            'name' => $validated['name'],
            'target_amount' => $validated['target_amount'],
            'current_amount' => 0,
            'deadline' => $validated['deadline'],
        ]);

        return redirect()->back()->with('success', 'Savings goal created successfully');
    }

    public function updateAddAmount(Request $request, SavingsGoal $savingsGoal)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0',
        ]);

        $savingsGoal->increment('current_amount', $validated['amount']);

        return redirect()->back()->with('success', 'Goal progress updated');
    }

    public function destroy(SavingsGoal $savingsGoal)
    {
        if ($savingsGoal->user_id !== Auth::id()) {
            abort(403);
        }

        $savingsGoal->delete();

        return redirect()->back()->with('success', 'Savings goal deleted successfully');
    }
}
