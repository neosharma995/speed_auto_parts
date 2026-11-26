<?php

declare(strict_types=1);

namespace App\Services\Connectors;

use App\Models\SupplierConnector;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class XmlFeedConnector implements SupplierConnectorInterface
{
    public function driver(): string
    {
        return 'xml_feed';
    }

    public function label(): string
    {
        return 'Remote XML Feed / B2B Web Service';
    }

    public function testConnection(SupplierConnector $connector): array
    {
        try {
            $rows = $this->fetchOffers($connector);

            return [
                'ok' => true,
                'message' => 'XML feed reachable. Parsed ' . count($rows) . ' offer(s).',
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
            throw new RuntimeException('Endpoint URL is required for XML Feed connector.');
        }

        $client = Http::timeout(20);
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
            throw new RuntimeException("XML feed returned HTTP {$response->status()}.");
        }

        libxml_use_internal_errors(true);
        $xml = simplexml_load_string($response->body());
        if ($xml === false) {
            throw new RuntimeException('Invalid XML payload received from supplier feed.');
        }

        $rows = [];
        $nodes = $xml->xpath('//item | //product | //offer | //row') ?: [];
        foreach ($nodes as $node) {
            $row = [];
            foreach ($node->children() as $k => $v) {
                $row[strtolower((string) $k)] = trim((string) $v);
            }
            if (! empty($row)) {
                $rows[] = $row;
            }
        }

        return $rows;
    }
}
