import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Settings, Save, Shield, CreditCard } from 'lucide-react';

export default function AdminSettingsIndex({ settings = {} }) {
    const [storeName, setStoreName] = useState(settings.store_name || 'SPEED AUTOS PARTS');
    const [storeEmail, setStoreEmail] = useState(settings.store_email || 'support@speedautosparts.com');
    const [storePhone, setStorePhone] = useState(settings.store_phone || '+91 98765 43210');
    const [storeAddress, setStoreAddress] = useState(settings.store_address || 'Sector 5, New Delhi 110001');
    const [currencySymbol, setCurrencySymbol] = useState(settings.currency_symbol || '₹');
    const [currencyCode, setCurrencyCode] = useState(settings.currency_code || 'INR');
    const [submitting, setSubmitting] = useState(false);

    const handleSave = (e) => {
        e.preventDefault();
        setSubmitting(true);
        router.post('/admin/settings', {
            store_name: storeName,
            store_email: storeEmail,
            store_phone: storePhone,
            store_address: storeAddress,
            currency_symbol: currencySymbol,
            currency_code: currencyCode,
        }, {
            onFinish: () => setSubmitting(false),
        });
    };

    return (
        <AdminLayout title="Platform & Store Configuration">
            <div style={{ maxWidth: '720px' }}>
                <div className="admin-card">
                    <div className="admin-card-header">
                        <h3>Store Identity & Regional Settings</h3>
                    </div>
                    <div className="admin-card-body">
                        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div className="form-group">
                                <label className="form-label">Store Brand Name</label>
                                <input type="text" className="form-input" value={storeName} onChange={e => setStoreName(e.target.value)} />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div className="form-group">
                                    <label className="form-label">Support Email</label>
                                    <input type="email" className="form-input" value={storeEmail} onChange={e => setStoreEmail(e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Customer Helpline Phone</label>
                                    <input type="text" className="form-input" value={storePhone} onChange={e => setStorePhone(e.target.value)} />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Central Depot / Company Legal Address</label>
                                <textarea className="form-textarea" value={storeAddress} onChange={e => setStoreAddress(e.target.value)} style={{ minHeight: '60px' }} />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div className="form-group">
                                    <label className="form-label">Currency Symbol</label>
                                    <input type="text" className="form-input" value={currencySymbol} onChange={e => setCurrencySymbol(e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Currency Code</label>
                                    <input type="text" className="form-input" value={currencyCode} onChange={e => setCurrencyCode(e.target.value)} />
                                </div>
                            </div>

                            <div style={{ padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '4px', border: '1px solid #DCDCDC', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <CreditCard size={24} color="#F36B16" />
                                <div>
                                    <strong style={{ fontSize: '13px' }}>Razorpay Payment Gateway Status</strong>
                                    <p style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                                        Key ID: <code>rzp_test_U0pM9MDph2MfNX</code> • 256-Bit SSL HMAC Signature Verification Active.
                                    </p>
                                </div>
                            </div>

                            <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
                                <Save size={16} /> {submitting ? 'Saving...' : 'Save Configuration'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
