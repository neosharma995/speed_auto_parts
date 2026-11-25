import React from 'react';
import { Link } from '@inertiajs/react';
import { LogIn, UserPlus, Shield, Zap, RotateCw } from 'lucide-react';

export default function GuestLayout({
    children,
    mode = 'login', // 'login' | 'register' | 'forgot'
    heroTag,
    heroTitle,
    heroDesc,
    switchText,
    switchHref,
    switchLabel,
}) {
    const isRegister = mode === 'register';

    return (
        <div className="auth-layout">
            {/* ------------------------------------------------------------ */}
            {/* 1. CAR CUTOUT: Outside inner container, bottom-left screen   */}
            {/* ------------------------------------------------------------ */}
            <div className="auth-car-cutout" aria-hidden="true">
                <img
                    src="/assets/images/auth/auth-car.png"
                    alt="Speed Autos Parts Performance Vehicle"
                />
            </div>

            {/* ------------------------------------------------------------ */}
            {/* 2. TOP BAR: Official Brand Logo, Accent Slashes, Switch CTA   */}
            {/* ------------------------------------------------------------ */}
            <header className="auth-top-bar">
                <div className="container auth-top-bar-inner">
                    <Link href="/" className="auth-top-bar-logo" title="Speed Autos Parts Home">
                        <img
                            src="/assets/images/logo/speedautoparts-official-dark.png"
                            alt="Speed Autos Parts - Performance Spare Parts"
                            className="auth-top-bar-logo-img"
                        />
                    </Link>

                    <div className="auth-top-bar-divider" aria-hidden="true">
                        <span className="divider-line" />
                        <div className="divider-slashes">
                            <span />
                            <span />
                            <span />
                        </div>
                    </div>

                    <div className="auth-top-bar-switch">
                        <span className="auth-top-bar-text">
                            {switchText || (isRegister ? 'Already have an account?' : 'New here?')}
                        </span>
                        <Link
                            href={switchHref || (isRegister ? '/login' : '/register')}
                            className="auth-top-bar-pill"
                        >
                            {isRegister ? <LogIn size={15} /> : <UserPlus size={15} />}
                            <span>{switchLabel || (isRegister ? 'Sign In' : 'Create Account')}</span>
                        </Link>
                    </div>
                </div>
            </header>

            {/* ------------------------------------------------------------ */}
            {/* 3. MAIN SECTION: Two-column grid inside .container           */}
            {/* ------------------------------------------------------------ */}
            <main className="auth-main">
                <div className="container">
                    <div className="auth-main-grid">
                        {/* LEFT COLUMN: Automotive Brand Hero & Selling Points */}
                        <section className="auth-hero">
                            <div className="auth-hero-tag">
                                <img
                                    src="/assets/icons/heading-stripe.webp"
                                    alt=""
                                    className="title-stripe-icon"
                                />
                                <span>{heroTag || 'PERFORMANCE AUTO PARTS'}</span>
                            </div>

                            <h1 className="auth-hero-title">
                                {heroTitle || (
                                    <>
                                        Genuine Parts
                                        <span className="title-accent">for Every Drive</span>
                                    </>
                                )}
                            </h1>

                            <p className="auth-hero-desc">
                                {heroDesc ||
                                    'Shop authentic auto parts, upgrade performance, and keep your vehicle running at its best.'}
                            </p>

                            <div className="auth-hero-features">
                                <div className="auth-hero-feature-item">
                                    <div className="auth-hero-feature-icon">
                                        <Shield size={26} strokeWidth={2} />
                                    </div>
                                    <div className="auth-hero-feature-title">
                                        Trusted<br />Parts
                                    </div>
                                </div>

                                <div className="auth-hero-feature-item">
                                    <div className="auth-hero-feature-icon">
                                        <Zap size={26} strokeWidth={2} />
                                    </div>
                                    <div className="auth-hero-feature-title">
                                        Better<br />Performance
                                    </div>
                                </div>

                                <div className="auth-hero-feature-item">
                                    <div className="auth-hero-feature-icon">
                                        <RotateCw size={26} strokeWidth={2} />
                                    </div>
                                    <div className="auth-hero-feature-title">
                                        Longer<br />Durability
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* RIGHT COLUMN: Interactive Form Content */}
                        <section className="auth-form-card">
                            {children}
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}
