<?php

namespace App\Services\Common;

use App\Data\Common\LoginData;
use App\Data\Common\RegisterData;
use App\Data\Common\TokenData;
use App\Data\Common\UserData;
use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthService
{
    public function register(RegisterData $data): TokenData
    {
        $user = User::query()->create([
            'name' => $data->name,
            'email' => $data->email,
            'password' => Hash::make($data->password),
            'role' => UserRole::Client,
        ]);

        return $this->token($user);
    }

    public function login(LoginData $data): TokenData
    {
        $user = User::query()->where('email', $data->email)->first();

        if ($user === null || ! Hash::check($data->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => 'These credentials do not match our records.',
            ]);
        }

        return $this->token($user);
    }

    public function logout(User $user): void
    {
        $user->currentAccessToken()->delete();
    }

    private function token(User $user): TokenData
    {
        return new TokenData(
            token: $user->createToken('auth')->plainTextToken,
            user: UserData::from($user),
        );
    }
}
