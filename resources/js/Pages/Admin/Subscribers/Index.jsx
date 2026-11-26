import React, { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import AdminDataTable from '@/Components/Admin/AdminDataTable';
import { Plus, Trash2, Download, X, Mail, CheckCircle2, XCircle } from 'lucide-react';

export default function AdminSubscribersIndex({ subscribers, filters = {}, stats = {} }) {
    const safeFilters = filters && !Array.isArray(filters) ? filters : {};
    const { errors } = usePage().props;

    const items = subscribers?.data || [];
    const totalCount = subscribers?.total ?? items.length;

    const [search, setSearch] = useState(safeFilters.search || '');
    const [statusFilter, setStatusFilter] = useState(safeFilters.status || '');
    const [showModal, setShowModal] = useState(false);
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [status, setStatus] = useState('subscribed');
    const [submitting, setSubmitting] = useState(false);

    const hasActiveFilters = Boolean(
        (safeFilters.search && String(safeFilters.search).trim() !== '') || safeFilters.status
    );

    const applyFilters = (next = {}) => {
        const nextSearch = next.search !== undefined ? next.search : search;
        const nextStatus = next.status !== undefined ? next.status : statusFilter;

        const params = {};
        if (nextSearch && nextSearch.trim()) params.search = nextSearch.trim();
        if (nextStatus) params.status = nextStatus;

        router.get('/admin/subscribers', params, { preserveState: true, replace: true });
    };

    const handleStatusChange = (val) => {
        setStatusFilter(val);
        applyFilters({ status: val });
    };

    const handleResetFilters = () => {
        setSearch('');
        setStatusFilter('');
        router.get('/admin/subscribers', {}, { preserveState: true, replace: true });
    };

    const handleCreate = (e) => {
        e.preventDefault();
        setSubmitting(true);
        router.post(
            '/admin/subscribers',
            { email, name: name || null, status },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setShowModal(false);
                    setEmail('');
                    setName('');
                    setStatus('subscribed');
                },
                onFinish: () => setSubmitting(false),
            }
        );
    };

    const handleToggleStatus = (sub) => {
        router.post(`/admin/subscribers/${sub.id}/toggle-status`, {}, { preserveScroll: true });
    };

    const handleDelete = (sub) => {
        if (confirm(`Remove subscriber "${sub.email}"?`)) {
            router.delete(`/admin/subscribers/${sub.id}`, { preserveScroll: true });
        }
    };

    const columns = [
        {
            key: 'email',
            label: 'Email Address',
            render: (sub) => (
                <>
                    <strong>{sub.email}</strong>
                    {sub.name && <small style={{ display: 'block', color: '#64748B' }}>{sub.name}</small>}
                </>
            ),
        },
        {
            key: 'source',
            label: 'Source',
            render: (sub) => (
                <span className="badge badge-neutral" style={{ textTransform: 'capitalize' }}>
                    {sub.source || 'footer'}
                </span>
            ),
        },
        {
            key: 'status',
            label: 'Status',
            render: (sub) => (
                <span
                    className={`badge ${sub.status === 'subscribed' ? 'badge-success' : 'badge-neutral'}`}
                    style={{ textTransform: 'capitalize' }}
                >
                    {sub.status}
                </span>
            ),
        },
        {
            key: 'subscribed_at',
            label: 'Subscribed Date',
            render: (sub) =>
                sub.subscribed_at
                    ? new Date(sub.subscribed_at).toLocaleDateString()
                    : new Date(sub.created_at).toLocaleDateString(),
        },
        {
            key: 'actions',
            label: 'Actions',
            align: 'right',
            render: (sub) => (
                <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                    <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => handleToggleStatus(sub)}
                        title={sub.status === 'subscribed' ? 'Mark Unsubscribed' : 'Resubscribe'}
                    >
                        {sub.status === 'subscribed' ? (
                            <>
                                <XCircle size={13} /> Unsubscribe
                            </>
                        ) : (
                            <>
                                <CheckCircle2 size={13} /> Resubscribe
                            </>
                        )}
                    </button>
                    <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        style={{ color: '#D93025', borderColor: '#FECDD3' }}
                        onClick={() => handleDelete(sub)}
                        title="Delete Subscriber"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            ),
        },
    ];

    const exportHref = statusFilter
        ? `/admin/subscribers/export?status=${encodeURIComponent(statusFilter)}`
        : '/admin/subscribers/export';

    return (
        <AdminLayout title="Newsletter Subscribers">
            <div className="stats-grid" style={{ marginBottom: '18px' }}>
                <div className="stat-card">
                    <div className="stat-info">
                        <span>Total Subscribers</span>
                        <strong>{stats.total ?? totalCount}</strong>
                    </div>
                    <div className="stat-icon stat-icon--primary">
                        <Mail size={22} />
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-info">
                        <span>Active Subscribed</span>
                        <strong>{stats.subscribed ?? 0}</strong>
                    </div>
                    <div className="stat-icon stat-icon--success">
                        <CheckCircle2 size={22} />
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-info">
                        <span>Unsubscribed</span>
                        <strong>{stats.unsubscribed ?? 0}</strong>
                    </div>
                    <div className="stat-icon stat-icon--warning">
                        <XCircle size={22} />
                    </div>
                </div>
            </div>

            <AdminDataTable
                title="Newsletter Mailing List"
                count={totalCount}
                search={{
                    value: search,
                    onChange: setSearch,
                    placeholder: 'Search by email or subscriber name...',
                }}
                filters={[
                    {
                        key: 'status',
                        value: statusFilter,
                        onChange: handleStatusChange,
                        placeholder: 'All Statuses',
                        options: [
                            { value: 'subscribed', label: 'Subscribed' },
                            { value: 'unsubscribed', label: 'Unsubscribed' },
                        ],
                    },
                ]}
                onSearch={() => applyFilters()}
                searchButtonLabel="Filter"
                hasActiveFilters={hasActiveFilters}
                onReset={handleResetFilters}
                actions={
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <a href={exportHref} className="btn btn-outline btn-sm">
                            <Download size={15} /> Export CSV
                        </a>
                        <button type="button" className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
                            <Plus size={15} /> Add Subscriber
                        </button>
                    </div>
                }
                columns={columns}
                rows={items}
                emptyMessage="No newsletter subscribers yet. Subscriptions from the website footer will appear here automatically."
                pagination={subscribers}
                itemLabel="subscribers"
            />

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
                            padding: '24px',
                            width: '92%',
                            maxWidth: '460px',
                            zIndex: 2200,
                            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                            <h3 style={{ fontSize: '17px', fontWeight: 800 }}>Add Newsletter Subscriber</h3>
                            <button type="button" onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none' }}>
                                <X size={18} />
                            </button>
                        </div>

                        {errors && Object.keys(errors).length > 0 && (
                            <div
                                style={{
                                    backgroundColor: '#FFF1F2',
                                    color: '#D93025',
                                    padding: '10px 12px',
                                    borderRadius: '4px',
                                    marginBottom: '12px',
                                    fontSize: '12px',
                                }}
                            >
                                {Object.values(errors).map((err, idx) => (
                                    <div key={idx}>{err}</div>
                                ))}
                            </div>
                        )}

                        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div className="form-group">
                                <label className="form-label">Email Address *</label>
                                <input
                                    type="email"
                                    className="form-input"
                                    required
                                    placeholder="customer@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Name (Optional)</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Subscriber full name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Status</label>
                                <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                                    <option value="subscribed">Subscribed</option>
                                    <option value="unsubscribed">Unsubscribed</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    style={{ flex: 1 }}
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submitting}>
                                    {submitting ? 'Saving...' : 'Save Subscriber'}
                                </button>
                            </div>
                        </form>
                    </div>
                </>
            )}
        </AdminLayout>
    );
}
