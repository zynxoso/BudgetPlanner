<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * Default categories use user_id = NULL so every user sees them.
     * Users can create their own categories on top of these.
     */
    public function run(): void
    {
        $defaults = [
            ['name' => 'Food', 'icon' => 'Utensils', 'color' => '#f87171'],
            ['name' => 'Transport', 'icon' => 'Bus', 'color' => '#60a5fa'],
            ['name' => 'School', 'icon' => 'GraduationCap', 'color' => '#fbbf24'],
            ['name' => 'Bills', 'icon' => 'FileText', 'color' => '#34d399'],
            ['name' => 'Shopping', 'icon' => 'ShoppingBag', 'color' => '#818cf8'],
            ['name' => 'Others', 'icon' => 'MoreHorizontal', 'color' => '#9ca3af'],
        ];

        foreach ($defaults as $attributes) {
            Category::firstOrCreate(
                ['user_id' => null, 'name' => $attributes['name']],
                $attributes
            );
        }
    }
}
