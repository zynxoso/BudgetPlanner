<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Loan extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'amount',
        'remaining_amount',
        'interest_rate',
        'due_date',
        'date_borrowed',
        'status',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'remaining_amount' => 'decimal:2',
        'interest_rate' => 'decimal:2',
        'due_date' => 'date',
        'date_borrowed' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
