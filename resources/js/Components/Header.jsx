import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { 
    Wrench, 
    ShoppingCart, 
    User as UserIcon, 
    Search, 
    Menu, 
    X, 
    ChevronDown, 
    Phone, 
    Mail, 
    ShieldCheck, 
    Car,
    SlidersHorizontal,
    LogOut,
    Package
} from 'lucide-react';
import { useCart } from '@/Context/CartContext';

export default function Header() {
    const { auth, navCategories = [], navBrands = [], settings = {} } = usePage().props;
    const { itemCount, setIsCartOpen } = useCart();
    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
    const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);

    return (
        <header className="header">
            {/* Top Announcement & Quick Contact Bar */}
            <div className="header-top">
                <div className="container header-top-inner">
                    <div className="header-top-contacts">
                        <a href={`tel:${settings.store_phone || '+919876543210'}`}>
                            <Phone size={12} />
                            <span>{settings.store_phone || '+91 98765 43210'}</span>
                        </a>
                        <a href={`mailto:${settings.store_email || 'support@autoparts.com'}`}>
                            <Mail size={12} />
                            <span>{settings.store_email || 'support@autoparts.com'}</span>
                        </a>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#168A35' }}>
                            <ShieldCheck size={12} />
                            <span>100% Genuine Certified Spare Parts</span>
                        </span>
                    </div>
                    <div className="header-top-links">
                        <Link href="/track-order">Track Your Order</Link>
                        <span>|</span>
                        <Link href="/shipping-policy">Express Dispatch</Link>
                        {auth?.user?.roles?.includes('admin') && (
                            <>
                                <span>|</span>
                                <Link href="/admin/dashboard" style={{ color: '#F36B16', fontWeight: 'bold' }}>
                                    Admin Dashboard
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Navbar */}
            <div className="header-main">
                <div className="container header-main-inner">
                    {/* Brand Logo */}
                    <Link href="/" className="header-logo">
                        <div className="header-logo-icon">
                            <Wrench size={20} />
                        </div>
                        <div className="header-logo-text">
                            <span className="brand-title">AUTO<span>PARTS</span></span>
                            <span className="brand-subtitle">Performance Spares</span>
                        </div>
                    </Link>

                    {/* Desktop Navigation Links */}
                    <nav className="header-nav">
                        <div className="header-nav-item">
                            <Link href="/shop" className="header-nav-link">
                                Performance <ChevronDown size={14} />
                            </Link>
                            <div className="header-dropdown">
                                <Link href="/shop?category=tires" className="header-dropdown-item">Tires & Track Rubber</Link>
                                <Link href="/shop?category=brakes" className="header-dropdown-item">Rotors & Big Brake Kits</Link>
                                <Link href="/shop?category=intake" className="header-dropdown-item">Cold Air Intake Systems</Link>
                                <Link href="/shop?category=exhaust" className="header-dropdown-item">Stainless Cat-Back Exhausts</Link>
                                <Link href="/shop?category=suspension" className="header-dropdown-item">Adjustable Coilovers</Link>
                                <Link href="/shop" className="header-dropdown-item" style={{ color: '#F36B16', fontWeight: 'bold' }}>
                                    View All Performance Parts →
                                </Link>
                            </div>
                        </div>

                        <div className="header-nav-item">
                            <Link href="/vehicle-finder" className="header-nav-link">
                                <Car size={15} /> Shop By Vehicle
                            </Link>
                        </div>

                        <div className="header-nav-item">
                            <Link href="/brands" className="header-nav-link">
                                Brands <ChevronDown size={14} />
                            </Link>
                            <div className="header-dropdown">
                                {navBrands.map(brand => (
                                    <Link key={brand.id} href={`/brands/${brand.slug}`} className="header-dropdown-item">
                                        {brand.name}
                                    </Link>
                                ))}
                                <Link href="/brands" className="header-dropdown-item" style={{ color: '#F36B16', fontWeight: 'bold' }}>
                                    All Certified Brands →
                                </Link>
                            </div>
                        </div>

                        <div className="header-nav-item">
                            <Link href="/contact-us" className="header-nav-link">Support</Link>
                        </div>
                    </nav>

                    {/* Right-Side Actions */}
                    <div className="header-actions">
                        <Link href="/shop" className="header-actions-btn" title="Search Parts">
                            <Search size={20} />
                            <span className="action-label">Search</span>
                        </Link>

                        {/* Customer Account Button */}
                        <div style={{ position: 'relative' }}>
                            {auth?.user ? (
                                <button 
                                    type="button"
                                    onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                                    className="header-actions-btn"
                                >
                                    <UserIcon size={20} />
                                    <span className="action-label">{auth.user.name.split(' ')[0]}</span>
                                    <ChevronDown size={14} />
                                </button>
                            ) : (
                                <Link href="/login" className="header-actions-btn">
                                    <UserIcon size={20} />
                                    <span className="action-label">Account</span>
                                </Link>
                            )}

                            {accountDropdownOpen && auth?.user && (
                                <div className="header-dropdown" style={{ display: 'block', right: 0, left: 'auto' }}>
                                    {auth.user.roles?.includes('admin') && (
                                        <Link href="/admin/dashboard" className="header-dropdown-item">
                                            Admin Dashboard
                                        </Link>
                                    )}
                                    <Link href="/customer/dashboard" className="header-dropdown-item">
                                        My Dashboard
                                    </Link>
                                    <Link href="/customer/orders" className="header-dropdown-item">
                                        Order History
                                    </Link>
                                    <Link href="/customer/addresses" className="header-dropdown-item">
                                        Saved Addresses
                                    </Link>
                                    <Link href="/customer/wishlist" className="header-dropdown-item">
                                        My Wishlist
                                    </Link>
                                    <Link href="/logout" method="post" as="button" className="header-dropdown-item" style={{ width: '100%', textAlign: 'left', color: '#D93025' }}>
                                        Sign Out
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Shopping Cart Button */}
                        <button 
                            type="button" 
                            className="header-actions-cart"
                            onClick={() => setIsCartOpen(true)}
                            aria-label="Open Cart"
                        >
                            <ShoppingCart size={20} />
                            {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
                        </button>

                        {/* Mobile Drawer Trigger */}
                        <button 
                            type="button" 
                            className="header-actions-mobile-toggle"
                            onClick={() => setMobileDrawerOpen(true)}
                            aria-label="Open Menu"
                        >
                            <Menu size={24} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Drawer */}
            {mobileDrawerOpen && (
                <>
                    <div className="header-backdrop" onClick={() => setMobileDrawerOpen(false)} />
                    <div className="header-drawer">
                        <div className="header-drawer-header">
                            <div className="header-logo">
                                <div className="header-logo-icon">
                                    <Wrench size={18} />
                                </div>
                                <span className="brand-title" style={{ fontSize: '16px', fontWeight: 900 }}>
                                    AUTO<span style={{ color: '#F36B16' }}>PARTS</span>
                                </span>
                            </div>
                            <button type="button" onClick={() => setMobileDrawerOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="header-drawer-menu">
                            <Link href="/" onClick={() => setMobileDrawerOpen(false)}>Home</Link>
                            <Link href="/shop" onClick={() => setMobileDrawerOpen(false)}>Shop All Parts</Link>
                            <Link href="/vehicle-finder" onClick={() => setMobileDrawerOpen(false)}>Shop By Vehicle</Link>
                            <Link href="/categories" onClick={() => setMobileDrawerOpen(false)}>Categories</Link>
                            <Link href="/brands" onClick={() => setMobileDrawerOpen(false)}>Brands</Link>
                            <Link href="/contact-us" onClick={() => setMobileDrawerOpen(false)}>Support</Link>
                            {auth?.user?.roles?.includes('admin') && (
                                <Link href="/admin/dashboard" onClick={() => setMobileDrawerOpen(false)} style={{ color: '#F36B16', fontWeight: 'bold' }}>
                                    Admin Dashboard
                                </Link>
                            )}
                        </div>

                        <div className="header-drawer-footer">
                            {auth?.user ? (
                                <>
                                    <Link href="/customer/dashboard" className="btn btn-outline btn-full" onClick={() => setMobileDrawerOpen(false)}>
                                        My Account ({auth.user.name})
                                    </Link>
                                    <Link href="/logout" method="post" as="button" className="btn btn-dark btn-full">
                                        Sign Out
                                    </Link>
                                </>
                            ) : (
                                <Link href="/login" className="btn btn-primary btn-full" onClick={() => setMobileDrawerOpen(false)}>
                                    Sign In / Register
                                </Link>
                            )}
                        </div>
                    </div>
                </>
            )}
        </header>
    );
}
