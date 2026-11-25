<?php

declare(strict_types=1);

namespace App\Services\Connectors;

use App\Models\SupplierConnector;

interface SupplierConnectorInterface
{
    public function driver(): string;

    public function label(): string;

    /**
     * Test connectivity and authentication against the supplier endpoint.
     *
     * @return array{ok: bool, message: string, sample_count?: int}
     */
    public function testConnection(SupplierConnector $connector): array;

    /**
     * Fetch normalized supplier offer rows from the remote B2B API or feed.
     *
     * @return array<int, array<string, mixed>>
     */
    public function fetchOffers(SupplierConnector $connector): array;
}
