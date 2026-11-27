import React from 'react';
import { Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { ChevronRight } from 'lucide-react';
import { useLanguage } from '@/Context/LanguageContext';

export default function StaticPage({ title, subtitle, content, translations = null, sections = [] }) {
    const { t, localize } = useLanguage();
    const pageEntity = { title, subtitle, content, translations };
    const displayTitle = localize(pageEntity, 'title');
    const displaySubtitle = localize(pageEntity, 'subtitle');
    const displayContent = localize(pageEntity, 'content');
    const normalizedSections = Array.isArray(sections) ? sections : [];

    const getSectionCardStyle = (type) => {
        switch (type) {
            case 'highlight_banner':
                return {
                    backgroundColor: '#FFF7ED',
                    border: '1px solid #FDBA74',
                    borderInlineStart: '4px solid #F36B16',
                };
            case 'info_card':
                return {
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #CBD5E1',
                    borderInlineStart: '4px solid #151515',
                };
            case 'faq_item':
                return {
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E5E7EB',
                };
            default:
                return {};
        }
    };

    return (
        <AppLayout title={displayTitle}>
            <div className="support-page">
                <div className="container">
                    {/* Breadcrumbs matching Shop, Brands, Categories */}
                    <div className="breadcrumb-nav">
                        <Link href="/" className="breadcrumb-link">{t('home')}</Link>
                        <ChevronRight size={12} className="breadcrumb-arrow" />
                        <Link href="/contact-us" className="breadcrumb-link">{t('support')}</Link>
                        <ChevronRight size={12} className="breadcrumb-arrow" />
                        <span className="breadcrumb-current">{displayTitle}</span>
                    </div>

                    {/* Left-Aligned Header matching Shop, Brands, Categories */}
                    <div className="support-page-header">
                        <h1>
                            <img src="/assets/icons/heading-stripe.webp" alt="" className="title-stripe-icon" />
                            {displayTitle}
                        </h1>
                        {displaySubtitle && <p>{displaySubtitle}</p>}
                    </div>

                    {/* Main Content Card */}
                    {displayContent && (
                        <div className="support-card">
                            <div
                                className="support-content"
                                dangerouslySetInnerHTML={{ __html: displayContent }}
                            />
                        </div>
                    )}

                    {/* Dynamic Multilingual Sections */}
                    {normalizedSections.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginTop: '20px' }}>
                            {normalizedSections.map((section, idx) => {
                                const heading = localize(section, 'heading');
                                const body = localize(section, 'body');
                                if (!heading && !body) return null;

                                return (
                                    <div
                                        key={section.id || idx}
                                        className="support-card"
                                        style={getSectionCardStyle(section.type)}
                                    >
                                        {heading && (
                                            <h2
                                                style={{
                                                    marginTop: 0,
                                                    marginBottom: body ? '12px' : 0,
                                                    fontSize: '20px',
                                                    fontWeight: 800,
                                                    color: '#151515',
                                                }}
                                            >
                                                {heading}
                                            </h2>
                                        )}
                                        {body && (
                                            <div
                                                className="support-content"
                                                dangerouslySetInnerHTML={{ __html: body }}
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
