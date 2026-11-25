<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Order;
use App\Models\Product;
use Tests\TestCase;

class CartAndCheckoutTest extends TestCase
{
    public function test_user_can_add_item_to_cart_and_view_cart(): void
    {
        $product = Product::first();
        $this->assertNotNull($product);

        $addResponse = $this->postJson('/api/cart/add', [
            'productId' => $product->id,
            'quantity' => 2,
        ]);

        $addResponse->assertStatus(200)
            ->assertJson(['success' => true]);

        $cartResponse = $this->get('/cart');
        $cartResponse->assertStatus(200);
    }

    public function test_user_can_apply_coupon(): void
    {
        $response = $this->postJson('/api/checkout/apply-coupon', [
            'code' => 'SPEED10',
            'subtotal' => 6000.0,
        ]);

        $response->assertStatus(200)
            ->assertJson(['success' => true]);
    }

    public function test_user_can_place_cod_order_successfully(): void
    {
        $product = Product::first();

        // 1. Add item to cart session
        $this->postJson('/api/cart/add', [
            'productId' => $product->id,
            'quantity' => 1,
        ]);

        // 2. Submit checkout process (Dubai / UAE)
        $payload = [
            'full_name' => 'Tariq Al Mansoori',
            'email' => 'tariq@example.ae',
            'phone' => '+971 50 512 3456',
            'address_line1' => 'Villa 18, Al Wasl Road, Jumeirah 1',
            'address_line2' => 'Near City Walk',
            'city' => 'Dubai',
            'state' => 'Dubai',
            'pincode' => '00000',
            'payment_method' => 'cod',
            'order_notes' => 'Please call before delivery',
        ];

        $checkoutResponse = $this->postJson('/checkout/process', $payload);

        $checkoutResponse->assertStatus(200)
            ->assertJson(['success' => true]);

        $orderNumber = $checkoutResponse->json('order_number');
        $this->assertNotEmpty($orderNumber);

        // Verify order in database
        $order = Order::where('order_number', $orderNumber)->first();
        $this->assertNotNull($order);
        $this->assertEquals('cod', $order->payment_method);
        $this->assertEquals('AED', $order->currency);
        $this->assertEquals('United Arab Emirates', $order->country);
        $this->assertEquals('pending', $order->payment_status);
        $this->assertGreaterThan(0, $order->total_amount);

        // Verify order success invoice page loads
        $successResponse = $this->get("/order-success/{$orderNumber}");
        $successResponse->assertStatus(200);
    }

    public function test_user_can_complete_stripe_checkout_session_in_aed(): void
    {
        config(['services.stripe.secret' => 'sk_test_your_stripe_secret_key_here']);

        $product = Product::first();
        $this->assertNotNull($product);

        $payload = [
            'customer_name' => 'Rashid Al Falasi',
            'customer_email' => 'rashid@example.ae',
            'customer_phone' => '+971 55 444 9900',
            'shipping_address' => 'Office 904, Business Bay Tower',
            'apartment' => 'Floor 9',
            'city' => 'Dubai',
            'state' => 'Dubai',
            'pincode' => '00000',
            'shipping_cost' => 0,
            'discount_amount' => 0,
            'items' => [[
                'productId' => $product->id,
                'name' => $product->name,
                'price' => (float) $product->base_price,
                'quantity' => 1,
                'sku' => $product->sku,
                'partNumber' => $product->part_number,
            ]],
        ];

        // 1. Initialize Stripe Checkout Session
        $sessionRes = $this->postJson('/checkout/stripe-session', $payload);
        $sessionRes->assertStatus(200)
            ->assertJson([
                'success' => true,
                'currency' => 'AED',
            ]);

        $sessionId = $sessionRes->json('session_id');
        $this->assertNotEmpty($sessionId);

        // 2. Simulate return from Stripe Checkout success URL
        $successRes = $this->get("/checkout/stripe/success?session_id={$sessionId}");
        $successRes->assertRedirect();

        $order = Order::where('stripe_session_id', $sessionId)->first();
        $this->assertNotNull($order);
        $this->assertEquals('stripe', $order->payment_method);
        $this->assertEquals('paid', $order->payment_status);
        $this->assertEquals('AED', $order->currency);
        $this->assertEquals('United Arab Emirates', $order->country);
        $this->assertNotNull($order->stripe_payment_intent_id);
    }
}
