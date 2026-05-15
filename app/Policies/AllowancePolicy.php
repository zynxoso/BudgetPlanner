<?php

namespace App\Policies;

use App\Models\Allowance;
use App\Models\User;

class AllowancePolicy
{
    public function update(User $user, Allowance $allowance): bool
    {
        return $allowance->user_id === $user->id;
    }

    public function delete(User $user, Allowance $allowance): bool
    {
        return $allowance->user_id === $user->id;
    }
}
