<?php

declare(strict_types=1);

namespace App\Http\Controllers\Auth;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Mail\CustomerWelcomeMail;
use App\Models\User;
use App\Services\EmailOtpService;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class RegisteredUserController extends Controller
{
    public function __construct(
        protected EmailOtpService $otpService
    ) {}

    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    public function sendOtp(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:' . User::class],
            'phone' => ['nullable', 'string', 'max:25'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        try {
            $this->otpService->sendOtp(
                email: $validated['email'],
                purpose: 'register',
                recipientName: $validated['name']
            );
        } catch (\Throwable $e) {
            Log::error('Registration OTP email failed: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Could not send verification OTP email. Please verify your SMTP mail settings in .env (' . $e->getMessage() . ').',
            ], 500);
        }

        return response()->json([
            'success' => true,
            'message' => 'A 6-digit verification OTP has been sent to ' . $validated['email'] . '.',
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:' . User::class],
            'phone' => ['nullable', 'string', 'max:25'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'otp' => ['required', 'digits:6'],
        ]);

        $verification = $this->otpService->verifyOtp(
            email: $validated['email'],
            purpose: 'register',
            code: (string) $validated['otp'],
            consume: true
        );

        if (! $verification['valid']) {
            throw ValidationException::withMessages([
                'otp' => $verification['message'],
            ]);
        }

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'password' => Hash::make($validated['password']),
            'email_verified_at' => now(),
            'status' => 'active',
        ]);

        // Assign Customer role
        $customerRole = Role::firstOrCreate(['name' => UserRole::Customer->value, 'guard_name' => 'web']);
        $user->assignRole($customerRole);

        event(new Registered($user));

        try {
            Mail::to($user->email)->send(new CustomerWelcomeMail($user));
        } catch (\Throwable $e) {
            Log::warning('Customer welcome email failed: ' . $e->getMessage());
        }

        Auth::login($user);

        return redirect(route('customer.dashboard'));
    }
}
