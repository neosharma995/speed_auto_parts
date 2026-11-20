import React, { useState, useMemo } from 'react';
import { router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import BulkCatalogueTransferModal from '@/Components/Admin/BulkCatalogueTransferModal';
import { Store, Boxes, CheckCircle2, Search, ArrowRight, RotateCcw, Edit, DollarSign, X } from 'lucide-react';

export default function AdminCatalogueIndex({ products = [], recentTransfers = [], filters = {}, stats = {} }) {
    const safeFilters = filters && !Array.isArray(filters) ? filters : {};
    const { errors } = usePage().props;

    const [search, setSearch] = useState(safeFilters.search || '');
    const activeFilter = safeFilters.filter || 'all';

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
        () => products.filter(p => Number(p.warehouse_stock) > 0),
        [products]
    );

    const applyFilter = (nextFilter, nextSearch = search) => {
        const query = {};
        if (nextFilter && nextFilter !== 'all') query.filter = nextFilter;
        if (nextSearch) query.search = nextSearch;
        router.get('/admin/catalogue', query, { preserveState: true });
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
        router.post(`/admin/catalogue/${transferProduct.id}/transfer`, {
            quantity: parseInt(quantity) || 0,
            base_price: parseFloat(basePrice) || 0,
            sale_price: salePrice ? parseFloat(salePrice) : null,
            publish,
            notes,
        }, {
            onSuccess: () => setTransferProduct(null),
            onFinish: () => setSubmitting(false),
        });
    };

    const handlePriceSubmit = (e) => {
        e.preventDefault();
        if (!priceProduct) return;
        setSubmitting(true);
        router.post(`/admin/catalogue/${priceProduct.id}/price`, {
            base_price: parseFloat(editBasePrice) || 0,
            sale_price: editSalePrice ? parseFloat(editSalePrice) : null,
        }, {
            onSuccess: () => setPriceProduct(null),
            onFinish: () => setSubmitting(false),
        });
    };

    const handleReturnSubmit = (e) => {
        e.preventDefault();
        if (!returnProduct) return;
        setSubmitting(true);
        router.post(`/admin/catalogue/${returnProduct.id}/return`, {
            quantity: parseInt(returnQty) || 0,
            notes: returnNotes,
        }, {
            onSuccess: () => setReturnProduct(null),
            onFinish: () => setSubmitting(false),
        });
    };

    const effectiveSellingPrice = Number(salePrice) > 0 && Number(salePrice) < Number(basePrice)
        ? Number(salePrice)
        : Number(basePrice || 0);
    const modalSupplierCost = transferProduct ? Number(transferProduct.supplier_price || transferProduct.cost_price || 0) : 0;
    const modalMargin = effectiveSellingPrice - modalSupplierCost;

    return (
        <AdminLayout title="Website Catalogue & Pricing">
            {errors && Object.keys(errors).length > 0 && (
                <div style={{ backgroundColor: '#FFF1F2', color: '#D93025', padding: '12px 16px', borderRadius: '4px', marginBottom: '16px', fontSize: '13px' }}>
                    {Object.values(errors).map((err, idx) => <div key={idx}>{err}</div>)}
                </div>
            )}

            {/* Stats */}
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
                        <strong>{stats.ready_in_warehouse_count || 0} <small style={{ fontSize: '12px', color: '#64748B' }}>products</small></strong>
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

            <div className="admin-card">
                <div className="admin-card-header" style={{ flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                        {[
                            { key: 'all', label: 'All Products' },
                            { key: 'warehouse', label: 'Has Warehouse Stock' },
                            { key: 'published', label: 'Live on Website' },
                            { key: 'draft', label: 'Draft / Hidden' },
                        ].map(tab => (
                            <button
                                key={tab.key}
                                type="button"
                                className={`btn btn-sm ${activeFilter === tab.key ? 'btn-primary' : 'btn-outline'}`}
                                onClick={() => applyFilter(tab.key)}
                            >
                                {tab.label}
                            </button>
                        ))}
                        <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            disabled={warehouseAvailableProducts.length === 0}
                            onClick={() => setShowBulkModal(true)}
                        >
                            <ArrowRight size={14} /> Bulk Transfer from Warehouse
                        </button>
                    </div>

                    <form onSubmit={e => { e.preventDefault(); applyFilter(activeFilter, search); }} style={{ display: 'flex', gap: '8px' }}>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Search SKU, part #, or name..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{ width: '240px' }}
                        />
                        <button type="submit" className="btn btn-dark btn-sm">
                            <Search size={14} /> Search
                        </button>
                    </form>
                </div>

                <div className="admin-card-body" style={{ padding: 0 }}>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Supplier</th>
                                <th>Warehouse Stock</th>
                                <th>Catalogue Stock</th>
                                <th>Supplier Cost</th>
                                <th>Website Selling Price</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.length === 0 ? (
                                <tr>
                                    <td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: '#64748B' }}>
                                        No products found for the selected filter.
                                    </td>
                                </tr>
                            ) : (
                                products.map(p => {
                                    const cost = Number(p.supplier_price || p.cost_price || 0);
                                    const sell = Number(p.effective_price || p.base_price || 0);
                                    const margin = sell - cost;
                                    return (
                                        <tr key={p.id}>
                                            <td>
                                                <strong>{p.name}</strong>
                                                <div style={{ fontSize: '11px', color: '#64748B', fontFamily: 'monospace' }}>
                                                    {p.sku} | {p.part_number}
                                                </div>
                                            </td>
                                            <td>{p.supplier?.company_name || p.supplier?.name || 'In-House'}</td>
                                            <td>
                                                <span className={`badge ${p.warehouse_stock > 0 ? 'badge-warning' : 'badge-neutral'}`}>
                                                    {p.warehouse_stock} units
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge ${p.stock_quantity > 0 ? 'badge-success' : 'badge-danger'}`}>
                                                    {p.stock_quantity} units
                                                </span>
                                            </td>
                                            <td>₹{cost.toLocaleString('en-IN')}</td>
                                            <td>
                                                <strong>₹{Number(p.base_price).toLocaleString('en-IN')}</strong>
                                                {p.sale_price && Number(p.sale_price) > 0 && (
                                                    <small style={{ display: 'block', color: '#168A35', fontWeight: 700 }}>
                                                        Sale: ₹{Number(p.sale_price).toLocaleString('en-IN')}
                                                    </small>
                                                )}
                                                {cost > 0 && (
                                                    <small style={{ display: 'block', color: margin >= 0 ? '#059669' : '#D93025', fontSize: '11px' }}>
                                                        Margin: {margin >= 0 ? '+' : ''}₹{margin.toLocaleString('en-IN')}
                                                    </small>
                                                )}
                                            </td>
                                            <td>
                                                <button
                                                    type="button"
                                                    onClick={() => router.post(`/admin/catalogue/${p.id}/toggle-status`)}
                                                    className={`badge ${p.status === 'published' ? 'badge-success' : 'badge-neutral'}`}
                                                    style={{ textTransform: 'capitalize', cursor: 'pointer', border: 'none' }}
                                                    title="Click to toggle Published / Draft"
                                                >
                                                    {p.status}
                                                </button>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                    <button
                                                        type="button"
                                                        className="btn btn-primary btn-sm"
                                                        disabled={p.warehouse_stock <= 0}
                                                        onClick={() => openTransferModal(p)}
                                                        title="Transfer from Warehouse & Set Selling Price"
                                                    >
                                                        <ArrowRight size={14} /> Transfer & Price
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
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Recent Catalogue Transfers */}
            <div className="admin-card">
                <div className="admin-card-header">
                    <h3>Recent Warehouse ↔ Catalogue Transfers ({recentTransfers.length})</h3>
                </div>
                <div className="admin-card-body" style={{ padding: 0 }}>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Ref #</th>
                                <th>Direction</th>
                                <th>Product</th>
                                <th>Qty</th>
                                <th>Selling Price</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentTransfers.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: '#64748B' }}>No catalogue transfers recorded yet.</td>
                                </tr>
                            ) : (
                                recentTransfers.map(t => (
                                    <tr key={t.id}>
                                        <td><code>{t.lot_number}</code></td>
                                        <td>
                                            <span className={`badge ${t.direction === 'warehouse_to_catalogue' ? 'badge-success' : 'badge-warning'}`}>
                                                {t.direction === 'warehouse_to_catalogue' ? 'Warehouse → Catalogue' : 'Catalogue → Warehouse'}
                                            </span>
                                        </td>
                                        <td><strong>{t.product?.name}</strong></td>
                                        <td>{t.quantity} units</td>
                                        <td>₹{Number(t.unit_price || 0).toLocaleString('en-IN')}</td>
                                        <td>{new Date(t.created_at).toLocaleDateString()}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

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
                    <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: '#FFF', borderRadius: '8px', padding: '28px', width: '90%', maxWidth: '500px', zIndex: 2200, boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '6px' }}>Transfer from Warehouse to Website Catalogue</h3>
                        <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '16px' }}>
                            <strong>{transferProduct.name}</strong> — Warehouse: <strong>{transferProduct.warehouse_stock} units</strong> | Supplier Cost: <strong>₹{modalSupplierCost.toLocaleString('en-IN')}</strong>
                        </p>
                        <form onSubmit={handleTransferSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div className="form-group">
                                <label className="form-label">Quantity to Move to Website Catalogue (Max {transferProduct.warehouse_stock})</label>
                                <input type="number" min="1" max={transferProduct.warehouse_stock} className="form-input" required value={quantity} onChange={e => setQuantity(e.target.value)} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div className="form-group">
                                    <label className="form-label">Website Selling Price (₹) <span className="required">*</span></label>
                                    <input type="number" step="0.01" min="1" className="form-input" required value={basePrice} onChange={e => setBasePrice(e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Promotional Sale Price (₹ Optional)</label>
                                    <input type="number" step="0.01" min="0" className="form-input" value={salePrice} onChange={e => setSalePrice(e.target.value)} />
                                </div>
                            </div>
                            <div style={{ padding: '10px 12px', backgroundColor: '#F8FAFC', borderRadius: '4px', fontSize: '13px', display: 'flex', justifyContent: 'space-between' }}>
                                <span>Estimated Unit Margin:</span>
                                <strong style={{ color: modalMargin >= 0 ? '#168A35' : '#D93025' }}>
                                    {modalMargin >= 0 ? '+' : ''}₹{modalMargin.toLocaleString('en-IN')} per unit
                                </strong>
                            </div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600 }}>
                                <input type="checkbox" checked={publish} onChange={e => setPublish(e.target.checked)} />
                                <span>Publish product on public website</span>
                            </label>
                            <div className="form-group">
                                <label className="form-label">Transfer Notes</label>
                                <input type="text" className="form-input" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Storefront restock batch" />
                            </div>
                            <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
                                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setTransferProduct(null)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submitting}>
                                    <ArrowRight size={15} /> Transfer & Set Price
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
                    <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: '#FFF', borderRadius: '8px', padding: '28px', width: '90%', maxWidth: '420px', zIndex: 2200, boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
                        <h3 style={{ fontSize: '17px', fontWeight: 800, marginBottom: '12px' }}>Update Selling Price: {priceProduct.name}</h3>
                        <form onSubmit={handlePriceSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div className="form-group">
                                <label className="form-label">Selling Price (₹) <span className="required">*</span></label>
                                <input type="number" step="0.01" min="1" className="form-input" required value={editBasePrice} onChange={e => setEditBasePrice(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Sale Price (₹ Optional)</label>
                                <input type="number" step="0.01" min="0" className="form-input" value={editSalePrice} onChange={e => setEditSalePrice(e.target.value)} />
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setPriceProduct(null)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submitting}>Save Price</button>
                            </div>
                        </form>
                    </div>
                </>
            )}

            {/* Return Catalogue -> Warehouse Modal */}
            {returnProduct && (
                <>
                    <div className="header-backdrop" onClick={() => setReturnProduct(null)} />
                    <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: '#FFF', borderRadius: '8px', padding: '28px', width: '90%', maxWidth: '420px', zIndex: 2200, boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
                        <h3 style={{ fontSize: '17px', fontWeight: 800, marginBottom: '8px' }}>Return Stock to Warehouse</h3>
                        <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '14px' }}>
                            <strong>{returnProduct.name}</strong> — Live Catalogue Stock: <strong>{returnProduct.stock_quantity} units</strong>
                        </p>
                        <form onSubmit={handleReturnSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div className="form-group">
                                <label className="form-label">Quantity to Return (Max {returnProduct.stock_quantity})</label>
                                <input type="number" min="1" max={returnProduct.stock_quantity} className="form-input" required value={returnQty} onChange={e => setReturnQty(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Notes</label>
                                <input type="text" className="form-input" value={returnNotes} onChange={e => setReturnNotes(e.target.value)} placeholder="Return to warehouse storage" />
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setReturnProduct(null)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submitting}>Return Stock</button>
                            </div>
                        </form>
                    </div>
                </>
            )}
        </AdminLayout>
    );
}
