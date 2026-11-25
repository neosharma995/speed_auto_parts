<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class CustomerCheckoutTest extends TestCase
{
    use DatabaseTransactions;

    public function test_customer_can_register_and_access_dashboard(): void
    {
        $this->get('/register')->assertStatus(200);

        $email = 'newcustomer_' . random_int(1000, 9999) . '@autoparts.com';

        $response = $this->post('/register', [
            'name' => 'Tariq Al Nuaimi',
            'email' => $email,
            'phone' => '+971 50 111 2233',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertRedirect('/customer/dashboard');
        $this->assertAuthenticated();
        $this->get('/customer/dashboard')->assertStatus(200);
        $this->get('/customer/orders')->assertStatus(200);
        $this->get('/customer/addresses')->assertStatus(200);
        $this->get('/customer/wishlist')->assertStatus(200);
    }

    public function test_seeded_customer_can_login_and_cannot_access_admin(): void
    {
        $customer = User::where('email', 'customer@autoparts.com')->first();
        $this->assertNotNull($customer);

        $response = $this->post('/login', [
            'email' => 'customer@autoparts.com',
            'password' => 'password',
        ]);

        $response->assertRedirect('/customer/dashboard');
        $this->get('/admin/dashboard')->assertStatus(403);
    }

    public function test_customer_can_add_to_cart_and_place_cod_and_stripe_orders(): void
    {
        $product = Product::first();
        $this->assertNotNull($product);

        // 1. Add to cart & view cart and checkout
        $this->postJson('/api/cart/add', [
            'productId' => $product->id,
            'name' => $product->name,
            'price' => (float) $product->base_price,
            'quantity' => 1,
        ])->assertStatus(200);

        $this->get('/cart')->assertStatus(200);
        $this->get('/checkout')->assertStatus(200);

        // 2. Place COD order
        $codRes = $this->postJson('/checkout/cod', [
            'customer_name' => 'Ahmed Al Mansoori',
            'customer_email' => 'customer@autoparts.com',
            'customer_phone' => '+971 50 512 0003',
            'shipping_address' => 'Villa 18, Al Wasl Road',
            'city' => 'Dubai',
            'state' => 'Dubai',
            'pincode' => '00000',
            'items' => [[
                'productId' => $product->id,
                'name' => $product->name,
                'price' => (float) $product->base_price,
                'quantity' => 1,
            ]],
        ]);

        $codRes->assertStatus(200)->assertJson(['success' => true]);
        $codOrderNumber = $codRes->json('order_number');
        $this->assertNotNull(Order::where('order_number', $codOrderNumber)->first());
        $this->get("/order-success/{$codOrderNumber}")->assertStatus(200);

        // 3. Stripe Checkout session (simulated in local/testing when STRIPE_SECRET is placeholder)
        config(['services.stripe.secret' => 'sk_test_your_stripe_secret_key_here']);

        $stripeRes = $this->postJson('/checkout/stripe-session', [
            'customer_name' => 'Ahmed Al Mansoori',
            'customer_email' => 'customer@autoparts.com',
            'customer_phone' => '+971 50 512 0003',
            'shipping_address' => 'Office 402, DIFC',
            'city' => 'Dubai',
            'state' => 'Dubai',
            'pincode' => '00000',
            'items' => [[
                'productId' => $product->id,
                'name' => $product->name,
                'price' => (float) $product->base_price,
                'quantity' => 1,
            ]],
        ]);

        $stripeRes->assertStatus(200)->assertJson(['success' => true, 'currency' => 'AED']);
        $sessionId = $stripeRes->json('session_id');
        $this->get('/checkout/stripe/success?session_id=' . urlencode($sessionId))->assertRedirect();
        $this->assertNotNull(Order::where('stripe_session_id', $sessionId)->first());
    }
}
