<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (): void {
        //
    })
    ->withExceptions(function (Exceptions $exceptions): void {

        // Token invalide → 403
        $exceptions->render(function () {
            return response()->json(['error' => 'Token invalide'], 403);
        });

        // Token expiré → 401
        $exceptions->render(function () {
            return response()->json(['error' => 'Token expiré, veuillez vous reconnecter'], 401);
        });

        // Token absent → 401
        $exceptions->render(function () {
            return response()->json(['error' => 'Token absent'], 401);
        });
    })->create();
