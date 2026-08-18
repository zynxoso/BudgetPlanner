<?php

namespace App\Traits;

use App\Models\User;

trait OwnedByUser
{
    public function isOwnedBy(User|int $user): bool
    {
        $userId = $user instanceof User ? $user->id : $user;

        return (int) $this->user_id === (int) $userId;
    }
}
