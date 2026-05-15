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
}
