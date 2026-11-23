<?php

use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Session\TokenMismatchException;
use Spatie\Permission\Middleware\PermissionMiddleware;
use Spatie\Permission\Middleware\RoleMiddleware;
use Spatie\Permission\Middleware\RoleOrPermissionMiddleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'role' => RoleMiddleware::class,
            'permission' => PermissionMiddleware::class,
            'role_or_permission' => RoleOrPermissionMiddleware::class,
            'staff' => \App\Http\Middleware\EnsureUserIsStaff::class,
        ]);

        $middleware->validateCsrfTokens(except: [
            'pincode/*',
            'cart/*',
            'logout',
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (\Symfony\Component\HttpKernel\Exception\HttpException $e, $request) {
            if ($e->getStatusCode() === 419) {
                if ($request->header('X-Inertia')) {
                    return \Inertia\Inertia::location($request->headers->get('referer') ?: url()->previous() ?: '/');
                }
                return redirect()->back();
            }
        });

        $exceptions->render(function (TokenMismatchException $e, $request) {
            if ($request->header('X-Inertia')) {
                return \Inertia\Inertia::location($request->headers->get('referer') ?: url()->previous() ?: '/');
            }
            return redirect()->back();
        });
    })->create();
