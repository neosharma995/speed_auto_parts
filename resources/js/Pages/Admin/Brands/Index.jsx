import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import AdminDataTable from '@/Components/Admin/AdminDataTable';
import { Plus, Edit, Trash2 } from 'lucide-react';

export default function AdminBrandsIndex({ brands = [] }) {
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [website, setWebsite] = useState('');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const openCreate = () => {
        setEditingId(null);
        setName('');
        setSlug('');
        setWebsite('');
        setDescription('');
        setShowModal(true);
    };

    const openEdit = (b) => {
        setEditingId(b.id);
        setName(b.name);
        setSlug(b.slug);
        setWebsite(b.website || '');
        setDescription(b.description || '');
        setShowModal(true);
    };

    const handleSave = (e) => {
        e.preventDefault();
        setSubmitting(true);
        const data = { name, slug, website, description };

        if (editingId) {
            router.put(`/admin/brands/${editingId}`, data, {
                onSuccess: () => setShowModal(false),
                onFinish: () => setSubmitting(false),
            });
        } else {
            router.post('/admin/brands', data, {
                onSuccess: () => setShowModal(false),
                onFinish: () => setSubmitting(false),
            });
        }
    };

    const handleDelete = (id, brandName) => {
        if (confirm(`Delete brand "${brandName}"?`)) {
            router.delete(`/admin/brands/${id}`);
        }
    };

    const columns = [
        {
            key: 'name',
            label: 'Brand Name',
            render: (brand) => <strong>{brand.name}</strong>,
        },
        {
            key: 'slug',
            label: 'Slug',
            render: (brand) => <code>{brand.slug}</code>,
        },
        {
            key: 'website',
            label: 'Website',
            render: (brand) =>
                brand.website ? (
                    <a href={brand.website} target="_blank" rel="noreferrer" style={{ color: '#F36B16' }}>
                        {brand.website} ↗
                    </a>
                ) : (
                    '—'
                ),
        },
        {
            key: 'description',
            label: 'Description',
            cellStyle: { maxWidth: '300px' },
        },
        {
            key: 'products_count',
            label: 'Products',
            render: (brand) => brand.products_count || 0,
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (brand) => (
                <div style={{ display: 'flex', gap: '6px' }}>
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => openEdit(brand)}>
                        <Edit size={14} />
                    </button>
                    <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        style={{ color: '#D93025' }}
                        onClick={() => handleDelete(brand.id, brand.name)}
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <AdminLayout title="Brand Management">
            <AdminDataTable
                title="All Certified Brands"
                count={brands.length}
                actions={
                    <button type="button" className="btn btn-primary btn-sm" onClick={openCreate}>
                        <Plus size={16} /> Add Brand
                    </button>
                }
                columns={columns}
                rows={brands}
                emptyMessage="No brands found."
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
                            padding: '32px',
                            width: '90%',
                            maxWidth: '500px',
                            zIndex: 2200,
                            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                        }}
                    >
                        <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '20px' }}>
                            {editingId ? 'Edit Brand' : 'Create Brand'}
                        </h3>
                        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div className="form-group">
                                <label className="form-label">Brand Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Slug</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value)}
                                    placeholder="Auto-generated if blank"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Website URL</label>
                                <input
                                    type="url"
                                    className="form-input"
                                    value={website}
                                    onChange={(e) => setWebsite(e.target.value)}
                                    placeholder="https://..."
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea
                                    className="form-textarea"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    style={{ minHeight: '60px' }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    style={{ flex: 1 }}
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submitting}>
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </>
            )}
        </AdminLayout>
    );
}
