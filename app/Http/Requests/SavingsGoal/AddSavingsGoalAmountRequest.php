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
}
