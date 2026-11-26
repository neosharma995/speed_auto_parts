<?php

declare(strict_types=1);

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\EmailOtpService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class PasswordResetOtpController extends Controller
{
    public function __construct(
        protected EmailOtpService $otpService
    ) {}

    public function create(): Response
    {
        return Inertia::render('Auth/ForgotPassword', [
            'status' => session('status'),
        ]);
    }

    public function sendOtp(Request $request): JsonResponse|RedirectResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'string', 'lowercase', 'email', 'exists:users,email'],
        ], [
            'email.exists' => 'No account found with this email address.',
        ]);

        $user = User::where('email', $validated['email'])->firstOrFail();

        try {
            $this->otpService->sendOtp(
                email: $user->email,
                purpose: 'forgot_password',
                recipientName: $user->name
            );
        } catch (\Throwable $e) {
            Log::error('Password reset OTP email failed: ' . $e->getMessage());

            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Could not send reset OTP email. Please verify your SMTP mail settings in .env (' . $e->getMessage() . ').',
                ], 500);
            }

            return back()->withErrors([
                'email' => 'Could not send reset OTP email. Please check mail configuration.',
            ]);
        }

        $message = 'A 6-digit password reset OTP has been sent to ' . $user->email . '.';

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => $message,
            ]);
        }

        return back()->with('status', $message);
    }

    public function reset(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'string', 'lowercase', 'email', 'exists:users,email'],
            'otp' => ['required', 'digits:6'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $verification = $this->otpService->verifyOtp(
            email: $validated['email'],
            purpose: 'forgot_password',
            code: (string) $validated['otp'],
            consume: true
        );

        if (! $verification['valid']) {
            throw ValidationException::withMessages([
                'otp' => $verification['message'],
            ]);
        }

        $user = User::where('email', $validated['email'])->firstOrFail();
        $user->password = Hash::make($validated['password']);
        $user->save();

        return redirect()->route('login')->with('status', 'Password reset successfully! Please sign in with your new password.');
    }
}
