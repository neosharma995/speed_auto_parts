<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>{{ $purpose === 'forgot_password' ? 'Password Reset OTP' : 'Verify Your Email' }}</title>
</head>
<body style="font-family: Arial, Helvetica, sans-serif; background:#F8FAFC; color:#0F172A; margin:0; padding:24px;">
    <div style="max-width:560px; margin:0 auto; background:#FFFFFF; border:1px solid #E2E8F0; border-radius:8px; overflow:hidden;">
        <div style="background:#111827; padding:20px 24px;">
            <h1 style="margin:0; font-size:18px; letter-spacing:1px; color:#FFFFFF;">
                <span style="color:#F36B16;">SPEED</span> AUTOS PARTS
            </h1>
        </div>

        <div style="padding:28px 24px;">
            <h2 style="margin:0 0 12px 0; font-size:20px; color:#0F172A;">
                {{ $purpose === 'forgot_password' ? 'Password Reset Verification Code' : 'Verify Your Email Address' }}
            </h2>

            <p style="margin:0 0 16px 0; font-size:14px; line-height:1.6; color:#334155;">
                Hello {{ $recipientName ?: 'there' }},
            </p>

            <p style="margin:0 0 20px 0; font-size:14px; line-height:1.6; color:#334155;">
                @if($purpose === 'forgot_password')
                    We received a request to reset your Speed Autos Parts account password. Enter the 6-digit One-Time Password (OTP) below to complete your password reset:
                @else
                    Thank you for registering with Speed Autos Parts. Please enter the 6-digit One-Time Password (OTP) below to verify your email address and complete your account setup:
                @endif
            </p>

            <div style="background:#FFF7ED; border:1px dashed #F36B16; border-radius:8px; padding:18px; text-align:center; margin:0 0 20px 0;">
                <div style="font-size:11px; text-transform:uppercase; letter-spacing:1.5px; color:#9A3412; margin-bottom:6px; font-weight:700;">
                    Your Verification Code
                </div>
                <div style="font-size:34px; font-weight:800; letter-spacing:10px; font-family:Consolas, Monaco, monospace; color:#0F172A;">
                    {{ $otp }}
                </div>
            </div>

            <p style="margin:0 0 10px 0; font-size:13px; color:#475569;">
                This code expires in <strong>{{ $expiresInMinutes }} minutes</strong>. For your security, never share this code with anyone.
            </p>

            <p style="margin:0; font-size:12px; color:#64748B;">
                If you did not request this code, you can safely ignore this email.
            </p>
        </div>

        <div style="background:#F8FAFC; border-top:1px solid #E2E8F0; padding:14px 24px; font-size:11px; color:#64748B; text-align:center;">
            &copy; {{ date('Y') }} Speed Autos Parts — Al Quoz Industrial Area 3, Dubai, UAE
        </div>
    </div>
</body>
</html>
