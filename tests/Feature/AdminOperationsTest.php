<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Tests\TestCase;

class AdminOperationsTest extends TestCase
{
    public function test_guest_cannot_access_admin_dashboard(): void
    {
        $response = $this->get('/admin/dashboard');
        $response->assertRedirect('/login');
    }

    public function test_admin_can_access_admin_dashboard(): void
    {
        $admin = User::where('email', 'admin@autoparts.com')->first();
        $this->actingAs($admin);

        $response = $this->get('/admin/dashboard');
        $response->assertStatus(200);
    }

    public function test_admin_can_manage_products(): void
    {
        $admin = User::where('email', 'admin@autoparts.com')->first();
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
}
