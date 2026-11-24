import React, { useState, useEffect, useRef } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    ShoppingCart,
    User as UserIcon,
    Search,
    Menu,
    List,
    X,
    ChevronDown,
    ChevronUp,
    CarFront,
    Heart,
    Phone,
    LayoutDashboard,
    ShoppingBag,
    MapPin,
    LogOut,
    Shield,
    Package
} from 'lucide-react';
import { useCart } from '@/Context/CartContext';
import { useWishlist } from '@/Context/WishlistContext';
import SearchDropdown from './SearchDropdown';

export default function Header() {
    const { auth, navBrands = [], settings = {} } = usePage().props;
    const { itemCount, setIsCartOpen } = useCart();
    const { wishlist = [] } = useWishlist();
    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
    const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
    const [selectedLang, setSelectedLang] = useState('EN');
    const [selectedCurrency, setSelectedCurrency] = useState('USD');
    const [langOpen, setLangOpen] = useState(false);
    const [currencyOpen, setCurrencyOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchResults, setSearchResults] = useState(null);
    const [searchSelectedIndex, setSearchSelectedIndex] = useState(-1);
    const [isScrolled, setIsScrolled] = useState(false);
    const [expandedSubmenu, setExpandedSubmenu] = useState(null);

    const accountRef = useRef(null);
    const langRef = useRef(null);
    const currencyRef = useRef(null);
    const desktopSearchRef = useRef(null);
    const mobileSearchRef = useRef(null);
    const debounceTimerRef = useRef(null);
    const abortControllerRef = useRef(null);

    // Language & Currency available options
    const languageOptions = [
        { code: 'EN', name: 'English' },
        { code: 'AR', name: 'العربية' },
        { code: 'DE', name: 'Deutsch' },
        { code: 'FR', name: 'Français' },
    ];

    const currencyOptions = [
        { code: 'USD', name: 'USD ($)' },
        { code: 'EUR', name: 'EUR (€)' },
        { code: 'AED', name: 'AED (د.إ)' },
    ];

    // Click outside listener for language and currency dropdowns
    useEffect(() => {
        if (!langOpen && !currencyOpen) return;
        const handleClickOutside = (e) => {
            if (langRef.current && !langRef.current.contains(e.target)) {
                setLangOpen(false);
            }
            if (currencyRef.current && !currencyRef.current.contains(e.target)) {
                setCurrencyOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [langOpen, currencyOpen]);

    // Fetch search suggestions (empty query returns popular & categories/brands)
    const fetchSuggestions = (query = '') => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        setSearchLoading(true);
        const url = query.trim()
            ? `/api/search/suggestions?q=${encodeURIComponent(query.trim())}`
            : `/api/search/suggestions`;

        fetch(url, { signal: abortControllerRef.current.signal })
            .then((res) => {
                if (!res.ok) throw new Error('Search suggestions failed');
                return res.json();
            })
            .then((data) => {
                setSearchResults(data);
                setSearchLoading(false);
            })
            .catch((err) => {
                if (err.name !== 'AbortError') {
                    setSearchLoading(false);
                }
            });
    };

    // Handle input change with debounce
    const handleSearchChange = (value) => {
        setSearchQuery(value);
        setSearchSelectedIndex(-1);
        setIsSearchOpen(true);

        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = setTimeout(() => {
            fetchSuggestions(value);
        }, 220);
    };

    // Handle input focus
    const handleSearchFocus = () => {
        setIsSearchOpen(true);
        if (!searchResults) {
            fetchSuggestions(searchQuery);
        }
    };

    // Handle popular search tag click
    const handleSelectPopular = (term) => {
        setSearchQuery(term);
        setIsSearchOpen(true);
        fetchSuggestions(term);
    };

    // Handle clear search
    const handleClearSearch = () => {
        setSearchQuery('');
        setSearchSelectedIndex(-1);
        fetchSuggestions('');
    };

    // Handle keyboard navigation (ArrowUp, ArrowDown, Enter, Escape)
    const handleSearchKeyDown = (e) => {
        if (!isSearchOpen) {
            if (e.key === 'ArrowDown') {
                setIsSearchOpen(true);
                if (!searchResults) fetchSuggestions(searchQuery);
            }
            return;
        }

        const products = searchResults?.products || [];

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (products.length > 0) {
                setSearchSelectedIndex((prev) => (prev < products.length - 1 ? prev + 1 : 0));
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (products.length > 0) {
                setSearchSelectedIndex((prev) => (prev > 0 ? prev - 1 : products.length - 1));
            }
        } else if (e.key === 'Enter') {
            if (searchSelectedIndex >= 0 && products[searchSelectedIndex]) {
                e.preventDefault();
                setIsSearchOpen(false);
                window.location.href = `/products/${products[searchSelectedIndex].slug}`;
            }
        } else if (e.key === 'Escape') {
            setIsSearchOpen(false);
        }
    };

    // Click outside listener for search dropdown (desktop & mobile)
    useEffect(() => {
        if (!isSearchOpen) return;
        const handleSearchClickOutside = (e) => {
            const inDesktop = desktopSearchRef.current && desktopSearchRef.current.contains(e.target);
            const inMobile = mobileSearchRef.current && mobileSearchRef.current.contains(e.target);
            if (!inDesktop && !inMobile) {
                setIsSearchOpen(false);
            }
        };
        document.addEventListener('mousedown', handleSearchClickOutside, true);
        document.addEventListener('touchstart', handleSearchClickOutside, true);
        return () => {
            document.removeEventListener('mousedown', handleSearchClickOutside, true);
            document.removeEventListener('touchstart', handleSearchClickOutside, true);
        };
    }, [isSearchOpen]);

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
        setIsSearchOpen(false);
        if (searchQuery.trim()) {
            window.location.href = `/shop?search=${encodeURIComponent(searchQuery.trim())}`;
        } else {
            window.location.href = '/shop';
        }
    };

    return (
        <header className={`site-header ${isScrolled ? 'is-scrolled' : ''} ${isSearchOpen ? 'is-search-open' : ''}`}>
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
                        {/* Language Selector (Hover & Click) */}
                        <div
                            className={`utility-select-dropdown ${langOpen ? 'is-open' : ''}`}
                            ref={langRef}
                            onMouseEnter={() => {
                                setLangOpen(true);
                                setCurrencyOpen(false);
                            }}
                            onMouseLeave={() => setLangOpen(false)}
                        >
                            <button
                                type="button"
                                className="utility-select-trigger"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setLangOpen((prev) => {
                                        if (!prev) setCurrencyOpen(false);
                                        return !prev;
                                    });
                                }}
                                aria-expanded={langOpen}
                                aria-label="Select Language"
                            >
                                <span>{selectedLang}</span>
                                <ChevronDown
                                    size={11}
                                    strokeWidth={2.2}
                                    className={`utility-chevron ${langOpen ? 'is-rotated' : ''}`}
                                />
                            </button>

                            <div className="utility-dropdown-menu">
                                {languageOptions.map((lang) => (
                                    <button
                                        key={lang.code}
                                        type="button"
                                        className={`utility-dropdown-item ${selectedLang === lang.code ? 'is-active' : ''}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedLang(lang.code);
                                            setLangOpen(false);
                                        }}
                                    >
                                        <span className="item-code">{lang.code}</span>
                                        <span className="item-name">{lang.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Currency Selector (Hover & Click) */}
                        <div
                            className={`utility-select-dropdown ${currencyOpen ? 'is-open' : ''}`}
                            ref={currencyRef}
                            onMouseEnter={() => {
                                setCurrencyOpen(true);
                                setLangOpen(false);
                            }}
                            onMouseLeave={() => setCurrencyOpen(false)}
                        >
                            <button
                                type="button"
                                className="utility-select-trigger"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setCurrencyOpen((prev) => {
                                        if (!prev) setLangOpen(false);
                                        return !prev;
                                    });
                                }}
                                aria-expanded={currencyOpen}
                                aria-label="Select Currency"
                            >
                                <span>{selectedCurrency}</span>
                                <ChevronDown
                                    size={11}
                                    strokeWidth={2.2}
                                    className={`utility-chevron ${currencyOpen ? 'is-rotated' : ''}`}
                                />
                            </button>

                            <div className="utility-dropdown-menu">
                                {currencyOptions.map((curr) => (
                                    <button
                                        key={curr.code}
                                        type="button"
                                        className={`utility-dropdown-item ${selectedCurrency === curr.code ? 'is-active' : ''}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedCurrency(curr.code);
                                            setCurrencyOpen(false);
                                        }}
                                    >
                                        <span className="item-code">{curr.code}</span>
                                        <span className="item-name">{curr.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <Link href="/track-order" className="utility-link">Track Order</Link>
                        <Link href="/contact-us" className="utility-link">Help & Support</Link>

                        {auth?.user?.roles?.includes('admin') && (
                            <Link href="/admin/dashboard" className="utility-link-accent">
                                Admin
                            </Link>
                        )}
                        {auth?.user?.roles?.includes('supplier') && (
                            <Link href="/supplier/dashboard" className="utility-link-accent">
                                Supplier
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

                        {/* Centered White Pill Search Bar with Autocomplete Dropdown */}
                        <form
                            onSubmit={handleSearchSubmit}
                            className="site-header-search"
                            ref={desktopSearchRef}
                            autoComplete="off"
                        >
                            <input
                                type="text"
                                placeholder="Search by part number, product, brand..."
                                value={searchQuery}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                onFocus={handleSearchFocus}
                                onKeyDown={handleSearchKeyDown}
                                aria-label="Search by part number, product, brand"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    className="search-clear-btn"
                                    onClick={handleClearSearch}
                                    aria-label="Clear search query"
                                >
                                    <X size={15} />
                                </button>
                            )}
                            <button type="submit" aria-label="Search" className="search-submit-btn">
                                <Search size={15} strokeWidth={2.4} />
                            </button>

                            <SearchDropdown
                                isOpen={isSearchOpen}
                                loading={searchLoading}
                                results={searchResults}
                                searchQuery={searchQuery}
                                selectedIndex={searchSelectedIndex}
                                onSelectPopular={handleSelectPopular}
                                onClose={() => setIsSearchOpen(false)}
                                isMobile={false}
                            />
                        </form>

                        {/* Right: Actions (Account, Wishlist, Cart) */}
                        <div className="site-header-actions">
                            {/* Account Button */}
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
                                            <strong className="user-name">Sign In / Register</strong>
                                        </div>
                                    </Link>
                                )}

                                {accountDropdownOpen && auth?.user && (
                                    <div
                                        className="site-header-dropdown user-menu-dropdown"
                                        style={{ display: 'block' }}
                                    >
                                        {auth.user.roles?.includes('admin') && (
                                            <Link
                                                href="/admin/dashboard"
                                                className="site-header-dropdown-item"
                                                onClick={() => setAccountDropdownOpen(false)}
                                            >
                                                <Shield size={16} strokeWidth={2} />
                                                <span>Admin Dashboard</span>
                                            </Link>
                                        )}
                                        {auth.user.roles?.includes('supplier') && (
                                            <Link
                                                href="/supplier/dashboard"
                                                className="site-header-dropdown-item"
                                                onClick={() => setAccountDropdownOpen(false)}
                                            >
                                                <Package size={16} strokeWidth={2} />
                                                <span>Supplier Dashboard</span>
                                            </Link>
                                        )}
                                        <Link
                                            href="/customer/dashboard"
                                            className="site-header-dropdown-item"
                                            onClick={() => setAccountDropdownOpen(false)}
                                        >
                                            <LayoutDashboard size={16} strokeWidth={2} />
                                            <span>My Dashboard</span>
                                        </Link>
                                        <Link
                                            href="/customer/orders"
                                            className="site-header-dropdown-item"
                                            onClick={() => setAccountDropdownOpen(false)}
                                        >
                                            <ShoppingBag size={16} strokeWidth={2} />
                                            <span>Order History</span>
                                        </Link>
                                        <Link
                                            href="/customer/addresses"
                                            className="site-header-dropdown-item"
                                            onClick={() => setAccountDropdownOpen(false)}
                                        >
                                            <MapPin size={16} strokeWidth={2} />
                                            <span>Saved Addresses</span>
                                        </Link>
                                        <Link
                                            href="/customer/wishlist"
                                            className="site-header-dropdown-item"
                                            onClick={() => setAccountDropdownOpen(false)}
                                        >
                                            <Heart size={16} strokeWidth={2} />
                                            <span>My Wishlist</span>
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

                            {/* Wishlist Icon */}
                            <Link href="/customer/wishlist" className="site-header-action-icon" title="Wishlist">
                                <Heart size={24} strokeWidth={1.8} />
                                {wishlist.length > 0 && <span className="action-badge">{wishlist.length}</span>}
                            </Link>

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
                        </div>

                        {/* Mobile Toggle Button with Custom Burger Icon */}
                        <button
                            type="button"
                            className="site-header-mobile-toggle"
                            onClick={() => setMobileDrawerOpen(true)}
                            aria-label="Open Menu"
                        >
                            <svg className="ekit-menu-icon ekit-svg-icon icon-burger-menu" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" aria-hidden="true">
                                <path d="M0 18.294h32v-2.563h-32v2.563zM11.519 25.975h20.481v-2.563h-20.481v2.563zM6.4 8.056v2.563h25.6v-2.563h-25.6z"></path>
                            </svg>
                        </button>
                    </div>
                </div>

                {/* ------------------------------------------------------------ */}
                {/* ROW 2.5: MOBILE SUBBAR (SEARCH, ACCOUNT, CART & ORDER NOW)   */}
                {/* ------------------------------------------------------------ */}
                <div className="site-header-mobile-subbar">
                    <div className="container site-header-mobile-subbar-inner">
                        <div className="mobile-subbar-right-group">
                            {/* Search Toggle Icon */}
                            <button
                                type="button"
                                className="mobile-subbar-icon-btn"
                                onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
                                aria-label="Search Catalog"
                            >
                                <Search size={21} strokeWidth={2} />
                            </button>

                            {/* Account Icon */}
                            <Link
                                href={auth?.user ? "/customer/dashboard" : "/login"}
                                className="mobile-subbar-icon-btn"
                                aria-label="My Account"
                            >
                                <UserIcon size={21} strokeWidth={2} />
                            </Link>

                            {/* Shopping Cart Icon with Badge */}
                            <button
                                type="button"
                                className="mobile-subbar-icon-btn mobile-subbar-cart-btn"
                                onClick={() => setIsCartOpen(true)}
                                aria-label="Open Cart"
                            >
                                <ShoppingCart size={21} strokeWidth={2} />
                                <span className="mobile-subbar-cart-badge">{itemCount}</span>
                            </button>

                            {/* ORDER NOW solid button -> redirect to /shop */}
                            <Link href="/shop" className="mobile-subbar-order-btn">
                                ORDER NOW
                            </Link>
                        </div>
                    </div>

                    {/* Expandable Mobile Search Field with Autocomplete Dropdown */}
                    {mobileSearchOpen && (
                        <div className="mobile-search-expand-wrap" ref={mobileSearchRef}>
                            <form onSubmit={handleSearchSubmit} className="mobile-search-form" autoComplete="off">
                                <input
                                    type="text"
                                    placeholder="Search by part number, product, brand..."
                                    value={searchQuery}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                    onFocus={handleSearchFocus}
                                    onKeyDown={handleSearchKeyDown}
                                    autoFocus
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        className="mobile-search-clear"
                                        onClick={handleClearSearch}
                                        aria-label="Clear search query"
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                                <button type="submit" className="mobile-search-submit" aria-label="Search">
                                    <Search size={16} />
                                </button>
                            </form>

                            <SearchDropdown
                                isOpen={isSearchOpen}
                                loading={searchLoading}
                                results={searchResults}
                                searchQuery={searchQuery}
                                selectedIndex={searchSelectedIndex}
                                onSelectPopular={handleSelectPopular}
                                onClose={() => setIsSearchOpen(false)}
                                isMobile={true}
                            />
                        </div>
                    )}
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
                                            <Link key={b.id} href={`/shop?brand=${b.slug}`} className="site-header-dropdown-item">{b.name}</Link>
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
                                    <Link href="/contact-us" className="site-header-nav-link">
                                        <span>Support</span>
                                        <ChevronDown size={12} strokeWidth={2.2} className="nav-chevron" />
                                    </Link>
                                    <div className="site-header-dropdown">
                                        <Link href="/contact-us" className="site-header-dropdown-item">Contact Us</Link>
                                        <Link href="/about-us" className="site-header-dropdown-item">About Us</Link>
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
                            {/* All Categories Link */}
                            <Link
                                href="/categories"
                                className="mobile-drawer-link highlight"
                                onClick={() => setMobileDrawerOpen(false)}
                            >
                                <List size={16} /> All Categories
                            </Link>

                            {/* Home with Accordion */}
                            <div className="mobile-drawer-item">
                                <div className="mobile-drawer-item-row">
                                    <Link
                                        href="/"
                                        className="mobile-drawer-link-text"
                                        onClick={() => setMobileDrawerOpen(false)}
                                    >
                                        Home
                                    </Link>
                                    <button
                                        type="button"
                                        className={`mobile-drawer-chevron-btn ${expandedSubmenu === 'home' ? 'is-open' : ''}`}
                                        onClick={() => setExpandedSubmenu(expandedSubmenu === 'home' ? null : 'home')}
                                        aria-label="Toggle Home menu"
                                    >
                                        {expandedSubmenu === 'home' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                    </button>
                                </div>
                                {expandedSubmenu === 'home' && (
                                    <div className="mobile-drawer-submenu">
                                        <Link href="/" className="mobile-drawer-sublink highlight-sublink" onClick={() => setMobileDrawerOpen(false)}>Homepage</Link>
                                        <Link href="/shop?sort=latest" className="mobile-drawer-sublink" onClick={() => setMobileDrawerOpen(false)}>New Arrivals</Link>
                                        <Link href="/shop?sort=rating" className="mobile-drawer-sublink" onClick={() => setMobileDrawerOpen(false)}>Featured Parts</Link>
                                        <Link href="/shop" className="mobile-drawer-sublink" onClick={() => setMobileDrawerOpen(false)}>Shop All Parts</Link>
                                        <Link href="/vehicle-finder" className="mobile-drawer-sublink" onClick={() => setMobileDrawerOpen(false)}>Vehicle Fitment Finder</Link>
                                        <Link href="/categories" className="mobile-drawer-sublink" onClick={() => setMobileDrawerOpen(false)}>Browse Categories</Link>
                                        <Link href="/brands" className="mobile-drawer-sublink" onClick={() => setMobileDrawerOpen(false)}>Top Brands</Link>
                                    </div>
                                )}
                            </div>

                            {/* Performance Parts with Accordion */}
                            <div className="mobile-drawer-item">
                                <div className="mobile-drawer-item-row">
                                    <Link
                                        href="/shop"
                                        className="mobile-drawer-link-text"
                                        onClick={() => setMobileDrawerOpen(false)}
                                    >
                                        Performance Parts
                                    </Link>
                                    <button
                                        type="button"
                                        className={`mobile-drawer-chevron-btn ${expandedSubmenu === 'performance' ? 'is-open' : ''}`}
                                        onClick={() => setExpandedSubmenu(expandedSubmenu === 'performance' ? null : 'performance')}
                                        aria-label="Toggle Performance menu"
                                    >
                                        {expandedSubmenu === 'performance' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                    </button>
                                </div>
                                {expandedSubmenu === 'performance' && (
                                    <div className="mobile-drawer-submenu">
                                        <Link href="/shop" className="mobile-drawer-sublink highlight-sublink" onClick={() => setMobileDrawerOpen(false)}>All Performance Parts</Link>
                                        <Link href="/shop?category=tires" className="mobile-drawer-sublink" onClick={() => setMobileDrawerOpen(false)}>Tires & Track Rubber</Link>
                                        <Link href="/shop?category=brakes" className="mobile-drawer-sublink" onClick={() => setMobileDrawerOpen(false)}>Rotors & Big Brake Kits</Link>
                                        <Link href="/shop?category=intake" className="mobile-drawer-sublink" onClick={() => setMobileDrawerOpen(false)}>Cold Air Intake Systems</Link>
                                        <Link href="/shop?category=exhaust" className="mobile-drawer-sublink" onClick={() => setMobileDrawerOpen(false)}>Stainless Cat-Back Exhausts</Link>
                                        <Link href="/shop?category=suspension" className="mobile-drawer-sublink" onClick={() => setMobileDrawerOpen(false)}>Adjustable Coilovers</Link>
                                    </div>
                                )}
                            </div>

                            {/* Shop By Vehicle */}
                            <Link
                                href="/vehicle-finder"
                                className="mobile-drawer-link"
                                onClick={() => setMobileDrawerOpen(false)}
                            >
                                Shop By Vehicle
                            </Link>

                            {/* Brands with Accordion */}
                            <div className="mobile-drawer-item">
                                <div className="mobile-drawer-item-row">
                                    <Link
                                        href="/brands"
                                        className="mobile-drawer-link-text"
                                        onClick={() => setMobileDrawerOpen(false)}
                                    >
                                        Brands
                                    </Link>
                                    <button
                                        type="button"
                                        className={`mobile-drawer-chevron-btn ${expandedSubmenu === 'brands' ? 'is-open' : ''}`}
                                        onClick={() => setExpandedSubmenu(expandedSubmenu === 'brands' ? null : 'brands')}
                                        aria-label="Toggle Brands menu"
                                    >
                                        {expandedSubmenu === 'brands' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                    </button>
                                </div>
                                {expandedSubmenu === 'brands' && (
                                    <div className="mobile-drawer-submenu">
                                        <Link href="/brands" className="mobile-drawer-sublink highlight-sublink" onClick={() => setMobileDrawerOpen(false)}>
                                            View All Brands
                                        </Link>
                                        {navBrands.length > 0 ? (
                                            navBrands.map(b => (
                                                <Link key={b.id} href={`/shop?brand=${b.slug}`} className="mobile-drawer-sublink" onClick={() => setMobileDrawerOpen(false)}>
                                                    {b.name}
                                                </Link>
                                            ))
                                        ) : (
                                            <>
                                                <Link href="/shop?brand=brembo" className="mobile-drawer-sublink" onClick={() => setMobileDrawerOpen(false)}>Brembo</Link>
                                                <Link href="/shop?brand=michelin" className="mobile-drawer-sublink" onClick={() => setMobileDrawerOpen(false)}>Michelin</Link>
                                                <Link href="/shop?brand=borla" className="mobile-drawer-sublink" onClick={() => setMobileDrawerOpen(false)}>Borla</Link>
                                                <Link href="/shop?brand=kn-engineering" className="mobile-drawer-sublink" onClick={() => setMobileDrawerOpen(false)}>K&N Engineering</Link>
                                                <Link href="/shop?brand=bilstein" className="mobile-drawer-sublink" onClick={() => setMobileDrawerOpen(false)}>Bilstein</Link>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Deals */}
                            <Link
                                href="/shop?filter=deals"
                                className="mobile-drawer-link deals-highlight"
                                onClick={() => setMobileDrawerOpen(false)}
                            >
                                <span className="site-header-deals-icon">%</span> Deals
                            </Link>

                            {/* Support with Accordion */}
                            <div className="mobile-drawer-item">
                                <div className="mobile-drawer-item-row">
                                    <Link
                                        href="/contact-us"
                                        className="mobile-drawer-link-text"
                                        onClick={() => setMobileDrawerOpen(false)}
                                    >
                                        Support
                                    </Link>
                                    <button
                                        type="button"
                                        className={`mobile-drawer-chevron-btn ${expandedSubmenu === 'support' ? 'is-open' : ''}`}
                                        onClick={() => setExpandedSubmenu(expandedSubmenu === 'support' ? null : 'support')}
                                        aria-label="Toggle Support menu"
                                    >
                                        {expandedSubmenu === 'support' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                    </button>
                                </div>
                                {expandedSubmenu === 'support' && (
                                    <div className="mobile-drawer-submenu">
                                        <Link href="/contact-us" className="mobile-drawer-sublink" onClick={() => setMobileDrawerOpen(false)}>Contact Us</Link>
                                        <Link href="/about-us" className="mobile-drawer-sublink" onClick={() => setMobileDrawerOpen(false)}>About Us</Link>
                                        <Link href="/track-order" className="mobile-drawer-sublink" onClick={() => setMobileDrawerOpen(false)}>Track Order</Link>
                                        <Link href="/shipping-policy" className="mobile-drawer-sublink" onClick={() => setMobileDrawerOpen(false)}>Shipping Policy</Link>
                                        <Link href="/return-policy" className="mobile-drawer-sublink" onClick={() => setMobileDrawerOpen(false)}>Return & Refund</Link>
                                        <Link href="/terms" className="mobile-drawer-sublink" onClick={() => setMobileDrawerOpen(false)}>Terms & Conditions</Link>
                                        <Link href="/faqs" className="mobile-drawer-sublink" onClick={() => setMobileDrawerOpen(false)}>FAQs</Link>
                                        <Link href="/help-center" className="mobile-drawer-sublink" onClick={() => setMobileDrawerOpen(false)}>Help Center</Link>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mobile-drawer-footer">
                            {auth?.user ? (
                                <Link
                                    href="/customer/dashboard"
                                    className="mobile-account-btn"
                                    onClick={() => setMobileDrawerOpen(false)}
                                >
                                    <UserIcon size={16} /> My Account
                                </Link>
                            ) : (
                                <Link
                                    href="/login"
                                    className="mobile-account-btn"
                                    onClick={() => setMobileDrawerOpen(false)}
                                >
                                    <UserIcon size={16} /> Sign In / Register
                                </Link>
                            )}
                        </div>
                    </div>
                </>
            )}
        </header>
    );
}
