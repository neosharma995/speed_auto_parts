import React, { useEffect, useMemo, useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import AdminDataTable from '@/Components/Admin/AdminDataTable';
import { Plus, Edit, Trash2, X, CheckCircle2, Package, Truck, Inbox, History } from 'lucide-react';

export default function AdminSuppliersIndex({
    suppliers,
    pendingLots = [],
    transfersCount = 0,
    activeTab: initialTab = 'suppliers',
    filters = {},
}) {
    const safeFilters = filters && !Array.isArray(filters) ? filters : {};
    const { errors } = usePage().props;

    const [tab, setTab] = useState(initialTab === 'incoming' ? 'incoming' : 'suppliers');
    useEffect(() => {
        setTab(initialTab === 'incoming' ? 'incoming' : 'suppliers');
    }, [initialTab]);

    const [search, setSearch] = useState(safeFilters.search || '');
    const [showModal, setShowModal] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState(null);

    const [name, setName] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [status, setStatus] = useState('active');
    const [submitting, setSubmitting] = useState(false);

    // Reject single item or whole lot modal
    const [rejectTarget, setRejectTarget] = useState(null);
    const [rejectReason, setRejectReason] = useState('');

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

    const openCreate = () => {
        setEditingSupplier(null);
        setName('');
        setCompanyName('');
        setEmail('');
        setPhone('');
        setPassword('');
        setStatus('active');
        setShowModal(true);
    };

    const openEdit = (s) => {
        setEditingSupplier(s);
        setName(s.name || '');
        setCompanyName(s.company_name || '');
        setEmail(s.email || '');
        setPhone(s.phone || '');
        setPassword('');
        setStatus(s.status || 'active');
        setShowModal(true);
    };

    const handleSave = (e) => {
        e.preventDefault();
        setSubmitting(true);

        if (editingSupplier) {
            router.put(
                `/admin/suppliers/${editingSupplier.id}`,
                {
                    name,
                    company_name: companyName,
                    email,
                    phone,
                    status,
                    password: password || null,
                },
                {
                    onSuccess: () => setShowModal(false),
                    onFinish: () => setSubmitting(false),
                }
            );
        } else {
            router.post(
                '/admin/suppliers',
                {
                    name,
                    company_name: companyName,
                    email,
                    phone,
                    password,
                },
                {
                    onSuccess: () => setShowModal(false),
                    onFinish: () => setSubmitting(false),
                }
            );
        }
    };

    const handleDelete = (id, label) => {
        if (confirm(`Remove supplier "${label}"? Existing products will remain in the catalog.`)) {
            router.delete(`/admin/suppliers/${id}`);
        }
    };

    const handleSearch = () => {
        router.get('/admin/suppliers', { search }, { preserveState: true });
    };

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

    const items = suppliers.data || [];

    const columns = [
        {
            key: 'company',
            label: 'Company / Contact',
            render: (s) => (
                <>
                    <strong>{s.company_name || s.name}</strong>
                    <small style={{ display: 'block', color: '#64748B' }}>Contact: {s.name}</small>
                </>
            ),
        },
        {
            key: 'contact',
            label: 'Email & Phone',
            render: (s) => (
                <>
                    <div>{s.email}</div>
                    <small style={{ color: '#64748B' }}>{s.phone || '—'}</small>
                </>
            ),
        },
        {
            key: 'supplied_products_count',
            label: 'Products',
            render: (s) => (
                <>
                    <strong>{s.supplied_products_count || 0}</strong> parts
                </>
            ),
        },
        {
            key: 'pending_lots_count',
            label: 'Pending Lots',
            render: (s) => (
                <span className={`badge ${s.pending_lots_count > 0 ? 'badge-warning' : 'badge-neutral'}`}>
                    {s.pending_lots_count || 0} pending
                </span>
            ),
        },
        {
            key: 'received_lots_count',
            label: 'Received Lots',
            render: (s) => <span className="badge badge-success">{s.received_lots_count || 0} received</span>,
        },
        {
            key: 'status',
            label: 'Status',
            render: (s) => (
                <span
                    className={`badge ${s.status === 'active' ? 'badge-success' : 'badge-danger'}`}
                    style={{ textTransform: 'capitalize' }}
                >
                    {s.status || 'active'}
                </span>
            ),
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (s) => (
                <div style={{ display: 'flex', gap: '6px' }}>
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => openEdit(s)}>
                        <Edit size={14} />
                    </button>
                    <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        style={{ color: '#D93025' }}
                        onClick={() => handleDelete(s.id, s.company_name || s.name)}
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <AdminLayout title="Suppliers & Incoming Lots">
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

            {/* Tabs & Logs Toolbar */}
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
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                        type="button"
                        className={`btn btn-sm ${tab === 'suppliers' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setTab('suppliers')}
                    >
                        <Truck size={15} />
                        <span>Suppliers Directory ({suppliers.total || items.length})</span>
                    </button>

                    <button
                        type="button"
                        className={`btn btn-sm ${tab === 'incoming' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setTab('incoming')}
                    >
                        <Inbox size={15} />
                        <span>Incoming Lots</span>
                        {groupedPendingLots.length > 0 && (
                            <span
                                style={{
                                    marginLeft: '4px',
                                    padding: '1px 7px',
                                    borderRadius: '999px',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    backgroundColor: tab === 'incoming' ? 'rgba(255,255,255,0.22)' : '#F36B16',
                                    color: '#FFF',
                                }}
                            >
                                {groupedPendingLots.length}
                            </span>
                        )}
                    </button>
                </div>

                <Link href="/admin/warehouse/logs" className="btn btn-outline btn-sm">
                    <History size={15} />
                    <span>Transfer Logs ({transfersCount})</span>
                </Link>
            </div>

            {tab === 'suppliers' ? (
                <AdminDataTable
                    title="Registered Suppliers"
                    count={suppliers.total || items.length}
                    search={{
                        value: search,
                        onChange: setSearch,
                        placeholder: 'Search by supplier company, contact name, email, or phone...',
                    }}
                    onSearch={handleSearch}
                    actions={
                        <button type="button" className="btn btn-primary btn-sm" onClick={openCreate}>
                            <Plus size={16} /> Add Supplier
                        </button>
                    }
                    columns={columns}
                    rows={items}
                    emptyMessage='No suppliers found. Click "Add Supplier" to onboard a supplier account.'
                    pagination={suppliers}
                    itemLabel="suppliers"
                />
            ) : (
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
                                                <strong>{group.items.length}</strong> items •{' '}
                                                <strong>{group.total_qty}</strong> total units • Lot Value:{' '}
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
            )}

            {/* Create / Edit Supplier Modal */}
            {showModal && (
                <>
                    <div className="header-backdrop" onClick={() => setShowModal(false)} />
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
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '16px',
                            }}
                        >
                            <h3 style={{ fontSize: '18px', fontWeight: 800 }}>
                                {editingSupplier ? 'Edit Supplier Account' : 'Add New Supplier'}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                style={{ background: 'none', border: 'none', color: '#64748B' }}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div className="form-group">
                                <label className="form-label">
                                    Company / Supplier Name <span className="required">*</span>
                                </label>
                                <input
                                    type="text"
                                    className="form-input"
                                    required
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    placeholder="e.g. Apex Motorsport Spares Pvt. Ltd."
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">
                                    Contact Person Name <span className="required">*</span>
                                </label>
                                <input
                                    type="text"
                                    className="form-input"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Rajesh Sharma"
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div className="form-group">
                                    <label className="form-label">
                                        Login Email <span className="required">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        className="form-input"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="supplier@company.com"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Phone</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="+91 98765 00003"
                                    />
                                </div>
                            </div>

                            {editingSupplier && (
                                <div className="form-group">
                                    <label className="form-label">Account Status</label>
                                    <select
                                        className="form-select"
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                    >
                                        <option value="active">Active</option>
                                        <option value="suspended">Suspended</option>
                                    </select>
                                </div>
                            )}

                            <div className="form-group">
                                <label className="form-label">
                                    {editingSupplier
                                        ? 'New Password (leave blank to keep current)'
                                        : 'Portal Login Password'}{' '}
                                    {!editingSupplier && <span className="required">*</span>}
                                </label>
                                <input
                                    type="password"
                                    className="form-input"
                                    required={!editingSupplier}
                                    minLength={6}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Minimum 6 characters"
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    style={{ flex: 1 }}
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submitting}>
                                    {submitting ? 'Saving...' : editingSupplier ? 'Update Supplier' : 'Create Supplier'}
                                </button>
                            </div>
                        </form>
                    </div>
                </>
            )}

            {/* Reject Lot / Item Modal */}
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
