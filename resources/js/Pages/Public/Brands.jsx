import React from 'react';
import { Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { ChevronRight, ArrowRight, ExternalLink } from 'lucide-react';
import { useLanguage } from '@/Context/LanguageContext';

const BRAND_LOGOS = {
    'brembo': '/assets/icons/brembo.svg',
    'michelin': '/assets/icons/michelin.svg',
    'borla': '/assets/icons/borla.svg',
    'kn-engineering': '/assets/icons/kn.svg',
    'bilstein': '/assets/icons/bilstein.svg',
    'garrett-motion': '/assets/icons/garrett.svg',
    'akrapovic': '/assets/icons/akrapovic.svg',
    'bbs-wheels': '/assets/icons/bbs.svg',
};

const resolveBrandLogo = (brand) => {
    if (brand.logo && brand.logo.startsWith('/assets/')) {
        return brand.logo;
    }
    return BRAND_LOGOS[brand.slug] || '/assets/icons/brembo.svg';
};

export default function Brands({ brands = [] }) {
    const { t, localize } = useLanguage();

    return (
        <AppLayout title={t('certified_brands')}>
            <div className="brands-page">
                <div className="container">
                    {/* Breadcrumbs matching Shop Page */}
                    <div className="breadcrumb-nav">
                        <Link href="/" className="breadcrumb-link">{t('home')}</Link>
                        <ChevronRight size={12} className="breadcrumb-arrow" />
                        <span className="breadcrumb-current">{t('brands')}</span>
                    </div>

                    {/* Left-Aligned Header matching Shop Page */}
                    <div className="brands-page-header">
                        <h1>
                            <img src="/assets/icons/heading-stripe.webp" alt="" className="title-stripe-icon" />
                            {t('certified_brands')}
                        </h1>
                        <p>{t('certified_brands_desc')}</p>
                    </div>

                    {/* Responsive Brands Grid */}
                    <div className="brands-page-grid">
                        {brands.map(brand => {
                            const brandName = localize(brand, 'name');
                            const brandDesc = localize(brand, 'description', 'Premium automotive precision engineering manufacturer.');
                            return (
                                <div key={brand.id} className="brand-directory-card">
                                    <div className="brand-card-logo">
                                        <img 
                                            src={resolveBrandLogo(brand)} 
                                            alt={brandName} 
                                            onError={(e) => {
                                                e.currentTarget.onerror = null;
                                                e.currentTarget.src = BRAND_LOGOS[brand.slug] || '/assets/icons/brembo.svg';
                                            }}
                                        />
                                    </div>

                                    <div className="brand-card-body">
                                        <div className="brand-card-top">
                                            <h3>{brandName}</h3>
                                            {brand.website && (
                                                <a 
                                                    href={brand.website} 
                                                    target="_blank" 
                                                    rel="noreferrer" 
                                                    className="brand-card-link"
                                                    title="Official Website"
                                                >
                                                    <ExternalLink size={15} />
                                                </a>
                                            )}
                                        </div>

                                        <p className="brand-card-desc">
                                            {brandDesc}
                                        </p>

                                        <Link 
                                            href={`/shop?brand=${brand.slug}`} 
                                            className="brand-card-btn"
                                        >
                                            {t('explore_parts')} — {brandName} <ArrowRight size={14} />
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
