import React from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import AdminDataTable from '@/Components/Admin/AdminDataTable';
import { Star, Trash2 } from 'lucide-react';

export default function AdminReviewsIndex({ reviews = [] }) {
    const rows = Array.isArray(reviews) ? reviews : (reviews?.data || []);
    const totalCount = Array.isArray(reviews) ? reviews.length : (reviews?.total ?? rows.length);
    const handleToggleApprove = (id) => {
        router.post(`/admin/reviews/${id}/toggle-approve`);
    };

    const handleDelete = (id) => {
        if (confirm('Delete this review?')) {
            router.delete(`/admin/reviews/${id}`);
        }
    };

    const columns = [
        {
            key: 'product',
            label: 'Product',
            render: (rev) => <strong>{rev.product?.name || '—'}</strong>,
        },
        {
            key: 'reviewer',
            label: 'Reviewer',
            render: (rev) => (
                <>
                    <span>{rev.reviewer_name}</span>
                    <small style={{ display: 'block', color: '#888' }}>{rev.reviewer_email}</small>
                </>
            ),
        },
        {
            key: 'rating',
            label: 'Rating',
            render: (rev) => (
                <div style={{ display: 'flex', color: '#E37400' }}>
                    {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} size={12} fill="#E37400" />
                    ))}
                </div>
            ),
        },
        {
            key: 'comment',
            label: 'Comment',
            cellStyle: { maxWidth: '350px' },
            render: (rev) => (
                <>
                    <strong>{rev.title}</strong>
                    <p style={{ fontSize: '12px', color: '#555', marginTop: '2px' }}>{rev.comment}</p>
                </>
            ),
        },
        {
            key: 'is_approved',
            label: 'Status',
            render: (rev) => (
                <span className={`badge ${rev.is_approved ? 'badge-success' : 'badge-warning'}`}>
                    {rev.is_approved ? 'Approved' : 'Pending'}
                </span>
            ),
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (rev) => (
                <div style={{ display: 'flex', gap: '6px' }}>
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => handleToggleApprove(rev.id)}>
                        {rev.is_approved ? 'Unapprove' : 'Approve'}
                    </button>
                    <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        style={{ color: '#D93025' }}
                        onClick={() => handleDelete(rev.id)}
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <AdminLayout title="Customer Reviews & Ratings">
            <AdminDataTable
                title="Product Reviews Moderation"
                count={totalCount}
                columns={columns}
                rows={rows}
                pagination={Array.isArray(reviews) ? null : reviews}
                itemLabel="reviews"
                emptyMessage="No customer reviews found."
            />
        </AdminLayout>
    );
}
