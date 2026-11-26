import React from 'react';
import { Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { ChevronRight, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/Context/LanguageContext';

const CATEGORY_FALLBACK_IMAGES = {
    tires: '/assets/images/categories/tires.webp',
    brakes: '/assets/images/categories/brakes.webp',
    intake: '/assets/images/categories/intake.webp',
    exhaust: '/assets/images/categories/exhaust.webp',
    suspension: '/assets/images/categories/suspension.webp',
    engine: '/assets/images/categories/engine.webp',
    cooling: '/assets/images/categories/cooling.webp',
    lighting: '/assets/images/categories/lighting.webp',
};

const resolveCategoryImage = (cat) => {
    if (cat.image && (cat.image.startsWith('/assets/') || cat.image.startsWith('/storage/') || cat.image.startsWith('http'))) {
        return cat.image;
    }
    return CATEGORY_FALLBACK_IMAGES[cat.slug] || '/assets/images/categories/tires.webp';
};

export default function Categories({ categories = [] }) {
    const { t, localize } = useLanguage();

    return (
        <AppLayout title={t('browse_categories')}>
            <div className="categories-page">
                <div className="container">
                    {/* Breadcrumbs matching Shop Page */}
                    <div className="breadcrumb-nav">
                        <Link href="/" className="breadcrumb-link">{t('home')}</Link>
                        <ChevronRight size={12} className="breadcrumb-arrow" />
                        <span className="breadcrumb-current">{t('browse_categories')}</span>
                    </div>

                    {/* Left-Aligned Header matching Shop Page */}
                    <div className="categories-page-header">
                        <h1>
                            <img src="/assets/icons/heading-stripe.webp" alt="" className="title-stripe-icon" />
                            {t('browse_categories')}
                        </h1>
                        <p>{t('browse_categories_desc')}</p>
                    </div>

                    {/* Responsive Grid */}
                    <div className="categories-page-grid">
                        {categories.map(cat => {
                            const catName = localize(cat, 'name');
                            const catDesc = localize(cat, 'description');
                            return (
                                <Link 
                                    key={cat.id} 
                                    href={`/shop?category=${cat.slug}`} 
                                    className="category-directory-card"
                                >
                                    <div className="category-card-thumb">
                                        <img 
                                            src={resolveCategoryImage(cat)} 
                                            alt={catName} 
                                            onError={(e) => {
                                                e.currentTarget.onerror = null;
                                                e.currentTarget.src = CATEGORY_FALLBACK_IMAGES[cat.slug] || '/assets/images/categories/tires.webp';
                                            }}
                                        />
                                    </div>
                                    <div className="category-card-body">
                                        <h3 className="category-card-name">
                                            {catName}
                                        </h3>
                                        <p className="category-card-desc">
                                            {catDesc}
                                        </p>
                                        <span className="category-card-action">
                                            {t('explore_parts')} <ArrowRight size={14} />
                                        </span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
