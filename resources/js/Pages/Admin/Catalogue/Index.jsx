import React, { useState, useMemo } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import AdminDataTable from '@/Components/Admin/AdminDataTable';
import BulkCatalogueTransferModal from '@/Components/Admin/BulkCatalogueTransferModal';
import {
    Store,
    Boxes,
    CheckCircle2,
    ArrowRight,
    RotateCcw,
    Edit,
    DollarSign,
    BarChart3,
    ChevronDown,
    ChevronUp,
    History,
} from 'lucide-react';

export default function AdminCatalogueIndex({ products = [], transfersCount = 0, filters = {}, stats = {} }) {
    const safeFilters = filters && !Array.isArray(filters) ? filters : {};
    const { errors } = usePage().props;

    const [showStats, setShowStats] = useState(false);
    const [search, setSearch] = useState(safeFilters.search || '');
    const [activeFilter, setActiveFilter] = useState(safeFilters.filter || 'all');

    // Single Transfer Warehouse -> Catalogue modal
    const [transferProduct, setTransferProduct] = useState(null);
    const [quantity, setQuantity] = useState('1');
    const [basePrice, setBasePrice] = useState('');
    const [salePrice, setSalePrice] = useState('');
    const [publish, setPublish] = useState(true);
    const [notes, setNotes] = useState('');

    // Bulk Transfer Warehouse -> Catalogue modal
    const [showBulkModal, setShowBulkModal] = useState(false);

    // Edit Price modal
    const [priceProduct, setPriceProduct] = useState(null);
    const [editBasePrice, setEditBasePrice] = useState('');
    const [editSalePrice, setEditSalePrice] = useState('');

    // Return Catalogue -> Warehouse modal
    const [returnProduct, setReturnProduct] = useState(null);
    const [returnQty, setReturnQty] = useState('1');
    const [returnNotes, setReturnNotes] = useState('');

    const [submitting, setSubmitting] = useState(false);

    const warehouseAvailableProducts = useMemo(
        () => products.filter((p) => Number(p.warehouse_stock) > 0),
        [products]
    );

    const applyFilter = (nextFilter = activeFilter, nextSearch = search) => {
        const query = {};
        if (nextFilter && nextFilter !== 'all') query.filter = nextFilter;
        if (nextSearch && nextSearch.trim()) query.search = nextSearch.trim();
        router.get('/admin/catalogue', query, { preserveState: true });
    };

    const handleFilterChange = (val) => {
        const next = val || 'all';
        setActiveFilter(next);
        applyFilter(next, search);
    };

    const openTransferModal = (p) => {
        setTransferProduct(p);
        setQuantity(String(Math.min(10, p.warehouse_stock || 1)));
        const cost = Number(p.supplier_price || p.cost_price || 0);
        const curBase = Number(p.base_price || 0);
        setBasePrice(String(curBase > cost ? curBase : Math.round(cost * 1.35) || 1000));
        setSalePrice(p.sale_price ? String(p.sale_price) : '');
        setPublish(true);
        setNotes('');
    };

    const handleTransferSubmit = (e) => {
        e.preventDefault();
        if (!transferProduct) return;
        setSubmitting(true);
        router.post(
            `/admin/catalogue/${transferProduct.id}/transfer`,
            {
                quantity: parseInt(quantity, 10) || 0,
                base_price: parseFloat(basePrice) || 0,
                sale_price: salePrice ? parseFloat(salePrice) : null,
                publish,
                notes,
            },
            {
                onSuccess: () => setTransferProduct(null),
                onFinish: () => setSubmitting(false),
            }
        );
    };

    const handlePriceSubmit = (e) => {
        e.preventDefault();
        if (!priceProduct) return;
        setSubmitting(true);
        router.post(
            `/admin/catalogue/${priceProduct.id}/price`,
            {
                base_price: parseFloat(editBasePrice) || 0,
                sale_price: editSalePrice ? parseFloat(editSalePrice) : null,
            },
            {
                onSuccess: () => setPriceProduct(null),
                onFinish: () => setSubmitting(false),
            }
        );
    };

    const handleReturnSubmit = (e) => {
        e.preventDefault();
        if (!returnProduct) return;
        setSubmitting(true);
        router.post(
            `/admin/catalogue/${returnProduct.id}/return`,
            {
                quantity: parseInt(returnQty, 10) || 0,
                notes: returnNotes,
            },
            {
                onSuccess: () => setReturnProduct(null),
                onFinish: () => setSubmitting(false),
            }
        );
    };

    const effectiveSellingPrice =
        Number(salePrice) > 0 && Number(salePrice) < Number(basePrice)
            ? Number(salePrice)
            : Number(basePrice || 0);
    const modalSupplierCost = transferProduct
        ? Number(transferProduct.supplier_price || transferProduct.cost_price || 0)
        : 0;
    const modalMargin = effectiveSellingPrice - modalSupplierCost;

    const columns = [
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
            render: (p) => p.supplier?.company_name || p.supplier?.name || 'In-House',
        },
        {
            key: 'warehouse_stock',
            label: 'Warehouse Stock',
            render: (p) => (
                <span className={`badge ${p.warehouse_stock > 0 ? 'badge-warning' : 'badge-neutral'}`}>
                    {p.warehouse_stock} units
                </span>
            ),
        },
        {
            key: 'catalogue_stock',
            label: 'Catalogue Stock',
            render: (p) => (
                <span className={`badge ${p.stock_quantity > 0 ? 'badge-success' : 'badge-danger'}`}>
                    {p.stock_quantity} units
                </span>
            ),
        },
        {
            key: 'supplier_cost',
            label: 'Supplier Cost',
            render: (p) => {
                const cost = Number(p.supplier_price || p.cost_price || 0);
                return `₹${cost.toLocaleString('en-IN')}`;
            },
        },
        {
            key: 'selling_price',
            label: 'Website Selling Price',
            render: (p) => {
                const cost = Number(p.supplier_price || p.cost_price || 0);
                const sell = Number(p.effective_price || p.base_price || 0);
                const margin = sell - cost;
                return (
                    <>
                        <strong>₹{Number(p.base_price).toLocaleString('en-IN')}</strong>
                        {p.sale_price && Number(p.sale_price) > 0 && (
                            <small style={{ display: 'block', color: '#168A35', fontWeight: 700 }}>
                                Sale: ₹{Number(p.sale_price).toLocaleString('en-IN')}
                            </small>
                        )}
                        {cost > 0 && (
                            <small
                                style={{
                                    display: 'block',
                                    color: margin >= 0 ? '#059669' : '#D93025',
                                    fontSize: '11px',
                                }}
                            >
                                Margin: {margin >= 0 ? '+' : ''}₹{margin.toLocaleString('en-IN')}
                            </small>
                        )}
                    </>
                );
            },
        },
        {
            key: 'status',
            label: 'Status',
            render: (p) => (
                <button
                    type="button"
                    onClick={() => router.post(`/admin/catalogue/${p.id}/toggle-status`)}
                    className={`badge ${p.status === 'published' ? 'badge-success' : 'badge-neutral'}`}
                    style={{ textTransform: 'capitalize', cursor: 'pointer', border: 'none' }}
                    title="Click to toggle Published / Draft"
                >
                    {p.status}
                </button>
            ),
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (p) => (
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        disabled={p.warehouse_stock <= 0}
                        onClick={() => openTransferModal(p)}
                        title="Transfer from Warehouse & Set Selling Price"
                    >
                        <ArrowRight size={14} /> Transfer &amp; Price
                    </button>
                    <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => {
                            setPriceProduct(p);
                            setEditBasePrice(String(p.base_price));
                            setEditSalePrice(p.sale_price ? String(p.sale_price) : '');
                        }}
                        title="Edit Website Selling Price"
                    >
                        <Edit size={14} />
                    </button>
                    {p.stock_quantity > 0 && (
                        <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            onClick={() => {
                                setReturnProduct(p);
                                setReturnQty(String(Math.min(5, p.stock_quantity)));
                                setReturnNotes('');
                            }}
                            title="Return Stock to Warehouse"
                        >
                            <RotateCcw size={14} />
                        </button>
                    )}
                </div>
            ),
        },
    ];

    return (
        <AdminLayout title="Website Catalogue & Pricing">
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

            {/* Summary & Logs Toolbar */}
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

                <Link href="/admin/catalogue/logs" className="btn btn-outline btn-sm">
                    <History size={15} />
                    <span>Transfer Logs ({transfersCount})</span>
                </Link>
            </div>

            {/* Expandable Stats */}
            {showStats && (
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-info">
                            <span>Live Website Products</span>
                            <strong>{stats.published_count || 0}</strong>
                        </div>
                        <div className="stat-icon stat-icon--success">
                            <Store size={24} />
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-info">
                            <span>Ready in Warehouse</span>
                            <strong>
                                {stats.ready_in_warehouse_count || 0}{' '}
                                <small style={{ fontSize: '12px', color: '#64748B' }}>products</small>
                            </strong>
                        </div>
                        <div className="stat-icon stat-icon--warning">
                            <Boxes size={24} />
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-info">
                            <span>Catalogue Sellable Units</span>
                            <strong>{stats.catalogue_units || 0}</strong>
                        </div>
                        <div className="stat-icon stat-icon--primary">
                            <CheckCircle2 size={24} />
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-info">
                            <span>Warehouse Reserve Units</span>
                            <strong>{stats.warehouse_units || 0}</strong>
                        </div>
                        <div className="stat-icon stat-icon--primary">
                            <DollarSign size={24} />
                        </div>
                    </div>
                </div>
            )}

            <AdminDataTable
                title="Website Catalogue"
                count={products.length}
                search={{
                    value: search,
                    onChange: setSearch,
                    placeholder: 'Search SKU, part #, or name...',
                }}
                filters={[
                    {
                        key: 'filter',
                        value: activeFilter,
                        onChange: handleFilterChange,
                        options: [
                            { value: 'all', label: 'All Products' },
                            { value: 'warehouse', label: 'Has Warehouse Stock' },
                            { value: 'published', label: 'Live on Website' },
                            { value: 'draft', label: 'Draft / Hidden' },
                        ],
                    },
                ]}
                onSearch={() => applyFilter(activeFilter, search)}
                actions={
                    <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        disabled={warehouseAvailableProducts.length === 0}
                        onClick={() => setShowBulkModal(true)}
                    >
                        <ArrowRight size={14} /> Bulk Transfer from Warehouse
                    </button>
                }
                columns={columns}
                rows={products}
                emptyMessage="No products found for the selected filter."
            />

            {/* Bulk Warehouse -> Catalogue Transfer Modal */}
            <BulkCatalogueTransferModal
                isOpen={showBulkModal}
                onClose={() => setShowBulkModal(false)}
                products={products}
            />

            {/* Single Transfer Warehouse -> Catalogue Modal */}
            {transferProduct && (
                <>
                    <div className="header-backdrop" onClick={() => setTransferProduct(null)} />
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
                            maxWidth: '500px',
                            zIndex: 2200,
                            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                        }}
                    >
                        <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '6px' }}>
                            Transfer from Warehouse to Website Catalogue
                        </h3>
                        <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '16px' }}>
                            <strong>{transferProduct.name}</strong> — Warehouse:{' '}
                            <strong>{transferProduct.warehouse_stock} units</strong> | Supplier Cost:{' '}
                            <strong>₹{modalSupplierCost.toLocaleString('en-IN')}</strong>
                        </p>
                        <form onSubmit={handleTransferSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div className="form-group">
                                <label className="form-label">
                                    Quantity to Move to Website Catalogue (Max {transferProduct.warehouse_stock})
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max={transferProduct.warehouse_stock}
                                    className="form-input"
                                    required
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div className="form-group">
                                    <label className="form-label">
                                        Website Selling Price (₹) <span className="required">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="1"
                                        className="form-input"
                                        required
                                        value={basePrice}
                                        onChange={(e) => setBasePrice(e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Promotional Sale Price (₹ Optional)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        className="form-input"
                                        value={salePrice}
                                        onChange={(e) => setSalePrice(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div
                                style={{
                                    padding: '10px 12px',
                                    backgroundColor: '#F8FAFC',
                                    borderRadius: '4px',
                                    fontSize: '13px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                }}
                            >
                                <span>Estimated Unit Margin:</span>
                                <strong style={{ color: modalMargin >= 0 ? '#168A35' : '#D93025' }}>
                                    {modalMargin >= 0 ? '+' : ''}₹{modalMargin.toLocaleString('en-IN')} per unit
                                </strong>
                            </div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600 }}>
                                <input type="checkbox" checked={publish} onChange={(e) => setPublish(e.target.checked)} />
                                <span>Publish product on public website</span>
                            </label>
                            <div className="form-group">
                                <label className="form-label">Transfer Notes</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Storefront restock batch"
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    style={{ flex: 1 }}
                                    onClick={() => setTransferProduct(null)}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submitting}>
                                    <ArrowRight size={15} /> Transfer &amp; Set Price
                                </button>
                            </div>
                        </form>
                    </div>
                </>
            )}

            {/* Edit Price Modal */}
            {priceProduct && (
                <>
                    <div className="header-backdrop" onClick={() => setPriceProduct(null)} />
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
                            maxWidth: '420px',
                            zIndex: 2200,
                            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                        }}
                    >
                        <h3 style={{ fontSize: '17px', fontWeight: 800, marginBottom: '12px' }}>
                            Update Selling Price: {priceProduct.name}
                        </h3>
                        <form onSubmit={handlePriceSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div className="form-group">
                                <label className="form-label">
                                    Selling Price (₹) <span className="required">*</span>
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="1"
                                    className="form-input"
                                    required
                                    value={editBasePrice}
                                    onChange={(e) => setEditBasePrice(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Sale Price (₹ Optional)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    className="form-input"
                                    value={editSalePrice}
                                    onChange={(e) => setEditSalePrice(e.target.value)}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    style={{ flex: 1 }}
                                    onClick={() => setPriceProduct(null)}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submitting}>
                                    Save Price
                                </button>
                            </div>
                        </form>
                    </div>
                </>
            )}

            {/* Return Catalogue -> Warehouse Modal */}
            {returnProduct && (
                <>
                    <div className="header-backdrop" onClick={() => setReturnProduct(null)} />
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
                            maxWidth: '420px',
                            zIndex: 2200,
                            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                        }}
                    >
                        <h3 style={{ fontSize: '17px', fontWeight: 800, marginBottom: '8px' }}>Return Stock to Warehouse</h3>
                        <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '14px' }}>
                            <strong>{returnProduct.name}</strong> — Live Catalogue Stock:{' '}
                            <strong>{returnProduct.stock_quantity} units</strong>
                        </p>
                        <form onSubmit={handleReturnSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div className="form-group">
                                <label className="form-label">
                                    Quantity to Return (Max {returnProduct.stock_quantity})
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max={returnProduct.stock_quantity}
                                    className="form-input"
                                    required
                                    value={returnQty}
                                    onChange={(e) => setReturnQty(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Notes</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={returnNotes}
                                    onChange={(e) => setReturnNotes(e.target.value)}
                                    placeholder="Return to warehouse storage"
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    style={{ flex: 1 }}
                                    onClick={() => setReturnProduct(null)}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submitting}>
                                    Return Stock
                                </button>
                            </div>
                        </form>
                    </div>
                </>
            )}
        </AdminLayout>
    );
}
