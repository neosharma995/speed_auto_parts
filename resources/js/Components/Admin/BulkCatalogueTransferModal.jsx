import React, { useState, useMemo, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import { Store, X, Trash2, ArrowRight, Boxes } from 'lucide-react';
import SearchableMultiSelect from '@/Components/SearchableMultiSelect';

export default function BulkCatalogueTransferModal({ isOpen, onClose, products = [] }) {
    const { errors } = usePage().props;

    const warehouseProducts = useMemo(
        () => products.filter((p) => Number(p.warehouse_stock) > 0),
        [products]
    );

    const productMap = useMemo(() => {
        const map = new Map();
        warehouseProducts.forEach((p) => map.set(String(p.id), p));
        return map;
    }, [warehouseProducts]);

    const [selectedIds, setSelectedIds] = useState([]);
    const [rowsById, setRowsById] = useState({});
    const [publish, setPublish] = useState(true);
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const resetState = () => {
        setSelectedIds([]);
        setRowsById({});
        setPublish(true);
        setNotes('');
        setSubmitting(false);
    };

    useEffect(() => {
        if (!isOpen) {
            resetState();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const options = warehouseProducts.map((p) => {
        const cost = Number(p.supplier_price || p.cost_price || 0);
        return {
            id: p.id,
            label: p.name,
            sublabel: p.sku,
            badge: `${p.warehouse_stock} in warehouse`,
            meta: cost > 0 ? `Cost ₹${cost.toLocaleString('en-IN')}` : null,
            searchText: `${p.name} ${p.sku} ${p.brand?.name || ''} ${p.category?.name || ''}`,
        };
    });

    const handleSelectionChange = (nextIds) => {
        setSelectedIds(nextIds);
        setRowsById((prev) => {
            const next = { ...prev };
            nextIds.forEach((id) => {
                const key = String(id);
                if (!next[key]) {
                    const prod = productMap.get(key);
                    const cost = Number(prod?.supplier_price || prod?.cost_price || 0);
                    const curBase = Number(prod?.base_price || 0);
                    const defaultBase = curBase > cost ? curBase : Math.round(cost * 1.35) || 1000;
                    next[key] = {
                        quantity: '1',
                        base_price: String(defaultBase),
                        sale_price: prod?.sale_price ? String(prod.sale_price) : '',
                    };
                }
            });
            return next;
        });
    };

    const updateRowField = (id, field, value) => {
        const key = String(id);
        setRowsById((prev) => ({
            ...prev,
            [key]: {
                ...(prev[key] || { quantity: '1', base_price: '0', sale_price: '' }),
                [field]: value,
            },
        }));
    };

    const removeRow = (id) => {
        const key = String(id);
        setSelectedIds((prev) => prev.filter((item) => String(item) !== key));
    };

    const selectedProducts = selectedIds
        .map((id) => productMap.get(String(id)))
        .filter(Boolean);

    const totalUnits = selectedProducts.reduce((sum, p) => {
        const row = rowsById[String(p.id)];
        return sum + Math.max(0, Number(row?.quantity || 0));
    }, 0);

    const canSubmit =
        selectedProducts.length > 0 &&
        selectedProducts.every((p) => {
            const row = rowsById[String(p.id)] || {};
            const qty = Number(row.quantity || 0);
            const base = Number(row.base_price || 0);
            return qty >= 1 && qty <= Number(p.warehouse_stock) && base >= 0;
        });

    const handleClose = () => {
        resetState();
        onClose();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!canSubmit || submitting) return;

        const items = selectedProducts.map((p) => {
            const row = rowsById[String(p.id)] || {};
            const rawSale = row.sale_price;
            return {
                product_id: p.id,
                quantity: parseInt(row.quantity, 10),
                base_price: Number(row.base_price),
                sale_price: rawSale !== '' && rawSale !== null ? Number(rawSale) : null,
            };
        });

        setSubmitting(true);
        router.post(
            '/admin/catalogue/bulk-transfer',
            { items, publish, notes },
            {
                preserveScroll: true,
                onSuccess: () => {
                    resetState();
                    onClose();
                },
                onFinish: () => setSubmitting(false),
            }
        );
    };

    const firstError = errors && Object.values(errors)[0];

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-label="Bulk Transfer from Warehouse to Website Catalogue"
            onClick={(e) => {
                if (e.target === e.currentTarget) handleClose();
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
                    maxWidth: '940px',
                    maxHeight: '90vh',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    margin: 0,
                    boxShadow: '0 20px 50px rgba(15, 23, 42, 0.25)',
                }}
            >
                {/* Header */}
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
                        <Store size={18} style={{ color: '#EA580C' }} />
                        <div>
                            <h3 style={{ margin: 0 }}>Bulk Transfer to Website Catalogue</h3>
                            <p style={{ margin: 0, fontSize: '12px', color: '#64748B', fontWeight: 400 }}>
                                Search and select multiple warehouse products, set quantities and storefront pricing.
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleClose}
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

                {/* Scrollable Body */}
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
                                Select Warehouse Products ({warehouseProducts.length} available)
                            </label>
                            <SearchableMultiSelect
                                options={options}
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
                                <Boxes size={24} style={{ marginBottom: '6px', color: '#94A3B8' }} />
                                <div>Select one or more products above to configure transfer quantities and pricing.</div>
                            </div>
                        ) : (
                            <div style={{ overflowX: 'auto', border: '1px solid #E2E8F0', borderRadius: '6px' }}>
                                <table className="admin-table" style={{ margin: 0 }}>
                                    <thead>
                                        <tr>
                                            <th>Product</th>
                                            <th>Warehouse Avail.</th>
                                            <th>Transfer Qty</th>
                                            <th>Selling Price (₹)</th>
                                            <th>Sale Price (₹ Opt.)</th>
                                            <th>Unit Margin</th>
                                            <th style={{ width: '44px' }}></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedProducts.map((p) => {
                                            const row = rowsById[String(p.id)] || {};
                                            const costPrice = Number(p.supplier_price || p.cost_price || 0);
                                            const basePrice = Number(row.base_price || 0);
                                            const salePrice = Number(row.sale_price || 0);
                                            const effectiveSell = salePrice > 0 ? salePrice : basePrice;
                                            const unitMargin = effectiveSell - costPrice;

                                            return (
                                                <tr key={p.id}>
                                                    <td>
                                                        <div style={{ fontWeight: 600 }}>{p.name}</div>
                                                        <div style={{ fontSize: '11px', color: '#64748B' }}>
                                                            {p.sku} • Cost ₹{costPrice.toLocaleString('en-IN')}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className="badge badge-info">{p.warehouse_stock} avail.</span>
                                                    </td>
                                                    <td style={{ width: '110px' }}>
                                                        <input
                                                            type="number"
                                                            className="form-input"
                                                            min={1}
                                                            max={p.warehouse_stock}
                                                            required
                                                            value={row.quantity ?? ''}
                                                            onChange={(e) => updateRowField(p.id, 'quantity', e.target.value)}
                                                        />
                                                    </td>
                                                    <td style={{ width: '130px' }}>
                                                        <input
                                                            type="number"
                                                            className="form-input"
                                                            min={0}
                                                            step="0.01"
                                                            required
                                                            value={row.base_price ?? ''}
                                                            onChange={(e) => updateRowField(p.id, 'base_price', e.target.value)}
                                                        />
                                                    </td>
                                                    <td style={{ width: '130px' }}>
                                                        <input
                                                            type="number"
                                                            className="form-input"
                                                            min={0}
                                                            step="0.01"
                                                            placeholder="Optional"
                                                            value={row.sale_price ?? ''}
                                                            onChange={(e) => updateRowField(p.id, 'sale_price', e.target.value)}
                                                        />
                                                    </td>
                                                    <td>
                                                        <span
                                                            style={{
                                                                fontWeight: 700,
                                                                fontSize: '12px',
                                                                color: unitMargin >= 0 ? '#059669' : '#DC2626',
                                                            }}
                                                        >
                                                            {unitMargin >= 0 ? '+' : ''}₹{unitMargin.toLocaleString('en-IN')}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeRow(p.id)}
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

                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                                gap: '12px',
                                alignItems: 'center',
                                paddingTop: '4px',
                            }}
                        >
                            <label
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    fontSize: '13px',
                                    fontWeight: 500,
                                    color: '#0F172A',
                                    cursor: 'pointer',
                                }}
                            >
                                <input
                                    type="checkbox"
                                    checked={publish}
                                    onChange={(e) => setPublish(e.target.checked)}
                                />
                                <span>Publish selected products on public website storefront</span>
                            </label>

                            <div>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Transfer notes (optional)..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
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
                            Summary: <strong>{selectedProducts.length}</strong> items • <strong>{totalUnits}</strong> units
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={handleClose}
                                disabled={submitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={!canSubmit || submitting}
                            >
                                <ArrowRight size={15} />
                                {submitting ? 'Transferring...' : 'Transfer to Website Catalogue'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
