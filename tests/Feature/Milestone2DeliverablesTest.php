<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Mail\CustomerWelcomeMail;
use App\Mail\EmailOtpMail;
use App\Mail\OrderConfirmationMail;
use App\Mail\OrderStatusUpdatedMail;
use App\Mail\SupplierInvitationMail;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\RegionalPricingRule;
use App\Models\SupplierConnector;
use App\Models\SupplierDocument;
use App\Models\SupplierImportLog;
use App\Models\SupplierOffer;
use App\Models\SupplierProfile;
use App\Models\User;
use Database\Seeders\AutomotiveCatalogSeeder;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;
use ZipArchive;

class Milestone2DeliverablesTest extends TestCase
{
    use DatabaseTransactions;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::where('email', 'admin@autosparts.com')->firstOrFail();
    }

    public function test_admin_can_manage_regional_pricing_rules_and_checkout_applies_country_tax_and_shipping(): void
    {
        $this->actingAs($this->admin)
            ->post('/admin/regional-pricing', [
                'country_code' => 'FR',
                'country_name' => 'France',
                'currency_code' => 'EUR',
                'margin_percent' => 8.5,
                'tax_rate_percent' => 20.0,
                'flat_shipping_cost' => 60.0,
                'free_shipping_threshold' => 1200.0,
                'min_order_amount' => 100.0,
                'is_selling_enabled' => true,
                'is_default' => false,
                'notes' => 'EU DHL Express',
            ])
            ->assertRedirect();

        $rule = RegionalPricingRule::where('country_code', 'FR')->firstOrFail();
        $this->assertEquals(20.0, (float) $rule->tax_rate_percent);
        $this->assertEquals(60.0, (float) $rule->flat_shipping_cost);

        $product = Product::where('status', 'published')->firstOrFail();

        $response = $this->postJson('/api/checkout/calculate-tax', [
            'country_code' => 'FR',
            'customer_state' => 'Paris',
            'items' => [
                ['id' => $product->id, 'price' => 500, 'quantity' => 1],
            ],
        ]);

        $response->assertOk()
            ->assertJson([
                'success' => true,
                'country_code' => 'FR',
                'tax_rate_percent' => 20.0,
                'tax_amount' => 100.0,
                'shipping_cost' => 60.0,
                'is_selling_enabled' => true,
            ]);

        $this->actingAs($this->admin)
            ->delete("/admin/regional-pricing/{$rule->id}")
            ->assertRedirect();

        $this->assertDatabaseMissing('regional_pricing_rules', ['id' => $rule->id]);
    }

    public function test_admin_can_invite_approve_reject_and_upload_documents_for_suppliers(): void
    {
        Mail::fake();
        Storage::fake('public');

        $this->actingAs($this->admin)
            ->post('/admin/suppliers', [
                'name' => 'Hassan Al-Mansoor',
                'company_name' => 'Emirates Turbo Supply LLC',
                'email' => 'hassan@emirateturbo.ae',
                'phone' => '+971 50 998 7766',
                'send_invitation' => true,
                'country_code' => 'AE',
                'country_name' => 'United Arab Emirates',
                'tax_id' => 'TRN-100998877600003',
                'registration_number' => 'CN-778899',
                'payment_terms' => 'Net 45',
                'default_discount_percent' => 7.5,
                'minimum_order_value' => 1000,
                'currency_code' => 'AED',
                'shipping_methods' => 'Same-Day Dubai Courier',
                'default_shipping_cost' => 15,
                'lead_time_days' => 2,
                'return_policy' => '30-day unopened return',
                'warranty_terms' => '24-month OEM warranty',
                'reliability_score' => 96,
                'priority_rank' => 5,
                'is_preferred' => true,
            ])
            ->assertRedirect();

        $supplier = User::where('email', 'hassan@emirateturbo.ae')->firstOrFail();
        $this->assertTrue($supplier->hasRole(UserRole::Supplier->value));

        $profile = SupplierProfile::where('user_id', $supplier->id)->firstOrFail();
        $this->assertSame('invited', $profile->approval_status);
        $this->assertSame('TRN-100998877600003', $profile->tax_id);
        $this->assertTrue($profile->is_preferred);

        Mail::assertSent(SupplierInvitationMail::class, fn ($m) => $m->hasTo('hassan@emirateturbo.ae') && $m->eventType === 'invited');

        // Approve supplier
        $this->actingAs($this->admin)
            ->post("/admin/suppliers/{$supplier->id}/approve")
            ->assertRedirect();

        $this->assertSame('approved', $profile->fresh()->approval_status);
        $this->assertSame('active', $supplier->fresh()->status);
        Mail::assertSent(SupplierInvitationMail::class, fn ($m) => $m->hasTo('hassan@emirateturbo.ae') && $m->eventType === 'approved');

        // Upload & delete supplier document
        $file = UploadedFile::fake()->create('trade-license.pdf', 120, 'application/pdf');
        $this->actingAs($this->admin)
            ->post("/admin/suppliers/{$supplier->id}/documents", [
                'title' => 'Dubai Trade License 2026',
                'document_type' => 'trade_license',
                'document_file' => $file,
            ])
            ->assertRedirect();

        $doc = SupplierDocument::where('supplier_id', $supplier->id)->firstOrFail();
        $this->assertSame('Dubai Trade License 2026', $doc->title);

        $this->actingAs($this->admin)
            ->delete("/admin/suppliers/documents/{$doc->id}")
            ->assertRedirect();
        $this->assertDatabaseMissing('supplier_documents', ['id' => $doc->id]);

        // Reject supplier
        $this->actingAs($this->admin)
            ->post("/admin/suppliers/{$supplier->id}/reject")
            ->assertRedirect();
        $this->assertSame('rejected', $profile->fresh()->approval_status);
        $this->assertSame('suspended', $supplier->fresh()->status);
    }

    public function test_multi_supplier_offer_comparison_auto_selection_and_manual_override(): void
    {
        $product = Product::where('status', 'published')->firstOrFail();
        $offers = SupplierOffer::where('product_id', $product->id)->get();
        $this->assertGreaterThanOrEqual(2, $offers->count());

        // Save custom selection rules and recalculate
        $this->actingAs($this->admin)
            ->post('/admin/suppliers/selection-rules', [
                'weight_price' => 50,
                'weight_stock' => 15,
                'weight_delivery' => 15,
                'weight_shipping' => 10,
                'weight_reliability' => 5,
                'weight_commercial' => 5,
                'min_margin_percent' => 10,
                'require_in_stock' => true,
            ])
            ->assertRedirect();

        $selected = SupplierOffer::where('product_id', $product->id)->where('is_selected', true)->first();
        $this->assertNotNull($selected);

        // Manually override to a non-selected offer
        $otherOffer = SupplierOffer::where('product_id', $product->id)
            ->where('id', '!=', $selected->id)
            ->firstOrFail();

        $this->actingAs($this->admin)
            ->post("/admin/suppliers/offers/{$product->id}/{$otherOffer->id}/override")
            ->assertRedirect();

        $this->assertTrue($otherOffer->fresh()->is_selected);
        $this->assertTrue($otherOffer->fresh()->is_manual_override);
        $this->assertFalse($selected->fresh()->is_selected);

        // Clear manual override -> returns to auto-selection
        $this->actingAs($this->admin)
            ->post("/admin/suppliers/offers/{$product->id}/clear-override")
            ->assertRedirect();

        $this->assertFalse($otherOffer->fresh()->is_manual_override);
        $this->assertEquals(1, SupplierOffer::where('product_id', $product->id)->where('is_selected', true)->count());
    }

    public function test_supplier_catalog_import_supports_csv_xml_and_excel_xlsx(): void
    {
        $supplier = User::whereHas('roles', fn ($q) => $q->where('name', UserRole::Supplier->value))->firstOrFail();
        $product = Product::where('status', 'published')->firstOrFail();

        // 1. CSV Import
        $csvContent = "sku,part_number,purchase_price,stock_quantity,preparation_days,delivery_days,shipping_cost,commercial_discount_percent,commercial_terms\n"
            . "{$product->sku},{$product->part_number},199.50,42,1,2,18.00,6,Net 30\n";
        $csvFile = UploadedFile::fake()->createWithContent('offers.csv', $csvContent);

        $this->actingAs($this->admin)
            ->post('/admin/suppliers/import', [
                'supplier_id' => $supplier->id,
                'catalog_file' => $csvFile,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('supplier_import_logs', [
            'supplier_id' => $supplier->id,
            'source_type' => 'csv',
            'status' => 'completed',
        ]);
        $this->assertEquals(42, SupplierOffer::where('supplier_id', $supplier->id)->where('product_id', $product->id)->value('stock_quantity'));

        // 2. XML Import
        $xmlContent = '<?xml version="1.0" encoding="UTF-8"?><offers><offer>'
            . "<sku>{$product->sku}</sku>"
            . '<purchase_price>189.00</purchase_price>'
            . '<stock_quantity>55</stock_quantity>'
            . '<preparation_days>1</preparation_days>'
            . '<delivery_days>3</delivery_days>'
            . '<shipping_cost>12.00</shipping_cost>'
            . '<commercial_discount_percent>8</commercial_discount_percent>'
            . '</offer></offers>';
        $xmlFile = UploadedFile::fake()->createWithContent('offers.xml', $xmlContent);

        $this->actingAs($this->admin)
            ->post('/admin/suppliers/import', [
                'supplier_id' => $supplier->id,
                'catalog_file' => $xmlFile,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('supplier_import_logs', [
            'supplier_id' => $supplier->id,
            'source_type' => 'xml',
            'status' => 'completed',
        ]);
        $this->assertEquals(55, SupplierOffer::where('supplier_id', $supplier->id)->where('product_id', $product->id)->value('stock_quantity'));

        // 3. Real Excel (.xlsx) Import built natively with ZipArchive
        $xlsxPath = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'test_offers_' . uniqid() . '.xlsx';
        $zip = new ZipArchive();
        $this->assertTrue($zip->open($xlsxPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) === true);
        $zip->addFromString('xl/sharedStrings.xml', '<?xml version="1.0" encoding="UTF-8"?>'
            . '<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
            . '<si><t>sku</t></si>'
            . '<si><t>purchase_price</t></si>'
            . '<si><t>stock_quantity</t></si>'
            . '<si><t>' . htmlspecialchars((string) $product->sku) . '</t></si>'
            . '</sst>');
        $zip->addFromString('xl/worksheets/sheet1.xml', '<?xml version="1.0" encoding="UTF-8"?>'
            . '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>'
            . '<row r="1"><c r="A1" t="s"><v>0</v></c><c r="B1" t="s"><v>1</v></c><c r="C1" t="s"><v>2</v></c></row>'
            . '<row r="2"><c r="A2" t="s"><v>3</v></c><c r="B2"><v>175.25</v></c><c r="C2"><v>68</v></c></row>'
            . '</sheetData></worksheet>');
        $zip->close();

        $xlsxFile = new UploadedFile($xlsxPath, 'offers.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', null, true);

        $this->actingAs($this->admin)
            ->post('/admin/suppliers/import', [
                'supplier_id' => $supplier->id,
                'catalog_file' => $xlsxFile,
            ])
            ->assertRedirect();

        @unlink($xlsxPath);

        $this->assertDatabaseHas('supplier_import_logs', [
            'supplier_id' => $supplier->id,
            'source_type' => 'xlsx',
            'status' => 'completed',
        ]);
        $this->assertEquals(68, SupplierOffer::where('supplier_id', $supplier->id)->where('product_id', $product->id)->value('stock_quantity'));
    }

    public function test_supplier_b2b_connector_creation_test_and_sync(): void
    {
        $supplier = User::whereHas('roles', fn ($q) => $q->where('name', UserRole::Supplier->value))->latest('id')->firstOrFail();

        $this->actingAs($this->admin)
            ->post('/admin/suppliers/connectors', [
                'supplier_id' => $supplier->id,
                'name' => 'Authorized B2B Live Feed',
                'driver' => 'mock_b2b',
                'auth_type' => 'none',
                'sync_frequency' => 'hourly',
                'is_active' => true,
            ])
            ->assertRedirect();

        $connector = SupplierConnector::where('name', 'Authorized B2B Live Feed')->firstOrFail();

        $this->actingAs($this->admin)
            ->post("/admin/suppliers/connectors/{$connector->id}/test")
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->actingAs($this->admin)
            ->post("/admin/suppliers/connectors/{$connector->id}/sync")
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertSame('synced', $connector->fresh()->last_status);
        $this->assertTrue(SupplierImportLog::where('connector_id', $connector->id)->exists());
    }

    public function test_transactional_emails_sent_on_registration_checkout_and_order_status_update(): void
    {
        Mail::fake();

        // 1. Registration Email OTP + Customer Welcome Email on registration
        $sentOtp = null;
        $this->postJson('/register/send-otp', [
            'name' => 'Rami Al-Farsi',
            'email' => 'rami.alfarsi@example.com',
            'phone' => '+971 55 123 4567',
            'password' => 'SecretPass123!',
            'password_confirmation' => 'SecretPass123!',
        ])->assertOk()->assertJson(['success' => true]);

        Mail::assertSent(EmailOtpMail::class, function (EmailOtpMail $mail) use (&$sentOtp) {
            if ($mail->hasTo('rami.alfarsi@example.com') && $mail->purpose === 'register') {
                $sentOtp = $mail->otp;
                return true;
            }
            return false;
        });
        $this->assertNotNull($sentOtp);

        $this->post('/register', [
            'name' => 'Rami Al-Farsi',
            'email' => 'rami.alfarsi@example.com',
            'phone' => '+971 55 123 4567',
            'password' => 'SecretPass123!',
            'password_confirmation' => 'SecretPass123!',
            'otp' => $sentOtp,
        ])->assertRedirect();

        Mail::assertSent(CustomerWelcomeMail::class, fn ($m) => $m->hasTo('rami.alfarsi@example.com'));

        // 2. Order Confirmation Email on COD checkout
        $product = Product::where('status', 'published')->firstOrFail();
        $res = $this->postJson('/checkout/cod', [
            'customer_name' => 'Rami Al-Farsi',
            'customer_email' => 'rami.alfarsi@example.com',
            'customer_phone' => '+971 55 123 4567',
            'shipping_address' => 'Al Wasl Rd, Villa 14',
            'city' => 'Dubai',
            'state' => 'Dubai',
            'pincode' => '00000',
            'subtotal' => (float) $product->base_price,
            'tax_amount' => round((float) $product->base_price * 0.05, 2),
            'total_amount' => round((float) $product->base_price * 1.05, 2),
            'currency' => 'AED',
            'items' => [
                [
                    'id' => $product->id,
                    'name' => $product->name,
                    'sku' => $product->sku,
                    'price' => (float) $product->base_price,
                    'quantity' => 1,
                ],
            ],
        ]);
        $res->assertOk()->assertJson(['success' => true]);

        $order = Order::where('order_number', $res->json('order_number'))->firstOrFail();
        Mail::assertSent(OrderConfirmationMail::class, fn ($m) => $m->hasTo('rami.alfarsi@example.com') && $m->order->id === $order->id);

        // 3. Order Status Updated Email when Admin updates order status
        $this->actingAs($this->admin)
            ->put("/admin/orders/{$order->id}", [
                'delivery_status' => 'shipped',
                'payment_status' => 'paid',
                'tracking_number' => 'DXB-TRACK-9988',
                'tracking_carrier' => 'Aramex UAE',
                'tracking_url' => 'https://aramex.com/track/DXB-TRACK-9988',
            ])
            ->assertRedirect();

        Mail::assertSent(OrderStatusUpdatedMail::class, fn ($m) => $m->hasTo('rami.alfarsi@example.com') && $m->order->id === $order->id);
    }

    public function test_forgot_password_otp_sends_email_and_resets_password(): void
    {
        Mail::fake();

        $customer = User::where('email', 'customer@autosparts.com')->firstOrFail();

        $resetOtp = null;
        $this->postJson('/forgot-password', [
            'email' => $customer->email,
        ])->assertOk()->assertJson(['success' => true]);

        Mail::assertSent(EmailOtpMail::class, function (EmailOtpMail $mail) use ($customer, &$resetOtp) {
            if ($mail->hasTo($customer->email) && $mail->purpose === 'forgot_password') {
                $resetOtp = $mail->otp;
                return true;
            }
            return false;
        });
        $this->assertNotNull($resetOtp);

        // Wrong OTP fails validation
        $this->post('/forgot-password/reset', [
            'email' => $customer->email,
            'otp' => '000000',
            'password' => 'NewSecurePass99!',
            'password_confirmation' => 'NewSecurePass99!',
        ])->assertSessionHasErrors('otp');

        // Correct OTP resets password and redirects to login
        $this->post('/forgot-password/reset', [
            'email' => $customer->email,
            'otp' => $resetOtp,
            'password' => 'NewSecurePass99!',
            'password_confirmation' => 'NewSecurePass99!',
        ])->assertRedirect(route('login'));

        $this->assertTrue(\Illuminate\Support\Facades\Hash::check('NewSecurePass99!', $customer->fresh()->password));
    }

    public function test_newsletter_subscription_saves_and_admin_can_manage_subscribers(): void
    {
        $this->postJson('/api/newsletter/subscribe', [
            'email' => 'trackfan@example.com',
        ])->assertOk()->assertJson(['success' => true]);

        $this->assertDatabaseHas('newsletter_subscribers', [
            'email' => 'trackfan@example.com',
            'status' => 'subscribed',
            'source' => 'footer',
        ]);

        $subscriber = \App\Models\NewsletterSubscriber::where('email', 'trackfan@example.com')->firstOrFail();

        $this->actingAs($this->admin)
            ->get('/admin/subscribers')
            ->assertOk();

        $this->actingAs($this->admin)
            ->post("/admin/subscribers/{$subscriber->id}/toggle-status")
            ->assertRedirect();

        $this->assertSame('unsubscribed', $subscriber->fresh()->status);

        $this->actingAs($this->admin)
            ->get('/admin/subscribers/export')
            ->assertOk()
            ->assertHeader('Content-Type', 'text/csv; charset=UTF-8');

        $this->actingAs($this->admin)
            ->delete("/admin/subscribers/{$subscriber->id}")
            ->assertRedirect();

        $this->assertDatabaseMissing('newsletter_subscribers', ['id' => $subscriber->id]);
    }

    public function test_localized_url_path_prefixes_work_for_english_arabic_and_french(): void
    {
        $product = Product::where('status', 'published')->firstOrFail();

        $this->get('/')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->where('locale', 'en'));

        $this->get('/ar')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->where('locale', 'ar'));

        $this->get('/fr')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->where('locale', 'fr'));

        $this->get('/ar/shop')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->where('locale', 'ar'));

        $this->get('/fr/brands')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->where('locale', 'fr'));

        $this->get("/ar/products/{$product->slug}")
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('locale', 'ar')
                ->where('product.slug', $product->slug)
            );
    }

    public function test_admin_can_save_native_translations_on_products_categories_and_brands(): void
    {
        $category = Category::firstOrFail();
        $brand = Brand::firstOrFail();
        $product = Product::firstOrFail();

        $this->actingAs($this->admin)
            ->post("/admin/categories/{$category->id}", [
                '_method' => 'put',
                'name' => $category->name,
                'slug' => $category->slug,
                'description' => $category->description ?? '',
                'icon' => $category->icon ?? 'Disc',
                'translations' => json_encode([
                    'ar' => ['name' => 'إطارات سباق', 'description' => 'وصف عربي'],
                    'fr' => ['name' => 'Pneus Course', 'description' => 'Description FR'],
                ]),
            ])
            ->assertRedirect();

        $this->assertSame('إطارات سباق', $category->fresh()->translations['ar']['name'] ?? null);
        $this->assertSame('Pneus Course', $category->fresh()->translations['fr']['name'] ?? null);

        $this->actingAs($this->admin)
            ->put("/admin/brands/{$brand->id}", [
                'name' => $brand->name,
                'slug' => $brand->slug,
                'description' => $brand->description ?? '',
                'translations' => [
                    'ar' => ['name' => 'علامة سباق', 'description' => 'وصف العلامة'],
                    'fr' => ['name' => 'Marque Course', 'description' => 'Desc Marque'],
                ],
            ])
            ->assertRedirect();

        $this->assertSame('علامة سباق', $brand->fresh()->translations['ar']['name'] ?? null);

        $this->actingAs($this->admin)
            ->put("/admin/products/{$product->id}", [
                'name' => $product->name,
                'slug' => $product->slug,
                'sku' => $product->sku,
                'part_number' => $product->part_number,
                'short_description' => $product->short_description,
                'description' => $product->description,
                'product_type' => $product->product_type,
                'status' => $product->status,
                'base_price' => $product->base_price,
                'stock_quantity' => $product->stock_quantity,
                'stock_status' => $product->stock_status,
                'category_id' => $product->category_id,
                'brand_id' => $product->brand_id,
                'translations' => [
                    'ar' => [
                        'name' => 'منتج اختبار عربي',
                        'short_description' => 'ملخص عربي',
                        'description' => 'وصف كامل بالعربية',
                    ],
                    'fr' => [
                        'name' => 'Produit Test FR',
                        'short_description' => 'Résumé FR',
                        'description' => 'Description complète FR',
                    ],
                ],
            ])
            ->assertRedirect();

        $freshProduct = $product->fresh();
        $this->assertSame('منتج اختبار عربي', $freshProduct->translations['ar']['name'] ?? null);
        $this->assertSame('Produit Test FR', $freshProduct->translations['fr']['name'] ?? null);
    }
}
