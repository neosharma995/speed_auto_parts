<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsStaff
{
    /**
     * Handle an incoming request.
     * Ensures only authenticated staff members (Admin, Editor, or Custom staff roles) can access administrative routes.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || ! $user->isStaff()) {
            abort(403, 'Unauthorized. Administrative staff access required.');
        }

        return $next($request);
    }
}
