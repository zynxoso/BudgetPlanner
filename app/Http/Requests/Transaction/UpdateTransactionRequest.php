<?php

namespace App\Http\Requests\Transaction;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Authorization is enforced at the controller level via TransactionPolicy.
        return $this->user() !== null;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $userId = $this->user()->id;
        $transaction = $this->route('transaction');
        $type = $transaction?->type;

        $rules = [
            'amount' => ['required', 'numeric', 'min:0.01', 'max:999999999.99'],
            'date' => ['required', 'date'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];

        if ($type === 'income') {
            $rules['source'] = ['required', 'string', 'max:255'];
            $rules['is_spent'] = ['nullable', 'boolean'];
        } else {
            $rules['category_id'] = [
                'required',
                Rule::exists('categories', 'id')->where(function ($query) use ($userId) {
                    $query->where(function ($q) use ($userId) {
                        $q->where('user_id', $userId)->orWhereNull('user_id');
                    });
                }),
            ];
        }

        return $rules;
    }
}
