<?php

namespace App\Http\Requests\Allowance;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAllowanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Ownership enforced via AllowancePolicy in the controller.
        return $this->user() !== null;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'amount' => ['required', 'numeric', 'min:0.01', 'max:999999999.99'],
            'frequency' => ['required', 'string', 'in:daily,weekly,monthly,yearly'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'amount.required' => 'Please enter an allowance amount.',
            'amount.numeric' => 'The allowance amount must be a valid number.',
            'amount.min' => 'The allowance amount must be at least ₱0.01.',
            'amount.max' => 'The allowance amount cannot exceed ₱999,999,999.99.',
            'frequency.required' => 'Please select a frequency interval.',
            'frequency.in' => 'Frequency must be daily, weekly, monthly, or yearly.',
        ];
    }
}
