<?php

namespace App\Models;

use App\Traits\OwnedByUser;
use Illuminate\Database\Eloquent\Model;

class SavingsGoal extends Model
{
    use OwnedByUser;

    protected $fillable = ['user_id', 'name', 'image', 'target_amount', 'current_amount', 'deadline'];

    protected $casts = [
        'target_amount' => 'decimal:2',
        'current_amount' => 'decimal:2',
        'deadline' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
