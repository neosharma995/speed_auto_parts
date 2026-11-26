<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Order Confirmation</title></head>
<body style="font-family: Arial, sans-serif; color: #151515; background: #f8fafc; padding: 24px;">
    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 28px;">
        <h2 style="color: #F36B16; margin-top: 0;">SPEED AUTOS PARTS</h2>
        <h3>Thank you for your order, {{ $order->customer_name }}!</h3>
        <p>Your order <strong>#{{ $order->order_number }}</strong> has been received and confirmed.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px;">
            <thead>
                <tr style="background: #f1f5f9; text-align: left;">
                    <th style="padding: 8px;">Item</th>
                    <th style="padding: 8px;">Qty</th>
                    <th style="padding: 8px; text-align: right;">Total ({{ $order->currency }})</th>
                </tr>
            </thead>
            <tbody>
                @foreach($order->items as $item)
                <tr style="border-bottom: 1px solid #e2e8f0;">
                    <td style="padding: 8px;">{{ $item->product_name }}</td>
                    <td style="padding: 8px;">{{ $item->quantity }}</td>
                    <td style="padding: 8px; text-align: right;">{{ number_format((float) $item->total, 2) }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
        <p style="font-size: 14px;">
            <strong>Subtotal:</strong> {{ $order->currency }} {{ number_format((float) $order->subtotal, 2) }}<br>
            <strong>Tax:</strong> {{ $order->currency }} {{ number_format((float) $order->tax_amount, 2) }}<br>
            <strong>Shipping:</strong> {{ $order->currency }} {{ number_format((float) $order->shipping_cost, 2) }}<br>
            <strong>Total Paid/Payable:</strong> <strong style="color: #F36B16;">{{ $order->currency }} {{ number_format((float) $order->total_amount, 2) }}</strong>
        </p>
        <p style="font-size: 12px; color: #64748b;">Payment Method: {{ strtoupper($order->payment_method) }} | Status: {{ strtoupper($order->payment_status) }}</p>
        <p style="font-size: 12px; color: #64748b;">Shipping Address: {{ $order->shipping_address }}, {{ $order->city }}, {{ $order->state }}, {{ $order->country }}</p>
    </div>
</body>
</html>
