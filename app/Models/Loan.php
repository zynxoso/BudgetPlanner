<?php

namespace App\Models;

use App\Traits\OwnedByUser;
use Illuminate\Database\Eloquent\Model;

class Loan extends Model
{
    use OwnedByUser;

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

    protected $appends = [
        'accrued_interest',
    ];

    public function getAccruedInterestAttribute(): float
    {
        if ((float) $this->interest_rate <= 0 || (float) $this->remaining_amount <= 0) {
            return 0.0;
        }

        $borrowed = $this->date_borrowed ?? $this->created_at;
        if (! $borrowed) {
            return 0.0;
        }

        $borrowedDate = $borrowed instanceof \Illuminate\Support\Carbon
            ? $borrowed
            : \Illuminate\Support\Carbon::parse($borrowed);

        $daysOutstanding = max(0, (int) $borrowedDate->startOfDay()->diffInDays(now()->startOfDay()));
        $annualRate = (float) $this->interest_rate / 100.0;
        $accrued = (float) $this->remaining_amount * $annualRate * ($daysOutstanding / 365.0);

        return round($accrued, 2);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function payments(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(LoanPayment::class);
    }
}
