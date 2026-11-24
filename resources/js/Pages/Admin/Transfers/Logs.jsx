import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import AdminDataTable from '@/Components/Admin/AdminDataTable';
import { ArrowLeft } from 'lucide-react';

const DIRECTION_LABELS = {
    supplier_to_warehouse: 'Supplier → Warehouse',
    warehouse_to_catalogue: 'Warehouse → Catalogue',
    catalogue_to_warehouse: 'Catalogue → Warehouse',
};

const DIRECTION_OPTIONS_BY_SCOPE = {
    catalogue: [
        { value: 'warehouse_to_catalogue', label: 'Warehouse → Catalogue' },
        { value: 'catalogue_to_warehouse', label: 'Catalogue → Warehouse' },
    ],
    warehouse: [
        { value: 'supplier_to_warehouse', label: 'Supplier → Warehouse' },
        { value: 'warehouse_to_catalogue', label: 'Warehouse → Catalogue' },
        { value: 'catalogue_to_warehouse', label: 'Catalogue → Warehouse' },
    ],
};

function directionBadgeClass(direction) {
    if (direction === 'warehouse_to_catalogue') return 'badge-success';
    if (direction === 'catalogue_to_warehouse') return 'badge-warning';
    return 'badge-neutral';
}

function statusBadgeClass(status) {
    if (status === 'received') return 'badge-success';
    if (status === 'rejected') return 'badge-danger';
    return 'badge-warning';
}

export default function AdminTransfersLogs({
    transfers,
    scope = 'warehouse',
    title = 'Stock Transfer Logs',
    backUrl = '/admin/warehouse',
    backLabel = 'Back',
    baseUrl = '/admin/warehouse/logs',
    filters = {},
}) {
    const safeFilters = filters && !Array.isArray(filters) ? filters : {};
    const items = Array.isArray(transfers) ? transfers : (transfers?.data || []);
    const totalCount = transfers?.total ?? items.length;

    const [search, setSearch] = useState(safeFilters.search || '');
    const [direction, setDirection] = useState(safeFilters.direction || '');
    const [status, setStatus] = useState(safeFilters.status || '');

    const directionOptions = DIRECTION_OPTIONS_BY_SCOPE[scope] || DIRECTION_OPTIONS_BY_SCOPE.warehouse;

    const hasActiveFilters = Boolean(
        (safeFilters.search && String(safeFilters.search).trim() !== '') ||
        safeFilters.direction ||
        safeFilters.status
    );

    const handleFilter = () => {
        const params = {};
        if (search.trim()) params.search = search.trim();
        if (direction) params.direction = direction;
        if (status) params.status = status;

        router.get(baseUrl, params, { preserveState: true, replace: true });
    };

    const handleReset = () => {
        setSearch('');
        setDirection('');
        setStatus('');
        router.get(baseUrl, {}, { preserveState: true, replace: true });
    };

    const columns = [
        {
            key: 'lot_number',
            label: 'Ref / Lot #',
            render: (t) => <code>{t.lot_number}</code>,
        },
        {
            key: 'direction',
            label: 'Direction',
            render: (t) => (
                <span className={`badge ${directionBadgeClass(t.direction)}`}>
                    {DIRECTION_LABELS[t.direction] || t.direction}
                </span>
            ),
        },
        {
            key: 'product',
            label: 'Product',
            render: (t) => (
                <>
                    <strong>{t.product?.name || '—'}</strong>
                    {t.product?.sku && (
                        <div style={{ fontSize: '11px', color: '#64748B', fontFamily: 'monospace' }}>
                            {t.product.sku}
                        </div>
                    )}
                </>
            ),
        },
        {
            key: 'supplier',
            label: 'Supplier',
            render: (t) => t.supplier?.company_name || t.supplier?.name || 'In-House',
        },
        {
            key: 'quantity',
            label: 'Qty',
            render: (t) => `${t.quantity} units`,
        },
        {
            key: 'unit_price',
            label: 'Unit Price',
            render: (t) => `₹${Number(t.unit_price || 0).toLocaleString('en-IN')}`,
        },
        {
            key: 'status',
            label: 'Status',
            render: (t) => (
                <span className={`badge ${statusBadgeClass(t.status)}`} style={{ textTransform: 'capitalize' }}>
                    {t.status}
                </span>
            ),
        },
        {
            key: 'notes',
            label: 'Notes',
            cellStyle: { maxWidth: '220px', fontSize: '12px', color: '#64748B' },
            render: (t) => t.rejection_reason || t.notes || '—',
        },
        {
            key: 'created_at',
            label: 'Date',
            cellStyle: { whiteSpace: 'nowrap' },
            render: (t) => (t.created_at ? new Date(t.created_at).toLocaleDateString() : '—'),
        },
    ];

    return (
        <AdminLayout title={title}>
            <AdminDataTable
                title={title}
                count={totalCount}
                search={{
                    value: search,
                    onChange: setSearch,
                    placeholder: 'Search ref/lot #, product name, SKU, notes...',
                }}
                filters={[
                    {
                        key: 'direction',
                        value: direction,
                        onChange: setDirection,
                        placeholder: 'All Directions',
                        options: directionOptions,
                    },
                    {
                        key: 'status',
                        value: status,
                        onChange: setStatus,
                        placeholder: 'All Statuses',
                        options: [
                            { value: 'pending', label: 'Pending' },
                            { value: 'received', label: 'Received' },
                            { value: 'rejected', label: 'Rejected' },
                        ],
                    },
                ]}
                onSearch={handleFilter}
                searchButtonLabel="Filter"
                hasActiveFilters={hasActiveFilters}
                onReset={handleReset}
                actions={
                    <Link href={backUrl} className="btn btn-outline btn-sm">
                        <ArrowLeft size={14} /> {backLabel}
                    </Link>
                }
                columns={columns}
                rows={items}
                emptyMessage="No transfer logs found."
                pagination={Array.isArray(transfers) ? null : transfers}
                itemLabel="logs"
            />
        </AdminLayout>
    );
}
