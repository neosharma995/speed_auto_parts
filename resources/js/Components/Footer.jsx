import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Wrench, Phone, Mail, MapPin, CheckCircle, ArrowRight } from 'lucide-react';

export default function Footer() {
    const { settings = {}, navCategories = [] } = usePage().props;
    const [newsletterEmail, setNewsletterEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);

    const handleSubscribe = (e) => {
        e.preventDefault();
        if (newsletterEmail) {
            setSubscribed(true);
            setNewsletterEmail('');
        }
    };

    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-grid">
                    {/* Column 1: Brand & Contacts */}
                    <div className="footer-col footer-about">
                        <div className="header-logo" style={{ marginBottom: '8px' }}>
                            <div className="header-logo-icon">
                                <Wrench size={20} />
                            </div>
                            <span className="brand-title" style={{ color: '#FFFFFF' }}>
                                AUTO<span style={{ color: '#F36B16' }}>PARTS</span>
                            </span>
                        </div>
                        <p>
                            India's leading precision automotive spare parts and performance tuning supplier. 
                            From OEM maintenance replacements to track-ready suspension, brakes, and engine hardware.
                        </p>
                        <ul className="footer-contacts">
                            <li>
                                <Phone size={14} />
                                <span>{settings.store_phone || '+91 98765 43210'}</span>
                            </li>
                            <li>
                                <Mail size={14} />
                                <span>{settings.store_email || 'support@autoparts.com'}</span>
                            </li>
                            <li>
                                <MapPin size={14} />
                                <span>{settings.store_address || 'Auto Parts HQ, Sector 5, New Delhi 110001'}</span>
                            </li>
                        </ul>
                    </div>

                    {/* Column 2: Categories */}
                    <div className="footer-col">
                        <h4 className="footer-heading">Performance Parts</h4>
                        <ul className="footer-links">
                            <li><Link href="/shop?category=tires">Performance Tires</Link></li>
                            <li><Link href="/shop?category=brakes">Brake Rotors & Calipers</Link></li>
                            <li><Link href="/shop?category=intake">Cold Air Intakes</Link></li>
                            <li><Link href="/shop?category=exhaust">Cat-Back Exhausts</Link></li>
                            <li><Link href="/shop?category=suspension">Track Coilovers</Link></li>
                            <li><Link href="/vehicle-finder">Shop By Vehicle Fitment</Link></li>
                        </ul>
                    </div>

                    {/* Column 3: Customer Service & Policies */}
                    <div className="footer-col">
                        <h4 className="footer-heading">Support & Info</h4>
                        <ul className="footer-links">
                            <li><Link href="/about-us">About Auto Parts</Link></li>
                            <li><Link href="/contact-us">Customer Support</Link></li>
                            <li><Link href="/track-order">Track Your Shipment</Link></li>
                            <li><Link href="/shipping-policy">Shipping & Freight Policy</Link></li>
                            <li><Link href="/refund-returns">Return & Refund Policy</Link></li>
                            <li><Link href="/privacy-policy">Privacy & Cookie Policy</Link></li>
                            <li><Link href="/terms-and-conditions">Terms & Conditions</Link></li>
                        </ul>
                    </div>

                    {/* Column 4: Newsletter */}
                    <div className="footer-col footer-newsletter">
                        <h4 className="footer-heading">Garage Insider</h4>
                        <p>
                            Join over 50,000+ drivers and build enthusiasts. Receive technical fitment guides, track day updates, and exclusive discount codes.
                        </p>
                        {subscribed ? (
                            <div style={{ color: '#168A35', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', marginTop: '12px' }}>
                                <CheckCircle size={16} /> Thank you for subscribing to Auto Parts updates!
                            </div>
                        ) : (
                            <form onSubmit={handleSubscribe} className="footer-newsletter-form">
                                <input 
                                    type="email" 
                                    required
                                    placeholder="Enter your email address"
                                    value={newsletterEmail}
                                    onChange={(e) => setNewsletterEmail(e.target.value)}
                                />
                                <button type="submit" aria-label="Subscribe">
                                    <ArrowRight size={16} />
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="footer-bottom">
                    <span className="footer-bottom-copyright">
                        © {new Date().getFullYear()} AUTO PARTS Inc. All Rights Reserved. Designed for Street, Track, and Garage Builds.
                    </span>
                    <div className="footer-bottom-badges">
                        <span>GST Registered & Compliant</span>
                        <span>•</span>
                        <span>Secure Razorpay 256-Bit SSL</span>
                        <span>•</span>
                        <span>Pan-India Logistics</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
