<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seed shared default categories (user_id = NULL) first so every user inherits them.
        $this->call(CategorySeeder::class);

        User::firstOrCreate(['email' => 'demo@example.com'], [
            'name' => 'Demo User',
            'password' => bcrypt('password'),
        ]);

        $this->call(DemoDataSeeder::class);
    }
}
