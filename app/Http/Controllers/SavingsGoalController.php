<?php

namespace App\Http\Controllers;

use App\Http\Requests\SavingsGoal\AddSavingsGoalAmountRequest;
use App\Http\Requests\SavingsGoal\StoreSavingsGoalRequest;
use App\Http\Requests\SavingsGoal\UpdateSavingsGoalRequest;
use App\Models\SavingsGoal;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class SavingsGoalController extends Controller
{
    public function index(): Response
    {
        $goals = SavingsGoal::query()
            ->select(['id', 'name', 'image', 'target_amount', 'current_amount', 'deadline'])
            ->where('user_id', Auth::id())
            ->orderBy('deadline', 'asc')
            ->get();

        return Inertia::render('savings-goals/index', [
            'goals' => $goals,
        ]);
    }

    public function store(StoreSavingsGoalRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $imagePath = $this->handleImageUpload($request);

        SavingsGoal::create([
            'user_id' => Auth::id(),
            'name' => $validated['name'],
            'image' => $imagePath,
            'target_amount' => $validated['target_amount'],
            'current_amount' => 0,
            'deadline' => $validated['deadline'],
        ]);

        return redirect()->back()->with('success', 'Savings goal created successfully');
    }

    public function update(UpdateSavingsGoalRequest $request, SavingsGoal $savingsGoal): RedirectResponse
    {
        $this->authorize('update', $savingsGoal);

        $validated = $request->validated();

        $imagePath = $this->handleImageUpload($request, $savingsGoal->image);

        $savingsGoal->update([
            'name' => $validated['name'],
            'image' => $imagePath,
            'target_amount' => $validated['target_amount'],
            'deadline' => $validated['deadline'],
        ]);

        return redirect()->back()->with('success', 'Savings goal updated successfully');
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

        $this->deleteImage($savingsGoal->image);

        $savingsGoal->delete();

        return redirect()->back()->with('success', 'Savings goal deleted successfully');
    }

    private function handleImageUpload(Request $request, ?string $currentImage = null): ?string
    {
        if ($request->hasFile('image')) {
            $this->deleteImage($currentImage);

            $path = $request->file('image')->store('savings-goals', 'public');

            return Storage::url($path);
        }

        return $currentImage;
    }

    private function deleteImage(?string $imagePath): void
    {
        if ($imagePath && str_starts_with($imagePath, '/storage/savings-goals/')) {
            $oldPath = str_replace('/storage/', '', $imagePath);
            Storage::disk('public')->delete($oldPath);
        }
    }
}
