<?php

namespace App\Http\Requests\Transaction;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreExpenseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $userId = $this->user()->id;

        return [
            'amount' => ['required', 'numeric', 'min:0.01', 'max:999999999.99'],
            'category_id' => [
                'required',
                Rule::exists('categories', 'id')->where(function ($query) use ($userId) {
                    $query->where(function ($q) use ($userId) {
                        $q->where('user_id', $userId)->orWhereNull('user_id');
                    });
                }),
            ],
            'date' => ['required', 'date'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'amount.required' => 'Please enter the expense amount.',
            'amount.numeric' => 'The expense amount must be a valid number.',
            'amount.min' => 'The expense amount must be at least ₱0.01.',
            'amount.max' => 'The expense amount cannot exceed ₱999,999,999.99.',
            'category_id.required' => 'Please select an expense category.',
            'category_id.exists' => 'The selected category does not exist.',
            'date.required' => 'Please select the date for this expense.',
            'date.date' => 'Please provide a valid date format.',
            'notes.max' => 'Notes cannot exceed 1,000 characters.',
        ];
    }
}
