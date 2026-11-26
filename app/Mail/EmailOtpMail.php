<?php

declare(strict_types=1);

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class EmailOtpMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $otp,
        public string $purpose = 'register',
        public ?string $recipientName = null,
        public int $expiresInMinutes = 10
    ) {}

    public function envelope(): Envelope
    {
        $subject = $this->purpose === 'forgot_password'
            ? 'Password Reset OTP — SPEED AUTOS PARTS'
            : 'Email Verification OTP — SPEED AUTOS PARTS';

        return new Envelope(subject: $subject);
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.email-otp',
        );
    }
}
