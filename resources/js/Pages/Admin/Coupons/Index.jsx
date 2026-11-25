import React, { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import AdminDataTable from '@/Components/Admin/AdminDataTable';
import { useCurrency } from '@/Context/CurrencyContext';
import { Plus, Edit, Trash2, X } from 'lucide-react';

const EMPTY_FORM = {
    code: '',
    type: 'percentage',
    value: '',
    min_spend: '0',
    max_discount: '',
    usage_limit: '',
    usage_per_user: '1',
    starts_at: '',
    expires_at: '',
    is_active: true,
};

function toDateInputValue(val) {
    if (!val) return '';
    return String(val).slice(0, 10);
}

export default function AdminCouponsIndex({ coupons, filters = {} }) {
    const safeFilters = filters && !Array.isArray(filters) ? filters : {};
    const { errors } = usePage().props;
    const { formatAdminPrice, defaultCurrency } = useCurrency();

    const items = Array.isArray(coupons) ? coupons : (coupons?.data || []);
    const totalCount = coupons?.total ?? items.length;

    const [search, setSearch] = useState(safeFilters.search || '');
    const [typeFilter, setTypeFilter] = useState(safeFilters.type || '');
    const [statusFilter, setStatusFilter] = useState(safeFilters.status || '');

    const [showModal, setShowModal] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState(null);
    const [form, setForm] = useState({ ...EMPTY_FORM });
    const [submitting, setSubmitting] = useState(false);

    const hasActiveFilters = Boolean(
        (safeFilters.search && String(safeFilters.search).trim() !== '') ||
        safeFilters.type ||
        safeFilters.status
    );

    const handleFilter = (next = {}) => {
        const nextSearch = next.search !== undefined ? next.search : search;
        const nextType = next.type !== undefined ? next.type : typeFilter;
        const nextStatus = next.status !== undefined ? next.status : statusFilter;

        const params = {};
        if (nextSearch && nextSearch.trim()) params.search = nextSearch.trim();
        if (nextType) params.type = nextType;
        if (nextStatus) params.status = nextStatus;

        router.get('/admin/coupons', params, { preserveState: true, replace: true });
    };

    const handleTypeChange = (val) => {
        setTypeFilter(val);
        handleFilter({ type: val });
    };

    const handleStatusChange = (val) => {
        setStatusFilter(val);
        handleFilter({ status: val });
    };

    const handleResetFilters = () => {
        setSearch('');
        setTypeFilter('');
        setStatusFilter('');
        router.get('/admin/coupons', {}, { preserveState: true, replace: true });
    };

    const openCreate = () => {
        setEditingCoupon(null);
        setForm({ ...EMPTY_FORM });
        setShowModal(true);
    };

    const openEdit = (coupon) => {
        setEditingCoupon(coupon);
        setForm({
            code: coupon.code || '',
            type: coupon.type || 'percentage',
            value: coupon.value !== null && coupon.value !== undefined ? String(coupon.value) : '',
            min_spend: coupon.min_spend !== null && coupon.min_spend !== undefined ? String(coupon.min_spend) : '0',
            max_discount: coupon.max_discount !== null && coupon.max_discount !== undefined ? String(coupon.max_discount) : '',
            usage_limit: coupon.usage_limit !== null && coupon.usage_limit !== undefined ? String(coupon.usage_limit) : '',
            usage_per_user:
                coupon.usage_per_user !== null && coupon.usage_per_user !== undefined
                    ? String(coupon.usage_per_user)
                    : '1',
            starts_at: toDateInputValue(coupon.starts_at),
            expires_at: toDateInputValue(coupon.expires_at),
            is_active: coupon.is_active !== undefined ? Boolean(coupon.is_active) : true,
        });
        setShowModal(true);
    };

    const handleSave = (e) => {
        e.preventDefault();
        setSubmitting(true);

        const payload = {
            code: form.code.toUpperCase().trim(),
            type: form.type,
            value: parseFloat(form.value) || 0,
            min_spend: form.min_spend !== '' ? parseFloat(form.min_spend) : 0,
            max_discount:
                form.type === 'percentage' && form.max_discount !== ''
                    ? parseFloat(form.max_discount)
                    : null,
            usage_limit: form.usage_limit !== '' ? parseInt(form.usage_limit, 10) : null,
            usage_per_user: form.usage_per_user !== '' ? parseInt(form.usage_per_user, 10) : 1,
            starts_at: form.starts_at || null,
            expires_at: form.expires_at || null,
            is_active: Boolean(form.is_active),
        };

        const options = {
            preserveScroll: true,
            onSuccess: () => {
                setShowModal(false);
                setEditingCoupon(null);
            },
            onFinish: () => setSubmitting(false),
        };

        if (editingCoupon) {
            router.put(`/admin/coupons/${editingCoupon.id}`, payload, options);
        } else {
            router.post('/admin/coupons', payload, options);
        }
    };

    const handleDelete = (coupon) => {
        if (confirm(`Delete coupon "${coupon.code}"?`)) {
            router.delete(`/admin/coupons/${coupon.id}`, { preserveScroll: true });
        }
    };

    const errorMessages = Object.values(errors || {}).filter(Boolean);

    const columns = [
        {
            key: 'code',
            label: 'Code',
            render: (c) => <strong>{c.code}</strong>,
        },
        {
            key: 'type',
            label: 'Type',
            render: (c) => (
                <span className="badge badge-neutral" style={{ textTransform: 'capitalize' }}>
                    {c.type}
                </span>
            ),
        },
        {
            key: 'discount',
            label: 'Discount',
            render: (c) => (
                <>
                    <strong>{c.type === 'percentage' ? `${c.value}%` : formatAdminPrice(c.value)}</strong>
                    {c.type === 'percentage' && c.max_discount && Number(c.max_discount) > 0 && (
                        <small style={{ display: 'block', color: '#64748B', fontSize: '11px' }}>
                            Max cap: {formatAdminPrice(c.max_discount)}
                        </small>
                    )}
                </>
            ),
        },
        {
            key: 'min_spend',
            label: 'Min Spend',
            render: (c) => formatAdminPrice(c.min_spend || 0),
        },
        {
            key: 'usage',
            label: 'Usage',
            render: (c) => (
                <>
                    <div>
                        {c.times_used || 0} / {c.usage_limit ? c.usage_limit : '∞'}
                    </div>
                    <small style={{ color: '#64748B', fontSize: '11px' }}>
                        {c.usage_per_user || 1} per user
                    </small>
                </>
            ),
        },
        {
            key: 'validity',
            label: 'Validity',
            render: (c) => {
                if (!c.starts_at && !c.expires_at) {
                    return <span style={{ color: '#64748B', fontSize: '12px' }}>No expiry</span>;
                }
                const start = c.starts_at ? new Date(c.starts_at).toLocaleDateString() : 'Anytime';
                const end = c.expires_at ? new Date(c.expires_at).toLocaleDateString() : 'No expiry';
                return (
                    <span style={{ fontSize: '12px', color: '#475569' }}>
                        {start} → {end}
                    </span>
                );
            },
        },
        {
            key: 'is_active',
            label: 'Status',
            render: (c) => (
                <span className={`badge ${c.is_active ? 'badge-success' : 'badge-neutral'}`}>
                    {c.is_active ? 'Active' : 'Inactive'}
                </span>
            ),
        },
        {
            key: 'actions',
            label: 'Actions',
            align: 'right',
            render: (c) => (
                <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                    <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        title="Edit Coupon"
                        onClick={() => openEdit(c)}
                    >
                        <Edit size={14} />
                    </button>
                    <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        style={{ color: '#D93025', borderColor: '#FECDD3' }}
                        title="Delete Coupon"
                        onClick={() => handleDelete(c)}
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <AdminLayout title="Coupon & Discount Management">
            <AdminDataTable
                title="All Coupons"
                count={totalCount}
                search={{
                    value: search,
                    onChange: setSearch,
                    placeholder: 'Search coupon code...',
                }}
                filters={[
                    {
                        key: 'type',
                        value: typeFilter,
                        onChange: handleTypeChange,
                        placeholder: 'All Types',
                        options: [
                            { value: 'percentage', label: 'Percentage (%)' },
                            { value: 'fixed', label: `Fixed (${defaultCurrency.code})` },
                        ],
                    },
                    {
                        key: 'status',
                        value: statusFilter,
                        onChange: handleStatusChange,
                        placeholder: 'All Statuses',
                        options: [
                            { value: 'active', label: 'Active' },
                            { value: 'inactive', label: 'Inactive' },
                        ],
                    },
                ]}
                onSearch={() => handleFilter()}
                searchButtonLabel="Filter"
                hasActiveFilters={hasActiveFilters}
                onReset={handleResetFilters}
                actions={
                    <button type="button" className="btn btn-primary btn-sm" onClick={openCreate}>
                        <Plus size={16} /> Add Coupon
                    </button>
                }
                columns={columns}
                rows={items}
                emptyMessage="No coupons found matching your criteria."
                pagination={Array.isArray(coupons) ? null : coupons}
                itemLabel="coupons"
            />

            {/* Create / Edit Coupon Modal */}
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
                            width: '92%',
                            maxWidth: '580px',
                            maxHeight: '90vh',
                            overflowY: 'auto',
                            zIndex: 2200,
                            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '18px',
                            }}
                        >
                            <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>
                                {editingCoupon ? 'Edit Coupon' : 'Create Coupon'}
                            </h3>
                            <button
                                type="button"
                                className="btn btn-outline btn-sm"
                                onClick={() => setShowModal(false)}
                                aria-label="Close modal"
                            >
                                <X size={15} />
                            </button>
                        </div>

                        {errorMessages.length > 0 && (
                            <div
                                style={{
                                    backgroundColor: '#FEF2F2',
                                    border: '1px solid #FECACA',
                                    color: '#B91C1C',
                                    borderRadius: '6px',
                                    padding: '10px 14px',
                                    fontSize: '13px',
                                    marginBottom: '16px',
                                }}
                            >
                                <ul style={{ margin: 0, paddingLeft: '18px' }}>
                                    {errorMessages.map((msg, i) => (
                                        <li key={i}>{msg}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                                <div className="form-group">
                                    <label className="form-label">
                                        Coupon Code <span className="required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        required
                                        placeholder="e.g. TRACKDAY"
                                        style={{ textTransform: 'uppercase' }}
                                        value={form.code}
                                        onChange={(e) => setForm({ ...form, code: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">
                                        Discount Type <span className="required">*</span>
                                    </label>
                                    <select
                                        className="form-select"
                                        value={form.type}
                                        onChange={(e) => setForm({ ...form, type: e.target.value })}
                                    >
                                        <option value="percentage">Percentage (%)</option>
                                        <option value="fixed">Fixed Amount ({defaultCurrency.code})</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">
                                        Discount Value ({form.type === 'percentage' ? '%' : defaultCurrency.symbol}){' '}
                                        <span className="required">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        className="form-input"
                                        required
                                        placeholder={form.type === 'percentage' ? '10' : '500'}
                                        value={form.value}
                                        onChange={(e) => setForm({ ...form, value: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Min Spend Required ({defaultCurrency.code})</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        className="form-input"
                                        value={form.min_spend}
                                        onChange={(e) => setForm({ ...form, min_spend: e.target.value })}
                                    />
                                </div>

                                {form.type === 'percentage' && (
                                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                        <label className="form-label">Max Discount Cap ({defaultCurrency.code} Optional)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            className="form-input"
                                            placeholder="e.g. 3000"
                                            value={form.max_discount}
                                            onChange={(e) => setForm({ ...form, max_discount: e.target.value })}
                                        />
                                    </div>
                                )}

                                <div className="form-group">
                                    <label className="form-label">Total Usage Limit</label>
                                    <input
                                        type="number"
                                        min="1"
                                        className="form-input"
                                        placeholder="Unlimited"
                                        value={form.usage_limit}
                                        onChange={(e) => setForm({ ...form, usage_limit: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Limit Per User</label>
                                    <input
                                        type="number"
                                        min="1"
                                        className="form-input"
                                        value={form.usage_per_user}
                                        onChange={(e) => setForm({ ...form, usage_per_user: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Starts At</label>
                                    <input
                                        type="date"
                                        className="form-input"
                                        value={form.starts_at}
                                        onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Expires At</label>
                                    <input
                                        type="date"
                                        className="form-input"
                                        value={form.expires_at}
                                        onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
                                    />
                                </div>
                            </div>

                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600 }}>
                                <input
                                    type="checkbox"
                                    checked={Boolean(form.is_active)}
                                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                                />
                                <span>Coupon is active and redeemable at checkout</span>
                            </label>

                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={submitting}>
                                    {submitting ? 'Saving...' : editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                                </button>
                            </div>
                        </form>
                    </div>
                </>
            )}
        </AdminLayout>
    );
}
