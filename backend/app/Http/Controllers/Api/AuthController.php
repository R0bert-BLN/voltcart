<?php

namespace App\Http\Controllers\Api;

use App\Data\Auth\LoginData;
use App\Data\Auth\RegisterData;
use App\Data\Auth\TokenData;
use App\Data\Auth\UserData;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(RegisterData $data): TokenData
    {
        $user = User::create([
            'name' => $data->name,
            'email' => $data->email,
            'password' => Hash::make($data->password),
            'role' => UserRole::Client,
        ]);

        return new TokenData(
            token: $user->createToken('auth')->plainTextToken,
            user: UserData::from($user),
        );
    }

    public function login(LoginData $data): TokenData
    {
        $user = User::where('email', $data->email)->first();

        if ($user === null || ! Hash::check($data->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => 'These credentials do not match our records.',
            ]);
        }

        return new TokenData(
            token: $user->createToken('auth')->plainTextToken,
            user: UserData::from($user),
        );
    }

    public function logout(Request $request): Response
    {
        $request->user()->currentAccessToken()->delete();

        return response()->noContent();
    }

    public function me(Request $request): UserData
    {
        return UserData::from($request->user());
    }
}
