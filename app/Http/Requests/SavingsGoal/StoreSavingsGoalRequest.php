<?php

namespace App\Http\Requests\SavingsGoal;

use Illuminate\Foundation\Http\FormRequest;

class StoreSavingsGoalRequest extends FormRequest
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
            'target_amount' => ['required', 'numeric', 'min:0.01', 'max:999999999.99'],
            'deadline' => ['required', 'date', 'after:today'],
            'image' => ['nullable', 'image', 'mimes:jpeg,png,webp', 'max:2048'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Please enter a goal name.',
            'name.max' => 'The goal name cannot exceed 255 characters.',
            'target_amount.required' => 'Please enter a target savings amount.',
            'target_amount.numeric' => 'The target amount must be a valid number.',
            'target_amount.min' => 'The target amount must be at least ₱0.01.',
            'target_amount.max' => 'The target amount cannot exceed ₱999,999,999.99.',
            'deadline.required' => 'Please set a target deadline date.',
            'deadline.date' => 'Please provide a valid date.',
            'deadline.after' => 'The deadline date must be in the future.',
            'image.image' => 'The uploaded file must be an image.',
            'image.mimes' => 'The image must be a JPEG, PNG, or WEBP file.',
            'image.max' => 'The image size cannot exceed 2MB.',
        ];
    }
}
