import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Settings, Save, CreditCard, Receipt, Plus } from 'lucide-react';

export default function AdminSettingsIndex({ settings = {}, taxClasses = [], initialTab = 'store' }) {
    const [activeTab, setActiveTab] = useState(initialTab === 'tax' ? 'tax' : 'store');

    // Store settings state
    const [storeName, setStoreName] = useState(settings.store_name || 'SPEED AUTOS PARTS');
    const [storeEmail, setStoreEmail] = useState(settings.store_email || 'support@speedautosparts.com');
    const [storePhone, setStorePhone] = useState(settings.store_phone || '+91 98765 43210');
    const [storeAddress, setStoreAddress] = useState(settings.store_address || 'Sector 5, New Delhi 110001');
    const [currencySymbol, setCurrencySymbol] = useState(settings.currency_symbol || '₹');
    const [currencyCode, setCurrencyCode] = useState(settings.currency_code || 'INR');
    const [savingStore, setSavingStore] = useState(false);

    // Tax settings state
    const [taxName, setTaxName] = useState('');
    const [taxSlug, setTaxSlug] = useState('');
    const [ratePercent, setRatePercent] = useState('18.00');
    const [savingTax, setSavingTax] = useState(false);

    const handleSaveStore = (e) => {
        e.preventDefault();
        setSavingStore(true);
        router.post('/admin/settings', {
            store_name: storeName,
            store_email: storeEmail,
            store_phone: storePhone,
            store_address: storeAddress,
            currency_symbol: currencySymbol,
            currency_code: currencyCode,
        }, {
            onFinish: () => setSavingStore(false),
        });
    };

    const handleCreateTax = (e) => {
        e.preventDefault();
        setSavingTax(true);
        const rate = parseFloat(ratePercent);
        router.post('/admin/taxes', {
            name: taxName,
            slug: taxSlug,
            rate: rate,
            cgst_rate: rate / 2,
            sgst_rate: rate / 2,
            igst_rate: rate,
        }, {
            onSuccess: () => {
                setTaxName('');
                setTaxSlug('');
                setRatePercent('18.00');
            },
            onFinish: () => setSavingTax(false),
        });
    };

    return (
        <AdminLayout title="Settings">
            <div className="admin-card" style={{ padding: 0 }}>
                <div className="product-form-tabs">
                    <button
                        type="button"
                        className={activeTab === 'store' ? 'active' : ''}
                        onClick={() => setActiveTab('store')}
                    >
                        <Settings size={15} style={{ display: 'inline', marginRight: '6px' }} />
                        Store Settings
                    </button>
                    <button
                        type="button"
                        className={activeTab === 'tax' ? 'active' : ''}
                        onClick={() => setActiveTab('tax')}
                    >
                        <Receipt size={15} style={{ display: 'inline', marginRight: '6px' }} />
                        Tax &amp; GST Settings ({taxClasses.length})
                    </button>
                </div>

                <div className="admin-card-body">
                    {activeTab === 'store' && (
                        <div style={{ maxWidth: '720px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>
                                Store Identity &amp; Regional Settings
                            </h3>
                            <form onSubmit={handleSaveStore} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div className="form-group">
                                    <label className="form-label">Store Brand Name</label>
                                    <input type="text" className="form-input" value={storeName} onChange={e => setStoreName(e.target.value)} />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
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

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
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

                                <div>
                                    <button type="submit" className="btn btn-primary btn-lg" disabled={savingStore}>
                                        <Save size={16} /> {savingStore ? 'Saving...' : 'Save Configuration'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'tax' && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                            <div className="admin-card" style={{ marginBottom: 0 }}>
                                <div className="admin-card-header">
                                    <h3>Create Tax Class</h3>
                                </div>
                                <div className="admin-card-body">
                                    <form onSubmit={handleCreateTax} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                        <div className="form-group">
                                            <label className="form-label">Tax Class Name</label>
                                            <input type="text" className="form-input" required value={taxName} onChange={e => setTaxName(e.target.value)} placeholder="e.g. Standard Autos Parts GST 18%" />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Slug</label>
                                            <input type="text" className="form-input" value={taxSlug} onChange={e => setTaxSlug(e.target.value)} placeholder="gst-18" />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Total GST Rate (%)</label>
                                            <input type="number" step="0.01" className="form-input" required value={ratePercent} onChange={e => setRatePercent(e.target.value)} />
                                            <small style={{ color: '#666', fontSize: '11px', marginTop: '4px', display: 'block' }}>
                                                Automatically calculates Intra-state CGST ({(parseFloat(ratePercent || 0) / 2).toFixed(2)}%) + SGST ({(parseFloat(ratePercent || 0) / 2).toFixed(2)}%) and Inter-state IGST ({parseFloat(ratePercent || 0).toFixed(2)}%).
                                            </small>
                                        </div>
                                        <button type="submit" className="btn btn-primary" disabled={savingTax}>
                                            <Plus size={16} /> Save Tax Class
                                        </button>
                                    </form>
                                </div>
                            </div>

                            <div className="admin-card" style={{ marginBottom: 0 }}>
                                <div className="admin-card-header">
                                    <h3>Configured Tax Classes &amp; Rates</h3>
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
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
