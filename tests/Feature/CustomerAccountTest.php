<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\CustomerAddress;
use App\Models\Product;
use App\Models\User;
use Tests\TestCase;

class CustomerAccountTest extends TestCase
{
    public function test_guest_is_redirected_to_login(): void
    {
        $response = $this->get('/customer/dashboard');
        $response->assertRedirect('/login');
    }

    public function test_customer_can_login_and_access_dashboard(): void
    {
        $customer = User::where('email', 'customer@autosparts.com')->first();
        $this->assertNotNull($customer);

        $loginResponse = $this->post('/login', [
            'email' => 'customer@autosparts.com',
            'password' => 'password',
        ]);

        $loginResponse->assertRedirect('/customer/dashboard');

        $this->actingAs($customer);
        $dashboardResponse = $this->get('/customer/dashboard');
        $dashboardResponse->assertStatus(200);
    }

    public function test_customer_can_manage_addresses(): void
    {
        $customer = User::where('email', 'customer@autosparts.com')->first();
        $this->actingAs($customer);

        // Store new address
        $storeResponse = $this->post('/customer/addresses', [
            'full_name' => 'Rahul Verma',
            'phone' => '+91 9988776655',
            'address_line1' => 'Plot 18, Phase 3',
            'address_line2' => 'Okhla Industrial Area',
            'city' => 'New Delhi',
            'state' => 'Delhi',
            'pincode' => '110020',
            'is_default' => true,
        ]);
        $storeResponse->assertStatus(302);

        $address = CustomerAddress::where('user_id', $customer->id)->latest()->first();
        $this->assertNotNull($address);
        $this->assertEquals('Plot 18, Phase 3', $address->address_line1);

        // Delete address
        $deleteResponse = $this->delete("/customer/addresses/{$address->id}");
        $deleteResponse->assertStatus(302);
    }

    public function test_customer_can_toggle_wishlist(): void
    {
        $customer = User::where('email', 'customer@autosparts.com')->first();
        $this->actingAs($customer);

        $product = Product::first();

        // Add to wishlist
        $res1 = $this->postJson('/api/wishlist/toggle', [
            'product_id' => $product->id,
        ]);
        $res1->assertStatus(200)->assertJson(['success' => true, 'inWishlist' => true]);

        // Remove from wishlist
        $res2 = $this->postJson('/api/wishlist/toggle', [
            'product_id' => $product->id,
        ]);
        $res2->assertStatus(200)->assertJson(['success' => true, 'inWishlist' => false]);
    }
}
