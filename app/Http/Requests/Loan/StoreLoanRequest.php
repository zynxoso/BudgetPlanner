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
}
