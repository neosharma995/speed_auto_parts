import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Phone, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

export default function Footer() {
    const { settings = {} } = usePage().props;

    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-grid">
                    {/* Column 1: Brand & Socials */}
                    <div className="footer-col footer-brand-col">
                        <Link href="/" className="header-logo" style={{ marginBottom: '12px' }}>
                            <div className="header-logo-badge">
                                <span className="badge-slash">///</span>
                            </div>
                            <div className="header-logo-text">
                                <span className="brand-title" style={{ color: '#FFFFFF' }}>
                                    SPEEDAUTOPARTS
                                </span>
                                <span className="brand-subtitle" style={{ color: '#F36B16' }}>
                                    PERFORMANCE SPARE PARTS
                                </span>
                            </div>
                        </Link>
                        <p className="footer-brand-desc">
                            Your trusted global source for premium automotive spare parts, performance upgrades, and genuine replacement components.
                        </p>
                        <div className="footer-social-row">
                            <a href="#" className="social-icon" aria-label="Facebook">f</a>
                            <a href="#" className="social-icon" aria-label="Instagram">ig</a>
                            <a href="#" className="social-icon" aria-label="YouTube">yt</a>
                            <a href="#" className="social-icon" aria-label="LinkedIn">in</a>
                            <a href="#" className="social-icon" aria-label="X">X</a>
                        </div>
                    </div>

                    {/* Column 2: Shop */}
                    <div className="footer-col">
                        <h4 className="footer-heading">Shop</h4>
                        <ul className="footer-links">
                            <li><Link href="/shop">All Products</Link></li>
                            <li><Link href="/shop?filter=performance">Performance Parts</Link></li>
                            <li><Link href="/shop?category=tires">Tires</Link></li>
                            <li><Link href="/shop?category=brakes">Brakes</Link></li>
                            <li><Link href="/shop?category=exhaust">Exhaust</Link></li>
                            <li><Link href="/shop?category=suspension">Suspension</Link></li>
                        </ul>
                    </div>

                    {/* Column 3: Information */}
                    <div className="footer-col">
                        <h4 className="footer-heading">Information</h4>
                        <ul className="footer-links">
                            <li><Link href="/about-us">About Us</Link></li>
                            <li><Link href="/contact-us">Contact Us</Link></li>
                            <li><Link href="/shipping-policy">Shipping & Delivery</Link></li>
                            <li><Link href="/refund-returns">Returns & Refunds</Link></li>
                            <li><Link href="/terms-and-conditions">Terms & Conditions</Link></li>
                            <li><Link href="/privacy-policy">Privacy Policy</Link></li>
                        </ul>
                    </div>

                    {/* Column 4: Customer Support */}
                    <div className="footer-col">
                        <h4 className="footer-heading">Customer Support</h4>
                        <ul className="footer-links">
                            <li><Link href="/track-order">Track Your Order</Link></li>
                            <li><Link href="/contact-us">Help Center</Link></li>
                            <li><Link href="/contact-us">FAQs</Link></li>
                            <li><Link href="/terms-and-conditions">Warranty Information</Link></li>
                            <li><Link href="/vehicle-finder">Part Compatibility</Link></li>
                            <li><Link href="/contact-us">Request a Part</Link></li>
                        </ul>
                    </div>

                    {/* Column 5: Need Help Contact */}
                    <div className="footer-col footer-contact-col">
                        <div className="need-help-header">
                            <div className="help-icon-wrap">
                                <Phone size={18} />
                            </div>
                            <div>
                                <span className="help-label">Need Help?</span>
                                <strong className="help-phone">{settings.store_phone || '+91 98765 43210'}</strong>
                            </div>
                        </div>
                        <span className="help-hours">Mon – Sat, 9:00 AM – 7:00 PM (IST)</span>
                        <Link href="/contact-us" className="btn btn-outline footer-contact-btn">
                            Contact Support
                        </Link>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="footer-bottom">
                    <span className="footer-bottom-copyright">
                        © {new Date().getFullYear()} SpeedAutoParts. All Rights Reserved.
                    </span>
                    <div className="footer-payment-badges">
                        <span className="pay-badge">VISA</span>
                        <span className="pay-badge">Mastercard</span>
                        <span className="pay-badge">PayPal</span>
                        <span className="pay-badge">Apple Pay</span>
                        <span className="pay-badge">G Pay</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
