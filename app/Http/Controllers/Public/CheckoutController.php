<?php

declare(strict_types=1);

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariation;
use App\Services\InventoryService;
use App\Services\RazorpayService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CheckoutController extends Controller
{
    public function __construct(
        protected RazorpayService $razorpayService,
        protected InventoryService $inventoryService
    ) {}

    public function index(Request $request): Response
    {
        return $this->view($request);
    }

    public function view(Request $request): Response
    {
        return Inertia::render('Public/Checkout', [
            'savedAddresses' => [],
            'user' => $request->user(),
        ]);
    }

    public function validateCoupon(Request $request): JsonResponse
    {
        $code = trim((string) $request->input('code'));
        $subtotal = (float) $request->input('subtotal', 0);

        $coupon = Coupon::where('code', strtoupper($code))->first();

        if (!$coupon) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid promotional code entered.',
            ], 422);
        }

        $validity = $coupon->isValidForAmount($subtotal, $request->user()?->id);
        if (!$validity['valid']) {
            return response()->json([
                'success' => false,
                'message' => $validity['message'],
            ], 422);
        }

        $discount = $coupon->calculateDiscount($subtotal);

        return response()->json([
            'success' => true,
            'coupon' => [
                'id' => $coupon->id,
                'code' => $coupon->code,
                'type' => $coupon->type,
                'value' => $coupon->value,
                'discount' => $discount,
            ],
            'discount' => $discount,
            'message' => 'Coupon code applied successfully.',
        ]);
    }

    public function process(Request $request): JsonResponse
    {
        // Support fallback where items come from session cart if not supplied in payload
        if (!$request->has('items') || empty($request->input('items'))) {
            $cart = $request->session()->get('cart', []);
            $request->merge(['items' => $cart]);
        }

        // Support full_name / customer_name and address_line1 / shipping_address
        if ($request->has('full_name') && !$request->has('customer_name')) {
            $request->merge(['customer_name' => $request->input('full_name')]);
        }
        if ($request->has('email') && !$request->has('customer_email')) {
            $request->merge(['customer_email' => $request->input('email')]);
        }
        if ($request->has('phone') && !$request->has('customer_phone')) {
            $request->merge(['customer_phone' => $request->input('phone')]);
        }
        if ($request->has('address_line1') && !$request->has('shipping_address')) {
            $request->merge(['shipping_address' => $request->input('address_line1')]);
        }

        return $this->placeCodOrder($request);
    }

    public function createRazorpayOrder(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'customer_name' => ['required', 'string', 'max:255'],
            'customer_email' => ['required', 'email', 'max:255'],
            'customer_phone' => ['required', 'string', 'max:25'],
            'shipping_address' => ['required', 'string', 'max:500'],
            'apartment' => ['nullable', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:100'],
            'state' => ['required', 'string', 'max:100'],
            'pincode' => ['required', 'string', 'max:20'],
            'billing_same_as_shipping' => ['boolean'],
            'billing_address' => ['nullable', 'string', 'max:500'],
            'billing_city' => ['nullable', 'string', 'max:100'],
            'billing_state' => ['nullable', 'string', 'max:100'],
            'billing_pincode' => ['nullable', 'string', 'max:20'],
            'shipping_method_title' => ['nullable', 'string', 'max:100'],
            'shipping_cost' => ['nullable', 'numeric', 'min:0'],
            'coupon_code' => ['nullable', 'string', 'max:50'],
            'discount_amount' => ['nullable', 'numeric', 'min:0'],
            'order_notes' => ['nullable', 'string', 'max:1000'],
            'items' => ['required', 'array', 'min:1'],
        ]);

        $user = $request->user();
        $shippingCost = (float) ($validated['shipping_cost'] ?? 0);
        $discountAmount = (float) ($validated['discount_amount'] ?? 0);

        try {
            // Recalculate Subtotal server-side
            $subtotal = 0;
            foreach ($validated['items'] as $item) {
                $subtotal += ((float) $item['price']) * ((int) $item['quantity']);
            }

            $taxAmount = 0.0;

            $finalTotal = max(0, $subtotal - $discountAmount) + $shippingCost;

            $temporaryReceipt = 'AP-RCPT-' . date('Ymd') . '-' . strtoupper(Str::random(5));

            $razorpayOrder = $this->razorpayService->createOrder(
                $finalTotal,
                $temporaryReceipt,
                [
                    'customer_email' => $validated['customer_email'],
                    'customer_phone' => $validated['customer_phone'],
                ]
            );

            $pendingOrderData = [
                'user_id' => $user?->id,
                'customer_name' => $validated['customer_name'],
                'customer_email' => $validated['customer_email'],
                'customer_phone' => $validated['customer_phone'],
                'shipping_address' => $validated['shipping_address'],
                'apartment' => $validated['apartment'] ?? null,
                'city' => $validated['city'],
                'state' => $validated['state'],
                'pincode' => $validated['pincode'],
                'billing_same_as_shipping' => $validated['billing_same_as_shipping'] ?? true,
                'billing_address' => $validated['billing_address'] ?? null,
                'billing_city' => $validated['billing_city'] ?? null,
                'billing_state' => $validated['billing_state'] ?? null,
                'billing_pincode' => $validated['billing_pincode'] ?? null,
                'shipping_method_title' => $validated['shipping_method_title'] ?? 'Standard Ground Freight',
                'shipping_cost' => $shippingCost,
                'coupon_code' => $validated['coupon_code'] ?? null,
                'discount_amount' => $discountAmount,
                'subtotal' => $subtotal,
                'tax_amount' => 0.0,
                'cgst_amount' => 0.0,
                'sgst_amount' => 0.0,
                'igst_amount' => 0.0,
                'total_amount' => $finalTotal,
                'order_notes' => $validated['order_notes'] ?? null,
                'items' => $validated['items'],
                'razorpay_order_id' => $razorpayOrder['id'],
            ];

            $cacheKey = 'pending_ap_rzp_' . $razorpayOrder['id'];
            Cache::put($cacheKey, $pendingOrderData, now()->addHours(6));
            session()->put($cacheKey, $pendingOrderData);

            return response()->json([
                'success' => true,
                'order_number' => $temporaryReceipt,
                'razorpay_order_id' => $razorpayOrder['id'],
                'amount' => $razorpayOrder['amount'],
                'currency' => $razorpayOrder['currency'] ?? 'INR',
                'key' => $this->razorpayService->getKeyId(),
            ]);
        } catch (Exception $e) {
            Log::error('Razorpay Init Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Unable to initialize online payment: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function verifyPayment(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'razorpay_order_id' => ['required', 'string'],
            'razorpay_payment_id' => ['required', 'string'],
            'razorpay_signature' => ['required', 'string'],
        ]);

        $isValid = $this->razorpayService->verifySignature(
            $validated['razorpay_order_id'],
            $validated['razorpay_payment_id'],
            $validated['razorpay_signature']
        );

        if (!$isValid) {
            return response()->json([
                'success' => false,
                'message' => 'Cryptographic payment signature verification failed.',
            ], 422);
        }

        // Idempotency check: if order already exists
        $existingOrder = Order::where('razorpay_payment_id', $validated['razorpay_payment_id'])
            ->orWhere('razorpay_order_id', $validated['razorpay_order_id'])
            ->first();

        if ($existingOrder) {
            return response()->json([
                'success' => true,
                'order_number' => $existingOrder->order_number,
                'order_id' => $existingOrder->id,
            ]);
        }

        $cacheKey = 'pending_ap_rzp_' . $validated['razorpay_order_id'];
        $pendingData = Cache::get($cacheKey) ?? session()->get($cacheKey);

        if (!$pendingData) {
            return response()->json([
                'success' => false,
                'message' => 'Order checkout session expired. Contact support with payment ID: ' . $validated['razorpay_payment_id'],
            ], 400);
        }

        return DB::transaction(function () use ($pendingData, $validated, $cacheKey) {
            $order = Order::create([
                'user_id' => $pendingData['user_id'],
                'customer_name' => $pendingData['customer_name'],
                'customer_email' => $pendingData['customer_email'],
                'customer_phone' => $pendingData['customer_phone'],
                'shipping_address' => $pendingData['shipping_address'],
                'apartment' => $pendingData['apartment'],
                'city' => $pendingData['city'],
                'state' => $pendingData['state'],
                'pincode' => $pendingData['pincode'],
                'billing_same_as_shipping' => $pendingData['billing_same_as_shipping'],
                'billing_address' => $pendingData['billing_address'],
                'billing_city' => $pendingData['billing_city'],
                'billing_state' => $pendingData['billing_state'],
                'billing_pincode' => $pendingData['billing_pincode'],
                'shipping_method_title' => $pendingData['shipping_method_title'],
                'shipping_cost' => $pendingData['shipping_cost'],
                'subtotal' => $pendingData['subtotal'],
                'discount_amount' => $pendingData['discount_amount'],
                'coupon_code' => $pendingData['coupon_code'],
                'tax_amount' => $pendingData['tax_amount'],
                'cgst_amount' => $pendingData['cgst_amount'],
                'sgst_amount' => $pendingData['sgst_amount'],
                'igst_amount' => $pendingData['igst_amount'],
                'total_amount' => $pendingData['total_amount'],
                'currency' => 'INR',
                'payment_method' => 'razorpay',
                'payment_status' => 'paid',
                'delivery_status' => 'pending',
                'razorpay_order_id' => $validated['razorpay_order_id'],
                'razorpay_payment_id' => $validated['razorpay_payment_id'],
                'razorpay_signature' => $validated['razorpay_signature'],
                'order_notes' => $pendingData['order_notes'],
                'paid_at' => now(),
            ]);

            foreach ($pendingData['items'] as $item) {
                $unitPrice = (float) $item['price'];
                $qty = (int) $item['quantity'];
                $itemSubtotal = $unitPrice * $qty;

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item['productId'] ?? null,
                    'product_variation_id' => $item['variationId'] ?? null,
                    'product_name' => $item['name'],
                    'variation_name' => $item['variationLabel'] ?? null,
                    'sku' => $item['sku'] ?? null,
                    'part_number' => $item['partNumber'] ?? null,
                    'unit_price' => $unitPrice,
                    'quantity' => $qty,
                    'subtotal' => $itemSubtotal,
                    'total' => $itemSubtotal,
                    'product_image' => $item['image'] ?? null,
                ]);
            }

            // Deduct inventory
            $this->inventoryService->deductStockForOrder($pendingData['items']);

            Cache::forget($cacheKey);
            session()->forget($cacheKey);
            session()->forget('cart');

            return response()->json([
                'success' => true,
                'order_number' => $order->order_number,
                'order_id' => $order->id,
            ]);
        });
    }

    public function placeCodOrder(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'customer_name' => ['required', 'string', 'max:255'],
            'customer_email' => ['required', 'email', 'max:255'],
            'customer_phone' => ['required', 'string', 'max:25'],
            'shipping_address' => ['required', 'string', 'max:500'],
            'apartment' => ['nullable', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:100'],
            'state' => ['required', 'string', 'max:100'],
            'pincode' => ['required', 'string', 'max:20'],
            'billing_same_as_shipping' => ['boolean'],
            'billing_address' => ['nullable', 'string', 'max:500'],
            'billing_city' => ['nullable', 'string', 'max:100'],
            'billing_state' => ['nullable', 'string', 'max:100'],
            'billing_pincode' => ['nullable', 'string', 'max:20'],
            'shipping_method_title' => ['nullable', 'string', 'max:100'],
            'shipping_cost' => ['nullable', 'numeric', 'min:0'],
            'coupon_code' => ['nullable', 'string', 'max:50'],
            'discount_amount' => ['nullable', 'numeric', 'min:0'],
            'order_notes' => ['nullable', 'string', 'max:1000'],
            'items' => ['required', 'array', 'min:1'],
        ]);

        $user = $request->user();
        $shippingCost = (float) ($validated['shipping_cost'] ?? 0);
        $discountAmount = (float) ($validated['discount_amount'] ?? 0);

        return DB::transaction(function () use ($validated, $user, $shippingCost, $discountAmount) {
            $subtotal = 0;
            foreach ($validated['items'] as $item) {
                $subtotal += ((float) $item['price']) * ((int) $item['quantity']);
            }

            $finalTotal = max(0, $subtotal - $discountAmount) + $shippingCost;

            $order = Order::create([
                'user_id' => $user?->id,
                'customer_name' => $validated['customer_name'],
                'customer_email' => $validated['customer_email'],
                'customer_phone' => $validated['customer_phone'],
                'shipping_address' => $validated['shipping_address'],
                'apartment' => $validated['apartment'] ?? null,
                'city' => $validated['city'],
                'state' => $validated['state'],
                'pincode' => $validated['pincode'],
                'billing_same_as_shipping' => $validated['billing_same_as_shipping'] ?? true,
                'billing_address' => $validated['billing_address'] ?? null,
                'billing_city' => $validated['billing_city'] ?? null,
                'billing_state' => $validated['billing_state'] ?? null,
                'billing_pincode' => $validated['billing_pincode'] ?? null,
                'shipping_method_title' => $validated['shipping_method_title'] ?? 'Standard Ground Freight',
                'shipping_cost' => $shippingCost,
                'subtotal' => $subtotal,
                'discount_amount' => $discountAmount,
                'coupon_code' => $validated['coupon_code'] ?? null,
                'tax_amount' => 0.0,
                'cgst_amount' => 0.0,
                'sgst_amount' => 0.0,
                'igst_amount' => 0.0,
                'total_amount' => $finalTotal,
                'currency' => 'INR',
                'payment_method' => 'cod',
                'payment_status' => 'pending',
                'delivery_status' => 'pending',
                'order_notes' => $validated['order_notes'] ?? null,
            ]);

            foreach ($validated['items'] as $item) {
                $unitPrice = (float) $item['price'];
                $qty = (int) $item['quantity'];
                $itemSubtotal = $unitPrice * $qty;

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item['productId'] ?? null,
                    'product_variation_id' => $item['variationId'] ?? null,
                    'product_name' => $item['name'],
                    'variation_name' => $item['variationLabel'] ?? null,
                    'sku' => $item['sku'] ?? null,
                    'part_number' => $item['partNumber'] ?? null,
                    'unit_price' => $unitPrice,
                    'quantity' => $qty,
                    'subtotal' => $itemSubtotal,
                    'total' => $itemSubtotal,
                    'product_image' => $item['image'] ?? null,
                ]);
            }

            // Deduct inventory
            $this->inventoryService->deductStockForOrder($validated['items']);

            session()->forget('cart');

            return response()->json([
                'success' => true,
                'order_number' => $order->order_number,
                'order_id' => $order->id,
            ]);
        });
    }

    public function success(string $orderNumber): Response
    {
        $order = Order::where('order_number', $orderNumber)
            ->with(['items.product'])
            ->firstOrFail();

        return Inertia::render('Public/OrderSuccess', [
            'order' => $order,
        ]);
    }
}
