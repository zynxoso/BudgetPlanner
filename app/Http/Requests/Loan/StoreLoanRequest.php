<?php

namespace App\Http\Requests\Loan;

use Illuminate\Foundation\Http\FormRequest;

class StoreLoanRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:255'],
            'amount' => ['required', 'numeric', 'min:0.01', 'max:999999999.99'],
            'interest_rate' => ['nullable', 'numeric', 'min:0', 'max:999.99'],
            'due_date' => ['nullable', 'date'],
            'date_borrowed' => ['required', 'date'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Please enter the lender or loan name.',
            'name.max' => 'The loan name cannot exceed 255 characters.',
            'amount.required' => 'Please enter the total loan amount.',
            'amount.numeric' => 'The loan amount must be a valid number.',
            'amount.min' => 'The loan amount must be at least ₱0.01.',
            'amount.max' => 'The loan amount cannot exceed ₱999,999,999.99.',
            'interest_rate.numeric' => 'The interest rate must be a valid number.',
            'date_borrowed.required' => 'Please select the date borrowed.',
            'date_borrowed.date' => 'Please provide a valid date format for date borrowed.',
            'due_date.date' => 'Please provide a valid date format for due date.',
        ];
    }
}
