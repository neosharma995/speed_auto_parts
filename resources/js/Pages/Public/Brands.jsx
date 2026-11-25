import React from 'react';
import { Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { ChevronRight, ArrowRight, ExternalLink } from 'lucide-react';

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
    return (
        <AppLayout title="Certified Automotive Brands">
            <div className="brands-page">
                <div className="container">
                    {/* Breadcrumbs matching Shop Page */}
                    <div className="breadcrumb-nav">
                        <Link href="/" className="breadcrumb-link">Home</Link>
                        <ChevronRight size={12} className="breadcrumb-arrow" />
                        <span className="breadcrumb-current">Certified Brands</span>
                    </div>

                    {/* Left-Aligned Header matching Shop Page */}
                    <div className="brands-page-header">
                        <h1>
                            <img src="/assets/icons/heading-stripe.webp" alt="" className="title-stripe-icon" />
                            Certified Performance Brands
                        </h1>
                        <p>We partner directly with leading OEM and motorsport manufacturers for 100% genuine guaranteed spares</p>
                    </div>

                    {/* Responsive Brands Grid */}
                    <div className="brands-page-grid">
                        {brands.map(brand => (
                            <div key={brand.id} className="brand-directory-card">
                                <div className="brand-card-logo">
                                    <img 
                                        src={resolveBrandLogo(brand)} 
                                        alt={brand.name} 
                                        onError={(e) => {
                                            e.currentTarget.onerror = null;
                                            e.currentTarget.src = BRAND_LOGOS[brand.slug] || '/assets/icons/brembo.svg';
                                        }}
                                    />
                                </div>

                                <div className="brand-card-body">
                                    <div className="brand-card-top">
                                        <h3>{brand.name}</h3>
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
                                        {brand.description || 'Premium automotive precision engineering manufacturer.'}
                                    </p>

                                    <Link 
                                        href={`/shop?brand=${brand.slug}`} 
                                        className="brand-card-btn"
                                    >
                                        View {brand.name} Products <ArrowRight size={14} />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
