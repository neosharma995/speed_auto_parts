import React, { useState, useMemo } from 'react';
import { router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import BulkCatalogueTransferModal from '@/Components/Admin/BulkCatalogueTransferModal';
import { Boxes, Clock, DollarSign, CheckCircle2, X, ArrowRight, Save, Store, Package } from 'lucide-react';

export default function AdminWarehouseIndex({ pendingLots = [], products = [], recentTransfers = [], stats = {} }) {
    const { errors } = usePage().props;

    const [warehouseEdits, setWarehouseEdits] = useState(() => {
        const map = {};
        products.forEach(p => { map[p.id] = p.warehouse_stock; });
        return map;
    });

    const [catalogueEdits, setCatalogueEdits] = useState(() => {
        const map = {};
        products.forEach(p => { map[p.id] = p.stock_quantity; });
        return map;
    });

    // Reject single item or whole lot modal
    const [rejectTarget, setRejectTarget] = useState(null); // { type: 'item' | 'batch', id?, lot_number, label, qty }
    const [rejectReason, setRejectReason] = useState('');

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
        () => products.filter(p => Number(p.warehouse_stock) > 0),
        [products]
    );

    const groupedPendingLots = useMemo(() => {
        const groups = [];
        const map = {};
        pendingLots.forEach(lot => {
            if (!map[lot.lot_number]) {
                map[lot.lot_number] = {
                    lot_number: lot.lot_number,
                    supplier: lot.supplier,
                    notes: lot.notes,
                    created_at: lot.created_at,
                    items: [],
                    total_qty: 0,
                    total_value: 0,
                };
                groups.push(map[lot.lot_number]);
            }
            const g = map[lot.lot_number];
            g.items.push(lot);
            g.total_qty += Number(lot.quantity || 0);
            g.total_value += Number(lot.quantity || 0) * Number(lot.unit_price || 0);
        });
        return groups;
    }, [pendingLots]);

    const handleReceiveLot = (lot) => {
        router.post(`/admin/warehouse/lots/${lot.id}/receive`);
    };

    const handleReceiveLotBatch = (lotNumber) => {
        router.post(`/admin/warehouse/lot-number/${encodeURIComponent(lotNumber)}/receive`);
    };

    const handleRejectSubmit = (e) => {
        e.preventDefault();
        if (!rejectTarget) return;
        setSubmitting(true);
        const url = rejectTarget.type === 'batch'
            ? `/admin/warehouse/lot-number/${encodeURIComponent(rejectTarget.lot_number)}/reject`
            : `/admin/warehouse/lots/${rejectTarget.id}/reject`;

        router.post(url, {
            reason: rejectReason,
        }, {
            onSuccess: () => setRejectTarget(null),
            onFinish: () => setSubmitting(false),
        });
    };

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
        router.post(`/admin/catalogue/${pushProduct.id}/transfer`, {
            quantity: parseInt(transferQty) || 0,
            base_price: parseFloat(sellingPrice) || 0,
            sale_price: salePrice ? parseFloat(salePrice) : null,
            publish: publishProduct,
            notes: transferNotes,
        }, {
            onSuccess: () => setPushProduct(null),
            onFinish: () => setSubmitting(false),
        });
    };

    const directionLabel = (dir) => {
        if (dir === 'supplier_to_warehouse') return 'Supplier → Warehouse';
        if (dir === 'warehouse_to_catalogue') return 'Warehouse → Catalogue';
        return 'Catalogue → Warehouse';
    };

    const statusBadge = (status) => {
        if (status === 'received') return 'badge-success';
        if (status === 'rejected') return 'badge-danger';
        return 'badge-warning';
    };

    return (
        <AdminLayout title="Admin Warehouse">
            {errors && Object.keys(errors).length > 0 && (
                <div style={{ backgroundColor: '#FFF1F2', color: '#D93025', padding: '12px 16px', borderRadius: '4px', marginBottom: '16px', fontSize: '13px' }}>
                    {Object.values(errors).map((err, idx) => <div key={idx}>{err}</div>)}
                </div>
            )}

            {/* Stats */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-info">
                        <span>Pending Incoming Lots</span>
                        <strong>{groupedPendingLots.length} <small style={{ fontSize: '12px', color: '#64748B' }}>({pendingLots.length} lines)</small></strong>
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
                        <strong>₹{Number(stats.warehouse_value || 0).toLocaleString('en-IN')}</strong>
                    </div>
                    <div className="stat-icon stat-icon--primary">
                        <DollarSign size={24} />
                    </div>
                </div>
            </div>

            {/* Grouped Pending Supplier Lots */}
            <div className="admin-card">
                <div className="admin-card-header">
                    <h3>Incoming Supplier Lots Pending Receipt ({groupedPendingLots.length} lots)</h3>
                </div>
                <div className="admin-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {groupedPendingLots.length === 0 ? (
                        <p style={{ color: '#64748B', fontSize: '13px' }}>
                            No pending supplier lots waiting for warehouse check-in.
                        </p>
                    ) : (
                        groupedPendingLots.map(group => (
                            <div key={group.lot_number} style={{ border: '1px solid #FDBA74', borderRadius: '6px', overflow: 'hidden' }}>
                                <div style={{
                                    padding: '12px 16px',
                                    backgroundColor: '#FFF7ED',
                                    borderBottom: '1px solid #FED7AA',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    flexWrap: 'wrap',
                                    gap: '12px',
                                }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                            <code style={{ fontWeight: 800, fontSize: '14px' }}>{group.lot_number}</code>
                                            <span className="badge badge-warning">Pending Receipt</span>
                                            <span style={{ fontSize: '13px', fontWeight: 700 }}>
                                                {group.supplier?.company_name || group.supplier?.name || 'Supplier'}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>
                                            <Package size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} />
                                            <strong>{group.items.length}</strong> items • <strong>{group.total_qty}</strong> total units • Lot Value: <strong>₹{group.total_value.toLocaleString('en-IN')}</strong>
                                            {group.notes && <span style={{ marginLeft: '10px', color: '#64748B' }}>— {group.notes}</span>}
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            type="button"
                                            className="btn btn-primary btn-sm"
                                            onClick={() => handleReceiveLotBatch(group.lot_number)}
                                        >
                                            <CheckCircle2 size={14} /> Receive Entire Lot ({group.items.length})
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-outline btn-sm"
                                            style={{ color: '#D93025' }}
                                            onClick={() => {
                                                setRejectTarget({
                                                    type: 'batch',
                                                    lot_number: group.lot_number,
                                                    label: `${group.items.length} items in ${group.lot_number}`,
                                                    qty: group.total_qty,
                                                });
                                                setRejectReason('');
                                            }}
                                        >
                                            <X size={14} /> Reject Entire Lot
                                        </button>
                                    </div>
                                </div>

                                <table className="admin-table" style={{ marginBottom: 0 }}>
                                    <thead>
                                        <tr>
                                            <th>Product</th>
                                            <th>Qty</th>
                                            <th>Supplier Price</th>
                                            <th>Line Total</th>
                                            <th>Item Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {group.items.map(lot => (
                                            <tr key={lot.id}>
                                                <td>
                                                    <strong>{lot.product?.name}</strong>
                                                    <small style={{ display: 'block', color: '#64748B', fontFamily: 'monospace' }}>{lot.product?.sku}</small>
                                                </td>
                                                <td><span className="badge badge-warning">{lot.quantity} units</span></td>
                                                <td>₹{Number(lot.unit_price || 0).toLocaleString('en-IN')}</td>
                                                <td><strong>₹{(lot.quantity * Number(lot.unit_price || 0)).toLocaleString('en-IN')}</strong></td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '6px' }}>
                                                        <button type="button" className="btn btn-outline btn-sm" onClick={() => handleReceiveLot(lot)}>
                                                            <CheckCircle2 size={13} /> Receive
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="btn btn-outline btn-sm"
                                                            style={{ color: '#D93025' }}
                                                            onClick={() => {
                                                                setRejectTarget({
                                                                    type: 'item',
                                                                    id: lot.id,
                                                                    lot_number: lot.lot_number,
                                                                    label: lot.product?.name || 'item',
                                                                    qty: lot.quantity,
                                                                });
                                                                setRejectReason('');
                                                            }}
                                                        >
                                                            <X size={13} /> Reject
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Warehouse Stock Pipeline */}
            <div className="admin-card">
                <div className="admin-card-header">
                    <h3>Warehouse Inventory & Stock Management</h3>
                    <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        disabled={warehouseAvailableProducts.length === 0}
                        onClick={() => setShowBulkModal(true)}
                    >
                        <Store size={15} /> Bulk Transfer to Catalogue
                    </button>
                </div>
                <div className="admin-card-body" style={{ padding: 0 }}>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Supplier</th>
                                <th>Supplier Price</th>
                                <th>Website Price</th>
                                <th>Stock Breakdown (Sup / Whs / Cat)</th>
                                <th>Quick Inventory Adjust (Whs / Cat)</th>
                                <th>Transfer</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(p => (
                                <tr key={p.id}>
                                    <td>
                                        <strong>{p.name}</strong>
                                        <div style={{ fontSize: '11px', color: '#64748B', fontFamily: 'monospace' }}>
                                            {p.sku} | {p.part_number}
                                        </div>
                                    </td>
                                    <td>{p.supplier?.company_name || p.supplier?.name || 'Direct / In-House'}</td>
                                    <td>₹{Number(p.supplier_price || p.cost_price || 0).toLocaleString('en-IN')}</td>
                                    <td>
                                        <strong>₹{Number(p.base_price).toLocaleString('en-IN')}</strong>
                                        <small style={{ display: 'block', color: p.status === 'published' ? '#168A35' : '#64748B', textTransform: 'capitalize' }}>
                                            {p.status}
                                        </small>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                            <span className="badge badge-neutral">Sup: {p.supplier_stock}</span>
                                            <span className={`badge ${p.warehouse_stock > 0 ? 'badge-warning' : 'badge-neutral'}`}>Whs: {p.warehouse_stock}</span>
                                            <span className={`badge ${p.stock_quantity <= 5 ? 'badge-danger' : (p.stock_quantity <= 15 ? 'badge-warning' : 'badge-success')}`}>
                                                Cat: {p.stock_quantity} ({p.stock_status})
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                            <input
                                                type="number"
                                                min="0"
                                                title="Warehouse Stock"
                                                placeholder="Whs"
                                                className="form-input"
                                                style={{ width: '68px', padding: '5px 8px' }}
                                                value={warehouseEdits[p.id] ?? p.warehouse_stock}
                                                onChange={e => setWarehouseEdits({ ...warehouseEdits, [p.id]: parseInt(e.target.value) || 0 })}
                                            />
                                            <input
                                                type="number"
                                                min="0"
                                                title="Catalogue Stock"
                                                placeholder="Cat"
                                                className="form-input"
                                                style={{ width: '68px', padding: '5px 8px' }}
                                                value={catalogueEdits[p.id] ?? p.stock_quantity}
                                                onChange={e => setCatalogueEdits({ ...catalogueEdits, [p.id]: parseInt(e.target.value) || 0 })}
                                            />
                                            <button type="button" className="btn btn-outline btn-sm" onClick={() => handleAdjustWarehouse(p.id)} title="Save Warehouse & Catalogue Stock">
                                                <Save size={13} /> Update
                                            </button>
                                        </div>
                                    </td>
                                    <td>
                                        <button
                                            type="button"
                                            className="btn btn-primary btn-sm"
                                            disabled={p.warehouse_stock <= 0}
                                            onClick={() => openPushModal(p)}
                                        >
                                            <Store size={14} /> Push to Catalogue
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Recent Transfers History */}
            <div className="admin-card">
                <div className="admin-card-header">
                    <h3>Recent Stock Transfers Log ({recentTransfers.length})</h3>
                </div>
                <div className="admin-card-body" style={{ padding: 0 }}>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Lot #</th>
                                <th>Direction</th>
                                <th>Product</th>
                                <th>Qty</th>
                                <th>Unit Price</th>
                                <th>Status</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentTransfers.length === 0 ? (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: '#64748B' }}>No transfer history yet.</td>
                                </tr>
                            ) : (
                                recentTransfers.map(t => (
                                    <tr key={t.id}>
                                        <td><code>{t.lot_number}</code></td>
                                        <td><span className="badge badge-neutral">{directionLabel(t.direction)}</span></td>
                                        <td><strong>{t.product?.name}</strong></td>
                                        <td>{t.quantity} units</td>
                                        <td>₹{Number(t.unit_price || 0).toLocaleString('en-IN')}</td>
                                        <td><span className={`badge ${statusBadge(t.status)}`} style={{ textTransform: 'capitalize' }}>{t.status}</span></td>
                                        <td>{new Date(t.created_at).toLocaleDateString()}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Reject Lot / Item Modal */}
            {rejectTarget && (
                <>
                    <div className="header-backdrop" onClick={() => setRejectTarget(null)} />
                    <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: '#FFF', borderRadius: '8px', padding: '28px', width: '90%', maxWidth: '440px', zIndex: 2200, boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
                        <h3 style={{ fontSize: '17px', fontWeight: 800, marginBottom: '8px' }}>Reject {rejectTarget.lot_number}</h3>
                        <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '16px' }}>
                            Rejecting returns <strong>{rejectTarget.qty} units</strong> ({rejectTarget.label}) back to the supplier's available stock.
                        </p>
                        <form onSubmit={handleRejectSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div className="form-group">
                                <label className="form-label">Rejection Reason (Optional)</label>
                                <textarea className="form-textarea" value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Damaged packaging, wrong specification, etc." style={{ minHeight: '70px' }} />
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setRejectTarget(null)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1, backgroundColor: '#D93025' }} disabled={submitting}>Confirm Reject</button>
                            </div>
                        </form>
                    </div>
                </>
            )}

            {/* Single Push to Catalogue Modal */}
            {pushProduct && (
                <>
                    <div className="header-backdrop" onClick={() => setPushProduct(null)} />
                    <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: '#FFF', borderRadius: '8px', padding: '28px', width: '90%', maxWidth: '480px', zIndex: 2200, boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '6px' }}>Push Stock to Website Catalogue</h3>
                        <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '16px' }}>
                            <strong>{pushProduct.name}</strong> — Warehouse Stock: <strong>{pushProduct.warehouse_stock} units</strong> | Supplier Cost: <strong>₹{Number(pushProduct.supplier_price || pushProduct.cost_price || 0).toLocaleString('en-IN')}</strong>
                        </p>
                        <form onSubmit={handlePushSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div className="form-group">
                                <label className="form-label">Quantity to Transfer (Max {pushProduct.warehouse_stock}) <span className="required">*</span></label>
                                <input type="number" min="1" max={pushProduct.warehouse_stock} className="form-input" required value={transferQty} onChange={e => setTransferQty(e.target.value)} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div className="form-group">
                                    <label className="form-label">New Selling Price (₹ MRP) <span className="required">*</span></label>
                                    <input type="number" step="0.01" min="1" className="form-input" required value={sellingPrice} onChange={e => setSellingPrice(e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Sale / Offer Price (₹ Optional)</label>
                                    <input type="number" step="0.01" min="0" className="form-input" value={salePrice} onChange={e => setSalePrice(e.target.value)} placeholder="Optional discount price" />
                                </div>
                            </div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600 }}>
                                <input type="checkbox" checked={publishProduct} onChange={e => setPublishProduct(e.target.checked)} />
                                <span>Publish immediately on public website storefront</span>
                            </label>
                            <div className="form-group">
                                <label className="form-label">Transfer Notes</label>
                                <input type="text" className="form-input" value={transferNotes} onChange={e => setTransferNotes(e.target.value)} placeholder="Catalogue batch release note" />
                            </div>
                            <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
                                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setPushProduct(null)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submitting}>
                                    <ArrowRight size={15} /> Transfer & Publish
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
                products={products}
            />
        </AdminLayout>
    );
}
