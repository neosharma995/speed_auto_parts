<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsSupplier
{
    /**
     * Handle an incoming request.
     * Ensures only active supplier accounts can access supplier portal routes.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || ! $user->isSupplier() || ($user->status ?? 'active') !== 'active') {
            abort(403, 'Unauthorized. Active supplier account required.');
        }

        return $next($request);
    }
}
