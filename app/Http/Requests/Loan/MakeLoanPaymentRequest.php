<?php

namespace App\Http\Requests\Loan;

use Illuminate\Foundation\Http\FormRequest;

class MakeLoanPaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Ownership enforced via LoanPolicy in the controller.
        return $this->user() !== null;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'amount' => ['required', 'numeric', 'min:0.01', 'max:999999999.99'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'amount.required' => 'Please enter a repayment amount.',
            'amount.numeric' => 'The repayment amount must be a valid number.',
            'amount.min' => 'The repayment amount must be at least ₱0.01.',
            'amount.max' => 'The repayment amount cannot exceed ₱999,999,999.99.',
        ];
    }
}
