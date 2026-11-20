import React from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Star, CheckCircle, XCircle, Trash2 } from 'lucide-react';

export default function AdminReviewsIndex({ reviews = [] }) {
    const handleToggleApprove = (id, currentStatus) => {
        router.post(`/admin/reviews/${id}/toggle-approve`);
    };

    const handleDelete = (id) => {
        if (confirm('Delete this review?')) {
            router.delete(`/admin/reviews/${id}`);
        }
    };

    return (
        <AdminLayout title="Customer Reviews & Ratings">
            <div className="admin-card">
                <div className="admin-card-header">
                    <h3>Product Reviews Moderation ({reviews.length})</h3>
                </div>
                <div className="admin-card-body" style={{ padding: 0 }}>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Reviewer</th>
                                <th>Rating</th>
                                <th>Comment</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reviews.map(rev => (
                                <tr key={rev.id}>
                                    <td><strong>{rev.product?.name || '—'}</strong></td>
                                    <td>
                                        <span>{rev.reviewer_name}</span>
                                        <small style={{ display: 'block', color: '#888' }}>{rev.reviewer_email}</small>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', color: '#E37400' }}>
                                            {[...Array(rev.rating)].map((_, i) => (
                                                <Star key={i} size={12} fill="#E37400" />
                                            ))}
                                        </div>
                                    </td>
                                    <td style={{ maxWidth: '350px' }}>
                                        <strong>{rev.title}</strong>
                                        <p style={{ fontSize: '12px', color: '#555', marginTop: '2px' }}>{rev.comment}</p>
                                    </td>
                                    <td>
                                        <span className={`badge ${rev.is_approved ? 'badge-success' : 'badge-warning'}`}>
                                            {rev.is_approved ? 'Approved' : 'Pending'}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '6px' }}>
                                            <button 
                                                type="button" 
                                                className="btn btn-outline btn-sm"
                                                onClick={() => handleToggleApprove(rev.id, rev.is_approved)}
                                            >
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
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
