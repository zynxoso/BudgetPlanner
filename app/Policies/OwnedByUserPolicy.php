<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class OwnedByUserPolicy
{
    public function view(User $user, Model $model): bool
    {
        return $this->checkOwnership($user, $model);
    }

    public function update(User $user, Model $model): bool
    {
        return $this->checkOwnership($user, $model);
    }

    public function delete(User $user, Model $model): bool
    {
        return $this->checkOwnership($user, $model);
    }

    private function checkOwnership(User $user, Model $model): bool
    {
        if (method_exists($model, 'isOwnedBy')) {
            return $model->isOwnedBy($user);
        }

        return (int) ($model->user_id ?? null) === (int) $user->id;
    }
}
