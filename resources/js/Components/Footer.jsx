import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { ArrowRight, CheckCircle, ShoppingBag, Info, Headphones } from 'lucide-react';

export default function Footer() {
    const { settings = {} } = usePage().props;
    const [newsletterEmail, setNewsletterEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);

    const handleNewsletterSubmit = (e) => {
        e.preventDefault();
        if (newsletterEmail.trim()) {
            setSubscribed(true);
            setNewsletterEmail('');
        }
    };

    return (
        <footer className="footer-unified">
            {/* 1. Top Section: Newsletter Strip with Sports Car within Container */}
            <div className="footer-newsletter-section">
                <div className="container footer-nl-container">
                    {/* Left: Sports Car aligned within container */}
                    <div className="footer-nl-car-col">
                        <img 
                            src="/assets/images/footer/footer-sports-car.webp" 
                            alt="Speed Autos Parts Performance Sports Car" 
                            className="footer-nl-car-img" 
                            loading="lazy"
                        />
                    </div>

                    {/* Right: Stay in the loop & form */}
                    <div className="footer-nl-content-col">
                        <div className="footer-nl-eyebrow">
                            <img src="/assets/icons/heading-stripe.webp" alt="" className="title-stripe-icon" />
                            <span>STAY IN THE LOOP</span>
                        </div>
                        <h2 className="footer-nl-heading">
                            Get Exclusive Deals &amp; Performance Updates
                        </h2>
                        <p className="footer-nl-desc">
                            Subscribe to our newsletter and be the first to know about new products, special offers, and expert automotive insights.
                        </p>

                        {subscribed ? (
                            <div className="footer-nl-success">
                                <CheckCircle size={18} className="text-primary" /> 
                                <span>Thank you for subscribing to Speed Autos Parts!</span>
                            </div>
                        ) : (
                            <form onSubmit={handleNewsletterSubmit} className="footer-nl-form-capsule">
                                <input 
                                    type="email" 
                                    required 
                                    placeholder="Enter your email address" 
                                    value={newsletterEmail}
                                    onChange={(e) => setNewsletterEmail(e.target.value)}
                                    aria-label="Email address"
                                    className="footer-nl-input"
                                />
                                <button type="submit" className="footer-nl-btn">
                                    <span>Subscribe</span>
                                    <ArrowRight size={15} />
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>

            {/* Crisp Section Divider Line */}
            <div className="footer-section-divider" />

            {/* 2. Middle Section: Main Footer 5-Column Grid */}
            <div className="footer-main-section">
                <div className="container">
                    <div className="footer-grid">
                        {/* Column 1: Official Logo, Desc & Socials */}
                        <div className="footer-col footer-brand-col">
                            <Link href="/" className="footer-brand-logo-wrap">
                                <img 
                                    src="/assets/images/logo/speedautoparts-official.png" 
                                    alt="Speed Autos Parts - Performance Spare Parts" 
                                    className="footer-brand-logo-img"
                                />
                            </Link>
                            <p className="footer-brand-desc">
                                Your trusted global source for premium automotive spare parts, performance upgrades, and genuine replacement components.
                            </p>
                            <div className="footer-social-row">
                                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Facebook">
                                    <svg width="17" height="17" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                                </a>
                                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Instagram">
                                    <svg width="17" height="17" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                                </a>
                                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="YouTube">
                                    <svg width="17" height="17" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                                </a>
                                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="LinkedIn">
                                    <svg width="17" height="17" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                                </a>
                                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="X">
                                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                                </a>
                            </div>
                        </div>

                        {/* Column 2: Shop */}
                        <div className="footer-col">
                            <h3 className="footer-heading">
                                <ShoppingBag size={16} color="#F97316" strokeWidth={2.2} className="footer-heading-icon" />
                                <span>Shop</span>
                            </h3>
                            <ul className="footer-links">
                                <li><Link href="/products">All Products</Link></li>
                                <li><Link href="/category/performance-parts">Performance Parts</Link></li>
                                <li><Link href="/category/tires">Tires</Link></li>
                                <li><Link href="/category/brakes">Brakes</Link></li>
                                <li><Link href="/category/exhaust">Exhaust</Link></li>
                                <li><Link href="/category/suspension">Suspension</Link></li>
                            </ul>
                        </div>

                        {/* Column 3: Information */}
                        <div className="footer-col">
                            <h3 className="footer-heading">
                                <Info size={16} color="#F97316" strokeWidth={2.2} className="footer-heading-icon" />
                                <span>Information</span>
                            </h3>
                            <ul className="footer-links">
                                <li><Link href="/about-us">About Us</Link></li>
                                <li><Link href="/contact-us">Contact Us</Link></li>
                                <li><Link href="/shipping-delivery">Shipping &amp; Delivery</Link></li>
                                <li><Link href="/return-policy">Returns &amp; Refunds</Link></li>
                                <li><Link href="/terms-and-conditions">Terms &amp; Conditions</Link></li>
                                <li><Link href="/privacy-policy">Privacy Policy</Link></li>
                            </ul>
                        </div>

                        {/* Column 4: Customer Support */}
                        <div className="footer-col">
                            <h3 className="footer-heading">
                                <Headphones size={16} color="#F97316" strokeWidth={2.2} className="footer-heading-icon" />
                                <span>Customer Support</span>
                            </h3>
                            <ul className="footer-links">
                                <li><Link href="/track-order">Track Your Order</Link></li>
                                <li><Link href="/help-center">Help Center</Link></li>
                                <li><Link href="/faqs">FAQs</Link></li>
                                <li><Link href="/terms-and-conditions">Warranty Information</Link></li>
                                <li><Link href="/vehicle-finder">Part Compatibility</Link></li>
                                <li><Link href="/contact-us">Request a Part</Link></li>
                            </ul>
                        </div>

                        {/* Column 5: Need Help Box */}
                        <div className="footer-col footer-contact-col">
                            <div className="need-help-card">
                                <div className="need-help-header">
                                    <div className="help-icon-wrap">
                                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="help-icon">
                                            <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                                            <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
                                        </svg>
                                    </div>
                                    <div className="help-text-group">
                                        <span className="help-label">Need Help?</span>
                                        <strong className="help-phone">{settings.store_phone || '+971 4 512 8900'}</strong>
                                    </div>
                                </div>
                                <span className="help-hours">Mon – Sat, 9:00 AM – 7:00 PM (Dubai / GST)</span>
                                <Link href="/contact-us" className="footer-contact-btn">
                                    Contact Support
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* 3. Bottom Bar: Copyright & Payment Badges with Corner Flares */}
                    <div className="footer-bottom">
                        <div className="footer-corner-flare flare-left" />
                        <div className="footer-corner-flare flare-right" />
                        
                        <span className="footer-bottom-copyright">
                            © {new Date().getFullYear()} Speed Autos Parts. All Rights Reserved.
                        </span>

                        <div className="footer-payment-badges">
                            {/* VISA */}
                            <div className="pay-badge visa-badge" title="Visa">
                                <span className="visa-text">VISA</span>
                            </div>

                            {/* Mastercard */}
                            <div className="pay-badge mastercard-badge" title="Mastercard">
                                <span className="mc-circle mc-red" />
                                <span className="mc-circle mc-orange" />
                            </div>

                            {/* AMEX */}
                            <div className="pay-badge amex-badge" title="American Express">
                                <span className="amex-text">AMEX</span>
                            </div>

                            {/* PayPal */}
                            <div className="pay-badge paypal-badge" title="PayPal">
                                <span className="pp-blue">Pay</span><span className="pp-cyan">Pal</span>
                            </div>

                            {/* Apple Pay */}
                            <div className="pay-badge applepay-badge" title="Apple Pay">
                                <svg width="12" height="15" viewBox="0 0 170 170" fill="currentColor">
                                    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.69-7.85-11.97-14.42-6.42-9.8-11.53-20.9-15.34-33.32-3.81-12.42-5.72-23.75-5.72-33.99 0-14.81 3.58-26.68 10.74-35.61 7.16-8.93 16.3-13.48 27.42-13.65 4.8 0 10.15 1.25 16.05 3.75 5.9 2.5 9.77 3.8 11.61 3.91 1.41 0 5.48-1.41 12.21-4.24 6.73-2.83 12.35-4.08 17.85-3.75 13.49.65 24.16 5.49 32.02 14.52-11.75 7.18-17.51 16.92-17.29 29.21.22 9.57 3.91 17.47 11.08 23.69 7.17 6.22 15.7 9.8 25.59 10.74-2.17 6.74-4.89 13.48-8.16 20.22zM119.22 31.81c0-7.72 2.76-14.85 8.27-21.39 5.51-6.54 12.28-10.42 20.31-11.64.22 1.09.33 2.18.33 3.26 0 7.62-2.88 14.86-8.64 21.72-5.76 6.86-12.67 10.78-20.73 11.77-.33-1.2-.54-2.44-.54-3.72z"/>
                                </svg>
                                <span>Pay</span>
                            </div>

                            {/* G Pay */}
                            <div className="pay-badge gpay-badge" title="Google Pay">
                                <span className="g-blue">G</span>
                                <span className="g-pay">Pay</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
