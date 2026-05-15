<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    protected $fillable = ['user_id', 'category_id', 'amount', 'type', 'source', 'date', 'notes', 'is_spent'];

    protected $casts = [
        'date' => 'date',
        'amount' => 'decimal:2',
        'is_spent' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}
