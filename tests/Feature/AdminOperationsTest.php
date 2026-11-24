<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductAttribute;
use App\Models\User;
use Tests\TestCase;

class AdminOperationsTest extends TestCase
{
    public function test_customer_cannot_access_admin_dashboard(): void
    {
        $customer = User::where('email', 'customer@autosparts.com')->first();
        $this->actingAs($customer);

        $response = $this->get('/admin/dashboard');
        $response->assertStatus(403);
    }

    public function test_admin_can_access_admin_dashboard(): void
    {
        $admin = User::where('email', 'admin@autosparts.com')->first();
        $this->actingAs($admin);

        $response = $this->get('/admin/dashboard');
        $response->assertStatus(200);

        $this->get('/admin/settings')->assertStatus(200);
        $this->get('/admin/taxes')->assertRedirect('/admin/settings?tab=tax');
    }

    public function test_admin_can_manage_products(): void
    {
        $admin = User::where('email', 'admin@autosparts.com')->first();
        $this->actingAs($admin);

        $category = Category::first();
        $brand = Brand::first();

        // 1. Create product
        $rand = rand(10000, 99999);
        $sku = 'TEST-BRK-' . $rand;
        $part = 'BRK-' . $rand;
        $name = "Ceramic Race Brake Pads {$rand}";

        $response = $this->post('/admin/products', [
            'name' => $name,
            'slug' => "ceramic-race-brake-pads-{$rand}",
            'sku' => $sku,
            'part_number' => $part,
            'short_description' => 'High friction track brake pads',
            'product_type' => 'simple',
            'status' => 'published',
            'base_price' => 7499.00,
            'sale_price' => 6999.00,
            'stock_quantity' => 25,
            'stock_status' => 'in_stock',
            'category_id' => $category?->id,
            'brand_id' => $brand?->id,
        ]);

        $response->assertRedirect('/admin/products');

        $created = Product::where('sku', $sku)->first();
        $this->assertNotNull($created);
        $this->assertEquals($name, $created->name);

        // 2. Edit page loads
        $editResponse = $this->get("/admin/products/{$created->id}/edit");
        $editResponse->assertStatus(200);

        // 3. Update product
        $updatedName = "Ceramic Race Brake Pads V2 {$rand}";
        $updateResponse = $this->put("/admin/products/{$created->id}", [
            'name' => $updatedName,
            'slug' => "ceramic-race-brake-pads-v2-{$rand}",
            'sku' => $sku,
            'part_number' => $part,
            'product_type' => 'simple',
            'status' => 'published',
            'base_price' => 7999.00,
            'stock_quantity' => 30,
            'stock_status' => 'in_stock',
        ]);
        $updateResponse->assertRedirect('/admin/products');

        $created->refresh();
        $this->assertEquals($updatedName, $created->name);
        $this->assertEquals(7999.00, (float) $created->base_price);

        // 4. Delete product
        $deleteResponse = $this->delete("/admin/products/{$created->id}");
        $deleteResponse->assertRedirect('/admin/products');
        $this->assertNull(Product::find($created->id));
    }

    public function test_admin_can_update_order_tracking_and_status(): void
    {
        $admin = User::where('email', 'admin@autosparts.com')->first();
        $this->actingAs($admin);

        $order = Order::first();
        if (!$order) {
            $order = Order::create([
                'order_number' => 'ORD-TEST-' . rand(1000, 9999),
                'customer_name' => 'Test Customer',
                'customer_email' => 'customer@autosparts.com',
                'customer_phone' => '+91 98765 43210',
                'shipping_address' => 'Test St',
                'city' => 'Delhi',
                'state' => 'Delhi',
                'pincode' => '110001',
                'subtotal' => 5000.00,
                'total_amount' => 5900.00,
                'payment_method' => 'cod',
                'payment_status' => 'pending',
                'delivery_status' => 'pending',
            ]);
        }

        $this->get('/admin/orders')->assertStatus(200);
        $this->get('/admin/orders?search=AP-')->assertStatus(200);
        $this->get("/admin/orders/{$order->id}")->assertStatus(200);

        $response = $this->put("/admin/orders/{$order->id}", [
            'delivery_status' => 'shipped',
            'payment_status' => 'paid',
            'tracking_number' => 'BLUEDART-987654321',
            'tracking_carrier' => 'Blue Dart Aviation',
            'tracking_url' => 'https://bluedart.com/track/BLUEDART-987654321',
        ]);

        $response->assertStatus(302);

        $order->refresh();
        $this->assertEquals('shipped', $order->delivery_status);
        $this->assertEquals('paid', $order->payment_status);
        $this->assertEquals('BLUEDART-987654321', $order->tracking_number);
        $this->assertEquals('Blue Dart Aviation', $order->tracking_carrier);
    }

    public function test_admin_can_manage_product_attributes_and_variations_inline(): void
    {
        $admin = User::where('email', 'admin@autosparts.com')->first();
        $this->actingAs($admin);

        $existingAttr = ProductAttribute::first();
        $rand = rand(10000, 99999);
        $sku = 'VAR-TEST-' . $rand;
        $part = 'PN-VAR-' . $rand;
        $customAttrName = "Piston Count {$rand}";
        $customAttrSlug = "piston-count-{$rand}";

        // 1. Create variable product with inline existing + custom attribute & variations
        $createResponse = $this->post('/admin/products', [
            'name' => "Modular Caliper Kit {$rand}",
            'slug' => "modular-caliper-kit-{$rand}",
            'sku' => $sku,
            'part_number' => $part,
            'product_type' => 'variable',
            'status' => 'published',
            'base_price' => 24000.00,
            'stock_quantity' => 20,
            'stock_status' => 'in_stock',
            'product_attributes' => [
                [
                    'id' => $existingAttr?->id,
                    'name' => $existingAttr?->name ?? 'Finish',
                    'slug' => $existingAttr?->slug ?? 'finish',
                    'values' => ['Red Anodized'],
                    'used_for_variations' => true,
                ],
                [
                    'id' => null,
                    'name' => $customAttrName,
                    'slug' => $customAttrSlug,
                    'values' => ['4-Piston', '6-Piston'],
                    'used_for_variations' => true,
                ],
            ],
            'variations' => [
                [
                    'name' => 'Red Anodized / 4-Piston',
                    'sku' => "{$sku}-4P",
                    'part_number' => "{$part}-4P",
                    'attributes_json' => [
                        ($existingAttr?->slug ?? 'finish') => 'Red Anodized',
                        $customAttrSlug => '4-Piston',
                    ],
                    'price' => 24000.00,
                    'sale_price' => 22000.00,
                    'stock_quantity' => 12,
                    'stock_status' => 'in_stock',
                    'is_default' => false,
                ],
                [
                    'name' => 'Red Anodized / 6-Piston',
                    'sku' => "{$sku}-6P",
                    'part_number' => "{$part}-6P",
                    'attributes_json' => [
                        ($existingAttr?->slug ?? 'finish') => 'Red Anodized',
                        $customAttrSlug => '6-Piston',
                    ],
                    'price' => 32000.00,
                    'sale_price' => null,
                    'stock_quantity' => 8,
                    'stock_status' => 'in_stock',
                    'is_default' => true,
                ],
            ],
        ]);

        $createResponse->assertRedirect('/admin/products');

        $product = Product::where('sku', $sku)->with(['attributes.values', 'variations'])->first();
        $this->assertNotNull($product);
        $this->assertEquals('variable', $product->product_type);
        $this->assertCount(2, $product->variations);

        $customAttr = ProductAttribute::where('slug', $customAttrSlug)->with('values')->first();
        $this->assertNotNull($customAttr);
        $this->assertCount(2, $customAttr->values);
        $this->assertTrue($product->attributes->contains('id', $customAttr->id));

        $sixPiston = $product->variations->firstWhere('sku', "{$sku}-6P");
        $this->assertNotNull($sixPiston);
        $this->assertTrue($sixPiston->is_default);
        $this->assertEquals('6-Piston', $sixPiston->attributes_json[$customAttrSlug]);

        // 2. Edit page loads cleanly
        $this->get("/admin/products/{$product->id}/edit")->assertStatus(200);

        // 3. Update product keeping 1 variation and removing the other
        $updateResponse = $this->put("/admin/products/{$product->id}", [
            'name' => "Modular Caliper Kit {$rand}",
            'slug' => "modular-caliper-kit-{$rand}",
            'sku' => $sku,
            'part_number' => $part,
            'product_type' => 'variable',
            'status' => 'published',
            'base_price' => 33000.00,
            'stock_quantity' => 8,
            'stock_status' => 'in_stock',
            'product_attributes' => [
                [
                    'id' => $customAttr->id,
                    'name' => $customAttrName,
                    'slug' => $customAttrSlug,
                    'values' => ['6-Piston'],
                    'used_for_variations' => true,
                ],
            ],
            'variations' => [
                [
                    'id' => $sixPiston->id,
                    'name' => '6-Piston Pro',
                    'sku' => "{$sku}-6P",
                    'part_number' => "{$part}-6P",
                    'attributes_json' => [$customAttrSlug => '6-Piston'],
                    'price' => 33500.00,
                    'sale_price' => 31000.00,
                    'stock_quantity' => 5,
                    'stock_status' => 'in_stock',
                    'is_default' => true,
                ],
            ],
        ]);
        $updateResponse->assertRedirect('/admin/products');

        $product->refresh();
        $this->assertCount(1, $product->variations);
        $this->assertEquals('6-Piston Pro', $product->variations->first()->name);
        $this->assertEquals(33500.00, (float) $product->variations->first()->price);

        // 4. Clean up test product & custom attribute
        $this->delete("/admin/products/{$product->id}")->assertRedirect('/admin/products');
        $customAttr->delete();
    }
}
