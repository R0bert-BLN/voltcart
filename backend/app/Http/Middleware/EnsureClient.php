<?php

namespace App\Http\Middleware;

use App\Enums\UserRole;
use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureClient
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user instanceof User) {
            abort(403);
        }

        // The model's casts() docblock makes static analysis see `role` as a
        // plain string, so read the attribute untyped and handle both cases.
        $role = $user->getAttribute('role');

        if ($role !== UserRole::Client && $role !== UserRole::Client->value) {
            abort(403);
        }

        return $next($request);
    }
}
