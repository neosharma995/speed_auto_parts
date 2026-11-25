import React from 'react';
import { Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { ChevronRight, ArrowRight } from 'lucide-react';

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
    if (cat.image && cat.image.startsWith('/assets/images/categories/')) {
        return cat.image;
    }
    return CATEGORY_FALLBACK_IMAGES[cat.slug] || '/assets/images/categories/tires.webp';
};

export default function Categories({ categories = [] }) {
    return (
        <AppLayout title="All Product Categories">
            <div className="categories-page">
                <div className="container">
                    {/* Breadcrumbs matching Shop Page */}
                    <div className="breadcrumb-nav">
                        <Link href="/" className="breadcrumb-link">Home</Link>
                        <ChevronRight size={12} className="breadcrumb-arrow" />
                        <span className="breadcrumb-current">Product Categories</span>
                    </div>

                    {/* Left-Aligned Header matching Shop Page */}
                    <div className="categories-page-header">
                        <h1>
                            <img src="/assets/icons/heading-stripe.webp" alt="" className="title-stripe-icon" />
                            Performance Spare Categories
                        </h1>
                        <p>Explore precision replacement components categorized by vehicle system</p>
                    </div>

                    {/* Responsive Grid */}
                    <div className="categories-page-grid">
                        {categories.map(cat => (
                            <Link 
                                key={cat.id} 
                                href={`/shop?category=${cat.slug}`} 
                                className="category-directory-card"
                            >
                                <div className="category-card-thumb">
                                    <img 
                                        src={resolveCategoryImage(cat)} 
                                        alt={cat.name} 
                                        onError={(e) => {
                                            e.currentTarget.onerror = null;
                                            e.currentTarget.src = CATEGORY_FALLBACK_IMAGES[cat.slug] || '/assets/images/categories/tires.webp';
                                        }}
                                    />
                                </div>
                                <div className="category-card-body">
                                    <h3 className="category-card-name">
                                        {cat.name}
                                    </h3>
                                    <p className="category-card-desc">
                                        {cat.description}
                                    </p>
                                    <span className="category-card-action">
                                        Browse Products <ArrowRight size={14} />
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
