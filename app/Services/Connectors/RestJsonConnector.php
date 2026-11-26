<?php

declare(strict_types=1);

namespace App\Services\Connectors;

use App\Models\SupplierConnector;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class RestJsonConnector implements SupplierConnectorInterface
{
    public function driver(): string
    {
        return 'rest_json';
    }

    public function label(): string
    {
        return 'REST JSON API';
    }

    public function testConnection(SupplierConnector $connector): array
    {
        try {
            $rows = $this->fetchOffers($connector);

            return [
                'ok' => true,
                'message' => 'Connected successfully. Found ' . count($rows) . ' offer(s) in JSON payload.',
                'sample_count' => count($rows),
            ];
        } catch (\Throwable $e) {
            return [
                'ok' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function fetchOffers(SupplierConnector $connector): array
    {
        if (empty($connector->endpoint_url)) {
            throw new RuntimeException('Endpoint URL is required for REST JSON connector.');
        }

        $client = Http::timeout(20)->acceptJson();
        $creds = $connector->decodedCredentials();

        if ($connector->auth_type === 'bearer' && ! empty($creds['token'])) {
            $client = $client->withToken((string) $creds['token']);
        } elseif ($connector->auth_type === 'api_key' && ! empty($creds['api_key'])) {
            $header = (string) ($creds['header_name'] ?? 'X-API-Key');
            $client = $client->withHeaders([$header => (string) $creds['api_key']]);
        } elseif ($connector->auth_type === 'basic' && ! empty($creds['username'])) {
            $client = $client->withBasicAuth((string) $creds['username'], (string) ($creds['password'] ?? ''));
        }

        $response = $client->get($connector->endpoint_url);
        if (! $response->successful()) {
            throw new RuntimeException("Supplier API returned HTTP {$response->status()}.");
        }

        $payload = $response->json();
        $mapping = $connector->field_mapping_json ?? [];
        $itemsPath = $mapping['items_path'] ?? null;
        $rawItems = $itemsPath ? Arr::get($payload, $itemsPath, []) : (is_array($payload) && array_is_list($payload) ? $payload : ($payload['data'] ?? $payload['items'] ?? []));

        if (! is_array($rawItems)) {
            return [];
        }

        return array_values(array_map(function ($item) use ($mapping) {
            if (! is_array($item)) {
                return [];
            }

            return [
                'sku' => Arr::get($item, $mapping['sku'] ?? 'sku', ''),
                'part_number' => Arr::get($item, $mapping['part_number'] ?? 'part_number', ''),
                'purchase_price' => Arr::get($item, $mapping['purchase_price'] ?? 'purchase_price', Arr::get($item, 'price', 0)),
                'stock_quantity' => Arr::get($item, $mapping['stock_quantity'] ?? 'stock_quantity', Arr::get($item, 'stock', 0)),
                'preparation_days' => Arr::get($item, $mapping['preparation_days'] ?? 'preparation_days', 1),
                'delivery_days' => Arr::get($item, $mapping['delivery_days'] ?? 'delivery_days', 3),
                'shipping_cost' => Arr::get($item, $mapping['shipping_cost'] ?? 'shipping_cost', 0),
                'commercial_discount_percent' => Arr::get($item, $mapping['commercial_discount_percent'] ?? 'commercial_discount_percent', 0),
            ];
        }, $rawItems));
    }
}
