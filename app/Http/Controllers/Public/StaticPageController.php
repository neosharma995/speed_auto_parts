<?php

declare(strict_types=1);

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StaticPageController extends Controller
{
    public function categories(): Response
    {
        $categories = Category::query()
            ->where('is_active', true)
            ->withCount('products')
            ->orderBy('sort_order')
            ->get();

        return Inertia::render('Public/Categories', [
            'categories' => $categories,
        ]);
    }

    public function brands(): Response
    {
        $brands = Brand::query()
            ->where('is_active', true)
            ->withCount('products')
            ->orderBy('name')
            ->get();

        return Inertia::render('Public/Brands', [
            'brands' => $brands,
        ]);
    }

    public function trackOrder(): Response
    {
        return Inertia::render('Public/TrackOrder');
    }

    public function trackOrderApi(Request $request): JsonResponse
    {
        $orderNumber = trim((string) $request->query('order_number'));

        if (empty($orderNumber)) {
            return response()->json([
                'success' => false,
                'message' => 'Please provide a valid order number.',
            ], 422);
        }

        $order = Order::query()
            ->where('order_number', $orderNumber)
            ->with(['items'])
            ->first();

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => "Order #{$orderNumber} was not found. Please verify the order number on your invoice.",
            ], 404);
        }

        return response()->json([
            'success' => true,
            'order' => [
                'order_number' => $order->order_number,
                'status' => $order->status,
                'payment_status' => $order->payment_status,
                'delivery_status' => $order->delivery_status,
                'tracking_number' => $order->tracking_number,
                'tracking_url' => $order->tracking_url,
                'carrier' => $order->carrier,
                'total_amount' => $order->total_amount,
                'shipping_city' => $order->shipping_city,
                'shipping_state' => $order->shipping_state,
                'created_at' => $order->created_at->format('M d, Y h:i A'),
                'items_count' => $order->items->count(),
            ],
        ]);
    }

    public function about(): Response
    {
        return Inertia::render('Public/StaticPage', [
            'title' => 'About AUTO PARTS',
            'subtitle' => 'Specialized automotive engineering spares & motorsport hardware distribution.',
            'content' => "Welcome to AUTO PARTS — your dedicated supplier for high-performance automotive replacement components, precision braking systems, high-flow induction setups, mandrel-bent exhausts, and track-grade suspension kits.\n\nFounded by passionate automotive engineers and drivers, AUTO PARTS bridges the gap between precision track performance and everyday street reliability. Every single component in our catalog is engineered to exacting tolerances, 100% genuine guaranteed, and backed by comprehensive vehicle compatibility databases.\n\nWhether you're executing a weekend garage build, upgrading track day brakes, or replacing critical OEM components, AUTO PARTS delivers verified fitment and fast nationwide distribution.",
        ]);
    }

    public function contact(): Response
    {
        return Inertia::render('Public/StaticPage', [
            'title' => 'Contact Engineering Support',
            'subtitle' => 'Have questions regarding vehicle fitment or part numbers? Our technical specialists are here to assist.',
            'content' => "Our team of certified automotive mechanics and performance specialists is available Monday through Saturday, 9:00 AM – 7:00 PM IST.\n\nDirect Inquiries:\n• Support Hotline: +91 11 4050 9000\n• Technical Fitment Desk: support@autoparts.in\n• Corporate Office: AUTO PARTS Logistics Hub, Industrial Area Phase II, New Delhi - 110020\n\nFor part number verification, please include your 17-digit VIN (Vehicle Identification Number), Engine Code, and Year/Make/Model in your inquiry.",
        ]);
    }

    public function shippingPolicy(): Response
    {
        return Inertia::render('Public/StaticPage', [
            'title' => 'Shipping & Dispatch Policy',
            'subtitle' => 'Safe packaging and nationwide logistics for heavy automotive hardware.',
            'content' => "Fast & Reliable Nationwide Dispatch:\n\n• Processing Time: In-stock components are inspected, packed with reinforced padding, and dispatched within 24 to 48 hours of order confirmation.\n• Standard Ground Shipping: 3 to 6 business days delivery across all tier-1 and tier-2 Indian pin codes.\n• Express Air Dispatch: 1 to 2 business days for select critical items (rotor kits, ECUs, sensors).\n• Freight Cargo for Heavy Items: Oversized items such as full cat-back exhaust systems, brake rotor assemblies, and coilover kits are shipped via verified ground freight partners (BlueDart / Delhivery Surface) with full transit insurance.\n• Tracking: Once shipped, real-time airway bill tracking details are dispatched via SMS and Email.",
        ]);
    }

    public function returnPolicy(): Response
    {
        return Inertia::render('Public/StaticPage', [
            'title' => 'Return & Refund Policy',
            'subtitle' => 'Hassle-free 30-day returns on uninstalled, verified automotive spares.',
            'content' => "Fitment Guarantee & Return Rules:\n\n• 30-Day Return Window: If a component is unopened, uninstalled, and in its original manufacturer packaging with all hardware intact, you may initiate a return within 30 days of delivery.\n• Fitment Guarantee: If an item verified through our Vehicle Parts Finder fails to fit your unmodified vehicle, we provide 100% free return pickup and replacement.\n• Non-Returnable Items: Electrical components (ECUs, wiring harnesses, opened sensors) and custom-drilled or mounted wheels/tires cannot be returned once test-fitted.\n• Refund Processing: Refunds are initiated within 48 hours of inspection at our central warehouse back to the original payment source.",
        ]);
    }

    public function privacyPolicy(): Response
    {
        return Inertia::render('Public/StaticPage', [
            'title' => 'Privacy Policy',
            'subtitle' => 'How AUTO PARTS protects your vehicle details and account information.',
            'content' => "We value your privacy. We only collect essential customer data required to fulfill parts orders, calculate accurate state GST, verify vehicle fitment compatibility, and coordinate courier delivery.\n\nWe never sell or rent your personal information to third-party marketing brokers. All financial transactions are securely processed via 256-bit SSL encrypted channels directly through RBI-compliant payment gateways (Razorpay). Your credit card and UPI credentials are never stored on our servers.",
        ]);
    }

    public function terms(): Response
    {
        return Inertia::render('Public/StaticPage', [
            'title' => 'Terms of Service',
            'subtitle' => 'Guidelines and legal terms governing parts procurement and vehicle fitment.',
            'content' => "By accessing AUTO PARTS and placing an order, you agree to our standard terms of service:\n\n1. Component Installation: Automotive hardware, especially brake components, suspension coilovers, and high-performance exhausts, should always be installed by certified automotive technicians following factory torque specifications.\n2. Vehicle Modifications: Fitment compatibility guarantees apply to stock, unmodified OEM chassis configurations unless explicitly noted for aftermarket configurations.\n3. Warranties: All manufacturer warranties are passed directly to the purchaser. AUTO PARTS assists with RMA claims for certified defect inspections.",
        ]);
    }
}
