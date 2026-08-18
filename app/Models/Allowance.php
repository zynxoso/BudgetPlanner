<?php

namespace App\Models;

use App\Traits\OwnedByUser;
use Illuminate\Database\Eloquent\Model;

class Allowance extends Model
{
    use OwnedByUser;

    protected $fillable = ['user_id', 'amount', 'frequency'];

    protected $casts = [
        'amount' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
