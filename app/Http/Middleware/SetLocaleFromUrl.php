<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetLocaleFromUrl
{
    public function handle(Request $request, Closure $next): Response
    {
        $locale = strtolower((string) $request->route('locale', 'en'));

        if (in_array($locale, ['ar', 'fr'], true)) {
            app()->setLocale($locale);
        } else {
            app()->setLocale('en');
        }

        if ($request->route()) {
            $request->route()->forgetParameter('locale');
        }

        return $next($request);
    }
}
