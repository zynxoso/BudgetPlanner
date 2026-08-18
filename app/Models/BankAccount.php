<?php

namespace App\Models;

use App\Traits\OwnedByUser;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BankAccount extends Model
{
    use HasFactory, OwnedByUser;

    protected $fillable = [
        'user_id',
        'bank_name',
        'account_name',
        'account_number_last4',
        'account_type',
        'currency',
        'balance',
        'credit_limit',
        'color',
        'card_type',
        'card_network',
        'status',
        'notes',
    ];

    protected $casts = [
        'balance' => 'float',
        'credit_limit' => 'float',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
