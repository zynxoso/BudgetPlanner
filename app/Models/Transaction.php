<?php

namespace App\Models;

use App\Traits\OwnedByUser;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Transaction extends Model
{
    use OwnedByUser;

    protected $fillable = ['user_id', 'category_id', 'amount', 'type', 'source', 'date', 'notes', 'is_spent'];

    protected $casts = [
        'date' => 'date',
        'amount' => 'decimal:2',
        'is_spent' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function scopeOwnedBy(Builder $query, int $userId): Builder
    {
        return $query->where('user_id', $userId);
    }

    public function scopeOfType(Builder $query, string $type): Builder
    {
        return $query->where('type', $type);
    }

    /**
     * Income rows that the user has marked as already spent.
     */
    public function scopeSpentIncome(Builder $query): Builder
    {
        return $query->where('type', 'income')->where('is_spent', true);
    }
}
