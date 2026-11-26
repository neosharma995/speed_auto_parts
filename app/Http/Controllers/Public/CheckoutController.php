<?php

declare(strict_types=1);

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Mail\OrderConfirmationMail;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Setting;
use App\Services\InventoryService;
use App\Services\RegionalPricingService;
use App\Services\StripeService;
use App\Services\TaxCalculationService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Stripe\Exception\SignatureVerificationException;
use UnexpectedValueException;

class CheckoutController extends Controller
{
    public function __construct(
        protected StripeService $stripeService,
        protected TaxCalculationService $taxService,
        protected InventoryService $inventoryService,
        protected RegionalPricingService $regionalPricingService
    ) {}

    public function index(Request $request): Response
    {
        return $this->view($request);
    }

    public function view(Request $request): Response
    {
        $user = $request->user();
        $savedAddresses = $user ? $user->addresses : [];

        return Inertia::render('Public/Checkout', [
            'savedAddresses' => $savedAddresses,
            'user' => $user,
            'stripePublishableKey' => $this->stripeService->getPublishableKey(),
            'stripeConfigured' => $this->stripeService->isConfigured(),
        ]);
    }

    public function validateCoupon(Request $request): JsonResponse
    {
        $code = trim((string) $request->input('code'));
        $subtotal = (float) $request->input('subtotal', 0);

        $coupon = Coupon::where('code', strtoupper($code))->first();

        if (! $coupon) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid promotional code entered.',
            ], 422);
        }

        $validity = $coupon->isValidForAmount($subtotal, $request->user()?->id);
        if (! $validity['valid']) {
            return response()->json([
                'success' => false,
                'message' => $validity['message'],
            ], 422);
        }

        $discount = $coupon->calculateDiscount($subtotal);

        return response()->json([
            'success' => true,
            'code' => $coupon->code,
            'coupon' => [
                'id' => $coupon->id,
                'code' => $coupon->code,
                'type' => $coupon->type,
                'value' => $coupon->value,
                'discount' => $discount,
            ],
            'discount' => $discount,
            'discount_amount' => $discount,
            'message' => 'Coupon code applied successfully.',
        ]);
    }

    public function process(Request $request): JsonResponse
    {
        if (! $request->has('items') || empty($request->input('items'))) {
            $cart = $request->session()->get('cart', []);
            $request->merge(['items' => $cart]);
        }

        if ($request->has('full_name') && ! $request->has('customer_name')) {
            $request->merge(['customer_name' => $request->input('full_name')]);
        }
        if ($request->has('email') && ! $request->has('customer_email')) {
            $request->merge(['customer_email' => $request->input('email')]);
        }
        if ($request->has('phone') && ! $request->has('customer_phone')) {
            $request->merge(['customer_phone' => $request->input('phone')]);
        }
        if ($request->has('address_line1') && ! $request->has('shipping_address')) {
            $request->merge(['shipping_address' => $request->input('address_line1')]);
        }

        return $this->placeCodOrder($request);
    }

    public function calculateTax(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'items' => ['required', 'array'],
            'customer_state' => ['nullable', 'string'],
            'country_code' => ['nullable', 'string', 'max:5'],
        ]);

        $countryCode = strtoupper(trim((string) ($validated['country_code'] ?? 'AE')));
        if ($countryCode !== '' && $countryCode !== 'AE') {
            $subtotal = 0.0;
            foreach ($validated['items'] as $item) {
                $subtotal += ((float) ($item['price'] ?? 0)) * ((int) ($item['quantity'] ?? 1));
            }
            $regional = $this->regionalPricingService->calculateForCountry(round($subtotal, 2), $countryCode);

            return response()->json([
                'success' => true,
                'tax_amount' => $regional['tax_amount'],
                'vat_amount' => $regional['tax_amount'],
                'tax_rate_percent' => $regional['tax_rate_percent'],
                'shipping_cost' => $regional['shipping_cost'],
                'margin_percent' => $regional['margin_percent'],
                'country_code' => $regional['country_code'],
                'country_name' => $regional['country_name'],
                'is_selling_enabled' => $regional['is_selling_enabled'],
            ]);
        }

        $emirate = $validated['customer_state'] ?? 'Dubai';
        $taxData = $this->taxService->calculate($validated['items'], $emirate);
        $subtotal = 0.0;
        foreach ($validated['items'] as $item) {
            $subtotal += ((float) ($item['price'] ?? 0)) * ((int) ($item['quantity'] ?? 1));
        }
        $regional = $this->regionalPricingService->calculateForCountry(round($subtotal, 2), 'AE');

        return response()->json([
            'success' => true,
            ...$taxData,
            'shipping_cost' => $regional['shipping_cost'],
            'margin_percent' => $regional['margin_percent'],
            'country_code' => $regional['country_code'],
            'country_name' => $regional['country_name'],
            'is_selling_enabled' => $regional['is_selling_enabled'],
        ]);
    }

    public function createStripeSession(Request $request): JsonResponse
    {
        $validated = $this->validateCheckoutPayload($request);

        $user = $request->user();
        ['currency' => $checkoutCurrency, 'rate' => $currencyRate] = $this->resolveCheckoutCurrencyAndRate($validated['currency'] ?? null);
        $scaledItems = $this->scaleItemsForDefaultCurrency($validated['items'], $currencyRate);
        $shippingCost = round(((float) ($validated['shipping_cost'] ?? 0)) * $currencyRate, 2);
        $discountAmount = round(((float) ($validated['discount_amount'] ?? 0)) * $currencyRate, 2);

        try {
            $subtotal = 0.0;
            foreach ($scaledItems as $item) {
                $subtotal += ((float) $item['price']) * ((int) $item['quantity']);
            }
            $subtotal = round($subtotal, 2);

            $taxResult = $this->taxService->calculate($scaledItems, $validated['state']);
            $taxAmount = round((float) $taxResult['tax_amount'], 2);
            $finalTotal = round(max(0, $subtotal - $discountAmount) + $shippingCost + $taxAmount, 2);

            $orderReference = 'AP-' . date('Ymd') . '-' . strtoupper(Str::random(5));

            $pendingOrderData = [
                'order_reference' => $orderReference,
                'user_id' => $user?->id,
                'customer_name' => $validated['customer_name'],
                'customer_email' => $validated['customer_email'],
                'customer_phone' => $validated['customer_phone'],
                'shipping_address' => $validated['shipping_address'],
                'apartment' => $validated['apartment'] ?? null,
                'city' => $validated['city'],
                'state' => $validated['state'],
                'pincode' => $validated['pincode'],
                'country' => 'United Arab Emirates',
                'billing_same_as_shipping' => $validated['billing_same_as_shipping'] ?? true,
                'billing_address' => $validated['billing_address'] ?? null,
                'billing_city' => $validated['billing_city'] ?? null,
                'billing_state' => $validated['billing_state'] ?? null,
                'billing_pincode' => $validated['billing_pincode'] ?? null,
                'shipping_method_title' => $validated['shipping_method_title'] ?? 'UAE Express Courier',
                'shipping_cost' => $shippingCost,
                'coupon_code' => $validated['coupon_code'] ?? null,
                'discount_amount' => $discountAmount,
                'subtotal' => $subtotal,
                'tax_amount' => $taxAmount,
                'cgst_amount' => 0.00,
                'sgst_amount' => 0.00,
                'igst_amount' => 0.00,
                'total_amount' => $finalTotal,
                'currency' => $checkoutCurrency,
                'order_notes' => $validated['order_notes'] ?? null,
                'items' => $scaledItems,
            ];

            $successUrl = route('checkout.stripe.success') . '?session_id={CHECKOUT_SESSION_ID}';
            $cancelUrl = route('checkout.stripe.cancel');

            $session = $this->stripeService->createCheckoutSession($pendingOrderData, $successUrl, $cancelUrl);

            $cacheKey = 'pending_ap_stripe_' . $session['id'];
            Cache::put($cacheKey, $pendingOrderData, now()->addHours(6));
            session()->put($cacheKey, $pendingOrderData);

            return response()->json([
                'success' => true,
                'session_id' => $session['id'],
                'checkout_url' => $session['url'],
                'simulated' => $session['simulated'],
                'currency' => $session['currency'],
            ]);
        } catch (Exception $e) {
            Log::error('Stripe Checkout Session Init Error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Unable to initialize Stripe checkout: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function stripeSuccess(Request $request): RedirectResponse
    {
        $sessionId = trim((string) $request->query('session_id', ''));
        if ($sessionId === '') {
            return redirect()->route('checkout.index')->with('error', 'Missing Stripe checkout session reference.');
        }

        // Idempotency check
        $existingOrder = Order::where('stripe_session_id', $sessionId)->first();
        if ($existingOrder) {
            session()->forget('cart');

            return redirect()->route('order.success', ['orderNumber' => $existingOrder->order_number]);
        }

        try {
            $sessionData = $this->stripeService->retrieveCheckoutSession($sessionId);
        } catch (Exception $e) {
            Log::error('Stripe Session Retrieve Error: ' . $e->getMessage());

            return redirect()->route('checkout.index')->with('error', 'Could not verify Stripe payment session.');
        }

        if (($sessionData['payment_status'] ?? '') !== 'paid') {
            return redirect()->route('checkout.index')->with('error', 'Stripe payment has not been completed yet.');
        }

        try {
            $order = $this->finalizeStripeOrder($sessionId, $sessionData['payment_intent'] ?? null, $sessionData);
        } catch (\Throwable $e) {
            Log::error('Stripe Order Finalization Error: ' . $e->getMessage(), [
                'session_id' => $sessionId,
                'exception' => $e,
            ]);

            return redirect()->route('checkout.index')->with(
                'error',
                'Your payment succeeded, but finalizing the order encountered an issue. Please contact support with reference: ' . $sessionId
            );
        }

        if (! $order) {
            return redirect()->route('checkout.index')->with('error', 'Checkout session expired. Please contact support with reference: ' . $sessionId);
        }

        session()->forget('cart');

        return redirect()->route('order.success', ['orderNumber' => $order->order_number]);
    }

    public function stripeCancel(): RedirectResponse
    {
        return redirect()->route('checkout.index')->with('error', 'Stripe payment was cancelled. You can retry checkout anytime.');
    }

    public function stripeWebhook(Request $request): JsonResponse
    {
        $payload = $request->getContent();
        $sigHeader = (string) $request->header('Stripe-Signature', '');

        try {
            $event = $this->stripeService->constructWebhookEvent($payload, $sigHeader);
        } catch (UnexpectedValueException|SignatureVerificationException|Exception $e) {
            Log::warning('Stripe webhook verification failed: ' . $e->getMessage());

            return response()->json(['error' => 'Invalid webhook signature'], 400);
        }

        if ($event->type === 'checkout.session.completed') {
            $session = $event->data->object;
            $sessionId = (string) ($session->id ?? '');
            $paymentIntentId = is_string($session->payment_intent ?? null)
                ? $session->payment_intent
                : ($session->payment_intent->id ?? null);

            if ($sessionId !== '') {
                $this->finalizeStripeOrder($sessionId, $paymentIntentId);
            }
        }

        return response()->json(['status' => 'received']);
    }

    public function placeCodOrder(Request $request): JsonResponse
    {
        $validated = $this->validateCheckoutPayload($request);

        $user = $request->user();
        ['currency' => $checkoutCurrency, 'rate' => $currencyRate] = $this->resolveCheckoutCurrencyAndRate($validated['currency'] ?? null);
        $scaledItems = $this->scaleItemsForDefaultCurrency($validated['items'], $currencyRate);
        $shippingCost = round(((float) ($validated['shipping_cost'] ?? 0)) * $currencyRate, 2);
        $discountAmount = round(((float) ($validated['discount_amount'] ?? 0)) * $currencyRate, 2);

        return DB::transaction(function () use ($validated, $scaledItems, $user, $shippingCost, $discountAmount, $checkoutCurrency) {
            $subtotal = 0.0;
            foreach ($scaledItems as $item) {
                $subtotal += ((float) $item['price']) * ((int) $item['quantity']);
            }
            $subtotal = round($subtotal, 2);

            $taxResult = $this->taxService->calculate($scaledItems, $validated['state']);
            $taxAmount = round((float) $taxResult['tax_amount'], 2);
            $finalTotal = round(max(0, $subtotal - $discountAmount) + $shippingCost + $taxAmount, 2);

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
                'country' => 'United Arab Emirates',
                'billing_same_as_shipping' => $validated['billing_same_as_shipping'] ?? true,
                'billing_address' => $validated['billing_address'] ?? null,
                'billing_city' => $validated['billing_city'] ?? null,
                'billing_state' => $validated['billing_state'] ?? null,
                'billing_pincode' => $validated['billing_pincode'] ?? null,
                'shipping_method_title' => $validated['shipping_method_title'] ?? 'UAE Express Courier',
                'shipping_cost' => $shippingCost,
                'subtotal' => $subtotal,
                'discount_amount' => $discountAmount,
                'coupon_code' => $validated['coupon_code'] ?? null,
                'tax_amount' => $taxAmount,
                'cgst_amount' => 0.00,
                'sgst_amount' => 0.00,
                'igst_amount' => 0.00,
                'total_amount' => $finalTotal,
                'currency' => $checkoutCurrency,
                'payment_method' => 'cod',
                'payment_status' => 'pending',
                'delivery_status' => 'pending',
                'order_notes' => $validated['order_notes'] ?? null,
            ]);

            $this->createOrderItems($order, $scaledItems);
            $this->inventoryService->deductStockForOrder($scaledItems);

            if (! empty($order->coupon_code)) {
                Coupon::where('code', strtoupper((string) $order->coupon_code))->increment('times_used');
            }

            session()->forget('cart');

            $this->sendOrderConfirmationEmail($order);

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

    private function finalizeStripeOrder(string $sessionId, ?string $paymentIntentId, array $sessionData = []): ?Order
    {
        $existingOrder = Order::where('stripe_session_id', $sessionId)->first();
        if ($existingOrder) {
            return $existingOrder;
        }

        $cacheKey = 'pending_ap_stripe_' . $sessionId;
        $pendingData = Cache::get($cacheKey) ?? session()->get($cacheKey);
        if (! $pendingData) {
            // Fallback for stateless/multi-container production environments when cache/session expired
            if (empty($sessionData)) {
                return null;
            }

            $meta = is_array($sessionData['metadata'] ?? null) ? $sessionData['metadata'] : [];
            $amount = round(((int) ($sessionData['amount_total'] ?? 0)) / 100, 2);

            $pendingData = [
                'order_reference' => ($meta['order_reference'] ?? '') !== '' ? $meta['order_reference'] : ($sessionData['client_reference_id'] ?? null),
                'user_id' => auth()->id(),
                'customer_name' => $meta['customer_name'] ?? 'Stripe Customer',
                'customer_email' => $sessionData['customer_email'] ?? 'customer@speedautosparts.ae',
                'customer_phone' => $meta['customer_phone'] ?? 'N/A',
                'shipping_address' => 'Dubai, UAE',
                'apartment' => null,
                'city' => 'Dubai',
                'state' => 'Dubai',
                'pincode' => '00000',
                'country' => 'United Arab Emirates',
                'billing_same_as_shipping' => true,
                'billing_address' => null,
                'billing_city' => null,
                'billing_state' => null,
                'billing_pincode' => null,
                'shipping_method_title' => 'UAE Express Courier',
                'shipping_cost' => 0.00,
                'subtotal' => $amount,
                'discount_amount' => 0.00,
                'coupon_code' => null,
                'tax_amount' => 0.00,
                'total_amount' => $amount,
                'currency' => strtoupper((string) ($sessionData['currency'] ?? $this->stripeService->getCurrency())),
                'order_notes' => 'Recovered from Stripe Checkout Session',
                'items' => [],
            ];
        }

        return DB::transaction(function () use ($pendingData, $sessionId, $paymentIntentId, $cacheKey) {
            $order = Order::create([
                'order_number' => $pendingData['order_reference'] ?? null,
                'user_id' => $pendingData['user_id'],
                'customer_name' => $pendingData['customer_name'],
                'customer_email' => $pendingData['customer_email'],
                'customer_phone' => $pendingData['customer_phone'],
                'shipping_address' => $pendingData['shipping_address'],
                'apartment' => $pendingData['apartment'],
                'city' => $pendingData['city'],
                'state' => $pendingData['state'],
                'pincode' => $pendingData['pincode'],
                'country' => $pendingData['country'] ?? 'United Arab Emirates',
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
                'cgst_amount' => 0.00,
                'sgst_amount' => 0.00,
                'igst_amount' => 0.00,
                'total_amount' => $pendingData['total_amount'],
                'currency' => $pendingData['currency'] ?? $this->stripeService->getCurrency(),
                'payment_method' => 'stripe',
                'payment_status' => 'paid',
                'delivery_status' => 'pending',
                'stripe_session_id' => $sessionId,
                'stripe_payment_intent_id' => $paymentIntentId,
                'order_notes' => $pendingData['order_notes'],
                'paid_at' => now(),
            ]);

            if (! empty($pendingData['items'])) {
                $this->createOrderItems($order, $pendingData['items']);
                $this->inventoryService->deductStockForOrder($pendingData['items']);
            }

            if (! empty($order->coupon_code)) {
                Coupon::where('code', strtoupper((string) $order->coupon_code))->increment('times_used');
            }

            Cache::forget($cacheKey);
            session()->forget($cacheKey);

            $this->sendOrderConfirmationEmail($order);

            return $order;
        });
    }

    private function sendOrderConfirmationEmail(Order $order): void
    {
        if (empty($order->customer_email)) {
            return;
        }

        try {
            Mail::to($order->customer_email)->send(new OrderConfirmationMail($order));
        } catch (\Throwable $e) {
            Log::warning('Order confirmation email failed: ' . $e->getMessage(), [
                'order_number' => $order->order_number,
            ]);
        }
    }

    private function createOrderItems(Order $order, array $items): void
    {
        foreach ($items as $item) {
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
    }

    private function validateCheckoutPayload(Request $request): array
    {
        return $request->validate([
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
            'currency' => ['nullable', 'string', 'max:10'],
            'items' => ['required', 'array', 'min:1'],
        ]);
    }

    /**
     * Resolve the active checkout currency and combined conversion multiplier
     * from Admin Settings (default currency + rate) and the frontend currency switcher.
     *
     * @return array{currency: string, rate: float}
     */
    private function resolveCheckoutCurrencyAndRate(?string $requestedCurrency): array
    {
        $defaultCode = 'AED';
        $baseRate = 1.0;
        $rates = [
            'AED' => 1.0,
            'USD' => 0.2723,
            'EUR' => 0.2510,
        ];

        try {
            if (Schema::hasTable('settings')) {
                $storedCode = strtoupper(trim((string) Setting::get('currency_code', 'AED')));
                if ($storedCode !== '') {
                    $defaultCode = $storedCode;
                }

                $storedBaseRate = (float) Setting::get('currency_rate', 1.0);
                if ($storedBaseRate > 0) {
                    $baseRate = $storedBaseRate;
                }

                $rawRates = Setting::get('currency_rates', '');
                $decoded = is_array($rawRates) ? $rawRates : json_decode((string) $rawRates, true);
                if (is_array($decoded)) {
                    foreach ($decoded as $k => $v) {
                        $upper = strtoupper((string) $k);
                        $num = (float) $v;
                        if ($num > 0 && array_key_exists($upper, $rates)) {
                            $rates[$upper] = $num;
                        }
                    }
                }
            }
        } catch (\Throwable) {
            // Fallback to defaults during initial setup/migrations
        }

        $rates[$defaultCode] = 1.0;

        $selected = strtoupper(trim((string) ($requestedCurrency ?? '')));
        if ($selected !== '' && isset($rates[$selected])) {
            return [
                'currency' => $selected,
                'rate' => $baseRate * (float) $rates[$selected],
            ];
        }

        return [
            'currency' => $defaultCode,
            'rate' => $baseRate,
        ];
    }

    private function scaleItemsForDefaultCurrency(array $items, float $currencyRate): array
    {
        if (abs($currencyRate - 1.0) < 0.000001) {
            return $items;
        }

        return array_map(static function (array $item) use ($currencyRate): array {
            $item['price'] = round(((float) ($item['price'] ?? 0)) * $currencyRate, 2);

            return $item;
        }, $items);
    }
}
