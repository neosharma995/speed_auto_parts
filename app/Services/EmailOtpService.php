<?php

declare(strict_types=1);

namespace App\Services;

use App\Mail\EmailOtpMail;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

class EmailOtpService
{
    public const EXPIRY_MINUTES = 10;

    public const MAX_ATTEMPTS = 5;

    public function sendOtp(string $email, string $purpose, ?string $recipientName = null): string
    {
        $normalized = $this->normalizeEmail($email);
        $otp = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        $cacheKey = $this->cacheKey($normalized, $purpose);

        Cache::put($cacheKey, [
            'hash' => Hash::make($otp),
            'attempts' => 0,
            'expires_at' => now()->addMinutes(self::EXPIRY_MINUTES)->timestamp,
        ], now()->addMinutes(self::EXPIRY_MINUTES));

        Mail::to($normalized)->send(new EmailOtpMail(
            otp: $otp,
            purpose: $purpose,
            recipientName: $recipientName,
            expiresInMinutes: self::EXPIRY_MINUTES
        ));

        return $otp;
    }

    /**
     * @return array{valid: bool, message: string}
     */
    public function verifyOtp(string $email, string $purpose, string $code, bool $consume = true): array
    {
        $normalized = $this->normalizeEmail($email);
        $cacheKey = $this->cacheKey($normalized, $purpose);
        $payload = Cache::get($cacheKey);

        if (! is_array($payload) || empty($payload['hash'])) {
            return [
                'valid' => false,
                'message' => 'Your verification OTP has expired or was not requested. Please request a new code.',
            ];
        }

        if ((int) ($payload['attempts'] ?? 0) >= self::MAX_ATTEMPTS) {
            Cache::forget($cacheKey);

            return [
                'valid' => false,
                'message' => 'Too many invalid OTP attempts. Please request a new verification code.',
            ];
        }

        if (! Hash::check(trim($code), (string) $payload['hash'])) {
            $payload['attempts'] = (int) ($payload['attempts'] ?? 0) + 1;
            $remainingSeconds = max(60, (int) ($payload['expires_at'] ?? now()->addMinutes(2)->timestamp) - now()->timestamp);
            Cache::put($cacheKey, $payload, $remainingSeconds);

            return [
                'valid' => false,
                'message' => 'Invalid OTP code. Please check your email and try again.',
            ];
        }

        if ($consume) {
            Cache::forget($cacheKey);
        }

        return [
            'valid' => true,
            'message' => 'OTP verified successfully.',
        ];
    }

    protected function normalizeEmail(string $email): string
    {
        return strtolower(trim($email));
    }

    protected function cacheKey(string $normalizedEmail, string $purpose): string
    {
        return 'email_otp:' . $purpose . ':' . sha1($normalizedEmail);
    }
}
