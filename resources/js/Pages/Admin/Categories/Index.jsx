import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import AdminDataTable from '@/Components/Admin/AdminDataTable';
import { Plus, Edit, Trash2 } from 'lucide-react';

export default function AdminCategoriesIndex({ categories = [] }) {
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState('');
    const [icon, setIcon] = useState('Disc');
    const [submitting, setSubmitting] = useState(false);

    const openCreate = () => {
        setEditingId(null);
        setName('');
        setSlug('');
        setDescription('');
        setImage('');
        setIcon('Disc');
        setShowModal(true);
    };

    const openEdit = (cat) => {
        setEditingId(cat.id);
        setName(cat.name);
        setSlug(cat.slug);
        setDescription(cat.description || '');
        setImage(cat.image || '');
        setIcon(cat.icon || 'Disc');
        setShowModal(true);
    };

    const handleSave = (e) => {
        e.preventDefault();
        setSubmitting(true);
        const data = { name, slug, description, image, icon };

        if (editingId) {
            router.put(`/admin/categories/${editingId}`, data, {
                onSuccess: () => setShowModal(false),
                onFinish: () => setSubmitting(false),
            });
        } else {
            router.post('/admin/categories', data, {
                onSuccess: () => setShowModal(false),
                onFinish: () => setSubmitting(false),
            });
        }
    };

    const handleDelete = (id, catName) => {
        if (confirm(`Delete category "${catName}"?`)) {
            router.delete(`/admin/categories/${id}`);
        }
    };

    const columns = [
        {
            key: 'image',
            label: 'Image',
            width: '60px',
            render: (cat) => (
                <img
                    src={cat.image?.startsWith('/assets/') ? cat.image : `/assets/images/categories/${cat.slug}.webp`}
                    alt={cat.name}
                    onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = `/assets/images/categories/${cat.slug}.webp`;
                    }}
                    style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '4px' }}
                />
            ),
        },
        {
            key: 'name',
            label: 'Name & Slug',
            render: (cat) => (
                <>
                    <strong>{cat.name}</strong>
                    <small style={{ display: 'block', color: '#64748B' }}>/{cat.slug}</small>
                </>
            ),
        },
        {
            key: 'description',
            label: 'Description',
            cellStyle: { maxWidth: '300px' },
        },
        {
            key: 'icon',
            label: 'Icon',
            render: (cat) => <code>{cat.icon || 'Disc'}</code>,
        },
        {
            key: 'products_count',
            label: 'Products',
            render: (cat) => `${cat.products_count || 0} items`,
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (cat) => (
                <div style={{ display: 'flex', gap: '6px' }}>
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => openEdit(cat)}>
                        <Edit size={14} />
                    </button>
                    <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        style={{ color: '#D93025' }}
                        onClick={() => handleDelete(cat.id, cat.name)}
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <AdminLayout title="Category Management">
            <AdminDataTable
                title="All Product Categories"
                count={categories.length}
                actions={
                    <button type="button" className="btn btn-primary btn-sm" onClick={openCreate}>
                        <Plus size={16} /> Add Category
                    </button>
                }
                columns={columns}
                rows={categories}
                emptyMessage="No categories found."
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
                            {editingId ? 'Edit Category' : 'Create Category'}
                        </h3>
                        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div className="form-group">
                                <label className="form-label">Category Name</label>
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
                                <label className="form-label">Description</label>
                                <textarea
                                    className="form-textarea"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    style={{ minHeight: '60px' }}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Image URL</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={image}
                                    onChange={(e) => setImage(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Lucide Icon Name</label>
                                <select className="form-select" value={icon} onChange={(e) => setIcon(e.target.value)}>
                                    <option value="Disc">Disc (Tires/Wheels)</option>
                                    <option value="ShieldAlert">ShieldAlert (Brakes)</option>
                                    <option value="Wind">Wind (Intake)</option>
                                    <option value="Flame">Flame (Exhaust)</option>
                                    <option value="GitCommit">GitCommit (Suspension)</option>
                                </select>
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
