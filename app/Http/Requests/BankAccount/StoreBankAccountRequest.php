<?php

namespace App\Http\Requests\BankAccount;

use Illuminate\Foundation\Http\FormRequest;

class StoreBankAccountRequest extends FormRequest
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
            'bank_name' => ['required', 'string', 'max:100'],
            'account_name' => ['required', 'string', 'max:100'],
            'account_number_last4' => ['nullable', 'string', 'max:4'],
            'account_type' => ['required', 'in:checking,savings,credit_card,investment,e_wallet'],
            'currency' => ['required', 'string', 'max:10'],
            'balance' => ['required', 'numeric'],
            'credit_limit' => ['nullable', 'numeric'],
            'color' => ['required', 'string', 'max:30'],
            'card_type' => ['nullable', 'string', 'max:30'],
            'card_network' => ['nullable', 'string', 'max:30'],
            'notes' => ['nullable', 'string', 'max:500'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'bank_name.required' => 'Please enter the bank or financial institution name.',
            'account_name.required' => 'Please enter a name for this account or card.',
            'account_type.required' => 'Please select an account type.',
            'account_type.in' => 'Selected account type is invalid.',
            'currency.required' => 'Please specify the currency.',
            'balance.required' => 'Please enter the current balance.',
            'balance.numeric' => 'The balance must be a valid number.',
            'credit_limit.numeric' => 'The credit limit must be a valid number.',
            'color.required' => 'Please select a card theme color.',
            'notes.max' => 'Notes cannot exceed 500 characters.',
        ];
    }
}
