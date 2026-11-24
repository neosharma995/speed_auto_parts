import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { CURRENCY_CATALOG, formatWithSymbol, getCurrencyMeta } from '@/utils/currency';
import { Save, CreditCard, Coins } from 'lucide-react';

const DEFAULT_STOREFRONT_RATES = {
    AED: '1',
    USD: '0.2723',
    EUR: '0.2510',
};

export default function AdminSettingsIndex({ settings = {} }) {
    const initialCode = String(settings.currency_code || 'AED').toUpperCase();
    const initialMeta = getCurrencyMeta(initialCode);

    const [storeName, setStoreName] = useState(settings.store_name || 'SPEED AUTOS PARTS');
    const [storeEmail, setStoreEmail] = useState(settings.store_email || 'support@speedautosparts.ae');
    const [storePhone, setStorePhone] = useState(settings.store_phone || '+971 4 512 8900');
    const [storeAddress, setStoreAddress] = useState(
        settings.store_address || 'Al Quoz Industrial Area 3, Dubai, United Arab Emirates'
    );

    const [currencyCode, setCurrencyCode] = useState(initialCode);
    const [currencySymbol, setCurrencySymbol] = useState(settings.currency_symbol || initialMeta.symbol);
    const [currencyLocale, setCurrencyLocale] = useState(settings.currency_locale || initialMeta.locale);
    const [currencyRate, setCurrencyRate] = useState(
        settings.currency_rate !== undefined && settings.currency_rate !== '' ? String(settings.currency_rate) : '1'
    );
    const [currencyRates, setCurrencyRates] = useState(() => {
        try {
            const parsed =
                typeof settings.currency_rates === 'string'
                    ? JSON.parse(settings.currency_rates)
                    : settings.currency_rates || {};
            return {
                ...DEFAULT_STOREFRONT_RATES,
                ...Object.fromEntries(Object.entries(parsed).map(([k, v]) => [k, String(v)])),
            };
        } catch {
            return { ...DEFAULT_STOREFRONT_RATES };
        }
    });
    const [submitting, setSubmitting] = useState(false);

    const handleDefaultCurrencyChange = (nextCode) => {
        const meta = getCurrencyMeta(nextCode);
        setCurrencyCode(meta.code);
        setCurrencySymbol(meta.symbol);
        setCurrencyLocale(meta.locale);
    };

    const handleSave = (e) => {
        e.preventDefault();
        setSubmitting(true);

        const numericRates = {};
        Object.keys(DEFAULT_STOREFRONT_RATES).forEach((k) => {
            const parsed = parseFloat(currencyRates[k]);
            if (!Number.isNaN(parsed) && parsed > 0) {
                numericRates[k] = parsed;
            }
        });
        numericRates[currencyCode.toUpperCase()] = 1;

        const parsedRate = parseFloat(currencyRate);

        router.post(
            '/admin/settings',
            {
                store_name: storeName,
                store_email: storeEmail,
                store_phone: storePhone,
                store_address: storeAddress,
                currency_code: currencyCode.toUpperCase().trim() || 'AED',
                currency_symbol: currencySymbol.trim() || currencyCode.toUpperCase(),
                currency_locale: currencyLocale.trim() || 'en-AE',
                currency_rate: !Number.isNaN(parsedRate) && parsedRate > 0 ? parsedRate : 1,
                currency_rates: numericRates,
            },
            {
                onFinish: () => setSubmitting(false),
            }
        );
    };

    const previewBase = 1000;
    const previewMultiplier = parseFloat(currencyRate) > 0 ? parseFloat(currencyRate) : 1;
    const previewFormatted = formatWithSymbol(previewBase * previewMultiplier, currencySymbol, currencyLocale);

    return (
        <AdminLayout title="Platform & Store Configuration">
            <div style={{ maxWidth: '820px' }}>
                <div className="admin-card">
                    <div className="admin-card-header">
                        <h3>Dubai Store Identity &amp; Default Currency Settings</h3>
                    </div>
                    <div className="admin-card-body">
                        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                            <div className="form-group">
                                <label className="form-label">Store Brand Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={storeName}
                                    onChange={(e) => setStoreName(e.target.value)}
                                />
                            </div>

                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                                    gap: '16px',
                                }}
                            >
                                <div className="form-group">
                                    <label className="form-label">Support Email</label>
                                    <input
                                        type="email"
                                        className="form-input"
                                        value={storeEmail}
                                        onChange={(e) => setStoreEmail(e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Dubai Customer Helpline</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={storePhone}
                                        onChange={(e) => setStorePhone(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Dubai Warehouse / Company Legal Address</label>
                                <textarea
                                    className="form-textarea"
                                    value={storeAddress}
                                    onChange={(e) => setStoreAddress(e.target.value)}
                                    style={{ minHeight: '60px' }}
                                />
                            </div>

                            {/* Default Currency & Price Calculation Box */}
                            <div
                                style={{
                                    padding: '18px',
                                    backgroundColor: '#FFF7ED',
                                    border: '1px solid #FDBA74',
                                    borderRadius: '6px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '14px',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Coins size={18} color="#F36B16" />
                                    <strong style={{ fontSize: '14px', color: '#0F172A' }}>
                                        Default Store Currency &amp; Price Conversion
                                    </strong>
                                </div>
                                <p style={{ fontSize: '12px', color: '#475569', margin: 0 }}>
                                    The Default Currency is applied across the Admin Dashboard and Storefront. All product prices are automatically calculated using your base price multiplied by the Default Price Rate.
                                </p>

                                <div
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                                        gap: '12px',
                                    }}
                                >
                                    <div className="form-group">
                                        <label className="form-label">Default Currency</label>
                                        <select
                                            className="form-select"
                                            value={currencyCode}
                                            onChange={(e) => handleDefaultCurrencyChange(e.target.value)}
                                        >
                                            {CURRENCY_CATALOG.map((c) => (
                                                <option key={c.code} value={c.code}>
                                                    {c.code} — {c.name} ({c.symbol})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Display Symbol</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={currencySymbol}
                                            onChange={(e) => setCurrencySymbol(e.target.value)}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Currency Code</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={currencyCode}
                                            onChange={(e) => setCurrencyCode(e.target.value.toUpperCase())}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Default Price Rate (Multiplier)</label>
                                        <input
                                            type="number"
                                            step="0.0001"
                                            min="0.0001"
                                            className="form-input"
                                            value={currencyRate}
                                            onChange={(e) => setCurrencyRate(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div
                                    style={{
                                        padding: '10px 12px',
                                        backgroundColor: '#FFFFFF',
                                        border: '1px solid #FED7AA',
                                        borderRadius: '4px',
                                        fontSize: '12px',
                                        color: '#334155',
                                    }}
                                >
                                    Live Calculation Preview: Base product price <strong>1,000</strong> ×{' '}
                                    <strong>{previewMultiplier}</strong> ={' '}
                                    <strong style={{ color: '#F36B16', fontSize: '13px' }}>{previewFormatted}</strong>{' '}
                                    (shown across Dashboard &amp; Website)
                                </div>

                                <div>
                                    <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>
                                        Website Switcher Exchange Rates (1 {currencyCode} =)
                                    </label>
                                    <div
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                                            gap: '10px',
                                        }}
                                    >
                                        {Object.keys(DEFAULT_STOREFRONT_RATES).map((code) => (
                                            <div key={code} className="form-group">
                                                <label className="form-label" style={{ fontSize: '11px' }}>
                                                    {code}
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.0001"
                                                    min="0.0001"
                                                    className="form-input"
                                                    disabled={code === currencyCode}
                                                    value={code === currencyCode ? '1' : currencyRates[code] ?? '1'}
                                                    onChange={(e) =>
                                                        setCurrencyRates({
                                                            ...currencyRates,
                                                            [code]: e.target.value,
                                                        })
                                                    }
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div
                                style={{
                                    padding: '16px',
                                    backgroundColor: '#F8FAFC',
                                    borderRadius: '4px',
                                    border: '1px solid #DCDCDC',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                }}
                            >
                                <CreditCard size={24} color="#F36B16" />
                                <div>
                                    <strong style={{ fontSize: '13px' }}>
                                        Stripe Payment Gateway ({currencyCode})
                                    </strong>
                                    <p style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                                        Configured via <code>STRIPE_KEY</code>, <code>STRIPE_SECRET</code>, and{' '}
                                        <code>STRIPE_WEBHOOK_SECRET</code> in <code>.env</code> • Checkout Sessions API &amp; Webhook Signature Verification enabled.
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
