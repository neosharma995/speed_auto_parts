import React from 'react';
import { Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { ChevronRight } from 'lucide-react';
import { useLanguage } from '@/Context/LanguageContext';

export default function StaticPage({ title, subtitle, content, translations = null }) {
    const { t, localize } = useLanguage();
    const pageEntity = { title, subtitle, content, translations };
    const displayTitle = localize(pageEntity, 'title');
    const displaySubtitle = localize(pageEntity, 'subtitle');
    const displayContent = localize(pageEntity, 'content');

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

                    {/* Content Card */}
                    <div className="support-card">
                        <div 
                            className="support-content"
                            dangerouslySetInnerHTML={{ __html: displayContent }}
                        />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
