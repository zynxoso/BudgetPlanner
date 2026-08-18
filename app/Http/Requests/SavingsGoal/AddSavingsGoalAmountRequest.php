<?php

namespace App\Http\Requests\SavingsGoal;

use Illuminate\Foundation\Http\FormRequest;

class AddSavingsGoalAmountRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Ownership enforced via SavingsGoalPolicy in the controller.
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
            'amount.required' => 'Please enter the deposit amount to save.',
            'amount.numeric' => 'The amount must be a valid number.',
            'amount.min' => 'The amount must be at least ₱0.01.',
            'amount.max' => 'The amount cannot exceed ₱999,999,999.99.',
        ];
    }
}
