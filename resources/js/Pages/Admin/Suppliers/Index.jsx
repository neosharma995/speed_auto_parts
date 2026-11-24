import React, { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import AdminDataTable from '@/Components/Admin/AdminDataTable';
import { Plus, Edit, Trash2, X } from 'lucide-react';

export default function AdminSuppliersIndex({ suppliers, filters = {} }) {
    const safeFilters = filters && !Array.isArray(filters) ? filters : {};
    const { errors } = usePage().props;

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
        <AdminLayout title="Suppliers Management">
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
        </AdminLayout>
    );
}
