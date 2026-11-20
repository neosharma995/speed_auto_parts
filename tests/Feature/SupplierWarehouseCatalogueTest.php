<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\StockTransfer;
use App\Models\User;
use Illuminate\Support\Str;
use Tests\TestCase;

class SupplierWarehouseCatalogueTest extends TestCase
{
    public function test_role_isolation_and_supplier_login_redirect(): void
    {
        $supplier = User::where('email', 'supplier@autoparts.com')->firstOrFail();
        $customer = User::where('email', 'customer@autoparts.com')->firstOrFail();

        // Supplier login redirects to /supplier/dashboard
        $loginRes = $this->post('/login', [
            'email' => 'supplier@autoparts.com',
            'password' => 'password',
        ]);
        $loginRes->assertRedirect('/supplier/dashboard');

        // Supplier cannot access admin portal
        $this->actingAs($supplier);
        $this->get('/admin/dashboard')->assertStatus(403);
        $this->get('/admin/warehouse')->assertStatus(403);
        $this->get('/supplier/dashboard')->assertStatus(200);

        // Customer cannot access supplier portal
        $this->actingAs($customer);
        $this->get('/supplier/dashboard')->assertStatus(403);
    }

    public function test_admin_can_create_supplier(): void
    {
        $admin = User::where('email', 'admin@autoparts.com')->firstOrFail();
        $this->actingAs($admin);

        $email = 'supplier_' . strtolower(Str::random(6)) . '@example.com';

        $res = $this->post('/admin/suppliers', [
            'name' => 'Karan Malhotra',
            'company_name' => 'TrackLine Components',
            'email' => $email,
            'phone' => '+91 98111 22334',
            'password' => 'secret123',
        ]);

        $res->assertStatus(302);
        $created = User::where('email', $email)->first();
        $this->assertNotNull($created);
        $this->assertTrue($created->isSupplier());
        $this->assertFalse($created->isStaff());
        $this->assertEquals('TrackLine Components', $created->company_name);
    }

    public function test_supplier_product_lot_warehouse_reject_receive_and_catalogue_flow(): void
    {
        $supplier = User::where('email', 'supplier@autoparts.com')->firstOrFail();
        $admin = User::where('email', 'admin@autoparts.com')->firstOrFail();
        $category = Category::first();
        $brand = Brand::first();

        $rand = rand(10000, 99999);
        $sku = "SUP-TEST-{$rand}";
        $part = "SUP-PN-{$rand}";

        // 1. Supplier creates a product in single products table (starts draft with 0 catalogue stock)
        $this->actingAs($supplier);
        $createRes = $this->post('/supplier/products', [
            'name' => "Forged Aluminum Control Arm {$rand}",
            'sku' => $sku,
            'part_number' => $part,
            'category_id' => $category?->id,
            'brand_id' => $brand?->id,
            'supplier_price' => 4500.00,
            'supplier_stock' => 50,
            'short_description' => 'CNC billet suspension arm',
        ]);
        $createRes->assertStatus(302);

        $product = Product::where('sku', $sku)->firstOrFail();
        $this->assertEquals($supplier->id, $product->supplier_id);
        $this->assertEquals('draft', $product->status);
        $this->assertEquals(50, $product->supplier_stock);
        $this->assertEquals(0, $product->warehouse_stock);
        $this->assertEquals(0, $product->stock_quantity);

        // Hidden from public storefront while draft
        $this->get("/products/{$product->slug}")->assertStatus(404);

        // 2. Supplier sends a lot of 20 units (pending)
        $lot1Res = $this->post('/supplier/lots', [
            'items' => [[
                'product_id' => $product->id,
                'quantity' => 20,
                'unit_price' => 4500.00,
            ]],
            'notes' => 'Batch 1 test',
        ]);
        $lot1Res->assertStatus(302);

        $product->refresh();
        $this->assertEquals(30, $product->supplier_stock);
        $this->assertEquals(0, $product->warehouse_stock);

        $lot1 = StockTransfer::where('product_id', $product->id)
            ->where('direction', 'supplier_to_warehouse')
            ->latest('id')
            ->firstOrFail();
        $this->assertEquals('pending', $lot1->status);

        // 3. Admin rejects Lot 1 -> restores 20 units back to supplier_stock
        $this->actingAs($admin);
        $this->post("/admin/warehouse/lots/{$lot1->id}/reject", [
            'reason' => 'Packaging mismatch',
        ])->assertStatus(302);

        $product->refresh();
        $lot1->refresh();
        $this->assertEquals('rejected', $lot1->status);
        $this->assertEquals(50, $product->supplier_stock);
        $this->assertEquals(0, $product->warehouse_stock);

        // 4. Supplier sends Lot 2 of 25 units -> Admin receives into Warehouse
        $this->actingAs($supplier);
        $this->post('/supplier/lots', [
            'items' => [[
                'product_id' => $product->id,
                'quantity' => 25,
                'unit_price' => 4600.00,
            ]],
            'notes' => 'Batch 2 verified',
        ])->assertStatus(302);

        $product->refresh();
        $this->assertEquals(25, $product->supplier_stock);

        $lot2 = StockTransfer::where('product_id', $product->id)
            ->where('direction', 'supplier_to_warehouse')
            ->where('status', 'pending')
            ->latest('id')
            ->firstOrFail();

        $this->actingAs($admin);
        $this->post("/admin/warehouse/lots/{$lot2->id}/receive")->assertStatus(302);

        $product->refresh();
        $lot2->refresh();
        $this->assertEquals('received', $lot2->status);
        $this->assertEquals(25, $product->warehouse_stock);
        $this->assertEquals(4600.00, (float) $product->supplier_price);

        // 5. Admin transfers 15 units from Warehouse -> Catalogue with new selling price & publishes
        $this->post("/admin/catalogue/{$product->id}/transfer", [
            'quantity' => 15,
            'base_price' => 6999.00,
            'sale_price' => 6499.00,
            'publish' => true,
            'notes' => 'Published to storefront',
        ])->assertStatus(302);

        $product->refresh();
        $this->assertEquals(10, $product->warehouse_stock);
        $this->assertEquals(15, $product->stock_quantity);
        $this->assertEquals(6999.00, (float) $product->base_price);
        $this->assertEquals(6499.00, (float) $product->sale_price);
        $this->assertEquals('published', $product->status);
        $this->assertEquals('in_stock', $product->stock_status);

        // Now visible on public website
        $this->get("/products/{$product->slug}")->assertStatus(200);

        // 6. Admin returns 5 units from Catalogue -> Warehouse
        $this->post("/admin/catalogue/{$product->id}/return", [
            'quantity' => 5,
            'notes' => 'Reserve stock',
        ])->assertStatus(302);

        $product->refresh();
        $this->assertEquals(15, $product->warehouse_stock);
        $this->assertEquals(10, $product->stock_quantity);
    }

    public function test_multi_item_lot_transfer_supplier_to_warehouse_to_catalogue(): void
    {
        $supplier = User::where('email', 'supplier@autoparts.com')->firstOrFail();
        $admin = User::where('email', 'admin@autoparts.com')->firstOrFail();
        $category = Category::first();
        $brand = Brand::first();

        $rand1 = rand(10000, 99999);
        $rand2 = rand(10000, 99999);

        // Create 2 supplier products
        $this->actingAs($supplier);
        $this->post('/supplier/products', [
            'name' => "Multi Lot Part A {$rand1}",
            'sku' => "LOT-A-{$rand1}",
            'part_number' => "PN-A-{$rand1}",
            'category_id' => $category?->id,
            'brand_id' => $brand?->id,
            'supplier_price' => 2500.00,
            'supplier_stock' => 40,
        ])->assertStatus(302);

        $this->post('/supplier/products', [
            'name' => "Multi Lot Part B {$rand2}",
            'sku' => "LOT-B-{$rand2}",
            'part_number' => "PN-B-{$rand2}",
            'category_id' => $category?->id,
            'brand_id' => $brand?->id,
            'supplier_price' => 3500.00,
            'supplier_stock' => 30,
        ])->assertStatus(302);

        $prodA = Product::where('sku', "LOT-A-{$rand1}")->firstOrFail();
        $prodB = Product::where('sku', "LOT-B-{$rand2}")->firstOrFail();

        // 1. Dispatch both products together in 1 lot
        $this->post('/supplier/lots', [
            'items' => [
                ['product_id' => $prodA->id, 'quantity' => 10, 'unit_price' => 2500.00],
                ['product_id' => $prodB->id, 'quantity' => 12, 'unit_price' => 3500.00],
            ],
            'notes' => 'Multi-item lot 1',
        ])->assertStatus(302);

        $prodA->refresh();
        $prodB->refresh();
        $this->assertEquals(30, $prodA->supplier_stock);
        $this->assertEquals(18, $prodB->supplier_stock);

        $lot1Transfers = StockTransfer::whereIn('product_id', [$prodA->id, $prodB->id])
            ->where('direction', 'supplier_to_warehouse')
            ->get();
        $this->assertCount(2, $lot1Transfers);
        $lotNumber1 = $lot1Transfers[0]->lot_number;
        $this->assertEquals($lotNumber1, $lot1Transfers[1]->lot_number);

        // 2. Admin rejects entire lot 1 -> restores stock on both
        $this->actingAs($admin);
        $this->post("/admin/warehouse/lot-number/{$lotNumber1}/reject", [
            'reason' => 'Invoice mismatch',
        ])->assertStatus(302);

        $prodA->refresh();
        $prodB->refresh();
        $this->assertEquals(40, $prodA->supplier_stock);
        $this->assertEquals(30, $prodB->supplier_stock);
        $this->assertEquals(2, StockTransfer::where('lot_number', $lotNumber1)->where('status', 'rejected')->count());

        // 3. Supplier dispatches 2-item lot 2 -> Admin receives entire lot
        $this->actingAs($supplier);
        $this->post('/supplier/lots', [
            'items' => [
                ['product_id' => $prodA->id, 'quantity' => 15, 'unit_price' => 2600.00],
                ['product_id' => $prodB->id, 'quantity' => 20, 'unit_price' => 3600.00],
            ],
            'notes' => 'Multi-item lot 2',
        ])->assertStatus(302);

        $lotNumber2 = StockTransfer::where('product_id', $prodA->id)
            ->where('status', 'pending')
            ->latest('id')
            ->value('lot_number');
        $this->assertNotEmpty($lotNumber2);

        $this->actingAs($admin);
        $this->post("/admin/warehouse/lot-number/{$lotNumber2}/receive")->assertStatus(302);

        $prodA->refresh();
        $prodB->refresh();
        $this->assertEquals(15, $prodA->warehouse_stock);
        $this->assertEquals(20, $prodB->warehouse_stock);
        $this->assertEquals(2, StockTransfer::where('lot_number', $lotNumber2)->where('status', 'received')->count());

        // 4. Admin bulk transfers both products from Warehouse -> Catalogue with new selling prices
        $this->post('/admin/catalogue/bulk-transfer', [
            'items' => [
                ['product_id' => $prodA->id, 'quantity' => 10, 'base_price' => 3999.00, 'sale_price' => 3599.00],
                ['product_id' => $prodB->id, 'quantity' => 14, 'base_price' => 5499.00, 'sale_price' => null],
            ],
            'publish' => true,
            'notes' => 'Bulk launch to storefront',
        ])->assertStatus(302);

        $prodA->refresh();
        $prodB->refresh();
        $this->assertEquals(5, $prodA->warehouse_stock);
        $this->assertEquals(10, $prodA->stock_quantity);
        $this->assertEquals(3999.00, (float) $prodA->base_price);
        $this->assertEquals(3599.00, (float) $prodA->sale_price);
        $this->assertEquals('published', $prodA->status);

        $this->assertEquals(6, $prodB->warehouse_stock);
        $this->assertEquals(14, $prodB->stock_quantity);
        $this->assertEquals(5499.00, (float) $prodB->base_price);
        $this->assertNull($prodB->sale_price);
        $this->assertEquals('published', $prodB->status);

        $catTransfers = StockTransfer::whereIn('product_id', [$prodA->id, $prodB->id])
            ->where('direction', 'warehouse_to_catalogue')
            ->get();
        $this->assertCount(2, $catTransfers);
        $this->assertEquals($catTransfers[0]->lot_number, $catTransfers[1]->lot_number);
    }
}
