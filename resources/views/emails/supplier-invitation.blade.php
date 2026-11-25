<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Supplier Portal Notification</title></head>
<body style="font-family: Arial, sans-serif; color: #151515; background: #f8fafc; padding: 24px;">
    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 28px;">
        <h2 style="color: #F36B16; margin-top: 0;">SPEED AUTOS PARTS — Supplier Portal</h2>
        <p>Hello {{ $supplier->name }} ({{ $supplier->company_name ?? 'Partner' }}),</p>
        @if($eventType === 'approved')
            <p>Your supplier account has been <strong>approved</strong> by the Speed Autos Parts administration team. You can now sign in to submit catalog offers and dispatch lots.</p>
        @elseif($eventType === 'rejected')
            <p>Thank you for your interest in partnering with Speed Autos Parts. Unfortunately, your supplier application was not approved at this time.</p>
        @else
            <p>You have been invited by the Speed Autos Parts administrator to join our B2B Supplier Portal.</p>
            <p><strong>Login Email:</strong> {{ $supplier->email }}@if($temporaryPassword)<br><strong>Temporary Password:</strong> {{ $temporaryPassword }}@endif</p>
        @endif
        <p><a href="{{ url('/login') }}" style="display: inline-block; background: #F36B16; color: #ffffff; padding: 10px 18px; text-decoration: none; border-radius: 4px; font-weight: bold;">Go to Supplier Portal</a></p>
    </div>
</body>
</html>
