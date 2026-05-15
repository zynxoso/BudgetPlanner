<?php

namespace App\Policies;

use App\Models\Loan;
use App\Models\User;

class LoanPolicy
{
    public function update(User $user, Loan $loan): bool
    {
        return $loan->user_id === $user->id;
    }

    public function delete(User $user, Loan $loan): bool
    {
        return $loan->user_id === $user->id;
    }
}
