<?php

declare(strict_types=1);

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\NewsletterSubscriber;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NewsletterController extends Controller
{
    public function subscribe(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'string', 'email', 'max:255'],
            'name' => ['nullable', 'string', 'max:150'],
        ]);

        $email = strtolower(trim($validated['email']));
        $existing = NewsletterSubscriber::where('email', $email)->first();

        if ($existing && $existing->status === 'subscribed') {
            return response()->json([
                'success' => true,
                'already_subscribed' => true,
                'message' => 'You are already subscribed to the Speed Autos Parts newsletter!',
            ]);
        }

        NewsletterSubscriber::updateOrCreate(
            ['email' => $email],
            [
                'name' => $validated['name'] ?? ($existing?->name),
                'status' => 'subscribed',
                'source' => 'footer',
                'subscribed_at' => now(),
                'unsubscribed_at' => null,
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Thank you for subscribing to Speed Autos Parts!',
        ]);
    }
}
