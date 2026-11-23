import React, { useState, useEffect, useRef } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    ShoppingCart,
    User as UserIcon,
    Search,
    List,
    X,
    ChevronDown,
    ChevronUp,
    CarFront,
    Heart,
    Phone,
    LogOut,
    Shield
} from 'lucide-react';
import { useCart } from '@/Context/CartContext';
import { useWishlist } from '@/Context/WishlistContext';

export default function Header() {
    const { auth, navBrands = [], settings = {} } = usePage().props;
    const { itemCount, setIsCartOpen } = useCart();
    const { wishlist = [] } = useWishlist();
    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
    const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isScrolled, setIsScrolled] = useState(false);
    const accountRef = useRef(null);

    // Click outside listener for user account dropdown (using capture to intercept reliably)
    useEffect(() => {
        if (!accountDropdownOpen) return;
        const handleClickOutside = (e) => {
            if (accountRef.current && !accountRef.current.contains(e.target)) {
                setAccountDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside, true);
        document.addEventListener('touchstart', handleClickOutside, true);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside, true);
            document.removeEventListener('touchstart', handleClickOutside, true);
        };
    }, [accountDropdownOpen]);

    // Passive scroll listener for subtle shadow only - pure CSS handles sticky positioning
    useEffect(() => {
        let ticking = false;
        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const scrolled = window.scrollY > 32;
                    setIsScrolled(prev => prev !== scrolled ? scrolled : prev);
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            window.location.href = `/shop?search=${encodeURIComponent(searchQuery.trim())}`;
        }
    };

    return (
        <header className={`site-header ${isScrolled ? 'is-scrolled' : ''}`}>
            {/* ============================================================ */}
            {/* ROW 1: TOP UTILITY BAR (Dark #0B0B0E)                         */}
            {/* ============================================================ */}
            <div className="site-header-utility">
                <div className="container site-header-utility-inner">
                    <div className="site-header-utility-left">
                        <CarFront size={17} strokeWidth={2.2} className="utility-car-icon" />
                        <span>Free International Shipping on Orders Over $500</span>
                    </div>

                    <div className="site-header-utility-right">
                        <div className="utility-select">
                            <span>EN</span>
                            <ChevronDown size={11} strokeWidth={2.2} />
                        </div>
                        <div className="utility-select">
                            <span>USD</span>
                            <ChevronDown size={11} strokeWidth={2.2} />
                        </div>
                        <Link href="/track-order" className="utility-link">Track Order</Link>
                        <Link href="/contact" className="utility-link">Help & Support</Link>

                        {auth?.user?.roles?.includes('admin') && (
                            <Link href="/admin/dashboard" className="utility-link-accent">
                                Admin
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* ============================================================ */}
            {/* STICKY GROUP: ROW 2 (Main Header) & ROW 3 (Nav) STAY TOGETHER */}
            {/* ============================================================ */}
            <div className="site-header-sticky-group">
                {/* ------------------------------------------------------------ */}
                {/* ROW 2: MAIN HEADER (Dark #0B0B0E)                            */}
                {/* ------------------------------------------------------------ */}
                <div className="site-header-main">
                    <div className="container site-header-main-inner">
                        {/* Official Speed Autos Parts Logo Image */}
                        <Link href="/" className="site-header-logo">
                            <img
                                src="/assets/images/logo/speedautoparts-official.png"
                                alt="Speed Autos Parts - Performance Spare Parts"
                                className="site-header-logo-img"
                            />
                        </Link>

                        {/* Centered White Pill Search Bar */}
                        <form onSubmit={handleSearchSubmit} className="site-header-search">
                            <input
                                type="text"
                                placeholder="Search by part number, product, brand..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                aria-label="Search by part number, product, brand"
                            />
                            <button type="submit" aria-label="Search" className="search-submit-btn">
                                <Search size={15} strokeWidth={2.4} />
                            </button>
                        </form>

                        {/* Right: Actions (Login/Account, Cart & Mobile Menu) */}
                        <div className="site-header-actions">
                            {/* Login / Account Button */}
                            <div className="site-header-account-wrap" ref={accountRef}>
                                {auth?.user ? (
                                    <button 
                                        type="button" 
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setAccountDropdownOpen(prev => !prev);
                                        }}
                                        className="site-header-action-user"
                                        aria-expanded={accountDropdownOpen}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <UserIcon size={24} strokeWidth={1.8} className="action-user-icon" />
                                        <div className="action-user-text">
                                            <span className="user-sub">Account</span>
                                            <strong className="user-name">{auth.user.name.split(' ')[0]}</strong>
                                        </div>
                                        {accountDropdownOpen ? (
                                            <ChevronUp size={11} strokeWidth={2.2} className="user-chevron" />
                                        ) : (
                                            <ChevronDown size={11} strokeWidth={2.2} className="user-chevron" />
                                        )}
                                    </button>
                                ) : (
                                    <Link href="/login" className="site-header-action-user">
                                        <UserIcon size={24} strokeWidth={1.8} className="action-user-icon" />
                                        <div className="action-user-text">
                                            <span className="user-sub">Account</span>
                                            <strong className="user-name">Sign In</strong>
                                        </div>
                                    </Link>
                                )}

                                {accountDropdownOpen && auth?.user && (
                                    <div 
                                        className="site-header-dropdown user-menu-dropdown"
                                        style={{ display: 'block' }}
                                    >
                                        <Link 
                                            href="/admin/dashboard" 
                                            className="site-header-dropdown-item"
                                            onClick={() => setAccountDropdownOpen(false)}
                                        >
                                            <Shield size={16} strokeWidth={2} />
                                            <span>Admin Dashboard</span>
                                        </Link>
                                        <Link 
                                            href="/logout" 
                                            method="post" 
                                            as="button" 
                                            className="site-header-dropdown-item logout-link"
                                            onClick={() => setAccountDropdownOpen(false)}
                                        >
                                            <LogOut size={16} strokeWidth={2} />
                                            <span>Sign Out</span>
                                        </Link>
                                    </div>
                                )}
                            </div>

                            {/* Shopping Cart Icon with Orange Badge */}
                            <button 
                                type="button" 
                                className="site-header-action-icon cart-action-btn"
                                onClick={() => setIsCartOpen(true)}
                                aria-label="Open Cart"
                            >
                                <ShoppingCart size={24} strokeWidth={1.8} />
                                <span className="action-badge">{itemCount}</span>
                            </button>

                            {/* Mobile Drawer Trigger */}
                            <button 
                                type="button" 
                                className="site-header-mobile-toggle"
                                onClick={() => setMobileDrawerOpen(true)}
                                aria-label="Open Menu"
                            >
                                <List size={22} strokeWidth={2} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* ------------------------------------------------------------ */}
                {/* ROW 3: SECONDARY NAVIGATION (LEFT NAV + RIGHT CONTACT INFO)   */}
                {/* ------------------------------------------------------------ */}
                <div className="site-header-navigation">
                    <div className="container site-header-navigation-inner">
                        {/* Left Group: Categories + Navigation Links */}
                        <div className="site-header-nav-left-group">
                            <div className="site-header-nav-categories">
                                <Link href="/categories" className="categories-trigger-link">
                                    <List size={17} strokeWidth={2.4} className="categories-list-icon" />
                                    <span>All Categories</span>
                                </Link>
                            </div>

                            {/* Center / Left-aligned Navigation Links */}
                            <nav className="site-header-nav-list">
                                <div className="site-header-nav-item">
                                    <Link href="/" className="site-header-nav-link active">
                                        <span>Home</span>
                                        <ChevronDown size={12} strokeWidth={2.2} className="nav-chevron" />
                                    </Link>
                                    <div className="site-header-dropdown">
                                        <Link href="/shop?sort=latest" className="site-header-dropdown-item">New Arrivals</Link>
                                        <Link href="/shop?sort=rating" className="site-header-dropdown-item">Featured Parts</Link>
                                        <Link href="/shop" className="site-header-dropdown-item">Shop All Parts</Link>
                                        <Link href="/vehicle-finder" className="site-header-dropdown-item">Vehicle Fitment Finder</Link>
                                        <Link href="/categories" className="site-header-dropdown-item">Browse Categories</Link>
                                        <Link href="/brands" className="site-header-dropdown-item">Top Brands</Link>
                                    </div>
                                </div>

                                <div className="site-header-nav-item">
                                    <Link href="/shop" className="site-header-nav-link">
                                        <span>Performance</span>
                                        <ChevronDown size={12} strokeWidth={2.2} className="nav-chevron" />
                                    </Link>
                                    <div className="site-header-dropdown">
                                        <Link href="/shop?category=tires" className="site-header-dropdown-item">Tires & Track Rubber</Link>
                                        <Link href="/shop?category=brakes" className="site-header-dropdown-item">Rotors & Big Brake Kits</Link>
                                        <Link href="/shop?category=intake" className="site-header-dropdown-item">Cold Air Intake Systems</Link>
                                        <Link href="/shop?category=exhaust" className="site-header-dropdown-item">Stainless Cat-Back Exhausts</Link>
                                        <Link href="/shop?category=suspension" className="site-header-dropdown-item">Adjustable Coilovers</Link>
                                    </div>
                                </div>

                                <div className="site-header-nav-item">
                                    <Link href="/vehicle-finder" className="site-header-nav-link">
                                        <span>Shop By Vehicle</span>
                                        <ChevronDown size={12} strokeWidth={2.2} className="nav-chevron" />
                                    </Link>
                                </div>

                                <div className="site-header-nav-item">
                                    <Link href="/brands" className="site-header-nav-link">
                                        <span>Brands</span>
                                        <ChevronDown size={12} strokeWidth={2.2} className="nav-chevron" />
                                    </Link>
                                    <div className="site-header-dropdown">
                                        {navBrands.map(b => (
                                            <Link key={b.id} href={`/brands/${b.slug}`} className="site-header-dropdown-item">{b.name}</Link>
                                        ))}
                                    </div>
                                </div>

                                <div className="site-header-nav-item">
                                    <Link href="/shop?filter=deals" className="site-header-nav-link deals-link">
                                        <span className="site-header-deals-icon">%</span>
                                        <span>Deals</span>
                                    </Link>
                                </div>

                                <div className="site-header-nav-item">
                                    <Link href="/contact" className="site-header-nav-link">
                                        <span>Support</span>
                                        <ChevronDown size={12} strokeWidth={2.2} className="nav-chevron" />
                                    </Link>
                                    <div className="site-header-dropdown">
                                        <Link href="/contact" className="site-header-dropdown-item">Contact Us</Link>
                                        <Link href="/about" className="site-header-dropdown-item">About Us</Link>
                                        <Link href="/track-order" className="site-header-dropdown-item">Track Order</Link>
                                        <Link href="/shipping-policy" className="site-header-dropdown-item">Shipping Policy</Link>
                                        <Link href="/return-policy" className="site-header-dropdown-item">Return & Refund</Link>
                                        <Link href="/terms" className="site-header-dropdown-item">Terms & Conditions</Link>
                                    </div>
                                </div>
                            </nav>
                        </div>

                        {/* Right Side: Info / Contact */}
                        <div className="site-header-nav-right-info">
                            <a href={`tel:${settings.store_phone || '+919876543210'}`} className="nav-contact-link">
                                <Phone size={14} strokeWidth={2.2} className="nav-contact-icon" />
                                <span className="nav-contact-text">
                                    <span className="nav-contact-label">Hotline:</span>
                                    <strong className="nav-contact-val">{settings.store_phone || '+91 98765 43210'}</strong>
                                </span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* ============================================================ */}
            {/* MOBILE NAVIGATION DRAWER                                     */}
            {/* ============================================================ */}
            {mobileDrawerOpen && (
                <>
                    <div
                        className="mobile-drawer-overlay"
                        onClick={() => setMobileDrawerOpen(false)}
                        aria-hidden="true"
                    />
                    <div className="mobile-drawer">
                        <div className="mobile-drawer-header">
                            <img
                                src="/assets/images/logo/speedautoparts-official.png"
                                alt="Speed Autos Parts"
                                style={{ height: '30px', width: 'auto' }}
                            />
                            <button
                                type="button"
                                className="mobile-drawer-close"
                                onClick={() => setMobileDrawerOpen(false)}
                                aria-label="Close menu"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="mobile-drawer-body">
                            <Link
                                href="/categories"
                                className="mobile-drawer-link highlight"
                                onClick={() => setMobileDrawerOpen(false)}
                            >
                                <List size={16} /> All Categories
                            </Link>
                            <Link
                                href="/"
                                className="mobile-drawer-link"
                                onClick={() => setMobileDrawerOpen(false)}
                            >
                                Home
                            </Link>
                            <Link
                                href="/shop"
                                className="mobile-drawer-link"
                                onClick={() => setMobileDrawerOpen(false)}
                            >
                                Performance Parts
                            </Link>
                            <Link
                                href="/vehicle-finder"
                                className="mobile-drawer-link"
                                onClick={() => setMobileDrawerOpen(false)}
                            >
                                Shop By Vehicle
                            </Link>
                            <Link
                                href="/brands"
                                className="mobile-drawer-link"
                                onClick={() => setMobileDrawerOpen(false)}
                            >
                                Brands
                            </Link>
                            <Link
                                href="/shop?filter=deals"
                                className="mobile-drawer-link deals-highlight"
                                onClick={() => setMobileDrawerOpen(false)}
                            >
                                <span className="site-header-deals-icon">%</span> Deals
                            </Link>
                            <Link
                                href="/contact"
                                className="mobile-drawer-link"
                                onClick={() => setMobileDrawerOpen(false)}
                            >
                                Support
                            </Link>
                        </div>

                        <div className="mobile-drawer-footer">
                            {auth?.user ? (
                                <Link
                                    href="/admin/dashboard"
                                    className="mobile-account-btn"
                                    onClick={() => setMobileDrawerOpen(false)}
                                >
                                    <UserIcon size={16} /> Admin Dashboard
                                </Link>
                            ) : (
                                <Link
                                    href="/login"
                                    className="mobile-account-btn"
                                    onClick={() => setMobileDrawerOpen(false)}
                                >
                                    <UserIcon size={16} /> Sign In
                                </Link>
                            )}
                        </div>
                    </div>
                </>
            )}
        </header>
    );
}
