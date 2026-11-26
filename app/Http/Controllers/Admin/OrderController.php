<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\OrderStatusUpdatedMail;
use App\Models\Order;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Order::query()->with(['items', 'user']);

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                    ->orWhere('customer_name', 'like', "%{$search}%")
                    ->orWhere('customer_email', 'like', "%{$search}%")
                    ->orWhere('customer_phone', 'like', "%{$search}%");
            });
        }

        if ($status = $request->query('status')) {
            $query->where('delivery_status', $status);
        }

        if ($payment = $request->query('payment')) {
            $query->where('payment_status', $payment);
        }

        $orders = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('Admin/Orders/Index', [
            'orders' => $orders,
            'filters' => (object) $request->only(['search', 'status', 'payment']),
        ]);
    }

    public function show(Order $order): Response
    {
        $order->load(['items', 'user']);

        return Inertia::render('Admin/Orders/Show', [
            'order' => $order,
        ]);
    }

    public function update(Request $request, Order $order): RedirectResponse
    {
        $validated = $request->validate([
            'delivery_status' => ['required', 'string'],
            'payment_status' => ['required', 'string'],
            'tracking_number' => ['nullable', 'string', 'max:100'],
            'tracking_carrier' => ['nullable', 'string', 'max:100'],
            'tracking_url' => ['nullable', 'string', 'max:255'],
        ]);

        $order->update([
            'delivery_status' => $validated['delivery_status'],
            'payment_status' => $validated['payment_status'],
            'tracking_number' => $validated['tracking_number'],
            'tracking_carrier' => $validated['tracking_carrier'],
            'tracking_url' => $validated['tracking_url'],
        ]);

        if (! empty($order->customer_email)) {
            try {
                Mail::to($order->customer_email)->send(new OrderStatusUpdatedMail($order));
            } catch (\Throwable $e) {
                Log::warning('Order status notification email failed: ' . $e->getMessage());
            }
        }

        return back()->with('success', "Order #{$order->order_number} status updated.");
    }
}
