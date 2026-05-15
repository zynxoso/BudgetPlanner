<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            ['name' => 'Food', 'icon' => 'Utensils', 'color' => '#f87171'],
            ['name' => 'Transport', 'icon' => 'Bus', 'color' => '#60a5fa'],
            ['name' => 'School', 'icon' => 'GraduationCap', 'color' => '#fbbf24'],
            ['name' => 'Bills', 'icon' => 'FileText', 'color' => '#34d399'],
            ['name' => 'Shopping', 'icon' => 'ShoppingBag', 'color' => '#818cf8'],
            ['name' => 'Others', 'icon' => 'MoreHorizontal', 'color' => '#9ca3af'],
        ];

        foreach ($categories as $category) {
            \App\Models\Category::create(array_merge($category, ['user_id' => 1]));
        }
    }
}
