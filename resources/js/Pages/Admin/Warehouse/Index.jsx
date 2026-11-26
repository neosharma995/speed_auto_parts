import React, { useState, useMemo } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import AdminDataTable from '@/Components/Admin/AdminDataTable';
import BulkCatalogueTransferModal from '@/Components/Admin/BulkCatalogueTransferModal';
import { useCurrency } from '@/Context/CurrencyContext';
import {
    Boxes,
    Clock,
    DollarSign,
    CheckCircle2,
    ArrowRight,
    Save,
    Store,
    Inbox,
    BarChart3,
    ChevronDown,
    ChevronUp,
    History,
} from 'lucide-react';

export default function AdminWarehouseIndex({ pendingLotsCount = 0, products = [], bulkProducts = null, transfersCount = 0, stats = {} }) {
    const productRows = Array.isArray(products) ? products : (products?.data || []);
    const totalProducts = Array.isArray(products) ? products.length : (products?.total ?? productRows.length);
    const bulkSource = Array.isArray(bulkProducts) ? bulkProducts : productRows;
    const { errors } = usePage().props;
    const { formatAdminPrice, defaultCurrency } = useCurrency();
    const [showStats, setShowStats] = useState(false);

    const [warehouseEdits, setWarehouseEdits] = useState(() => {
        const map = {};
        productRows.forEach((p) => {
            map[p.id] = p.warehouse_stock;
        });
        return map;
    });

    const [catalogueEdits, setCatalogueEdits] = useState(() => {
        const map = {};
        productRows.forEach((p) => {
            map[p.id] = p.stock_quantity;
        });
        return map;
    });

    // Single Push to Catalogue modal
    const [pushProduct, setPushProduct] = useState(null);
    const [transferQty, setTransferQty] = useState('1');
    const [sellingPrice, setSellingPrice] = useState('');
    const [salePrice, setSalePrice] = useState('');
    const [publishProduct, setPublishProduct] = useState(true);
    const [transferNotes, setTransferNotes] = useState('');

    // Bulk Transfer to Catalogue modal
    const [showBulkModal, setShowBulkModal] = useState(false);

    const [submitting, setSubmitting] = useState(false);

    const warehouseAvailableProducts = useMemo(
        () => bulkSource.filter((p) => Number(p.warehouse_stock) > 0),
        [bulkSource]
    );

    const handleAdjustWarehouse = (productId) => {
        router.post(`/admin/warehouse/products/${productId}/adjust`, {
            warehouse_stock: warehouseEdits[productId] ?? 0,
            stock_quantity: catalogueEdits[productId] ?? 0,
        });
    };

    const openPushModal = (p) => {
        setPushProduct(p);
        setTransferQty(String(Math.min(10, p.warehouse_stock || 1)));
        const cost = Number(p.supplier_price || p.cost_price || 0);
        const currentBase = Number(p.base_price || 0);
        setSellingPrice(String(currentBase > cost ? currentBase : Math.round(cost * 1.35) || 1000));
        setSalePrice(p.sale_price ? String(p.sale_price) : '');
        setPublishProduct(true);
        setTransferNotes('');
    };

    const handlePushSubmit = (e) => {
        e.preventDefault();
        if (!pushProduct) return;
        setSubmitting(true);
        router.post(
            `/admin/catalogue/${pushProduct.id}/transfer`,
            {
                quantity: parseInt(transferQty, 10) || 0,
                base_price: parseFloat(sellingPrice) || 0,
                sale_price: salePrice ? parseFloat(salePrice) : null,
                publish: publishProduct,
                notes: transferNotes,
            },
            {
                onSuccess: () => setPushProduct(null),
                onFinish: () => setSubmitting(false),
            }
        );
    };

    return (
        <AdminLayout title="Admin Warehouse">
            {errors && Object.keys(errors).length > 0 && (
                <div
                    style={{
                        backgroundColor: '#FFF1F2',
                        color: '#D93025',
                        padding: '12px 16px',
                        borderRadius: '4px',
                        marginBottom: '16px',
                        fontSize: '13px',
                    }}
                >
                    {Object.values(errors).map((err, idx) => (
                        <div key={idx}>{err}</div>
                    ))}
                </div>
            )}

            {/* Summary, Incoming & Logs Toolbar */}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '10px',
                    marginBottom: '16px',
                }}
            >
                <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => setShowStats((prev) => !prev)}
                    aria-expanded={showStats}
                >
                    <BarChart3 size={15} />
                    <span>{showStats ? 'Hide Summary' : 'Expand Summary'}</span>
                    {showStats ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                </button>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <Link href="/admin/suppliers?tab=incoming" className="btn btn-outline btn-sm">
                        <Inbox size={15} />
                        <span>Incoming Lots ({pendingLotsCount})</span>
                    </Link>

                    <Link href="/admin/warehouse/logs" className="btn btn-outline btn-sm">
                        <History size={15} />
                        <span>Transfer Logs ({transfersCount})</span>
                    </Link>
                </div>
            </div>

            {/* Expandable Stats */}
            {showStats && (
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-info">
                            <span>Pending Incoming Lots</span>
                            <strong>
                                {stats.pending_lots_count || 0}{' '}
                                <small style={{ fontSize: '12px', color: '#64748B' }}>
                                    ({stats.pending_lines_count || 0} lines)
                                </small>
                            </strong>
                        </div>
                        <div className="stat-icon stat-icon--warning">
                            <Clock size={24} />
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-info">
                            <span>Units In Transit</span>
                            <strong>{stats.pending_units || 0}</strong>
                        </div>
                        <div className="stat-icon stat-icon--primary">
                            <Boxes size={24} />
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-info">
                            <span>Warehouse Stock Units</span>
                            <strong>{stats.warehouse_units || 0}</strong>
                        </div>
                        <div className="stat-icon stat-icon--success">
                            <CheckCircle2 size={24} />
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-info">
                            <span>Warehouse Cost Value</span>
                            <strong>{formatAdminPrice(stats.warehouse_value || 0)}</strong>
                        </div>
                        <div className="stat-icon stat-icon--primary">
                            <DollarSign size={24} />
                        </div>
                    </div>
                </div>
            )}

            {/* Warehouse Stock Pipeline */}
            <AdminDataTable
                title="Warehouse Inventory & Stock Management"
                count={totalProducts}
                actions={
                    <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        disabled={warehouseAvailableProducts.length === 0}
                        onClick={() => setShowBulkModal(true)}
                    >
                        <Store size={15} /> Bulk Transfer to Catalogue
                    </button>
                }
                columns={[
                    {
                        key: 'product',
                        label: 'Product',
                        render: (p) => (
                            <>
                                <strong>{p.name}</strong>
                                <div style={{ fontSize: '11px', color: '#64748B', fontFamily: 'monospace' }}>
                                    {p.sku} | {p.part_number}
                                </div>
                            </>
                        ),
                    },
                    {
                        key: 'supplier',
                        label: 'Supplier',
                        render: (p) => p.supplier?.company_name || p.supplier?.name || 'Direct / In-House',
                    },
                    {
                        key: 'supplier_price',
                        label: 'Supplier Price',
                        render: (p) => formatAdminPrice(p.supplier_price || p.cost_price || 0),
                    },
                    {
                        key: 'base_price',
                        label: 'Website Price',
                        render: (p) => (
                            <>
                                <strong>{formatAdminPrice(p.base_price)}</strong>
                                <small
                                    style={{
                                        display: 'block',
                                        color: p.status === 'published' ? '#168A35' : '#64748B',
                                        textTransform: 'capitalize',
                                    }}
                                >
                                    {p.status}
                                </small>
                            </>
                        ),
                    },
                    {
                        key: 'breakdown',
                        label: 'Stock Breakdown (Sup / Whs / Cat)',
                        render: (p) => (
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                <span className="badge badge-neutral">Sup: {p.supplier_stock}</span>
                                <span className={`badge ${p.warehouse_stock > 0 ? 'badge-warning' : 'badge-neutral'}`}>
                                    Whs: {p.warehouse_stock}
                                </span>
                                <span
                                    className={`badge ${
                                        p.stock_quantity <= 5
                                            ? 'badge-danger'
                                            : p.stock_quantity <= 15
                                                ? 'badge-warning'
                                                : 'badge-success'
                                    }`}
                                >
                                    Cat: {p.stock_quantity} ({p.stock_status})
                                </span>
                            </div>
                        ),
                    },
                    {
                        key: 'adjust',
                        label: 'Quick Inventory Adjust (Whs / Cat)',
                        render: (p) => (
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                <input
                                    type="number"
                                    min="0"
                                    title="Warehouse Stock"
                                    placeholder="Whs"
                                    className="form-input"
                                    style={{ width: '68px', padding: '5px 8px' }}
                                    value={warehouseEdits[p.id] ?? p.warehouse_stock}
                                    onChange={(e) =>
                                        setWarehouseEdits({ ...warehouseEdits, [p.id]: parseInt(e.target.value, 10) || 0 })
                                    }
                                />
                                <input
                                    type="number"
                                    min="0"
                                    title="Catalogue Stock"
                                    placeholder="Cat"
                                    className="form-input"
                                    style={{ width: '68px', padding: '5px 8px' }}
                                    value={catalogueEdits[p.id] ?? p.stock_quantity}
                                    onChange={(e) =>
                                        setCatalogueEdits({ ...catalogueEdits, [p.id]: parseInt(e.target.value, 10) || 0 })
                                    }
                                />
                                <button
                                    type="button"
                                    className="btn btn-outline btn-sm"
                                    onClick={() => handleAdjustWarehouse(p.id)}
                                    title="Save Warehouse & Catalogue Stock"
                                >
                                    <Save size={13} /> Update
                                </button>
                            </div>
                        ),
                    },
                    {
                        key: 'transfer',
                        label: 'Transfer',
                        render: (p) => (
                            <button
                                type="button"
                                className="btn btn-primary btn-sm"
                                disabled={p.warehouse_stock <= 0}
                                onClick={() => openPushModal(p)}
                            >
                                <Store size={14} /> Push to Catalogue
                            </button>
                        ),
                    },
                ]}
                rows={productRows}
                pagination={Array.isArray(products) ? null : products}
                itemLabel="products"
                emptyMessage="No warehouse products found."
            />

            {/* Single Push to Catalogue Modal */}
            {pushProduct && (
                <>
                    <div className="header-backdrop" onClick={() => setPushProduct(null)} />
                    <div
                        style={{
                            position: 'fixed',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            backgroundColor: '#FFF',
                            borderRadius: '8px',
                            padding: '28px',
                            width: '90%',
                            maxWidth: '480px',
                            zIndex: 2200,
                            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                        }}
                    >
                        <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '6px' }}>
                            Push Stock to Website Catalogue
                        </h3>
                        <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '16px' }}>
                            <strong>{pushProduct.name}</strong> — Warehouse Stock:{' '}
                            <strong>{pushProduct.warehouse_stock} units</strong> | Supplier Cost:{' '}
                            <strong>{formatAdminPrice(pushProduct.supplier_price || pushProduct.cost_price || 0)}</strong>
                        </p>
                        <form onSubmit={handlePushSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div className="form-group">
                                <label className="form-label">
                                    Quantity to Transfer (Max {pushProduct.warehouse_stock}){' '}
                                    <span className="required">*</span>
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max={pushProduct.warehouse_stock}
                                    className="form-input"
                                    required
                                    value={transferQty}
                                    onChange={(e) => setTransferQty(e.target.value)}
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div className="form-group">
                                    <label className="form-label">
                                        New Selling Price ({defaultCurrency.code}) <span className="required">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="1"
                                        className="form-input"
                                        required
                                        value={sellingPrice}
                                        onChange={(e) => setSellingPrice(e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Sale / Offer Price ({defaultCurrency.code} Optional)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        className="form-input"
                                        value={salePrice}
                                        onChange={(e) => setSalePrice(e.target.value)}
                                        placeholder="Optional discount price"
                                    />
                                </div>
                            </div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600 }}>
                                <input
                                    type="checkbox"
                                    checked={publishProduct}
                                    onChange={(e) => setPublishProduct(e.target.checked)}
                                />
                                <span>Publish immediately on public website storefront</span>
                            </label>
                            <div className="form-group">
                                <label className="form-label">Transfer Notes</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={transferNotes}
                                    onChange={(e) => setTransferNotes(e.target.value)}
                                    placeholder="Catalogue batch release note"
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    style={{ flex: 1 }}
                                    onClick={() => setPushProduct(null)}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submitting}>
                                    <ArrowRight size={15} /> Transfer &amp; Publish
                                </button>
                            </div>
                        </form>
                    </div>
                </>
            )}

            {/* Bulk Warehouse -> Catalogue Transfer Modal */}
            <BulkCatalogueTransferModal
                isOpen={showBulkModal}
                onClose={() => setShowBulkModal(false)}
                products={bulkSource}
            />
        </AdminLayout>
    );
}
