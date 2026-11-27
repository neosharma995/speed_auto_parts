import React, { useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Save, Plus, Trash2, ArrowUp, ArrowDown, Layers, ExternalLink } from 'lucide-react';

const SECTION_TYPES = [
    { value: 'text_block', label: 'Content Block' },
    { value: 'info_card', label: 'Highlighted Info Card' },
    { value: 'faq_item', label: 'FAQ / Q&A Item' },
    { value: 'highlight_banner', label: 'Callout Banner' },
];

const LANG_TABS = [
    { code: 'en', label: 'EN (Default)' },
    { code: 'ar', label: 'AR (العربية)' },
    { code: 'fr', label: 'FR (Français)' },
];

function createEmptySection() {
    return {
        id: `sec_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        type: 'text_block',
        heading: '',
        body: '',
        translations: {
            ar: { heading: '', body: '' },
            fr: { heading: '', body: '' },
        },
    };
}

function normalizeSections(rawSections) {
    if (!Array.isArray(rawSections)) return [];
    return rawSections.map((sec, idx) => ({
        id: sec?.id || `sec_${idx}_${Date.now()}`,
        type: sec?.type || 'text_block',
        heading: sec?.heading || '',
        body: sec?.body || '',
        translations: {
            ar: {
                heading: sec?.translations?.ar?.heading || '',
                body: sec?.translations?.ar?.body || '',
            },
            fr: {
                heading: sec?.translations?.fr?.heading || '',
                body: sec?.translations?.fr?.body || '',
            },
        },
    }));
}

export default function PageForm({ page = null, isEditing = false }) {
    const { errors = {} } = usePage().props;

    const [contentLang, setContentLang] = useState('en');
    const [title, setTitle] = useState(page?.title || '');
    const [slug, setSlug] = useState(page?.slug || '');
    const [subtitle, setSubtitle] = useState(page?.subtitle || '');
    const [content, setContent] = useState(page?.content || '');
    const [isActive, setIsActive] = useState(page ? page.is_active !== false : true);
    const [translations, setTranslations] = useState({
        ar: {
            title: page?.translations?.ar?.title || '',
            subtitle: page?.translations?.ar?.subtitle || '',
            content: page?.translations?.ar?.content || '',
        },
        fr: {
            title: page?.translations?.fr?.title || '',
            subtitle: page?.translations?.fr?.subtitle || '',
            content: page?.translations?.fr?.content || '',
        },
    });
    const [sections, setSections] = useState(() => normalizeSections(page?.sections));
    const [submitting, setSubmitting] = useState(false);

    const updateTranslation = (langCode, field, value) => {
        setTranslations((prev) => ({
            ...prev,
            [langCode]: {
                ...(prev[langCode] || {}),
                [field]: value,
            },
        }));
    };

    const addSection = () => {
        setSections((prev) => [...prev, createEmptySection()]);
    };

    const removeSection = (index) => {
        setSections((prev) => prev.filter((_, i) => i !== index));
    };

    const moveSection = (index, direction) => {
        setSections((prev) => {
            const target = index + direction;
            if (target < 0 || target >= prev.length) return prev;
            const copy = [...prev];
            [copy[index], copy[target]] = [copy[target], copy[index]];
            return copy;
        });
    };

    const updateSectionField = (index, field, value) => {
        setSections((prev) =>
            prev.map((sec, i) => {
                if (i !== index) return sec;
                if (field === 'type') {
                    return { ...sec, type: value };
                }
                if (contentLang === 'en') {
                    return { ...sec, [field]: value };
                }
                return {
                    ...sec,
                    translations: {
                        ...(sec.translations || {}),
                        [contentLang]: {
                            ...(sec.translations?.[contentLang] || {}),
                            [field]: value,
                        },
                    },
                };
            })
        );
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitting(true);

        const payload = {
            title,
            slug,
            subtitle,
            content,
            translations,
            sections,
            is_active: isActive,
        };

        if (isEditing && page?.id) {
            router.put(`/admin/pages/${page.id}`, payload, {
                onFinish: () => setSubmitting(false),
            });
        } else {
            router.post('/admin/pages', payload, {
                onFinish: () => setSubmitting(false),
            });
        }
    };

    const isRtl = contentLang === 'ar';

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Top Action Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <Link href="/admin/pages" className="btn btn-outline btn-sm">
                    <ArrowLeft size={15} /> Back to Pages
                </Link>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    {isEditing && page?.slug && (
                        <a
                            href={`/${page.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-outline btn-sm"
                        >
                            <ExternalLink size={14} /> View Live Page
                        </a>
                    )}
                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                        <Save size={15} /> {submitting ? 'Saving...' : isEditing ? 'Save Page Changes' : 'Create Page'}
                    </button>
                </div>
            </div>

            {/* Language Switcher Banner */}
            <div className="admin-card" style={{ padding: '16px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                        <strong style={{ display: 'block', fontSize: '14px', color: '#151515' }}>
                            Editing Language
                        </strong>
                        <small style={{ color: '#64748B' }}>
                            Switch between English, Arabic (RTL), and French to edit both the main page content and all dynamic sections.
                        </small>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {LANG_TABS.map((item) => {
                            const active = contentLang === item.code;
                            return (
                                <button
                                    key={item.code}
                                    type="button"
                                    onClick={() => setContentLang(item.code)}
                                    style={{
                                        padding: '7px 14px',
                                        borderRadius: '6px',
                                        fontSize: '13px',
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
                </div>
            </div>

            {/* Main Page Details Card */}
            <div className="admin-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid #E5E7EB', paddingBottom: '12px' }}>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#151515' }}>
                        Page Details ({contentLang.toUpperCase()})
                    </h3>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                        />
                        <span>Published &amp; Visible on Storefront</span>
                    </label>
                </div>

                {contentLang === 'en' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div className="form-group">
                                <label className="form-label">
                                    Page Title (English) <span className="required">*</span>
                                </label>
                                <input
                                    type="text"
                                    className="form-input"
                                    required
                                    placeholder="e.g. Shipping & Delivery Policy"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                                {errors.title && <div className="form-error">{errors.title}</div>}
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    URL Slug {isEditing && <span className="required">*</span>}
                                </label>
                                <input
                                    type="text"
                                    className="form-input"
                                    required={isEditing}
                                    placeholder="e.g. shipping-policy (auto-generated if blank)"
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value)}
                                />
                                {errors.slug && <div className="form-error">{errors.slug}</div>}
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Subtitle (English)</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Short introductory line shown under the page heading..."
                                value={subtitle}
                                onChange={(e) => setSubtitle(e.target.value)}
                            />
                            {errors.subtitle && <div className="form-error">{errors.subtitle}</div>}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Main Page Content (English — supports HTML)</label>
                            <textarea
                                className="form-textarea"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Write the main body content for this page..."
                                style={{ minHeight: '200px', lineHeight: 1.6 }}
                            />
                            {errors.content && <div className="form-error">{errors.content}</div>}
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div className="form-group">
                            <label className="form-label">
                                Page Title ({contentLang === 'ar' ? 'Arabic — العربية' : 'French — Français'})
                            </label>
                            <input
                                type="text"
                                className="form-input"
                                dir={isRtl ? 'rtl' : 'ltr'}
                                placeholder={isRtl ? 'عنوان الصفحة بالعربية...' : 'Titre de la page en français...'}
                                value={translations[contentLang]?.title || ''}
                                onChange={(e) => updateTranslation(contentLang, 'title', e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                Subtitle ({contentLang === 'ar' ? 'Arabic — العربية' : 'French — Français'})
                            </label>
                            <input
                                type="text"
                                className="form-input"
                                dir={isRtl ? 'rtl' : 'ltr'}
                                placeholder={isRtl ? 'العنوان الفرعي بالعربية...' : 'Sous-titre en français...'}
                                value={translations[contentLang]?.subtitle || ''}
                                onChange={(e) => updateTranslation(contentLang, 'subtitle', e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                Main Page Content ({contentLang === 'ar' ? 'Arabic — العربية' : 'French — Français'})
                            </label>
                            <textarea
                                className="form-textarea"
                                dir={isRtl ? 'rtl' : 'ltr'}
                                placeholder={isRtl ? 'محتوى الصفحة بالعربية...' : 'Contenu de la page en français...'}
                                value={translations[contentLang]?.content || ''}
                                onChange={(e) => updateTranslation(contentLang, 'content', e.target.value)}
                                style={{ minHeight: '200px', lineHeight: 1.6 }}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Dynamic Page Sections Builder */}
            <div className="admin-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '18px', borderBottom: '1px solid #E5E7EB', paddingBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Layers size={18} color="#F36B16" />
                        <div>
                            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#151515' }}>
                                Page Sections ({sections.length})
                            </h3>
                            <small style={{ color: '#64748B' }}>
                                Add structured sections below the main content. Each section supports EN, AR, and FR.
                            </small>
                        </div>
                    </div>
                    <button type="button" className="btn btn-dark btn-sm" onClick={addSection}>
                        <Plus size={15} /> Add Section
                    </button>
                </div>

                {sections.length === 0 ? (
                    <div
                        style={{
                            border: '1px dashed #CBD5E1',
                            borderRadius: '8px',
                            padding: '32px 20px',
                            textAlign: 'center',
                            backgroundColor: '#F8FAFC',
                        }}
                    >
                        <p style={{ margin: '0 0 12px', color: '#475569', fontSize: '14px' }}>
                            No custom sections added to this page yet.
                        </p>
                        <button type="button" className="btn btn-primary btn-sm" onClick={addSection}>
                            <Plus size={15} /> Add First Section
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {sections.map((section, idx) => {
                            const activeHeading =
                                contentLang === 'en'
                                    ? section.heading || ''
                                    : section.translations?.[contentLang]?.heading || '';
                            const activeBody =
                                contentLang === 'en'
                                    ? section.body || ''
                                    : section.translations?.[contentLang]?.body || '';

                            const hasEn = Boolean(section.heading || section.body);
                            const hasAr = Boolean(section.translations?.ar?.heading || section.translations?.ar?.body);
                            const hasFr = Boolean(section.translations?.fr?.heading || section.translations?.fr?.body);

                            return (
                                <div
                                    key={section.id || idx}
                                    style={{
                                        border: '1px solid #E2E8F0',
                                        borderRadius: '8px',
                                        padding: '18px',
                                        backgroundColor: '#FFFFFF',
                                    }}
                                >
                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            flexWrap: 'wrap',
                                            gap: '10px',
                                            marginBottom: '14px',
                                            paddingBottom: '10px',
                                            borderBottom: '1px solid #F1F5F9',
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                            <span
                                                style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    width: '26px',
                                                    height: '26px',
                                                    borderRadius: '6px',
                                                    backgroundColor: '#FFF7ED',
                                                    color: '#F36B16',
                                                    fontWeight: 800,
                                                    fontSize: '12px',
                                                }}
                                            >
                                                #{idx + 1}
                                            </span>
                                            <select
                                                className="form-select"
                                                value={section.type || 'text_block'}
                                                onChange={(e) => updateSectionField(idx, 'type', e.target.value)}
                                                style={{ width: '200px', height: '34px', fontSize: '13px', padding: '4px 10px' }}
                                            >
                                                {SECTION_TYPES.map((st) => (
                                                    <option key={st.value} value={st.value}>
                                                        {st.label}
                                                    </option>
                                                ))}
                                            </select>
                                            <div style={{ display: 'flex', gap: '4px' }}>
                                                <span className={`badge ${hasEn ? 'badge-success' : 'badge-warning'}`}>EN</span>
                                                <span className={`badge ${hasAr ? 'badge-success' : 'badge-warning'}`}>AR</span>
                                                <span className={`badge ${hasFr ? 'badge-success' : 'badge-warning'}`}>FR</span>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                            <button
                                                type="button"
                                                className="btn btn-outline btn-sm"
                                                onClick={() => moveSection(idx, -1)}
                                                disabled={idx === 0}
                                                title="Move Section Up"
                                            >
                                                <ArrowUp size={14} />
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-outline btn-sm"
                                                onClick={() => moveSection(idx, 1)}
                                                disabled={idx === sections.length - 1}
                                                title="Move Section Down"
                                            >
                                                <ArrowDown size={14} />
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-outline btn-sm"
                                                style={{ color: '#D93025' }}
                                                onClick={() => removeSection(idx)}
                                                title="Remove Section"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <div className="form-group">
                                            <label className="form-label">
                                                Section Heading ({contentLang.toUpperCase()})
                                            </label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                dir={isRtl ? 'rtl' : 'ltr'}
                                                placeholder={
                                                    contentLang === 'en'
                                                        ? 'e.g. Same-Day Dubai Express Delivery'
                                                        : isRtl
                                                        ? 'عنوان القسم بالعربية...'
                                                        : 'Titre de la section en français...'
                                                }
                                                value={activeHeading}
                                                onChange={(e) => updateSectionField(idx, 'heading', e.target.value)}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">
                                                Section Content ({contentLang.toUpperCase()})
                                            </label>
                                            <textarea
                                                className="form-textarea"
                                                dir={isRtl ? 'rtl' : 'ltr'}
                                                placeholder={
                                                    contentLang === 'en'
                                                        ? 'Write the section text or HTML...'
                                                        : isRtl
                                                        ? 'محتوى القسم بالعربية...'
                                                        : 'Contenu de la section en français...'
                                                }
                                                value={activeBody}
                                                onChange={(e) => updateSectionField(idx, 'body', e.target.value)}
                                                style={{ minHeight: '110px', lineHeight: 1.6 }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Bottom Submit Bar */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <Link href="/admin/pages" className="btn btn-outline">
                    Cancel
                </Link>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                    <Save size={15} /> {submitting ? 'Saving...' : isEditing ? 'Save Page Changes' : 'Create Page'}
                </button>
            </div>
        </form>
    );
}
