import React, { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { CURRENCY_CATALOG, formatWithSymbol, getCurrencyMeta } from '@/utils/currency';
import { Settings, Save, CreditCard, Receipt, Plus, Coins, Globe, Trash2, Edit, Layout } from 'lucide-react';

const DEFAULT_STOREFRONT_RATES = {
    AED: '1',
    USD: '0.2723',
    EUR: '0.2510',
};

const EMPTY_REGION_FORM = {
    id: null,
    country_code: '',
    country_name: '',
    currency_code: 'AED',
    margin_percent: '0',
    tax_rate_percent: '5',
    flat_shipping_cost: '25',
    free_shipping_threshold: '500',
    min_order_amount: '0',
    is_selling_enabled: true,
    is_default: false,
    notes: '',
};

export default function AdminSettingsIndex({
    settings = {},
    taxClasses = [],
    regionalRules = [],
    initialTab = 'store',
}) {
    const { flash, errors } = usePage().props;
    const validTabs = ['store', 'header_footer', 'tax', 'regional'];
    const [activeTab, setActiveTab] = useState(validTabs.includes(initialTab) ? initialTab : 'store');

    const handleSwitchTab = (nextTab) => {
        if (!validTabs.includes(nextTab)) return;
        setActiveTab(nextTab);
        const url = new URL(window.location.href);
        url.searchParams.set('tab', nextTab);
        window.history.replaceState(window.history.state, '', url.toString());
    };

    const initialCode = String(settings.currency_code || 'AED').toUpperCase();
    const initialMeta = getCurrencyMeta(initialCode);

    // Store settings state (Dubai / UAE)
    const [storeName, setStoreName] = useState(settings.store_name || 'SPEED AUTOS PARTS');
    const [storeEmail, setStoreEmail] = useState(settings.store_email || 'support@speedautosparts.ae');
    const [storePhone, setStorePhone] = useState(settings.store_phone || '+971 4 512 8900');
    const [storeAddress, setStoreAddress] = useState(
        settings.store_address || 'Al Quoz Industrial Area 3, Dubai, United Arab Emirates'
    );

    // Default Currency & Rate settings
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
    const [savingStore, setSavingStore] = useState(false);

    // UAE VAT settings state
    const [taxName, setTaxName] = useState('');
    const [taxSlug, setTaxSlug] = useState('');
    const [ratePercent, setRatePercent] = useState('5.00');
    const [savingTax, setSavingTax] = useState(false);

    // Regional Pricing & Country Rules state
    const [regionForm, setRegionForm] = useState(EMPTY_REGION_FORM);
    const [savingRegion, setSavingRegion] = useState(false);

    // Dynamic Header & Footer state
    const [hfForm, setHfForm] = useState({
        site_logo: settings.site_logo || '/assets/images/logo/speedautoparts-official.png',
        footer_logo: settings.footer_logo || settings.site_logo || '/assets/images/logo/speedautoparts-official.png',
        header_announcement:
            settings.header_announcement || 'Free UAE Delivery on Orders Over AED 500 — Dubai Express Dispatch',
        header_hotline_label: settings.header_hotline_label || 'Dubai Hotline:',
        footer_description:
            settings.footer_description ||
            'Your trusted global source for premium automotive spare parts, performance upgrades, and genuine replacement components.',
        footer_hours: settings.footer_hours || 'Mon – Sat, 9:00 AM – 7:00 PM (Dubai / GST)',
        footer_newsletter_eyebrow: settings.footer_newsletter_eyebrow || 'STAY IN THE LOOP',
        footer_newsletter_heading: settings.footer_newsletter_heading || 'Get Exclusive Deals & Performance Updates',
        footer_newsletter_desc:
            settings.footer_newsletter_desc ||
            'Subscribe to our newsletter and be the first to know about new products, special offers, and expert automotive insights.',
        footer_copyright: settings.footer_copyright || `© ${new Date().getFullYear()} Speed Autos Parts. All Rights Reserved.`,
        social_facebook: settings.social_facebook ?? 'https://facebook.com',
        social_instagram: settings.social_instagram ?? 'https://instagram.com',
        social_youtube: settings.social_youtube ?? 'https://youtube.com',
        social_linkedin: settings.social_linkedin ?? 'https://linkedin.com',
        social_twitter: settings.social_twitter ?? 'https://twitter.com',
    });
    const [siteLogoFile, setSiteLogoFile] = useState(null);
    const [footerLogoFile, setFooterLogoFile] = useState(null);
    const [savingHf, setSavingHf] = useState(false);

    const handleSaveHeaderFooter = (e) => {
        e.preventDefault();
        setSavingHf(true);

        const payload = { ...hfForm };
        if (siteLogoFile) payload.site_logo_file = siteLogoFile;
        if (footerLogoFile) payload.footer_logo_file = footerLogoFile;

        router.post('/admin/settings', payload, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setSiteLogoFile(null);
                setFooterLogoFile(null);
            },
            onFinish: () => setSavingHf(false),
        });
    };

    const handleDefaultCurrencyChange = (nextCode) => {
        const meta = getCurrencyMeta(nextCode);
        setCurrencyCode(meta.code);
        setCurrencySymbol(meta.code);
        setCurrencyLocale(meta.locale);

        const baseUsd = { AED: 3.6725, USD: 1.0, EUR: 0.9218 };
        const denom = baseUsd[meta.code] || 1;
        setCurrencyRates({
            AED: meta.code === 'AED' ? '1' : String(Number((baseUsd.AED / denom).toFixed(4))),
            USD: meta.code === 'USD' ? '1' : String(Number((baseUsd.USD / denom).toFixed(4))),
            EUR: meta.code === 'EUR' ? '1' : String(Number((baseUsd.EUR / denom).toFixed(4))),
        });
    };

    const handleSaveStore = (e) => {
        e.preventDefault();
        setSavingStore(true);

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
                onFinish: () => setSavingStore(false),
            }
        );
    };

    const handleCreateTax = (e) => {
        e.preventDefault();
        setSavingTax(true);
        const rate = parseFloat(ratePercent);
        router.post(
            '/admin/taxes',
            {
                name: taxName,
                slug: taxSlug,
                rate,
                cgst_rate: 0,
                sgst_rate: 0,
                igst_rate: 0,
            },
            {
                onSuccess: () => {
                    setTaxName('');
                    setTaxSlug('');
                    setRatePercent('5.00');
                },
                onFinish: () => setSavingTax(false),
            }
        );
    };

    const handleEditRegion = (rule) => {
        setRegionForm({
            id: rule.id,
            country_code: rule.country_code,
            country_name: rule.country_name,
            currency_code: rule.currency_code || 'AED',
            margin_percent: String(rule.margin_percent ?? 0),
            tax_rate_percent: String(rule.tax_rate_percent ?? 5),
            flat_shipping_cost: String(rule.flat_shipping_cost ?? 0),
            free_shipping_threshold: String(rule.free_shipping_threshold ?? 0),
            min_order_amount: String(rule.min_order_amount ?? 0),
            is_selling_enabled: Boolean(rule.is_selling_enabled),
            is_default: Boolean(rule.is_default),
            notes: rule.notes || '',
        });
    };

    const handleSaveRegion = (e) => {
        e.preventDefault();
        setSavingRegion(true);

        const payload = {
            country_code: regionForm.country_code.toUpperCase().trim(),
            country_name: regionForm.country_name.trim(),
            currency_code: regionForm.currency_code,
            margin_percent: Number(regionForm.margin_percent || 0),
            tax_rate_percent: Number(regionForm.tax_rate_percent || 0),
            flat_shipping_cost: Number(regionForm.flat_shipping_cost || 0),
            free_shipping_threshold: Number(regionForm.free_shipping_threshold || 0),
            min_order_amount: Number(regionForm.min_order_amount || 0),
            is_selling_enabled: Boolean(regionForm.is_selling_enabled),
            is_default: Boolean(regionForm.is_default),
            notes: regionForm.notes || null,
        };

        if (regionForm.id) {
            router.put(`/admin/regional-pricing/${regionForm.id}`, payload, {
                preserveScroll: true,
                onSuccess: () => setRegionForm(EMPTY_REGION_FORM),
                onFinish: () => setSavingRegion(false),
            });
        } else {
            router.post('/admin/regional-pricing', payload, {
                preserveScroll: true,
                onSuccess: () => setRegionForm(EMPTY_REGION_FORM),
                onFinish: () => setSavingRegion(false),
            });
        }
    };

    const handleDeleteRegion = (rule) => {
        if (confirm(`Delete regional pricing rule for ${rule.country_name} (${rule.country_code})?`)) {
            router.delete(`/admin/regional-pricing/${rule.id}`, { preserveScroll: true });
        }
    };

    const previewBase = 1000;
    const previewMultiplier = parseFloat(currencyRate) > 0 ? parseFloat(currencyRate) : 1;
    const previewFormatted = formatWithSymbol(previewBase * previewMultiplier, currencyCode, currencyLocale);

    return (
        <AdminLayout title="Settings">
            {errors && Object.keys(errors).length > 0 && (
                <div
                    style={{
                        backgroundColor: '#FFF1F2',
                        color: '#D93025',
                        padding: '12px 16px',
                        borderRadius: '4px',
                        marginBottom: '16px',
                        fontSize: '13px',
                    }}
                >
                    {Object.values(errors).map((err, idx) => (
                        <div key={idx}>{err}</div>
                    ))}
                </div>
            )}

            <div className="admin-card" style={{ padding: 0 }}>
                <div className="product-form-tabs">
                    <button
                        type="button"
                        className={activeTab === 'store' ? 'active' : ''}
                        onClick={() => handleSwitchTab('store')}
                    >
                        <Settings size={15} style={{ display: 'inline', marginRight: '6px' }} />
                        Store &amp; Currency Settings
                    </button>
                    <button
                        type="button"
                        className={activeTab === 'header_footer' ? 'active' : ''}
                        onClick={() => handleSwitchTab('header_footer')}
                    >
                        <Layout size={15} style={{ display: 'inline', marginRight: '6px' }} />
                        Header &amp; Footer
                    </button>
                    <button
                        type="button"
                        className={activeTab === 'regional' ? 'active' : ''}
                        onClick={() => handleSwitchTab('regional')}
                    >
                        <Globe size={15} style={{ display: 'inline', marginRight: '6px' }} />
                        Regional Pricing &amp; Country Rules ({regionalRules.length})
                    </button>
                    <button
                        type="button"
                        className={activeTab === 'tax' ? 'active' : ''}
                        onClick={() => handleSwitchTab('tax')}
                    >
                        <Receipt size={15} style={{ display: 'inline', marginRight: '6px' }} />
                        UAE VAT &amp; Tax Settings ({taxClasses.length})
                    </button>
                </div>

                <div className="admin-card-body">
                    {activeTab === 'store' && (
                        <div style={{ maxWidth: '820px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>
                                Dubai Store Identity &amp; Default Currency Settings
                            </h3>
                            <form onSubmit={handleSaveStore} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
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
                                        The Default Currency is applied across the entire Admin Dashboard, Supplier Portal, and Storefront.
                                        All product prices are automatically calculated using your base price multiplied by the Default Price Rate.
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
                                                        {c.code} — {c.name}
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
                                            Stripe Payment Gateway (Dynamic AED / USD / EUR)
                                        </strong>
                                        <p style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                                            Configured via <code>STRIPE_KEY</code>, <code>STRIPE_SECRET</code>, and{' '}
                                            <code>STRIPE_WEBHOOK_SECRET</code> in <code>.env</code> • Checkout Sessions API &amp; Webhook
                                            Signature Verification enabled.
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

                    {activeTab === 'header_footer' && (
                        <div style={{ maxWidth: '860px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>
                                Dynamic Header, Footer, Logos &amp; Social Media Links
                            </h3>
                            <form onSubmit={handleSaveHeaderFooter} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {/* Header Section */}
                                <div
                                    style={{
                                        padding: '18px',
                                        backgroundColor: '#F8FAFC',
                                        border: '1px solid #E2E8F0',
                                        borderRadius: '6px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '14px',
                                    }}
                                >
                                    <strong style={{ fontSize: '13px', color: '#F36B16', textTransform: 'uppercase' }}>
                                        1. Header Branding &amp; Top Utility Bar
                                    </strong>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', alignItems: 'end' }}>
                                        <div className="form-group">
                                            <label className="form-label">Upload New Header Logo (PNG / SVG / WebP)</label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="form-input"
                                                onChange={(e) => setSiteLogoFile(e.target.files?.[0] || null)}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Or Header Logo URL / Path</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={hfForm.site_logo}
                                                onChange={(e) => setHfForm({ ...hfForm, site_logo: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    {hfForm.site_logo && (
                                        <div style={{ backgroundColor: '#111827', padding: '12px 16px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', width: 'fit-content' }}>
                                            <img
                                                src={siteLogoFile ? URL.createObjectURL(siteLogoFile) : hfForm.site_logo}
                                                alt="Header Logo Preview"
                                                style={{ maxHeight: '36px', width: 'auto' }}
                                            />
                                        </div>
                                    )}

                                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                                        <div className="form-group">
                                            <label className="form-label">Top Bar Announcement Text</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={hfForm.header_announcement}
                                                onChange={(e) => setHfForm({ ...hfForm, header_announcement: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Hotline Label</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={hfForm.header_hotline_label}
                                                onChange={(e) => setHfForm({ ...hfForm, header_hotline_label: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Section */}
                                <div
                                    style={{
                                        padding: '18px',
                                        backgroundColor: '#F8FAFC',
                                        border: '1px solid #E2E8F0',
                                        borderRadius: '6px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '14px',
                                    }}
                                >
                                    <strong style={{ fontSize: '13px', color: '#F36B16', textTransform: 'uppercase' }}>
                                        2. Footer Branding, Newsletter &amp; Copyright
                                    </strong>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                                        <div className="form-group">
                                            <label className="form-label">Upload Footer Logo (Optional)</label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="form-input"
                                                onChange={(e) => setFooterLogoFile(e.target.files?.[0] || null)}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Or Footer Logo URL / Path</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={hfForm.footer_logo}
                                                onChange={(e) => setHfForm({ ...hfForm, footer_logo: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Footer Brand Description</label>
                                        <textarea
                                            className="form-textarea"
                                            style={{ minHeight: '65px' }}
                                            value={hfForm.footer_description}
                                            onChange={(e) => setHfForm({ ...hfForm, footer_description: e.target.value })}
                                        />
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                        <div className="form-group">
                                            <label className="form-label">Support Hours</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={hfForm.footer_hours}
                                                onChange={(e) => setHfForm({ ...hfForm, footer_hours: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Copyright Line</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={hfForm.footer_copyright}
                                                onChange={(e) => setHfForm({ ...hfForm, footer_copyright: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
                                        <div className="form-group">
                                            <label className="form-label">Newsletter Eyebrow</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={hfForm.footer_newsletter_eyebrow}
                                                onChange={(e) => setHfForm({ ...hfForm, footer_newsletter_eyebrow: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Newsletter Heading</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={hfForm.footer_newsletter_heading}
                                                onChange={(e) => setHfForm({ ...hfForm, footer_newsletter_heading: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Newsletter Description</label>
                                        <textarea
                                            className="form-textarea"
                                            style={{ minHeight: '55px' }}
                                            value={hfForm.footer_newsletter_desc}
                                            onChange={(e) => setHfForm({ ...hfForm, footer_newsletter_desc: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Social Links Section */}
                                <div
                                    style={{
                                        padding: '18px',
                                        backgroundColor: '#F8FAFC',
                                        border: '1px solid #E2E8F0',
                                        borderRadius: '6px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '14px',
                                    }}
                                >
                                    <strong style={{ fontSize: '13px', color: '#F36B16', textTransform: 'uppercase' }}>
                                        3. Social Media Links (Leave blank to hide icon)
                                    </strong>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                                        <div className="form-group">
                                            <label className="form-label">Facebook URL</label>
                                            <input
                                                type="url"
                                                className="form-input"
                                                placeholder="https://facebook.com/yourpage"
                                                value={hfForm.social_facebook}
                                                onChange={(e) => setHfForm({ ...hfForm, social_facebook: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Instagram URL</label>
                                            <input
                                                type="url"
                                                className="form-input"
                                                placeholder="https://instagram.com/yourpage"
                                                value={hfForm.social_instagram}
                                                onChange={(e) => setHfForm({ ...hfForm, social_instagram: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">YouTube URL</label>
                                            <input
                                                type="url"
                                                className="form-input"
                                                placeholder="https://youtube.com/@yourchannel"
                                                value={hfForm.social_youtube}
                                                onChange={(e) => setHfForm({ ...hfForm, social_youtube: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">LinkedIn URL</label>
                                            <input
                                                type="url"
                                                className="form-input"
                                                placeholder="https://linkedin.com/company/yourcompany"
                                                value={hfForm.social_linkedin}
                                                onChange={(e) => setHfForm({ ...hfForm, social_linkedin: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">X (Twitter) URL</label>
                                            <input
                                                type="url"
                                                className="form-input"
                                                placeholder="https://x.com/yourhandle"
                                                value={hfForm.social_twitter}
                                                onChange={(e) => setHfForm({ ...hfForm, social_twitter: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <button type="submit" className="btn btn-primary btn-lg" disabled={savingHf}>
                                        <Save size={16} /> {savingHf ? 'Saving...' : 'Save Header & Footer Settings'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'regional' && (
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
                                gap: '20px',
                            }}
                        >
                            <div className="admin-card" style={{ marginBottom: 0 }}>
                                <div className="admin-card-header">
                                    <h3>
                                        {regionForm.id
                                            ? `Edit Country Rule (${regionForm.country_code})`
                                            : 'Add Country Pricing, Margin & Tax Rule'}
                                    </h3>
                                </div>
                                <div className="admin-card-body">
                                    <form onSubmit={handleSaveRegion} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '10px' }}>
                                            <div className="form-group">
                                                <label className="form-label">ISO Code *</label>
                                                <input
                                                    type="text"
                                                    className="form-input"
                                                    required
                                                    maxLength={5}
                                                    disabled={Boolean(regionForm.id)}
                                                    placeholder="AE"
                                                    value={regionForm.country_code}
                                                    onChange={(e) =>
                                                        setRegionForm({ ...regionForm, country_code: e.target.value.toUpperCase() })
                                                    }
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Country Name *</label>
                                                <input
                                                    type="text"
                                                    className="form-input"
                                                    required
                                                    placeholder="United Arab Emirates"
                                                    value={regionForm.country_name}
                                                    onChange={(e) => setRegionForm({ ...regionForm, country_name: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                                            <div className="form-group">
                                                <label className="form-label">Currency *</label>
                                                <select
                                                    className="form-select"
                                                    value={regionForm.currency_code}
                                                    onChange={(e) => setRegionForm({ ...regionForm, currency_code: e.target.value })}
                                                >
                                                    <option value="AED">AED</option>
                                                    <option value="USD">USD</option>
                                                    <option value="EUR">EUR</option>
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Margin Adj. (%)</label>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    className="form-input"
                                                    required
                                                    value={regionForm.margin_percent}
                                                    onChange={(e) => setRegionForm({ ...regionForm, margin_percent: e.target.value })}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Tax / VAT (%)</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    className="form-input"
                                                    required
                                                    value={regionForm.tax_rate_percent}
                                                    onChange={(e) => setRegionForm({ ...regionForm, tax_rate_percent: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                                            <div className="form-group">
                                                <label className="form-label">Flat Shipping</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    className="form-input"
                                                    required
                                                    value={regionForm.flat_shipping_cost}
                                                    onChange={(e) => setRegionForm({ ...regionForm, flat_shipping_cost: e.target.value })}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Free Ship Over</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    className="form-input"
                                                    required
                                                    value={regionForm.free_shipping_threshold}
                                                    onChange={(e) =>
                                                        setRegionForm({ ...regionForm, free_shipping_threshold: e.target.value })
                                                    }
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Min Order</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    className="form-input"
                                                    value={regionForm.min_order_amount}
                                                    onChange={(e) => setRegionForm({ ...regionForm, min_order_amount: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">Selling Rules / Notes</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                placeholder="e.g. GCC Express Courier, VAT 15%"
                                                value={regionForm.notes}
                                                onChange={(e) => setRegionForm({ ...regionForm, notes: e.target.value })}
                                            />
                                        </div>

                                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={regionForm.is_selling_enabled}
                                                    onChange={(e) =>
                                                        setRegionForm({ ...regionForm, is_selling_enabled: e.target.checked })
                                                    }
                                                />
                                                <span>Selling Enabled</span>
                                            </label>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={regionForm.is_default}
                                                    onChange={(e) => setRegionForm({ ...regionForm, is_default: e.target.checked })}
                                                />
                                                <span>Default Country</span>
                                            </label>
                                        </div>

                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            {regionForm.id && (
                                                <button
                                                    type="button"
                                                    className="btn btn-outline"
                                                    onClick={() => setRegionForm(EMPTY_REGION_FORM)}
                                                >
                                                    Cancel Edit
                                                </button>
                                            )}
                                            <button type="submit" className="btn btn-primary" disabled={savingRegion}>
                                                <Save size={15} /> {regionForm.id ? 'Update Country Rule' : 'Save Country Rule'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>

                            <div className="admin-card" style={{ marginBottom: 0 }}>
                                <div className="admin-card-header">
                                    <h3>Configured Regional Pricing &amp; Selling Rules</h3>
                                </div>
                                <div className="admin-card-body" style={{ padding: 0, overflowX: 'auto' }}>
                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                <th>Country</th>
                                                <th>Margin / VAT</th>
                                                <th>Shipping</th>
                                                <th>Status</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {regionalRules.length === 0 ? (
                                                <tr>
                                                    <td colSpan="5" style={{ textAlign: 'center', color: '#64748B', padding: '20px' }}>
                                                        No regional pricing rules configured yet.
                                                    </td>
                                                </tr>
                                            ) : (
                                                regionalRules.map((rule) => (
                                                    <tr key={rule.id}>
                                                        <td>
                                                            <strong>
                                                                {rule.country_name} ({rule.country_code})
                                                            </strong>
                                                            <small style={{ display: 'block', color: '#64748B' }}>
                                                                Currency: {rule.currency_code}
                                                                {rule.is_default ? ' • Default' : ''}
                                                            </small>
                                                        </td>
                                                        <td>
                                                            <div>Margin: {rule.margin_percent}%</div>
                                                            <small style={{ color: '#64748B' }}>Tax/VAT: {rule.tax_rate_percent}%</small>
                                                        </td>
                                                        <td>
                                                            <div>Flat: {rule.flat_shipping_cost}</div>
                                                            <small style={{ color: '#64748B' }}>
                                                                Free over: {rule.free_shipping_threshold}
                                                            </small>
                                                        </td>
                                                        <td>
                                                            <span
                                                                className={`badge ${rule.is_selling_enabled ? 'badge-success' : 'badge-danger'
                                                                    }`}
                                                            >
                                                                {rule.is_selling_enabled ? 'Selling On' : 'Disabled'}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-outline btn-sm"
                                                                    onClick={() => handleEditRegion(rule)}
                                                                >
                                                                    <Edit size={13} />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-outline btn-sm"
                                                                    style={{ color: '#D93025' }}
                                                                    onClick={() => handleDeleteRegion(rule)}
                                                                >
                                                                    <Trash2 size={13} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'tax' && (
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                                gap: '24px',
                            }}
                        >
                            <div className="admin-card" style={{ marginBottom: 0 }}>
                                <div className="admin-card-header">
                                    <h3>Create UAE VAT Class</h3>
                                </div>
                                <div className="admin-card-body">
                                    <form onSubmit={handleCreateTax} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                        <div className="form-group">
                                            <label className="form-label">Tax Class Name</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                required
                                                value={taxName}
                                                onChange={(e) => setTaxName(e.target.value)}
                                                placeholder="e.g. Standard Auto Parts (UAE VAT 5%)"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Slug</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={taxSlug}
                                                onChange={(e) => setTaxSlug(e.target.value)}
                                                placeholder="vat-5"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">UAE VAT Rate (%)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                className="form-input"
                                                required
                                                value={ratePercent}
                                                onChange={(e) => setRatePercent(e.target.value)}
                                            />
                                            <small style={{ color: '#666', fontSize: '11px', marginTop: '4px', display: 'block' }}>
                                                Standard UAE Federal VAT is 5.00% across all 7 Emirates (0.00% for qualifying exports).
                                            </small>
                                        </div>
                                        <button type="submit" className="btn btn-primary" disabled={savingTax}>
                                            <Plus size={16} /> Save VAT Class
                                        </button>
                                    </form>
                                </div>
                            </div>

                            <div className="admin-card" style={{ marginBottom: 0 }}>
                                <div className="admin-card-header">
                                    <h3>Configured UAE VAT Classes &amp; Rates</h3>
                                </div>
                                <div className="admin-card-body" style={{ padding: 0 }}>
                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                <th>Class Name</th>
                                                <th>Slug</th>
                                                <th>Country</th>
                                                <th>VAT Rate</th>
                                                <th>Products Linked</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {taxClasses.map((tc) => {
                                                const r = tc.rates?.[0];
                                                return (
                                                    <tr key={tc.id}>
                                                        <td>
                                                            <strong>{tc.name}</strong>
                                                        </td>
                                                        <td>
                                                            <code>{tc.slug}</code>
                                                        </td>
                                                        <td>
                                                            <span className="badge badge-neutral">{r?.country_code || 'AE'}</span>
                                                        </td>
                                                        <td>
                                                            <strong>{r?.rate ?? 5}%</strong>
                                                        </td>
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
