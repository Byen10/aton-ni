<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RolesSeeder::class,        // First, create roles
            UsersSeeder::class,        // Then users with roles
            CategoriesSeeder::class,   // Categories for equipment
            EmployeesSeeder::class,    // Employees
            EquipmentSeeder::class,    // Equipment with categories
            RequestsSeeder::class,     // Requests from employees
            TransactionsSeeder::class, // Finally, transactions
        ]);
    }
}

