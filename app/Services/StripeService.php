<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Setting;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use RuntimeException;
use Stripe\ApiRequestor;
use Stripe\Event;
use Stripe\HttpClient\CurlClient;
use Stripe\StripeClient;
use Stripe\Webhook;

class StripeService
{
    protected string $publishableKey;
    protected string $secretKey;
    protected string $webhookSecret;
    protected string $currency;

    public function __construct()
    {
        $this->publishableKey = (string) config('services.stripe.key', '');
        $this->secretKey = (string) config('services.stripe.secret', '');
        $this->webhookSecret = (string) config('services.stripe.webhook_secret', '');

        $settingCurrency = Schema::hasTable('settings')
            ? (string) Setting::get('currency_code', '')
            : '';

        $this->currency = strtolower($settingCurrency !== '' ? $settingCurrency : (string) config('services.stripe.currency', 'aed'));
    }

    public function getPublishableKey(): string
    {
        return $this->publishableKey;
    }

    public function getCurrency(): string
    {
        return strtoupper($this->currency);
    }

    public function isConfigured(): bool
    {
        if (empty($this->secretKey)) {
            return false;
        }

        return ! str_contains($this->secretKey, 'your_stripe_secret_key');
    }

    /**
     * Create a Stripe Checkout Session using the latest Stripe PHP SDK (Checkout Sessions API).
     *
     * @param  array<string, mixed>  $orderData
     * @return array{id: string, url: string, amount_total: int, currency: string, simulated: bool}
     */
    public function createCheckoutSession(array $orderData, string $successUrl, string $cancelUrl): array
    {
        $totalAmount = (float) ($orderData['total_amount'] ?? 0);
        $amountInFils = max(100, (int) round($totalAmount * 100));
        $receipt = (string) ($orderData['order_reference'] ?? ('SAP-' . uniqid()));
        $sessionCurrency = strtolower(trim((string) ($orderData['currency'] ?? $this->currency)));
        if ($sessionCurrency === '') {
            $sessionCurrency = $this->currency;
        }

        if (! $this->isConfigured()) {
            if (app()->environment('local', 'testing')) {
                $simId = 'cs_test_sim_' . uniqid();
                $simUrl = str_replace('{CHECKOUT_SESSION_ID}', $simId, $successUrl);

                Log::info('Stripe secret key not configured yet; using simulated Checkout Session in local/testing mode.', [
                    'session_id' => $simId,
                    'amount_fils' => $amountInFils,
                    'currency' => $sessionCurrency,
                ]);

                return [
                    'id' => $simId,
                    'url' => $simUrl,
                    'amount_total' => $amountInFils,
                    'currency' => strtoupper($sessionCurrency),
                    'simulated' => true,
                ];
            }

            throw new RuntimeException('Stripe secret key is not configured. Please set STRIPE_SECRET in .env.');
        }

        $client = $this->makeStripeClient();

        $lineItems = [];
        $items = $orderData['items'] ?? [];
        $discountAmount = (float) ($orderData['discount_amount'] ?? 0);
        $taxAmount = (float) ($orderData['tax_amount'] ?? 0);
        $shippingCost = (float) ($orderData['shipping_cost'] ?? 0);

        if ($discountAmount > 0) {
            // Single consolidated payable line item when a coupon discount is applied to guarantee exact total match
            $itemSummary = collect($items)
                ->map(fn ($item) => ($item['name'] ?? 'Auto Part') . ' x' . (int) ($item['quantity'] ?? 1))
                ->implode(', ');

            $lineItems[] = [
                'price_data' => [
                    'currency' => $sessionCurrency,
                    'product_data' => [
                        'name' => "Speed Autos Parts Order ({$receipt})",
                        'description' => mb_strimwidth($itemSummary, 0, 240, '...'),
                    ],
                    'unit_amount' => $amountInFils,
                ],
                'quantity' => 1,
            ];
        } else {
            foreach ($items as $item) {
                $unitFils = max(1, (int) round(((float) ($item['price'] ?? 0)) * 100));
                $productData = [
                    'name' => (string) ($item['name'] ?? 'Automotive Spare Part'),
                ];
                if (! empty($item['variationLabel'])) {
                    $productData['description'] = (string) $item['variationLabel'];
                }

                $lineItems[] = [
                    'price_data' => [
                        'currency' => $sessionCurrency,
                        'product_data' => $productData,
                        'unit_amount' => $unitFils,
                    ],
                    'quantity' => max(1, (int) ($item['quantity'] ?? 1)),
                ];
            }

            if ($shippingCost > 0) {
                $lineItems[] = [
                    'price_data' => [
                        'currency' => $sessionCurrency,
                        'product_data' => [
                            'name' => (string) ($orderData['shipping_method_title'] ?? 'UAE Delivery'),
                        ],
                        'unit_amount' => (int) round($shippingCost * 100),
                    ],
                    'quantity' => 1,
                ];
            }

            if ($taxAmount > 0) {
                $lineItems[] = [
                    'price_data' => [
                        'currency' => $sessionCurrency,
                        'product_data' => [
                            'name' => 'UAE VAT (5%)',
                        ],
                        'unit_amount' => (int) round($taxAmount * 100),
                    ],
                    'quantity' => 1,
                ];
            }
        }

        $session = $client->checkout->sessions->create([
            'mode' => 'payment',
            'line_items' => $lineItems,
            'customer_email' => $orderData['customer_email'] ?? null,
            'client_reference_id' => $receipt,
            'metadata' => [
                'order_reference' => $receipt,
                'customer_name' => (string) ($orderData['customer_name'] ?? ''),
                'customer_phone' => (string) ($orderData['customer_phone'] ?? ''),
            ],
            'success_url' => $successUrl,
            'cancel_url' => $cancelUrl,
        ]);

        return [
            'id' => $session->id,
            'url' => (string) $session->url,
            'amount_total' => (int) ($session->amount_total ?? $amountInFils),
            'currency' => strtoupper((string) ($session->currency ?? $sessionCurrency)),
            'simulated' => false,
        ];
    }

    /**
     * Retrieve a Stripe Checkout Session to confirm payment status.
     *
     * @return array{id: string, payment_status: string, payment_intent: string|null, status: string}
     */
    public function retrieveCheckoutSession(string $sessionId): array
    {
        if (str_starts_with($sessionId, 'cs_test_sim_') && app()->environment('local', 'testing')) {
            return [
                'id' => $sessionId,
                'payment_status' => 'paid',
                'payment_intent' => 'pi_sim_' . substr($sessionId, -8),
                'status' => 'complete',
            ];
        }

        if (! $this->isConfigured()) {
            throw new RuntimeException('Stripe secret key is not configured.');
        }

        $client = $this->makeStripeClient();
        $session = $client->checkout->sessions->retrieve($sessionId);

        return [
            'id' => $session->id,
            'payment_status' => (string) $session->payment_status,
            'payment_intent' => is_string($session->payment_intent) ? $session->payment_intent : ($session->payment_intent->id ?? null),
            'status' => (string) $session->status,
        ];
    }

    /**
     * Verify and construct a Stripe Webhook Event from raw request payload and Stripe-Signature header.
     */
    public function constructWebhookEvent(string $payload, string $sigHeader): Event
    {
        if (empty($this->webhookSecret) || str_contains($this->webhookSecret, 'your_stripe_webhook_secret')) {
            throw new RuntimeException('Stripe webhook signing secret is not configured.');
        }

        return Webhook::constructEvent($payload, $sigHeader, $this->webhookSecret);
    }

    /**
     * Build a StripeClient configured to use the Windows native CA trust store on Windows hosts
     * so TLS verification succeeds reliably on XAMPP/WAMP without disabling SSL verification.
     */
    protected function makeStripeClient(): StripeClient
    {
        if (PHP_OS_FAMILY === 'Windows' && defined('CURLSSLOPT_NATIVE_CA')) {
            ApiRequestor::setHttpClient(new CurlClient([
                CURLOPT_SSL_OPTIONS => CURLSSLOPT_NATIVE_CA,
            ]));
        }

        return new StripeClient($this->secretKey);
    }
}
