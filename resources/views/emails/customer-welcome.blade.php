<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Welcome to SPEED AUTOS PARTS</title></head>
<body style="font-family: Arial, sans-serif; color: #151515; background: #f8fafc; padding: 24px;">
    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 28px;">
        <h2 style="color: #F36B16; margin-top: 0;">Welcome to SPEED AUTOS PARTS</h2>
        <p>Hello {{ $user->name }},</p>
        <p>Your customer account has been created successfully. You can now save vehicles for guaranteed fitment, manage addresses, track orders, and check out seamlessly in AED, USD, or EUR.</p>
        <p><a href="{{ url('/customer/dashboard') }}" style="display: inline-block; background: #F36B16; color: #ffffff; padding: 10px 18px; text-decoration: none; border-radius: 4px; font-weight: bold;">Open My Account</a></p>
    </div>
</body>
</html>
