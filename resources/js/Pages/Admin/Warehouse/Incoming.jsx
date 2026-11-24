import React, { useMemo, useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { ArrowLeft, CheckCircle2, History, Package, X } from 'lucide-react';

export default function AdminWarehouseIncoming({ pendingLots = [], transfersCount = 0 }) {
    const { errors } = usePage().props;

    const [rejectTarget, setRejectTarget] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const groupedPendingLots = useMemo(() => {
        const groups = [];
        const map = {};
        pendingLots.forEach((lot) => {
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
        router.post(`/admin/warehouse/lots/${lot.id}/receive`, {}, { preserveScroll: true });
    };

    const handleReceiveLotBatch = (lotNumber) => {
        router.post(`/admin/warehouse/lot-number/${encodeURIComponent(lotNumber)}/receive`, {}, { preserveScroll: true });
    };

    const handleRejectSubmit = (e) => {
        e.preventDefault();
        if (!rejectTarget) return;
        setSubmitting(true);
        const url =
            rejectTarget.type === 'batch'
                ? `/admin/warehouse/lot-number/${encodeURIComponent(rejectTarget.lot_number)}/reject`
                : `/admin/warehouse/lots/${rejectTarget.id}/reject`;

        router.post(
            url,
            { reason: rejectReason },
            {
                preserveScroll: true,
                onSuccess: () => setRejectTarget(null),
                onFinish: () => setSubmitting(false),
            }
        );
    };

    return (
        <AdminLayout title="Incoming Supplier Lots">
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
                <Link href="/admin/warehouse" className="btn btn-outline btn-sm">
                    <ArrowLeft size={14} />
                    <span>Back to Warehouse</span>
                </Link>

                <Link href="/admin/warehouse/logs" className="btn btn-outline btn-sm">
                    <History size={15} />
                    <span>Transfer Logs ({transfersCount})</span>
                </Link>
            </div>

            <div className="admin-card">
                <div className="admin-card-header">
                    <h3>Incoming Supplier Lots Pending Receipt ({groupedPendingLots.length} lots)</h3>
                </div>
                <div className="admin-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {groupedPendingLots.length === 0 ? (
                        <p style={{ color: '#64748B', fontSize: '13px', margin: 0 }}>
                            No pending supplier lots waiting for warehouse check-in.
                        </p>
                    ) : (
                        groupedPendingLots.map((group) => (
                            <div
                                key={group.lot_number}
                                style={{ border: '1px solid #FDBA74', borderRadius: '6px', overflow: 'hidden' }}
                            >
                                <div
                                    style={{
                                        padding: '12px 16px',
                                        backgroundColor: '#FFF7ED',
                                        borderBottom: '1px solid #FED7AA',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        flexWrap: 'wrap',
                                        gap: '12px',
                                    }}
                                >
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                            <code style={{ fontWeight: 800, fontSize: '14px' }}>{group.lot_number}</code>
                                            <span className="badge badge-warning">Pending Receipt</span>
                                            <span style={{ fontSize: '13px', fontWeight: 700 }}>
                                                {group.supplier?.company_name || group.supplier?.name || 'Supplier'}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>
                                            <Package
                                                size={13}
                                                style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }}
                                            />
                                            <strong>{group.items.length}</strong> items • <strong>{group.total_qty}</strong>{' '}
                                            total units • Lot Value:{' '}
                                            <strong>₹{group.total_value.toLocaleString('en-IN')}</strong>
                                            {group.notes && (
                                                <span style={{ marginLeft: '10px', color: '#64748B' }}>— {group.notes}</span>
                                            )}
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

                                <table className="admin-table">
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
                                        {group.items.map((lot) => (
                                            <tr key={lot.id}>
                                                <td>
                                                    <strong>{lot.product?.name}</strong>
                                                    <small
                                                        style={{
                                                            display: 'block',
                                                            color: '#64748B',
                                                            fontFamily: 'monospace',
                                                        }}
                                                    >
                                                        {lot.product?.sku}
                                                    </small>
                                                </td>
                                                <td>
                                                    <span className="badge badge-warning">{lot.quantity} units</span>
                                                </td>
                                                <td>₹{Number(lot.unit_price || 0).toLocaleString('en-IN')}</td>
                                                <td>
                                                    <strong>
                                                        ₹{(lot.quantity * Number(lot.unit_price || 0)).toLocaleString('en-IN')}
                                                    </strong>
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '6px' }}>
                                                        <button
                                                            type="button"
                                                            className="btn btn-outline btn-sm"
                                                            onClick={() => handleReceiveLot(lot)}
                                                        >
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

            {rejectTarget && (
                <>
                    <div className="header-backdrop" onClick={() => setRejectTarget(null)} />
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
                            maxWidth: '440px',
                            zIndex: 2200,
                            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                        }}
                    >
                        <h3 style={{ fontSize: '17px', fontWeight: 800, marginBottom: '8px' }}>
                            Reject {rejectTarget.lot_number}
                        </h3>
                        <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '16px' }}>
                            Rejecting returns <strong>{rejectTarget.qty} units</strong> ({rejectTarget.label}) back to the
                            supplier's available stock.
                        </p>
                        <form onSubmit={handleRejectSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div className="form-group">
                                <label className="form-label">Rejection Reason (Optional)</label>
                                <textarea
                                    className="form-textarea"
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    placeholder="Damaged packaging, wrong specification, etc."
                                    style={{ minHeight: '70px' }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    style={{ flex: 1 }}
                                    onClick={() => setRejectTarget(null)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    style={{ flex: 1, backgroundColor: '#D93025' }}
                                    disabled={submitting}
                                >
                                    Confirm Reject
                                </button>
                            </div>
                        </form>
                    </div>
                </>
            )}
        </AdminLayout>
    );
}
