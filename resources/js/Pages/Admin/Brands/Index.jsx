import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Plus, Edit, Trash2, ExternalLink } from 'lucide-react';

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

    return (
        <AdminLayout title="Brand Management">
            <div className="admin-card">
                <div className="admin-card-header">
                    <h3>All Certified Brands ({brands.length})</h3>
                    <button type="button" className="btn btn-primary btn-sm" onClick={openCreate}>
                        <Plus size={16} /> Add Brand
                    </button>
                </div>

                <div className="admin-card-body" style={{ padding: 0 }}>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Brand Name</th>
                                <th>Slug</th>
                                <th>Website</th>
                                <th>Description</th>
                                <th>Products</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {brands.map(brand => (
                                <tr key={brand.id}>
                                    <td><strong>{brand.name}</strong></td>
                                    <td><code>{brand.slug}</code></td>
                                    <td>
                                        {brand.website ? (
                                            <a href={brand.website} target="_blank" rel="noreferrer" style={{ color: '#F36B16' }}>
                                                {brand.website} ↗
                                            </a>
                                        ) : '—'}
                                    </td>
                                    <td style={{ maxWidth: '300px' }}>{brand.description}</td>
                                    <td>{brand.products_count || 0}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '6px' }}>
                                            <button type="button" className="btn btn-outline btn-sm" onClick={() => openEdit(brand)}>
                                                <Edit size={14} />
                                            </button>
                                            <button type="button" className="btn btn-outline btn-sm" style={{ color: '#D93025' }} onClick={() => handleDelete(brand.id, brand.name)}>
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <>
                    <div className="header-backdrop" onClick={() => setShowModal(false)} />
                    <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: '#FFF', borderRadius: '8px', padding: '32px', width: '90%', maxWidth: '500px', zIndex: 2200, boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '20px' }}>
                            {editingId ? 'Edit Brand' : 'Create Brand'}
                        </h3>
                        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div className="form-group">
                                <label className="form-label">Brand Name</label>
                                <input type="text" className="form-input" required value={name} onChange={e => setName(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Slug</label>
                                <input type="text" className="form-input" value={slug} onChange={e => setSlug(e.target.value)} placeholder="Auto-generated if blank" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Website URL</label>
                                <input type="url" className="form-input" value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://..." />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea className="form-textarea" value={description} onChange={e => setDescription(e.target.value)} style={{ minHeight: '60px' }} />
                            </div>
                            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submitting}>Save</button>
                            </div>
                        </form>
                    </div>
                </>
            )}
        </AdminLayout>
    );
}
