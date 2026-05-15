<?php

namespace App\Policies;

use App\Models\SavingsGoal;
use App\Models\User;

class SavingsGoalPolicy
{
    public function update(User $user, SavingsGoal $goal): bool
    {
        return $goal->user_id === $user->id;
    }

    public function delete(User $user, SavingsGoal $goal): bool
    {
        return $goal->user_id === $user->id;
    }
}
