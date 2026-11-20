import React, { useState, useMemo } from 'react';
import { router, usePage } from '@inertiajs/react';
import SupplierLayout from '@/Layouts/SupplierLayout';
import SearchableMultiSelect from '@/Components/SearchableMultiSelect';
import { Truck, Plus, Package, Trash2, X } from 'lucide-react';

const statusBadge = (status) => {
    if (status === 'received' || status === 'partially_received') return 'badge-success';
    if (status === 'rejected') return 'badge-danger';
    if (status === 'pending') return 'badge-warning';
    return 'badge-neutral';
};

export default function SupplierLotsIndex({ products = [], lots = [] }) {
    const { flash, errors } = usePage().props;

    const availableProducts = useMemo(
        () => products.filter((p) => Number(p.supplier_stock) > 0),
        [products]
    );

    const totalAvailableUnits = useMemo(
        () => availableProducts.reduce((sum, p) => sum + Number(p.supplier_stock || 0), 0),
        [availableProducts]
    );

    const productMap = useMemo(() => {
        const map = new Map();
        availableProducts.forEach((p) => map.set(String(p.id), p));
        return map;
    }, [availableProducts]);

    // Popup Modal State
    const [showLotModal, setShowLotModal] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const [quantities, setQuantities] = useState({});
    const [unitPrices, setUnitPrices] = useState({});
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const resetModal = () => {
        setSelectedIds([]);
        setQuantities({});
        setUnitPrices({});
        setNotes('');
        setSubmitting(false);
    };

    const closeLotModal = () => {
        resetModal();
        setShowLotModal(false);
    };

    const productOptions = useMemo(
        () =>
            availableProducts.map((p) => {
                const price = Number(p.supplier_price || p.cost_price || 0);
                return {
                    id: p.id,
                    label: p.name,
                    sublabel: p.sku,
                    badge: `${p.supplier_stock} avail.`,
                    meta: `₹${price.toLocaleString('en-IN')}`,
                    searchText: `${p.name} ${p.sku}`,
                };
            }),
        [availableProducts]
    );

    const handleSelectionChange = (nextIds) => {
        setSelectedIds(nextIds);
        setQuantities((prev) => {
            const next = { ...prev };
            nextIds.forEach((id) => {
                const key = String(id);
                if (next[key] === undefined) {
                    next[key] = '1';
                }
            });
            return next;
        });
        setUnitPrices((prev) => {
            const next = { ...prev };
            nextIds.forEach((id) => {
                const key = String(id);
                if (next[key] === undefined) {
                    const prod = productMap.get(key);
                    next[key] = String(prod?.supplier_price || prod?.cost_price || 0);
                }
            });
            return next;
        });
    };

    const removeItem = (id) => {
        const key = String(id);
        setSelectedIds((prev) => prev.filter((item) => String(item) !== key));
    };

    const selectedProducts = useMemo(
        () => selectedIds.map((id) => productMap.get(String(id))).filter(Boolean),
        [selectedIds, productMap]
    );

    const totalUnits = selectedProducts.reduce(
        (sum, p) => sum + Math.max(0, Number(quantities[String(p.id)] || 0)),
        0
    );

    const totalValue = selectedProducts.reduce((sum, p) => {
        const key = String(p.id);
        const qty = Math.max(0, Number(quantities[key] || 0));
        const price = Math.max(0, Number(unitPrices[key] || 0));
        return sum + qty * price;
    }, 0);

    const canSubmit =
        selectedProducts.length > 0 &&
        selectedProducts.every((p) => {
            const key = String(p.id);
            const qty = Number(quantities[key] || 0);
            const price = Number(unitPrices[key] ?? -1);
            return qty >= 1 && qty <= Number(p.supplier_stock) && price >= 0;
        });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!canSubmit || submitting) return;

        const items = selectedProducts.map((p) => {
            const key = String(p.id);
            return {
                product_id: p.id,
                quantity: parseInt(quantities[key], 10),
                unit_price: Number(unitPrices[key] || 0),
            };
        });

        setSubmitting(true);
        router.post(
            '/supplier/lots',
            { items, notes },
            {
                preserveScroll: true,
                onSuccess: () => {
                    closeLotModal();
                },
                onFinish: () => setSubmitting(false),
            }
        );
    };

    // Group dispatched lots by lot_number so multi-item lots render together cleanly
    const groupedLots = useMemo(() => {
        const groups = {};
        lots.forEach((lot) => {
            const key = lot.lot_number;
            if (!groups[key]) {
                groups[key] = {
                    lot_number: key,
                    created_at: lot.created_at,
                    notes: lot.notes,
                    items: [],
                };
            }
            groups[key].items.push(lot);
        });

        return Object.values(groups).map((g) => {
            const statuses = [...new Set(g.items.map((i) => i.status))];
            let overallStatus = statuses[0] || 'pending';
            if (statuses.length > 1) overallStatus = 'partially_received';

            const groupQty = g.items.reduce((sum, i) => sum + Number(i.quantity || 0), 0);
            const groupVal = g.items.reduce(
                (sum, i) => sum + Number(i.quantity || 0) * Number(i.unit_price || 0),
                0
            );

            return {
                ...g,
                status: overallStatus,
                total_qty: groupQty,
                total_value: groupVal,
            };
        });
    }, [lots]);

    const firstError = errors && Object.values(errors)[0];

    return (
        <SupplierLayout title="Send Lot to Admin Warehouse">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {flash?.success && (
                    <div
                        style={{
                            padding: '12px 16px',
                            backgroundColor: '#ECFDF5',
                            border: '1px solid #A7F3D0',
                            borderRadius: '6px',
                            color: '#065F46',
                            fontSize: '13px',
                            fontWeight: 500,
                        }}
                    >
                        {flash.success}
                    </div>
                )}

                {flash?.error && (
                    <div
                        style={{
                            padding: '12px 16px',
                            backgroundColor: '#FEF2F2',
                            border: '1px solid #FECACA',
                            borderRadius: '6px',
                            color: '#991B1B',
                            fontSize: '13px',
                            fontWeight: 500,
                        }}
                    >
                        {flash.error}
                    </div>
                )}

                {/* Quick Action Header Card */}
                <div className="admin-card">
                    <div
                        className="admin-card-header"
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '12px',
                        }}
                    >
                        <div>
                            <h3 style={{ margin: 0 }}>Transfer Stock Lots to Admin Warehouse</h3>
                            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748B', fontWeight: 400 }}>
                                {availableProducts.length} product{availableProducts.length === 1 ? '' : 's'} ready •{' '}
                                {totalAvailableUnits} total supplier units available to bundle and dispatch
                            </p>
                        </div>

                        <button
                            type="button"
                            className="btn btn-primary"
                            disabled={availableProducts.length === 0}
                            onClick={() => setShowLotModal(true)}
                        >
                            <Plus size={16} />
                            New Lot Transfer
                        </button>
                    </div>
                </div>

                {/* Grouped Dispatched Lots History */}
                <div className="admin-card">
                    <div className="admin-card-header">
                        <h3>Dispatched Lots History ({groupedLots.length} lots)</h3>
                    </div>
                    <div className="admin-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {groupedLots.length === 0 ? (
                            <p style={{ color: '#64748B', fontSize: '13px', margin: 0 }}>
                                No lots dispatched yet. Click &ldquo;+ New Lot Transfer&rdquo; above to create one.
                            </p>
                        ) : (
                            groupedLots.map((group) => (
                                <div
                                    key={group.lot_number}
                                    style={{
                                        border: '1px solid #E2E8F0',
                                        borderRadius: '6px',
                                        overflow: 'hidden',
                                    }}
                                >
                                    <div
                                        style={{
                                            padding: '12px 16px',
                                            backgroundColor: '#F8FAFC',
                                            borderBottom: '1px solid #E2E8F0',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            flexWrap: 'wrap',
                                            gap: '10px',
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                                            <code style={{ fontWeight: 800, fontSize: '13px' }}>{group.lot_number}</code>
                                            <span
                                                className={`badge ${statusBadge(group.status)}`}
                                                style={{ textTransform: 'capitalize' }}
                                            >
                                                {group.status.replace('_', ' ')}
                                            </span>
                                            <span style={{ fontSize: '12px', color: '#475569' }}>
                                                <Package
                                                    size={13}
                                                    style={{
                                                        display: 'inline',
                                                        marginRight: '4px',
                                                        verticalAlign: 'text-bottom',
                                                    }}
                                                />
                                                <strong>{group.items.length}</strong> items •{' '}
                                                <strong>{group.total_qty}</strong> units • Total:{' '}
                                                <strong>₹{group.total_value.toLocaleString('en-IN')}</strong>
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#64748B' }}>
                                            {group.notes && <span style={{ marginRight: '12px' }}>{group.notes}</span>}
                                            <span>{new Date(group.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    <div style={{ overflowX: 'auto' }}>
                                        <table className="admin-table" style={{ margin: 0 }}>
                                            <thead>
                                                <tr>
                                                    <th>Product</th>
                                                    <th>Qty</th>
                                                    <th>Unit Price</th>
                                                    <th>Line Total</th>
                                                    <th>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {group.items.map((item) => (
                                                    <tr key={item.id}>
                                                        <td>
                                                            <div style={{ fontWeight: 600 }}>{item.product?.name}</div>
                                                            <div style={{ fontSize: '11px', color: '#64748B' }}>
                                                                {item.product?.sku}
                                                            </div>
                                                        </td>
                                                        <td style={{ fontWeight: 700 }}>{item.quantity} units</td>
                                                        <td>₹{Number(item.unit_price).toLocaleString('en-IN')}</td>
                                                        <td style={{ fontWeight: 700 }}>
                                                            ₹{(Number(item.quantity) * Number(item.unit_price)).toLocaleString('en-IN')}
                                                        </td>
                                                        <td>
                                                            <span
                                                                className={`badge ${statusBadge(item.status)}`}
                                                                style={{ textTransform: 'capitalize' }}
                                                            >
                                                                {item.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* New Multi-Item Lot Transfer Popup Modal */}
            {showLotModal && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-label="Transfer Multiple Items in One Lot"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) closeLotModal();
                    }}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 1050,
                        backgroundColor: 'rgba(15, 23, 42, 0.55)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '20px',
                    }}
                >
                    <div
                        className="admin-card"
                        style={{
                            width: '100%',
                            maxWidth: '900px',
                            maxHeight: '90vh',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            margin: 0,
                            boxShadow: '0 20px 50px rgba(15, 23, 42, 0.25)',
                        }}
                    >
                        {/* Modal Header */}
                        <div
                            className="admin-card-header"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '12px',
                                flexShrink: 0,
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Truck size={18} style={{ color: '#EA580C' }} />
                                <div>
                                    <h3 style={{ margin: 0 }}>Transfer Multiple Items in One Lot</h3>
                                    <p style={{ margin: 0, fontSize: '12px', color: '#64748B', fontWeight: 400 }}>
                                        Search and select multiple products, then set dispatch quantities and unit prices.
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={closeLotModal}
                                aria-label="Close modal"
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: '#64748B',
                                    padding: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                }}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Modal Form Body + Footer */}
                        <form
                            onSubmit={handleSubmit}
                            style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}
                        >
                            <div
                                className="admin-card-body"
                                style={{
                                    overflowY: 'auto',
                                    flex: 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '16px',
                                }}
                            >
                                {firstError && (
                                    <div
                                        style={{
                                            padding: '10px 12px',
                                            backgroundColor: '#FEF2F2',
                                            border: '1px solid #FECACA',
                                            borderRadius: '6px',
                                            color: '#B91C1C',
                                            fontSize: '13px',
                                        }}
                                    >
                                        {firstError}
                                    </div>
                                )}

                                <div>
                                    <label
                                        style={{
                                            display: 'block',
                                            fontSize: '12px',
                                            fontWeight: 600,
                                            color: '#334155',
                                            marginBottom: '6px',
                                        }}
                                    >
                                        Select Products ({availableProducts.length} available)
                                    </label>
                                    <SearchableMultiSelect
                                        options={productOptions}
                                        selectedIds={selectedIds}
                                        onChange={handleSelectionChange}
                                        placeholder="Search by product name or SKU to select multiple items..."
                                    />
                                </div>

                                {selectedProducts.length === 0 ? (
                                    <div
                                        style={{
                                            padding: '28px 16px',
                                            textAlign: 'center',
                                            border: '1px dashed #CBD5E1',
                                            borderRadius: '6px',
                                            backgroundColor: '#F8FAFC',
                                            color: '#64748B',
                                            fontSize: '13px',
                                        }}
                                    >
                                        <Package size={24} style={{ marginBottom: '6px', color: '#94A3B8' }} />
                                        <div>Use the dropdown above to select products to include in this lot.</div>
                                    </div>
                                ) : (
                                    <div style={{ overflowX: 'auto', border: '1px solid #E2E8F0', borderRadius: '6px' }}>
                                        <table className="admin-table" style={{ margin: 0 }}>
                                            <thead>
                                                <tr>
                                                    <th>Product</th>
                                                    <th>Available Stock</th>
                                                    <th>Transfer Qty</th>
                                                    <th>Unit Price (₹)</th>
                                                    <th>Line Total (₹)</th>
                                                    <th style={{ width: '44px' }}></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedProducts.map((p) => {
                                                    const key = String(p.id);
                                                    const qty = Number(quantities[key] || 0);
                                                    const price = Number(unitPrices[key] || 0);
                                                    const lineTotal = Math.max(0, qty) * Math.max(0, price);

                                                    return (
                                                        <tr key={p.id}>
                                                            <td>
                                                                <div style={{ fontWeight: 600 }}>{p.name}</div>
                                                                <div style={{ fontSize: '11px', color: '#64748B' }}>
                                                                    {p.sku}
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <span className="badge badge-info">
                                                                    {p.supplier_stock} avail.
                                                                </span>
                                                            </td>
                                                            <td style={{ width: '120px' }}>
                                                                <input
                                                                    type="number"
                                                                    className="form-input"
                                                                    min={1}
                                                                    max={p.supplier_stock}
                                                                    required
                                                                    value={quantities[key] ?? ''}
                                                                    onChange={(e) =>
                                                                        setQuantities((prev) => ({
                                                                            ...prev,
                                                                            [key]: e.target.value,
                                                                        }))
                                                                    }
                                                                />
                                                            </td>
                                                            <td style={{ width: '140px' }}>
                                                                <input
                                                                    type="number"
                                                                    className="form-input"
                                                                    min={0}
                                                                    step="0.01"
                                                                    required
                                                                    value={unitPrices[key] ?? ''}
                                                                    onChange={(e) =>
                                                                        setUnitPrices((prev) => ({
                                                                            ...prev,
                                                                            [key]: e.target.value,
                                                                        }))
                                                                    }
                                                                />
                                                            </td>
                                                            <td style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                                                                ₹{lineTotal.toLocaleString('en-IN')}
                                                            </td>
                                                            <td>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeItem(p.id)}
                                                                    title={`Remove ${p.name}`}
                                                                    style={{
                                                                        background: 'transparent',
                                                                        border: 'none',
                                                                        cursor: 'pointer',
                                                                        color: '#DC2626',
                                                                        padding: '4px',
                                                                        display: 'inline-flex',
                                                                        alignItems: 'center',
                                                                    }}
                                                                >
                                                                    <Trash2 size={15} />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                <div>
                                    <label
                                        style={{
                                            display: 'block',
                                            fontSize: '12px',
                                            fontWeight: 600,
                                            color: '#334155',
                                            marginBottom: '6px',
                                        }}
                                    >
                                        Dispatch Notes (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="e.g., Batch #42 via BlueDart Surface Cargo"
                                    />
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div
                                style={{
                                    padding: '14px 20px',
                                    borderTop: '1px solid #E2E8F0',
                                    backgroundColor: '#F8FAFC',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    flexWrap: 'wrap',
                                    gap: '12px',
                                    flexShrink: 0,
                                }}
                            >
                                <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>
                                    Summary: <strong>{selectedProducts.length}</strong> items •{' '}
                                    <strong>{totalUnits}</strong> total units •{' '}
                                    <strong>₹{totalValue.toLocaleString('en-IN')}</strong>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={closeLotModal}
                                        disabled={submitting}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={!canSubmit || submitting}
                                    >
                                        <Truck size={15} />
                                        {submitting ? 'Dispatching...' : 'Dispatch Lot to Admin Warehouse'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </SupplierLayout>
    );
}
