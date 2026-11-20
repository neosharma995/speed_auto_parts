import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Plus, Receipt, Save } from 'lucide-react';

export default function AdminTaxesIndex({ taxClasses = [] }) {
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [ratePercent, setRatePercent] = useState('18.00');
    const [submitting, setSubmitting] = useState(false);

    const handleCreate = (e) => {
        e.preventDefault();
        setSubmitting(true);
        const rate = parseFloat(ratePercent);
        router.post('/admin/taxes', {
            name,
            slug,
            rate: rate,
            cgst_rate: rate / 2,
            sgst_rate: rate / 2,
            igst_rate: rate,
        }, {
            onSuccess: () => {
                setName('');
                setSlug('');
                setRatePercent('18.00');
            },
            onFinish: () => setSubmitting(false),
        });
    };

    return (
        <AdminLayout title="Indian GST & Tax Management">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
                <div className="admin-card">
                    <div className="admin-card-header">
                        <h3>Create Tax Class</h3>
                    </div>
                    <div className="admin-card-body">
                        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div className="form-group">
                                <label className="form-label">Tax Class Name</label>
                                <input type="text" className="form-input" required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Standard Auto Parts GST 18%" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Slug</label>
                                <input type="text" className="form-input" value={slug} onChange={e => setSlug(e.target.value)} placeholder="gst-18" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Total GST Rate (%)</label>
                                <input type="number" step="0.01" className="form-input" required value={ratePercent} onChange={e => setRatePercent(e.target.value)} />
                                <small style={{ color: '#666', fontSize: '11px', marginTop: '4px', display: 'block' }}>
                                    Automatically calculates Intra-state CGST ({(parseFloat(ratePercent || 0)/2).toFixed(2)}%) + SGST ({(parseFloat(ratePercent || 0)/2).toFixed(2)}%) and Inter-state IGST ({parseFloat(ratePercent || 0).toFixed(2)}%).
                                </small>
                            </div>
                            <button type="submit" className="btn btn-primary" disabled={submitting}>
                                <Plus size={16} /> Save Tax Class
                            </button>
                        </form>
                    </div>
                </div>

                <div className="admin-card">
                    <div className="admin-card-header">
                        <h3>Configured Tax Classes & Rates</h3>
                    </div>
                    <div className="admin-card-body" style={{ padding: 0 }}>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Class Name</th>
                                    <th>Slug</th>
                                    <th>Total Rate</th>
                                    <th>CGST / SGST</th>
                                    <th>IGST</th>
                                    <th>Products Linked</th>
                                </tr>
                            </thead>
                            <tbody>
                                {taxClasses.map(tc => {
                                    const r = tc.rates?.[0];
                                    return (
                                        <tr key={tc.id}>
                                            <td><strong>{tc.name}</strong></td>
                                            <td><code>{tc.slug}</code></td>
                                            <td><strong>{r?.rate || 18}%</strong></td>
                                            <td>{r?.cgst_rate || 9}% + {r?.sgst_rate || 9}%</td>
                                            <td>{r?.igst_rate || 18}%</td>
                                            <td>{tc.products_count || 0} items</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
