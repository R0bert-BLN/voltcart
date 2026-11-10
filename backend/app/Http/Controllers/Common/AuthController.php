<?php

namespace App\Http\Controllers\Common;

use App\Data\Common\LoginData;
use App\Data\Common\RegisterData;
use App\Data\Common\TokenData;
use App\Data\Common\UserData;
use App\Http\Controllers\Controller;
use App\Services\Common\AuthService;
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
