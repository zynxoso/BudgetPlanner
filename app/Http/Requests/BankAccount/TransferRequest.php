<?php

namespace App\Http\Requests\BankAccount;

use Illuminate\Foundation\Http\FormRequest;

class TransferRequest extends FormRequest
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
            'from_account_id' => ['required', 'exists:bank_accounts,id'],
            'to_account_id' => ['required', 'exists:bank_accounts,id', 'different:from_account_id'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'notes' => ['nullable', 'string', 'max:255'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'from_account_id.required' => 'Please select the source account to transfer from.',
            'from_account_id.exists' => 'The selected source account is invalid.',
            'to_account_id.required' => 'Please select the destination account to transfer to.',
            'to_account_id.exists' => 'The selected destination account is invalid.',
            'to_account_id.different' => 'Source and destination accounts must be different.',
            'amount.required' => 'Please enter the transfer amount.',
            'amount.numeric' => 'The transfer amount must be a valid number.',
            'amount.min' => 'The transfer amount must be at least ₱0.01.',
            'notes.max' => 'Notes cannot exceed 255 characters.',
        ];
    }
}
