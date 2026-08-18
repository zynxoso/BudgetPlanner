<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LoanPayment extends Model
{
    protected $fillable = [
        'loan_id',
        'amount',
        'overpayment_amount',
        'date',
        'notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'overpayment_amount' => 'decimal:2',
        'date' => 'date',
    ];

    public function loan(): BelongsTo
    {
        return $this->belongsTo(Loan::class);
    }
}
