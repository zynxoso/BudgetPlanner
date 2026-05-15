<?php

namespace App\Http\Controllers;

use App\Http\Requests\Allowance\StoreAllowanceRequest;
use App\Http\Requests\Allowance\UpdateAllowanceRequest;
use App\Models\Allowance;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AllowanceController extends Controller
{
    public function index(): Response
    {
        $allowances = Allowance::query()
            ->select(['id', 'amount', 'frequency'])
            ->where('user_id', Auth::id())
            ->get();

        return Inertia::render('allowance/index', [
            'allowances' => $allowances,
        ]);
    }

    public function store(StoreAllowanceRequest $request): RedirectResponse
    {
        Allowance::create(array_merge($request->validated(), [
            'user_id' => Auth::id(),
        ]));

        return redirect()->back()->with('success', 'Allowance created successfully');
    }

    public function update(UpdateAllowanceRequest $request, Allowance $allowance): RedirectResponse
    {
        $this->authorize('update', $allowance);

        $allowance->update($request->validated());

        return redirect()->back()->with('success', 'Allowance updated successfully');
    }

    public function destroy(Allowance $allowance): RedirectResponse
    {
        $this->authorize('delete', $allowance);

        $allowance->delete();

        return redirect()->back()->with('success', 'Allowance removed successfully');
    }
}
