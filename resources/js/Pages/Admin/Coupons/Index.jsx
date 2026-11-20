import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Plus, Percent, Trash2 } from 'lucide-react';

export default function AdminCouponsIndex({ coupons = [] }) {
    const [code, setCode] = useState('');
    const [type, setType] = useState('percentage');
    const [value, setValue] = useState('');
    const [minSpend, setMinSpend] = useState('0');
    const [maxDiscount, setMaxDiscount] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleCreate = (e) => {
        e.preventDefault();
        setSubmitting(true);
        router.post('/admin/coupons', {
            code: code.toUpperCase().trim(),
            type,
            value: parseFloat(value),
            min_spend: parseFloat(minSpend) || 0,
            max_discount: maxDiscount ? parseFloat(maxDiscount) : null,
        }, {
            onSuccess: () => {
                setCode('');
                setValue('');
                setMinSpend('0');
                setMaxDiscount('');
            },
            onFinish: () => setSubmitting(false),
        });
    };

    const handleDelete = (id, couponCode) => {
        if (confirm(`Delete coupon "${couponCode}"?`)) {
            router.delete(`/admin/coupons/${id}`);
        }
    };

    return (
        <AdminLayout title="Coupon & Discount Management">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
                <div className="admin-card">
                    <div className="admin-card-header">
                        <h3>Create Promo Code</h3>
                    </div>
                    <div className="admin-card-body">
                        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div className="form-group">
                                <label className="form-label">Coupon Code (Uppercase)</label>
                                <input type="text" className="form-input" required value={code} onChange={e => setCode(e.target.value)} placeholder="e.g. TRACKDAY" style={{ textTransform: 'uppercase' }} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Discount Type</label>
                                <select className="form-select" value={type} onChange={e => setType(e.target.value)}>
                                    <option value="percentage">Percentage (%)</option>
                                    <option value="fixed">Fixed Rupee (₹)</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Value (Amount or %)</label>
                                <input type="number" step="0.01" className="form-input" required value={value} onChange={e => setValue(e.target.value)} placeholder="10" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Min Spend Required (₹)</label>
                                <input type="number" step="0.01" className="form-input" value={minSpend} onChange={e => setMinSpend(e.target.value)} />
                            </div>
                            {type === 'percentage' && (
                                <div className="form-group">
                                    <label className="form-label">Max Discount Cap (₹ Optional)</label>
                                    <input type="number" step="0.01" className="form-input" value={maxDiscount} onChange={e => setMaxDiscount(e.target.value)} placeholder="3000" />
                                </div>
                            )}
                            <button type="submit" className="btn btn-primary" disabled={submitting}>
                                <Plus size={16} /> Save Coupon
                            </button>
                        </form>
                    </div>
                </div>

                <div className="admin-card">
                    <div className="admin-card-header">
                        <h3>Active Coupons ({coupons.length})</h3>
                    </div>
                    <div className="admin-card-body" style={{ padding: 0 }}>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Code</th>
                                    <th>Type</th>
                                    <th>Discount</th>
                                    <th>Min Spend</th>
                                    <th>Used</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {coupons.map(c => (
                                    <tr key={c.id}>
                                        <td><strong>{c.code}</strong></td>
                                        <td><span className="badge badge-neutral" style={{ textTransform: 'capitalize' }}>{c.type}</span></td>
                                        <td><strong>{c.type === 'percentage' ? `${c.value}%` : `₹${c.value}`}</strong></td>
                                        <td>₹{Number(c.min_spend).toLocaleString('en-IN')}</td>
                                        <td>{c.times_used || 0} times</td>
                                        <td>
                                            <button type="button" className="btn btn-outline btn-sm" style={{ color: '#D93025' }} onClick={() => handleDelete(c.id, c.code)}>
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
