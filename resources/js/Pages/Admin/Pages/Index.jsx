import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import AdminDataTable from '@/Components/Admin/AdminDataTable';
import { Plus, Edit, Trash2, ExternalLink, Search, Layers } from 'lucide-react';

export default function AdminPagesIndex({ pages = [], filters = {} }) {
    const rows = Array.isArray(pages) ? pages : (pages?.data || []);
    const totalCount = Array.isArray(pages) ? pages.length : (pages?.total ?? rows.length);

    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/admin/pages', { search: search || undefined }, { preserveState: true });
    };

    const handleDelete = (id, pageTitle) => {
        if (confirm(`Delete page "${pageTitle}"?`)) {
            router.delete(`/admin/pages/${id}`);
        }
    };

    const columns = [
        {
            key: 'title',
            label: 'Page Title & URL',
            render: (page) => (
                <div>
                    <strong style={{ display: 'block', color: '#151515' }}>{page.title}</strong>
                    <small style={{ color: '#64748B', fontFamily: 'monospace' }}>/{page.slug}</small>
                </div>
            ),
        },
        {
            key: 'sections',
            label: 'Sections',
            render: (page) => {
                const count = Array.isArray(page.sections) ? page.sections.length : 0;
                return (
                    <span className="badge badge-info" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        <Layers size={12} />
                        {count} {count === 1 ? 'section' : 'sections'}
                    </span>
                );
            },
        },
        {
            key: 'languages',
            label: 'Languages',
            render: (page) => {
                const hasAr = Boolean(page.translations?.ar?.title && page.translations?.ar?.content);
                const hasFr = Boolean(page.translations?.fr?.title && page.translations?.fr?.content);
                return (
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        <span className="badge badge-success">EN</span>
                        <span className={`badge ${hasAr ? 'badge-success' : 'badge-warning'}`}>AR</span>
                        <span className={`badge ${hasFr ? 'badge-success' : 'badge-warning'}`}>FR</span>
                    </div>
                );
            },
        },
        {
            key: 'status',
            label: 'Status',
            render: (page) => (
                <span className={`badge ${page.is_active ? 'badge-success' : 'badge-danger'}`}>
                    {page.is_active ? 'Active' : 'Hidden'}
                </span>
            ),
        },
        {
            key: 'updated_at',
            label: 'Last Updated',
            render: (page) => (page.updated_at ? new Date(page.updated_at).toLocaleDateString() : '—'),
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (page) => (
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <a
                        href={`/${page.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-outline btn-sm"
                        title="View Live Page"
                    >
                        <ExternalLink size={14} />
                    </a>
                    <Link
                        href={`/admin/pages/${page.id}/edit`}
                        className="btn btn-outline btn-sm"
                        title="Edit Page & Sections"
                    >
                        <Edit size={14} />
                    </Link>
                    <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        style={{ color: '#D93025' }}
                        onClick={() => handleDelete(page.id, page.title)}
                        title="Delete Page"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <AdminLayout title="Dynamic CMS Pages">
            <AdminDataTable
                title="Storefront Information & Support Pages"
                count={totalCount}
                actions={
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '6px' }}>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Search title or slug..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                style={{ width: '210px', height: '34px', fontSize: '13px' }}
                            />
                            <button type="submit" className="btn btn-dark btn-sm">
                                <Search size={14} /> Filter
                            </button>
                        </form>
                        <Link href="/admin/pages/create" className="btn btn-primary btn-sm">
                            <Plus size={16} /> Add Page
                        </Link>
                    </div>
                }
                columns={columns}
                rows={rows}
                pagination={Array.isArray(pages) ? null : pages}
                itemLabel="pages"
                emptyMessage="No dynamic pages found."
            />
        </AdminLayout>
    );
}
