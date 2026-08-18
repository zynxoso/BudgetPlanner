<?php

namespace App\Http\Requests\Transaction;

use Illuminate\Foundation\Http\FormRequest;

class StoreIncomeRequest extends FormRequest
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
        return [
            'amount' => ['required', 'numeric', 'min:0.01', 'max:999999999.99'],
            'source' => ['required', 'string', 'max:255'],
            'date' => ['required', 'date'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'is_spent' => ['nullable', 'boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'amount.required' => 'Please enter the income amount.',
            'amount.numeric' => 'The income amount must be a valid number.',
            'amount.min' => 'The income amount must be at least ₱0.01.',
            'amount.max' => 'The income amount cannot exceed ₱999,999,999.99.',
            'source.required' => 'Please enter the income source (e.g. Salary, Freelance, Business).',
            'source.max' => 'The income source name cannot exceed 255 characters.',
            'date.required' => 'Please select the date for this income entry.',
            'date.date' => 'Please provide a valid date format.',
            'notes.max' => 'Notes cannot exceed 1,000 characters.',
        ];
    }
}
