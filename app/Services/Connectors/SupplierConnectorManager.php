<?php

declare(strict_types=1);

namespace App\Services\Connectors;

use App\Models\SupplierConnector;
use App\Models\SupplierImportLog;
use App\Models\User;
use App\Services\SupplierCatalogImportService;
use RuntimeException;

class SupplierConnectorManager
{
    /** @var array<string, SupplierConnectorInterface> */
    protected array $drivers = [];

    public function __construct(
        protected SupplierCatalogImportService $importService,
        RestJsonConnector $restJson,
        XmlFeedConnector $xmlFeed,
        MockB2bConnector $mockB2b
    ) {
        $this->register($restJson);
        $this->register($xmlFeed);
        $this->register($mockB2b);
    }

    public function register(SupplierConnectorInterface $connector): void
    {
        $this->drivers[$connector->driver()] = $connector;
    }

    public function driver(string $name): SupplierConnectorInterface
    {
        if (! isset($this->drivers[$name])) {
            throw new RuntimeException("Unknown supplier connector driver '{$name}'.");
        }

        return $this->drivers[$name];
    }

    /**
     * @return array<int, array{driver: string, label: string}>
     */
    public function availableDrivers(): array
    {
        return array_values(array_map(
            fn (SupplierConnectorInterface $d) => ['driver' => $d->driver(), 'label' => $d->label()],
            $this->drivers
        ));
    }

    /**
     * @return array{ok: bool, message: string, sample_count?: int}
     */
    public function test(SupplierConnector $connector): array
    {
        $result = $this->driver($connector->driver)->testConnection($connector);

        $connector->update([
            'last_status' => $result['ok'] ? 'connected' : 'error',
            'last_message' => $result['message'],
        ]);

        return $result;
    }

    public function sync(SupplierConnector $connector, ?User $initiator = null): SupplierImportLog
    {
        try {
            $rows = $this->driver($connector->driver)->fetchOffers($connector);

            $log = $this->importService->processRows(
                supplier: $connector->supplier,
                rows: $rows,
                sourceType: 'connector',
                filename: $connector->name,
                initiator: $initiator,
                createMissingProducts: false,
                connectorId: $connector->id
            );

            $connector->update([
                'last_synced_at' => now(),
                'last_status' => 'synced',
                'last_message' => "Synced {$log->imported_rows} new, {$log->updated_rows} updated ({$log->failed_rows} failed).",
                'last_items_synced' => $log->imported_rows + $log->updated_rows,
            ]);

            return $log;
        } catch (\Throwable $e) {
            $connector->update([
                'last_synced_at' => now(),
                'last_status' => 'error',
                'last_message' => $e->getMessage(),
            ]);

            throw $e;
        }
    }
}
