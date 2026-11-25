<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Order Status Update</title></head>
<body style="font-family: Arial, sans-serif; color: #151515; background: #f8fafc; padding: 24px;">
    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 28px;">
        <h2 style="color: #F36B16; margin-top: 0;">SPEED AUTOS PARTS</h2>
        <h3>Order #{{ $order->order_number }} Status Updated</h3>
        <p>Hello {{ $order->customer_name }},</p>
        <p>Your order fulfillment status is now: <strong style="text-transform: uppercase;">{{ $order->delivery_status }}</strong>.</p>
        @if($order->tracking_number)
            <p>
                <strong>Carrier:</strong> {{ $order->tracking_carrier ?? 'Aramex Express UAE' }}<br>
                <strong>Tracking Number:</strong> {{ $order->tracking_number }}
            </p>
        @endif
        <p style="font-size: 12px; color: #64748b;">Thank you for shopping with SPEED AUTOS PARTS.</p>
    </div>
</body>
</html>
