import React from 'react';
import { Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { ChevronRight } from 'lucide-react';

export default function StaticPage({ title, subtitle, content }) {
    return (
        <AppLayout title={title}>
            <div className="support-page">
                <div className="container">
                    {/* Breadcrumbs matching Shop, Brands, Categories */}
                    <div className="breadcrumb-nav">
                        <Link href="/" className="breadcrumb-link">Home</Link>
                        <ChevronRight size={12} className="breadcrumb-arrow" />
                        <Link href="/contact-us" className="breadcrumb-link">Support</Link>
                        <ChevronRight size={12} className="breadcrumb-arrow" />
                        <span className="breadcrumb-current">{title}</span>
                    </div>

                    {/* Left-Aligned Header matching Shop, Brands, Categories */}
                    <div className="support-page-header">
                        <h1>
                            <img src="/assets/icons/heading-stripe.webp" alt="" className="title-stripe-icon" />
                            {title}
                        </h1>
                        {subtitle && <p>{subtitle}</p>}
                    </div>

                    {/* Content Card */}
                    <div className="support-card">
                        <div 
                            className="support-content"
                            dangerouslySetInnerHTML={{ __html: content }}
                        />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
