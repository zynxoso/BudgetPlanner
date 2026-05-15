<?php

namespace Database\Seeders;

use App\Models\Allowance;
use App\Models\Budget;
use App\Models\Category;
use App\Models\Loan;
use App\Models\SavingsGoal;
use App\Models\Transaction;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoDataSeeder extends Seeder
{
    /**
     * Seed demo data for the dashboard and reports.
     */
    public function run(): void
    {
        $user = User::firstOrCreate(
            ['email' => 'demo@example.com'],
            [
                'name' => 'Demo User',
                'password' => Hash::make('password'),
            ]
        );

        Transaction::where('user_id', $user->id)->delete();
        Budget::where('user_id', $user->id)->delete();
        Allowance::where('user_id', $user->id)->delete();
        SavingsGoal::where('user_id', $user->id)->delete();
        Loan::where('user_id', $user->id)->delete();
        Category::where('user_id', $user->id)->delete();

        $customCategories = collect([
            ['name' => 'Subscriptions', 'icon' => 'Repeat', 'color' => '#22c55e'],
            ['name' => 'Health', 'icon' => 'HeartPulse', 'color' => '#f97316'],
            ['name' => 'Entertainment', 'icon' => 'Film', 'color' => '#0ea5e9'],
        ])->map(fn (array $data) => Category::create(array_merge($data, ['user_id' => $user->id])));

        $categories = Category::query()
            ->whereNull('user_id')
            ->get()
            ->concat($customCategories)
            ->values();

        $now = Carbon::now();

        $budgetCategories = $categories->shuffle()->take(5);
        foreach ($budgetCategories as $category) {
            Budget::updateOrCreate(
                [
                    'user_id' => $user->id,
                    'category_id' => $category->id,
                    'month' => $now->month,
                    'year' => $now->year,
                ],
                [
                    'amount_limit' => fake()->numberBetween(2000, 12000),
                ]
            );
        }

        Allowance::create([
            'user_id' => $user->id,
            'amount' => 300,
            'frequency' => 'daily',
        ]);

        Allowance::create([
            'user_id' => $user->id,
            'amount' => 2000,
            'frequency' => 'weekly',
        ]);

        $incomeSources = ['Salary', 'Freelance', 'Commission', 'Refund'];
        for ($i = 0; $i < 5; $i++) {
            Transaction::create([
                'user_id' => $user->id,
                'amount' => fake()->numberBetween(20000, 35000),
                'type' => 'income',
                'source' => $incomeSources[$i % count($incomeSources)],
                'date' => $now->copy()->subMonths($i)->startOfMonth()->addDays(fake()->numberBetween(0, 3)),
                'notes' => fake()->boolean(30) ? fake()->sentence(4) : null,
                'is_spent' => fake()->boolean(30),
            ]);
        }

        for ($i = 0; $i < 60; $i++) {
            $category = $categories->random();

            Transaction::create([
                'user_id' => $user->id,
                'category_id' => $category->id,
                'amount' => fake()->numberBetween(80, 3500),
                'type' => 'expense',
                'date' => $now->copy()->subDays(fake()->numberBetween(0, 90)),
                'notes' => fake()->boolean(35) ? fake()->sentence(4) : null,
                'is_spent' => false,
            ]);
        }

        SavingsGoal::create([
            'user_id' => $user->id,
            'name' => 'Emergency Fund',
            'target_amount' => 50000,
            'current_amount' => 14000,
            'deadline' => $now->copy()->addMonths(8),
        ]);

        SavingsGoal::create([
            'user_id' => $user->id,
            'name' => 'New Laptop',
            'target_amount' => 65000,
            'current_amount' => 22000,
            'deadline' => $now->copy()->addMonths(5),
        ]);

        Loan::create([
            'user_id' => $user->id,
            'name' => 'Motorbike Loan',
            'amount' => 65000,
            'remaining_amount' => 31500,
            'interest_rate' => 4.5,
            'due_date' => $now->copy()->addMonths(10),
            'date_borrowed' => $now->copy()->subMonths(6),
            'status' => 'active',
        ]);

        Loan::create([
            'user_id' => $user->id,
            'name' => 'Phone Installment',
            'amount' => 24000,
            'remaining_amount' => 0,
            'interest_rate' => 0,
            'due_date' => $now->copy()->subMonths(1),
            'date_borrowed' => $now->copy()->subMonths(12),
            'status' => 'paid',
        ]);
    }
}
