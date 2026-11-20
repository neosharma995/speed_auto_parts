import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Plus, Edit, Trash2 } from 'lucide-react';

export default function AdminAttributesIndex({ attributes = [] }) {
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleCreate = (e) => {
        e.preventDefault();
        setSubmitting(true);
        router.post('/admin/attributes', { name, slug, description }, {
            onSuccess: () => {
                setName('');
                setSlug('');
                setDescription('');
            },
            onFinish: () => setSubmitting(false),
        });
    };

    const handleDelete = (id, attrName) => {
        if (confirm(`Delete attribute "${attrName}"?`)) {
            router.delete(`/admin/attributes/${id}`);
        }
    };

    return (
        <AdminLayout title="Product Attributes Management">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                {/* Form */}
                <div className="admin-card">
                    <div className="admin-card-header">
                        <h3>Add New Dynamic Attribute</h3>
                    </div>
                    <div className="admin-card-body">
                        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div className="form-group">
                                <label className="form-label">Attribute Name (e.g. Rotor Diameter, Tire Width)</label>
                                <input type="text" className="form-input" required value={name} onChange={e => setName(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Slug</label>
                                <input type="text" className="form-input" value={slug} onChange={e => setSlug(e.target.value)} placeholder="rotor-diameter" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea className="form-textarea" value={description} onChange={e => setDescription(e.target.value)} style={{ minHeight: '60px' }} />
                            </div>
                            <button type="submit" className="btn btn-primary" disabled={submitting}>
                                <Plus size={16} /> Save Attribute
                            </button>
                        </form>
                    </div>
                </div>

                {/* List */}
                <div className="admin-card">
                    <div className="admin-card-header">
                        <h3>Existing Attributes ({attributes.length})</h3>
                    </div>
                    <div className="admin-card-body" style={{ padding: 0 }}>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Slug</th>
                                    <th>Values</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attributes.map(attr => (
                                    <tr key={attr.id}>
                                        <td><strong>{attr.name}</strong></td>
                                        <td><code>{attr.slug}</code></td>
                                        <td>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                                {attr.values?.map(v => (
                                                    <span key={v.id} className="badge badge-neutral" style={{ fontSize: '10px' }}>
                                                        {v.value}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td>
                                            <button type="button" className="btn btn-outline btn-sm" style={{ color: '#D93025' }} onClick={() => handleDelete(attr.id, attr.name)}>
                                                <Trash2 size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
