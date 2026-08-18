<?php

namespace App\Http\Requests\Budget;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreBudgetRequest extends FormRequest
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
        $userId = $this->user()->id;

        return [
            'category_id' => [
                'required',
                Rule::exists('categories', 'id')->where(function ($query) use ($userId) {
                    $query->where(function ($q) use ($userId) {
                        $q->where('user_id', $userId)->orWhereNull('user_id');
                    });
                }),
            ],
            'amount_limit' => ['required', 'numeric', 'min:0', 'max:999999999.99'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'category_id.required' => 'Please select a category for this budget.',
            'category_id.exists' => 'The selected category does not exist.',
            'amount_limit.required' => 'Please enter a monthly budget limit.',
            'amount_limit.numeric' => 'The budget limit must be a valid number.',
            'amount_limit.min' => 'The budget limit cannot be negative.',
            'amount_limit.max' => 'The budget limit cannot exceed ₱999,999,999.99.',
        ];
    }
}
