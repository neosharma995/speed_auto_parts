<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Product;
use Tests\TestCase;

class PublicCatalogTest extends TestCase
{
    public function test_homepage_loads_successfully(): void
    {
        $response = $this->get('/');
        $response->assertStatus(200);
    }

    public function test_shop_page_loads_with_products(): void
    {
        $response = $this->get('/shop');
        $response->assertStatus(200);
    }

    public function test_product_detail_page_loads_by_slug(): void
    {
        $product = Product::first();
        $this->assertNotNull($product, 'Seed products should exist.');

        $response = $this->get("/products/{$product->slug}");
        $response->assertStatus(200);
    }

    public function test_categories_directory_page_loads(): void
    {
        $response = $this->get('/categories');
        $response->assertStatus(200);
    }

    public function test_brands_directory_page_loads(): void
    {
        $response = $this->get('/brands');
        $response->assertStatus(200);
    }

    public function test_static_information_pages_load(): void
    {
        $pages = ['/about-us', '/contact-us', '/shipping-policy', '/return-policy', '/privacy-policy', '/terms'];

        foreach ($pages as $url) {
            $response = $this->get($url);
            $response->assertStatus(200);
        }
    }

    public function test_part_number_and_sku_search_filters_results(): void
    {
        $product = Product::first();
        $response = $this->get("/shop?search={$product->part_number}");
        $response->assertStatus(200);
    }
}
