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

        // 2. Submit checkout process
        $payload = [
            'full_name' => 'Aditya Sharma',
            'email' => 'aditya@example.com',
            'phone' => '+91 98765 43210',
            'address_line1' => 'Flat 402, Lotus Towers',
            'address_line2' => 'Sector 62',
            'city' => 'Noida',
            'state' => 'Uttar Pradesh',
            'pincode' => '201309',
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
        $this->assertEquals('pending', $order->payment_status);
        $this->assertGreaterThan(0, $order->total_amount);

        // Verify order success invoice page loads
        $successResponse = $this->get("/order-success/{$orderNumber}");
        $successResponse->assertStatus(200);
    }
}
