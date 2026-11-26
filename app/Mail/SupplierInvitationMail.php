<?php

declare(strict_types=1);

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SupplierInvitationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $supplier,
        public string $eventType = 'invited', // invited | approved | rejected
        public ?string $temporaryPassword = null
    ) {}

    public function envelope(): Envelope
    {
        $subject = match ($this->eventType) {
            'approved' => 'Your SPEED AUTOS PARTS Supplier Account is Approved',
            'rejected' => 'Update on Your SPEED AUTOS PARTS Supplier Application',
            default => 'You Are Invited to Join SPEED AUTOS PARTS Supplier Portal',
        };

        return new Envelope(subject: $subject);
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.supplier-invitation',
        );
    }
}
