<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        \App\Models\User::factory()->create([
            'name' => 'Demo User',
            'email' => 'demo@example.com',
            'password' => \Hash::make('password'),
        ]);

        $this->call(CategorySeeder::class);
    }
}
