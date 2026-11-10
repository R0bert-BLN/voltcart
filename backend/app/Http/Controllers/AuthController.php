<?php

namespace App\Http\Controllers;

use App\Data\Auth\LoginData;
use App\Data\Auth\RegisterData;
use App\Data\Auth\TokenData;
use App\Data\Auth\UserData;
use App\Services\AuthService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class AuthController extends Controller
{
    public function __construct(private readonly AuthService $auth) {}

    public function register(RegisterData $data): TokenData
    {
        return $this->auth->register($data);
    }

    public function login(LoginData $data): TokenData
    {
        return $this->auth->login($data);
    }

    public function logout(Request $request): Response
    {
        $this->auth->logout($request->user());

        return response()->noContent();
    }

    public function me(Request $request): UserData
    {
        return UserData::from($request->user());
    }
}
