<?php

namespace App\Http\Requests\Transaction;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        $transaction = $this->route('transaction');

        return $this->user() !== null && (! $transaction || $this->user()->can('update', $transaction));
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

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'amount.required' => 'Please enter an amount.',
            'amount.numeric' => 'The amount must be a valid number.',
            'amount.min' => 'The amount must be at least ₱0.01.',
            'amount.max' => 'The amount cannot exceed ₱999,999,999.99.',
            'source.required' => 'Please enter the income source.',
            'source.max' => 'The income source cannot exceed 255 characters.',
            'category_id.required' => 'Please select an expense category.',
            'category_id.exists' => 'The selected category does not exist.',
            'date.required' => 'Please select a date.',
            'date.date' => 'Please provide a valid date format.',
            'notes.max' => 'Notes cannot exceed 1,000 characters.',
        ];
    }
}
