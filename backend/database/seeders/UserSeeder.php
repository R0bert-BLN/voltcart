<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Seed the two mockup users.
     */
    public function run(): void
    {
        User::create([
            'name' => 'Maya Keller',
            'email' => 'maya@voltcart.test',
            'phone' => '+49 30 123456',
            'password' => Hash::make('password'),
            'role' => UserRole::Client,
        ]);

        User::create([
            'name' => 'Daniel Roth',
            'email' => 'admin@voltcart.test',
            'phone' => '+49 30 654321',
            'password' => Hash::make('password'),
            'role' => UserRole::Admin,
        ]);
    }
}
