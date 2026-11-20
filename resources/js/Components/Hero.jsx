import React from 'react';
import { Link } from '@inertiajs/react';
import { ArrowRight, ShieldCheck, Zap, Disc } from 'lucide-react';

export default function Hero({ banner = null }) {
    const eyebrow = banner?.eyebrow || 'PERFORMANCE PARTS FOR DRIVERS';
    const description = banner?.subtitle || 'PREMIUM AUTOMOTIVE SPARE PARTS FOR STREET, TRACK, AND GARAGE BUILDS.';
    const ctaText = banner?.button_text || 'SHOP PERFORMANCE';
    const ctaLink = banner?.button_link || '/shop';

    return (
        <section className="home-hero">
            <div className="container">
                <div className="home-hero-inner">
                    {/* Left Column: Hero Text */}
                    <div className="home-hero-content">
                        <span className="home-hero-eyebrow">
                            {eyebrow}
                        </span>

                        <h1 className="home-hero-heading">
                            <span className="heading-white">BUILD</span>
                            <span className="heading-orange">UPGRADE</span>
                            <span className="heading-white">PERFORM</span>
                        </h1>

                        <p className="home-hero-desc">
                            {description}
                        </p>

                        <div className="home-hero-cta-group">
                            <Link href={ctaLink} className="btn btn-primary btn-lg">
                                {ctaText} <ArrowRight size={18} />
                            </Link>
                            <Link href="/vehicle-finder" className="btn btn-outline" style={{ color: '#FFFFFF', borderColor: '#444' }}>
                                Find By Vehicle
                            </Link>
                        </div>
                    </div>

                    {/* Right Column: Automotive Product Composition */}
                    <div className="home-hero-visual">
                        <div className="home-hero-visual-composition">
                            <img 
                                src="https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1000&q=80" 
                                alt="Performance Brakes, Exhaust and Tires" 
                                className="hero-main-car"
                            />
                            <div className="home-hero-visual-badge">
                                <div className="badge-icon">
                                    <ShieldCheck size={28} />
                                </div>
                                <div className="badge-text">
                                    <strong>Guaranteed Vehicle Fitment</strong>
                                    <span>Engineered for track & street builds</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
