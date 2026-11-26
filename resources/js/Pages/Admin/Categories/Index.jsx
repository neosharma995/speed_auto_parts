import React, { useRef, useState } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import AdminDataTable from '@/Components/Admin/AdminDataTable';
import { Plus, Edit, Trash2, Upload } from 'lucide-react';

export default function AdminCategoriesIndex({ categories = [] }) {
    const rows = Array.isArray(categories) ? categories : (categories?.data || []);
    const totalCount = Array.isArray(categories) ? categories.length : (categories?.total ?? rows.length);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [contentLang, setContentLang] = useState('en');
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [description, setDescription] = useState('');
    const [translations, setTranslations] = useState({ ar: { name: '', description: '' }, fr: { name: '', description: '' } });
    const [image, setImage] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [icon, setIcon] = useState('Disc');
    const [submitting, setSubmitting] = useState(false);
    const fileInputRef = useRef(null);

    const updateTranslation = (langCode, field, val) => {
        setTranslations((prev) => ({
            ...prev,
            [langCode]: {
                ...(prev[langCode] || {}),
                [field]: val,
            },
        }));
    };

    const openCreate = () => {
        setEditingId(null);
        setContentLang('en');
        setName('');
        setSlug('');
        setDescription('');
        setTranslations({ ar: { name: '', description: '' }, fr: { name: '', description: '' } });
        setImage('');
        setImageFile(null);
        setImagePreview('');
        setIcon('Disc');
        setShowModal(true);
    };

    const openEdit = (cat) => {
        setEditingId(cat.id);
        setContentLang('en');
        setName(cat.name);
        setSlug(cat.slug);
        setDescription(cat.description || '');
        setTranslations({
            ar: {
                name: cat.translations?.ar?.name || '',
                description: cat.translations?.ar?.description || '',
            },
            fr: {
                name: cat.translations?.fr?.name || '',
                description: cat.translations?.fr?.description || '',
            },
        });
        setImage(cat.image || '');
        setImageFile(null);
        setImagePreview(cat.image || '');
        setIcon(cat.icon || 'Disc');
        setShowModal(true);
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0] || null;
        setImageFile(file);
        if (file) {
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSave = (e) => {
        e.preventDefault();
        setSubmitting(true);
        const data = {
            name,
            slug,
            description,
            translations: JSON.stringify(translations),
            image,
            icon,
        };
        if (imageFile) {
            data.image_file = imageFile;
        }

        if (editingId) {
            router.post(
                `/admin/categories/${editingId}`,
                { ...data, _method: 'put' },
                {
                    forceFormData: true,
                    onSuccess: () => setShowModal(false),
                    onFinish: () => setSubmitting(false),
                }
            );
        } else {
            router.post('/admin/categories', data, {
                forceFormData: true,
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
                    src={
                        cat.image && (cat.image.startsWith('/assets/') || cat.image.startsWith('/storage/') || cat.image.startsWith('http'))
                            ? cat.image
                            : `/assets/images/categories/${cat.slug}.webp`
                    }
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
                count={totalCount}
                actions={
                    <button type="button" className="btn btn-primary btn-sm" onClick={openCreate}>
                        <Plus size={16} /> Add Category
                    </button>
                }
                columns={columns}
                rows={rows}
                pagination={Array.isArray(categories) ? null : categories}
                itemLabel="categories"
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
                        <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '14px' }}>
                            {editingId ? 'Edit Category' : 'Create Category'}
                        </h3>
                        <div style={{ display: 'flex', gap: '6px', marginBottom: '14px' }}>
                            {[
                                { code: 'en', label: 'EN (Default)' },
                                { code: 'ar', label: 'AR (العربية)' },
                                { code: 'fr', label: 'FR (Français)' },
                            ].map((item) => {
                                const active = contentLang === item.code;
                                return (
                                    <button
                                        key={item.code}
                                        type="button"
                                        onClick={() => setContentLang(item.code)}
                                        style={{
                                            padding: '4px 10px',
                                            borderRadius: '4px',
                                            fontSize: '12px',
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                            border: active ? '1px solid #F36B16' : '1px solid #CBD5E1',
                                            backgroundColor: active ? '#F36B16' : '#FFFFFF',
                                            color: active ? '#FFFFFF' : '#334155',
                                        }}
                                    >
                                        {item.label}
                                    </button>
                                );
                            })}
                        </div>
                        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            {contentLang === 'en' ? (
                                <div className="form-group">
                                    <label className="form-label">Category Name (English)</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                            ) : (
                                <div className="form-group">
                                    <label className="form-label">
                                        Category Name ({contentLang === 'ar' ? 'Arabic — العربية' : 'French — Français'})
                                    </label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        dir={contentLang === 'ar' ? 'rtl' : 'ltr'}
                                        placeholder={contentLang === 'ar' ? 'اسم الفئة بالعربية...' : 'Nom de la catégorie...'}
                                        value={translations[contentLang]?.name || ''}
                                        onChange={(e) => updateTranslation(contentLang, 'name', e.target.value)}
                                    />
                                </div>
                            )}
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
                            {contentLang === 'en' ? (
                                <div className="form-group">
                                    <label className="form-label">Description (English)</label>
                                    <textarea
                                        className="form-textarea"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        style={{ minHeight: '60px' }}
                                    />
                                </div>
                            ) : (
                                <div className="form-group">
                                    <label className="form-label">
                                        Description ({contentLang === 'ar' ? 'Arabic — العربية' : 'French — Français'})
                                    </label>
                                    <textarea
                                        className="form-textarea"
                                        dir={contentLang === 'ar' ? 'rtl' : 'ltr'}
                                        placeholder={contentLang === 'ar' ? 'وصف الفئة بالعربية...' : 'Description en français...'}
                                        value={translations[contentLang]?.description || ''}
                                        onChange={(e) => updateTranslation(contentLang, 'description', e.target.value)}
                                        style={{ minHeight: '60px' }}
                                    />
                                </div>
                            )}
                            <div className="form-group">
                                <label className="form-label">Category Image</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                    {(imagePreview || image) && (
                                        <img
                                            src={imagePreview || image}
                                            alt="Category Preview"
                                            style={{
                                                width: '54px',
                                                height: '54px',
                                                objectFit: 'cover',
                                                borderRadius: '6px',
                                                border: '1px solid #E2E8F0',
                                                backgroundColor: '#F8FAFC',
                                            }}
                                        />
                                    )}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            style={{ display: 'none' }}
                                            onChange={handleFileChange}
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-outline btn-sm"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <Upload size={14} /> {imageFile ? 'Change Image' : 'Upload Image'}
                                        </button>
                                        {imageFile && (
                                            <small style={{ color: '#059669', fontSize: '11px', fontWeight: 600 }}>
                                                Selected: {imageFile.name}
                                            </small>
                                        )}
                                    </div>
                                </div>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Or paste image URL / path"
                                    value={image}
                                    onChange={(e) => {
                                        setImage(e.target.value);
                                        if (!imageFile) setImagePreview(e.target.value);
                                    }}
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
