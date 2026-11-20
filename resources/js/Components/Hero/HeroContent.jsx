import React from 'react';
import { Link } from '@inertiajs/react';
import { ArrowRight, ShieldCheck } from 'lucide-react';

/**
 * Hero Brand Content & CTA Section
 * Preserves the exact AUTO PARTS hierarchy and messaging with guaranteed contrast
 */
export default function HeroContent({ banner = null, sceneIndex = 0 }) {
    const eyebrow = banner?.eyebrow || 'PERFORMANCE PARTS FOR DRIVERS';
    const description = banner?.subtitle || 'PREMIUM AUTOMOTIVE SPARE PARTS FOR STREET, TRACK, AND GARAGE BUILDS.';
    const ctaText = banner?.button_text || 'SHOP PERFORMANCE';
    const ctaLink = banner?.button_link || '/shop';

    return (
        <div className="home-hero-content">
            {/* Eyebrow */}
            <span className="home-hero-eyebrow">
                {eyebrow}
            </span>

            {/* Main Brand Heading */}
            <h1 className="home-hero-heading">
                <span className="heading-white">BUILD</span>
                <span className="heading-orange">UPGRADE</span>
                <span className="heading-white">PERFORM</span>
            </h1>

            {/* Description */}
            <p className="home-hero-desc">
                {description}
            </p>

            {/* CTA Action Buttons */}
            <div className="home-hero-cta-group">
                <Link
                    href={ctaLink}
                    className="btn btn-primary btn-lg hero-primary-btn"
                >
                    <span>{ctaText}</span>
                    <ArrowRight size={18} />
                </Link>

                <Link
                    href="/vehicle-finder"
                    className="btn btn-outline hero-secondary-btn"
                >
                    Find By Vehicle
                </Link>
            </div>

            {/* Fitment Guarantee Badge */}
            <div className="home-hero-guarantee-badge">
                <div className="badge-icon">
                    <ShieldCheck size={22} />
                </div>
                <div className="badge-text">
                    <strong>100% Guaranteed Fitment</strong>
                    <span>Engineered for track & street builds</span>
                </div>
            </div>
        </div>
    );
}
