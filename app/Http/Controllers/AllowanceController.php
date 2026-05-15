<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Allowance;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class AllowanceController extends Controller
{
    public function index()
    {
        $allowances = Allowance::query()
            ->select(['id', 'amount', 'frequency'])
            ->where('user_id', Auth::id())
            ->get();

        return Inertia::render('allowance/index', [
            'allowances' => $allowances,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0',
            'frequency' => 'required|string|in:daily,weekly,monthly,yearly',
        ]);

        Allowance::create([
            'user_id' => Auth::id(),
            'amount' => $validated['amount'],
            'frequency' => $validated['frequency'],
        ]);

        return redirect()->back()->with('success', 'Allowance created successfully');
    }

    public function update(Request $request, Allowance $allowance)
    {
        if ($allowance->user_id !== Auth::id()) {
            abort(403);
        }

        $validated = $request->validate([
            'amount' => 'required|numeric|min:0',
            'frequency' => 'required|string|in:daily,weekly,monthly,yearly',
        ]);

        $allowance->update($validated);

        return redirect()->back()->with('success', 'Allowance updated successfully');
    }

    public function destroy(Allowance $allowance)
    {
        if ($allowance->user_id !== Auth::id()) {
            abort(403);
        }

        $allowance->delete();

        return redirect()->back()->with('success', 'Allowance removed successfully');
    }
}
