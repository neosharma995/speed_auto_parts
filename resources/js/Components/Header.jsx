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
    Package,
    Globe,
    Coins
} from 'lucide-react';
import { useCart } from '@/Context/CartContext';
import { useCurrency } from '@/Context/CurrencyContext';
import { useLanguage } from '@/Context/LanguageContext';
import { useWishlist } from '@/Context/WishlistContext';
import SearchDropdown from './SearchDropdown';

export default function Header() {
    const { auth, navBrands = [], settings = {}, activeVehicle } = usePage().props;
    const { itemCount, setIsCartOpen } = useCart();
    const { activeCurrency, availableCurrencies, setSelectedCurrency } = useCurrency();
    const { language: selectedLang, availableLanguages, setLanguage: setSelectedLang, t, localize } = useLanguage();
    const { wishlist = [] } = useWishlist();
    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
    const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
    const selectedCurrency = activeCurrency.code;
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
    const langLockedRef = useRef(false);
    const currencyLockedRef = useRef(false);
    const langTimerRef = useRef(null);
    const currencyTimerRef = useRef(null);

    // Sticky nav state & refs (shown after Support when header is scrolled)
    const [stickyLangOpen, setStickyLangOpen] = useState(false);
    const [stickyCurrencyOpen, setStickyCurrencyOpen] = useState(false);
    const stickyLangRef = useRef(null);
    const stickyCurrencyRef = useRef(null);
    const stickyLangLockedRef = useRef(false);
    const stickyCurrencyLockedRef = useRef(false);
    const stickyLangTimerRef = useRef(null);
    const stickyCurrencyTimerRef = useRef(null);

    // Mobile drawer state & refs
    const [mobileDrawerLangOpen, setMobileDrawerLangOpen] = useState(false);
    const [mobileDrawerCurrOpen, setMobileDrawerCurrOpen] = useState(false);
    const mobileDrawerLangRef = useRef(null);
    const mobileDrawerCurrRef = useRef(null);

    const desktopSearchRef = useRef(null);
    const mobileSearchRef = useRef(null);
    const debounceTimerRef = useRef(null);
    const abortControllerRef = useRef(null);

    // Language & Currency available options (3 languages matching our 3 currencies: EN/USD, AR/AED, FR/EUR)
    const languageOptions = availableLanguages;

    const currencyOptions = availableCurrencies;

    // Click outside listener for language and currency dropdowns (desktop, sticky & mobile drawer)
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (langRef.current && !langRef.current.contains(e.target)) {
                setLangOpen(false);
                langLockedRef.current = false;
            }
            if (currencyRef.current && !currencyRef.current.contains(e.target)) {
                setCurrencyOpen(false);
                currencyLockedRef.current = false;
            }
            if (stickyLangRef.current && !stickyLangRef.current.contains(e.target)) {
                setStickyLangOpen(false);
                stickyLangLockedRef.current = false;
            }
            if (stickyCurrencyRef.current && !stickyCurrencyRef.current.contains(e.target)) {
                setStickyCurrencyOpen(false);
                stickyCurrencyLockedRef.current = false;
            }
            if (mobileDrawerLangRef.current && !mobileDrawerLangRef.current.contains(e.target)) {
                setMobileDrawerLangOpen(false);
            }
            if (mobileDrawerCurrRef.current && !mobileDrawerCurrRef.current.contains(e.target)) {
                setMobileDrawerCurrOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, []);

    // Dropdown hover handlers with grace timer to prevent premature closing
    const handleLangMouseEnter = () => {
        if (langTimerRef.current) clearTimeout(langTimerRef.current);
        setLangOpen(true);
        setCurrencyOpen(false);
        currencyLockedRef.current = false;
    };
    const handleLangMouseLeave = () => {
        if (!langLockedRef.current) {
            langTimerRef.current = setTimeout(() => {
                if (!langLockedRef.current) setLangOpen(false);
            }, 150);
        }
    };
    const handleCurrencyMouseEnter = () => {
        if (currencyTimerRef.current) clearTimeout(currencyTimerRef.current);
        setCurrencyOpen(true);
        setLangOpen(false);
        langLockedRef.current = false;
    };
    const handleCurrencyMouseLeave = () => {
        if (!currencyLockedRef.current) {
            currencyTimerRef.current = setTimeout(() => {
                if (!currencyLockedRef.current) setCurrencyOpen(false);
            }, 150);
        }
    };

    const handleStickyLangMouseEnter = () => {
        if (stickyLangTimerRef.current) clearTimeout(stickyLangTimerRef.current);
        setStickyLangOpen(true);
        setStickyCurrencyOpen(false);
        stickyCurrencyLockedRef.current = false;
    };
    const handleStickyLangMouseLeave = () => {
        if (!stickyLangLockedRef.current) {
            stickyLangTimerRef.current = setTimeout(() => {
                if (!stickyLangLockedRef.current) setStickyLangOpen(false);
            }, 150);
        }
    };
    const handleStickyCurrencyMouseEnter = () => {
        if (stickyCurrencyTimerRef.current) clearTimeout(stickyCurrencyTimerRef.current);
        setStickyCurrencyOpen(true);
        setStickyLangOpen(false);
        stickyLangLockedRef.current = false;
    };
    const handleStickyCurrencyMouseLeave = () => {
        if (!stickyCurrencyLockedRef.current) {
            stickyCurrencyTimerRef.current = setTimeout(() => {
                if (!stickyCurrencyLockedRef.current) setStickyCurrencyOpen(false);
            }, 150);
        }
    };

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
                    if (scrolled) {
                        setLangOpen(false);
                        setCurrencyOpen(false);
                        langLockedRef.current = false;
                        currencyLockedRef.current = false;
                    } else {
                        setStickyLangOpen(false);
                        setStickyCurrencyOpen(false);
                        stickyLangLockedRef.current = false;
                        stickyCurrencyLockedRef.current = false;
                    }
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
                        <span>{selectedLang === 'EN' ? (settings.header_announcement || t('free_delivery_banner')) : t('free_delivery_banner')}</span>
                    </div>

                    <div className="site-header-utility-right">
                        {/* Language Selector (Hover & Click) */}
                        <div
                            className={`utility-select-dropdown notranslate ${langOpen ? 'is-open' : ''}`}
                            translate="no"
                            ref={langRef}
                            onMouseEnter={handleLangMouseEnter}
                            onMouseLeave={handleLangMouseLeave}
                        >
                            <button
                                type="button"
                                className="utility-select-trigger"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (langTimerRef.current) clearTimeout(langTimerRef.current);
                                    setLangOpen((prev) => {
                                        const next = !prev;
                                        langLockedRef.current = next;
                                        if (next) {
                                            setCurrencyOpen(false);
                                            currencyLockedRef.current = false;
                                        }
                                        return next;
                                    });
                                }}
                                aria-expanded={langOpen}
                                aria-label="Select Language"
                                title="Language"
                            >
                                <Globe size={13} strokeWidth={2.1} style={{ color: '#F36B16', flexShrink: 0 }} />
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
                                            langLockedRef.current = false;
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
                            className={`utility-select-dropdown notranslate ${currencyOpen ? 'is-open' : ''}`}
                            translate="no"
                            ref={currencyRef}
                            onMouseEnter={handleCurrencyMouseEnter}
                            onMouseLeave={handleCurrencyMouseLeave}
                        >
                            <button
                                type="button"
                                className="utility-select-trigger"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (currencyTimerRef.current) clearTimeout(currencyTimerRef.current);
                                    setCurrencyOpen((prev) => {
                                        const next = !prev;
                                        currencyLockedRef.current = next;
                                        if (next) {
                                            setLangOpen(false);
                                            langLockedRef.current = false;
                                        }
                                        return next;
                                    });
                                }}
                                aria-expanded={currencyOpen}
                                aria-label="Select Currency"
                                title="Currency"
                            >
                                <Coins size={13} strokeWidth={2.1} style={{ color: '#F36B16', flexShrink: 0 }} />
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
                                            currencyLockedRef.current = false;
                                        }}
                                    >
                                        <span className="item-code">{curr.code}</span>
                                        <span className="item-name">{curr.name} ({curr.symbol})</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <Link href="/track-order" className="utility-link">{t('track_order')}</Link>
                        <Link href="/contact-us" className="utility-link">{t('help_support')}</Link>

                        {auth?.user?.roles?.includes('admin') && (
                            <Link href="/admin/dashboard" className="utility-link-accent">
                                {t('admin')}
                            </Link>
                        )}
                        {auth?.user?.roles?.includes('supplier') && (
                            <Link href="/supplier/dashboard" className="utility-link-accent">
                                {t('supplier')}
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
                                src={settings.site_logo || '/assets/images/logo/speedautoparts-official.png'}
                                alt={settings.store_name || 'Speed Autos Parts - Performance Spare Parts'}
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
                                placeholder={t('search_placeholder')}
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
                                            <span className="user-sub">{t('account')}</span>
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
                                            <span className="user-sub">{t('account')}</span>
                                            <strong className="user-name">{t('sign_in_register')}</strong>
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
                            onClick={() => {
                                setLangOpen(false);
                                setCurrencyOpen(false);
                                langLockedRef.current = false;
                                currencyLockedRef.current = false;
                                setMobileDrawerOpen(true);
                            }}
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
                                {t('nav_order_now')}
                            </Link>
                        </div>
                    </div>

                    {/* Expandable Mobile Search Field with Autocomplete Dropdown */}
                    {mobileSearchOpen && (
                        <div className="mobile-search-expand-wrap" ref={mobileSearchRef}>
                            <form onSubmit={handleSearchSubmit} className="mobile-search-form" autoComplete="off">
                                <input
                                    type="text"
                                    placeholder={t('search_placeholder')}
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
                                    <span>{t('all_categories')}</span>
                                </Link>
                            </div>

                            {/* Center / Left-aligned Navigation Links */}
                            <nav className="site-header-nav-list">
                                <div className="site-header-nav-item">
                                    <Link href="/" className="site-header-nav-link active">
                                        <span>{t('home')}</span>
                                        <ChevronDown size={12} strokeWidth={2.2} className="nav-chevron" />
                                    </Link>
                                    <div className="site-header-dropdown">
                                        <Link href="/shop?sort=latest" className="site-header-dropdown-item">{t('new_arrivals')}</Link>
                                        <Link href="/shop?sort=rating" className="site-header-dropdown-item">{t('nav_featured_parts')}</Link>
                                        <Link href="/shop" className="site-header-dropdown-item">{t('nav_shop_all_parts')}</Link>
                                        <Link href="/vehicle-finder" className="site-header-dropdown-item">{t('nav_vehicle_fitment_finder')}</Link>
                                        <Link href="/categories" className="site-header-dropdown-item">{t('nav_browse_categories')}</Link>
                                        <Link href="/brands" className="site-header-dropdown-item">{t('nav_top_brands')}</Link>
                                    </div>
                                </div>

                                <div className="site-header-nav-item">
                                    <Link href="/shop" className="site-header-nav-link">
                                        <span>{t('performance')}</span>
                                        <ChevronDown size={12} strokeWidth={2.2} className="nav-chevron" />
                                    </Link>
                                    <div className="site-header-dropdown">
                                        <Link href="/shop?category=tires" className="site-header-dropdown-item">{t('nav_tires_track')}</Link>
                                        <Link href="/shop?category=brakes" className="site-header-dropdown-item">{t('nav_rotors_brakes')}</Link>
                                        <Link href="/shop?category=intake" className="site-header-dropdown-item">{t('nav_cold_air_intake')}</Link>
                                        <Link href="/shop?category=exhaust" className="site-header-dropdown-item">{t('nav_cat_back_exhaust')}</Link>
                                        <Link href="/shop?category=suspension" className="site-header-dropdown-item">{t('nav_adjustable_coilovers')}</Link>
                                    </div>
                                </div>

                                <div className="site-header-nav-item">
                                    <Link href="/vehicle-finder" className="site-header-nav-link">
                                        <span className="vehicle-nav-text">
                                            {t('shop_by_vehicle')}
                                            {activeVehicle && (
                                                <span
                                                    className="vehicle-active-dot"
                                                    title={`Active Vehicle: ${activeVehicle.year} ${activeVehicle.make} ${activeVehicle.model}`}
                                                />
                                            )}
                                        </span>
                                    </Link>
                                </div>

                                <div className="site-header-nav-item">
                                    <Link href="/brands" className="site-header-nav-link">
                                        <span>{t('brands')}</span>
                                        <ChevronDown size={12} strokeWidth={2.2} className="nav-chevron" />
                                    </Link>
                                    <div className="site-header-dropdown">
                                        {navBrands.map(b => (
                                            <Link key={b.id} href={`/shop?brand=${b.slug}`} className="site-header-dropdown-item">{localize(b, 'name')}</Link>
                                        ))}
                                    </div>
                                </div>

                                <div className="site-header-nav-item">
                                    <Link href="/shop?filter=deals" className="site-header-nav-link deals-link">
                                        <span className="site-header-deals-icon">%</span>
                                        <span>{t('deals')}</span>
                                    </Link>
                                </div>

                                <div className="site-header-nav-item">
                                    <Link href="/contact-us" className="site-header-nav-link">
                                        <span>{t('support')}</span>
                                        <ChevronDown size={12} strokeWidth={2.2} className="nav-chevron" />
                                    </Link>
                                    <div className="site-header-dropdown">
                                        <Link href="/track-order" className="site-header-dropdown-item">{t('track_order')}</Link>
                                        <Link href="/shipping-policy" className="site-header-dropdown-item">{t('nav_shipping_policy')}</Link>
                                        <Link href="/return-policy" className="site-header-dropdown-item">{t('nav_return_refund')}</Link>
                                        <Link href="/terms" className="site-header-dropdown-item">{t('footer_terms')}</Link>
                                    </div>
                                </div>

                                <div className="site-header-nav-item">
                                    <Link href="/about-us" className="site-header-nav-link">
                                        <span>{t('footer_about_us')}</span>
                                    </Link>
                                </div>

                                <div className="site-header-nav-item">
                                    <Link href="/contact-us" className="site-header-nav-link">
                                        <span>{t('footer_contact_us')}</span>
                                    </Link>
                                </div>

                                {/* Sticky bottom bar utilities (shown after Support when header is sticky) */}
                                <div
                                    className={`site-header-nav-item nav-sticky-item ${stickyLangOpen ? 'is-open' : ''}`}
                                    ref={stickyLangRef}
                                    onMouseEnter={handleStickyLangMouseEnter}
                                    onMouseLeave={handleStickyLangMouseLeave}
                                >
                                    <button
                                        type="button"
                                        className={`site-header-nav-link ${stickyLangOpen ? 'active' : ''}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (stickyLangTimerRef.current) clearTimeout(stickyLangTimerRef.current);
                                            setStickyLangOpen((prev) => {
                                                const next = !prev;
                                                stickyLangLockedRef.current = next;
                                                if (next) {
                                                    setStickyCurrencyOpen(false);
                                                    stickyCurrencyLockedRef.current = false;
                                                }
                                                return next;
                                            });
                                        }}
                                        aria-expanded={stickyLangOpen}
                                        aria-label="Select Language"
                                        title="Language"
                                    >
                                        <Globe size={14} strokeWidth={2.1} style={{ color: '#F36B16', flexShrink: 0 }} />
                                        <span className="notranslate" translate="no">{selectedLang}</span>
                                        <ChevronDown size={12} strokeWidth={2.2} className={`nav-chevron ${stickyLangOpen ? 'is-rotated' : ''}`} />
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
                                                    setStickyLangOpen(false);
                                                    stickyLangLockedRef.current = false;
                                                }}
                                            >
                                                <span className="item-code">{lang.code}</span>
                                                <span className="item-name">{lang.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div
                                    className={`site-header-nav-item nav-sticky-item ${stickyCurrencyOpen ? 'is-open' : ''}`}
                                    ref={stickyCurrencyRef}
                                    onMouseEnter={handleStickyCurrencyMouseEnter}
                                    onMouseLeave={handleStickyCurrencyMouseLeave}
                                >
                                    <button
                                        type="button"
                                        className={`site-header-nav-link ${stickyCurrencyOpen ? 'active' : ''}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (stickyCurrencyTimerRef.current) clearTimeout(stickyCurrencyTimerRef.current);
                                            setStickyCurrencyOpen((prev) => {
                                                const next = !prev;
                                                stickyCurrencyLockedRef.current = next;
                                                if (next) {
                                                    setStickyLangOpen(false);
                                                    stickyLangLockedRef.current = false;
                                                }
                                                return next;
                                            });
                                        }}
                                        aria-expanded={stickyCurrencyOpen}
                                        aria-label="Select Currency"
                                        title="Currency"
                                    >
                                        <Coins size={14} strokeWidth={2.1} style={{ color: '#F36B16', flexShrink: 0 }} />
                                        <span className="notranslate" translate="no">{selectedCurrency}</span>
                                        <ChevronDown size={12} strokeWidth={2.2} className={`nav-chevron ${stickyCurrencyOpen ? 'is-rotated' : ''}`} />
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
                                                    setStickyCurrencyOpen(false);
                                                    stickyCurrencyLockedRef.current = false;
                                                }}
                                            >
                                                <span className="item-code">{curr.code}</span>
                                                <span className="item-name">{curr.name} ({curr.symbol})</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </nav>
                        </div>

                        {/* Right Side: Info / Contact */}
                        <div className="site-header-nav-right-info">
                            <a href={`tel:${settings.store_phone || '+97145128900'}`} className="nav-contact-link">
                                <Phone size={14} strokeWidth={2.2} className="nav-contact-icon" />
                                <span className="nav-contact-text">
                                    <span className="nav-contact-label">{selectedLang === 'EN' ? (settings.header_hotline_label || `${t('dubai_hotline')}:`) : `${t('dubai_hotline')}:`}</span>
                                    <strong className="nav-contact-val">{settings.store_phone || '+971 4 512 8900'}</strong>
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
                                src={settings.site_logo || '/assets/images/logo/speedautoparts-official.png'}
                                alt={settings.store_name || 'Speed Autos Parts'}
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
                                <List size={16} /> {t('all_categories')}
                            </Link>

                            {/* Home with Accordion */}
                            <div className="mobile-drawer-item">
                                <div className="mobile-drawer-item-row">
                                    <Link
                                        href="/"
                                        className="mobile-drawer-link-text"
                                        onClick={() => setMobileDrawerOpen(false)}
                                    >
                                        {t('home')}
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
                                        <Link href="/" className="mobile-drawer-sublink highlight-sublink" onClick={() => setMobileDrawerOpen(false)}>{t('nav_homepage')}</Link>
                                        <Link href="/shop?sort=latest" className="mobile-drawer-sublink" onClick={() => setMobileDrawerOpen(false)}>{t('new_arrivals')}</Link>
                                        <Link href="/shop?sort=rating" className="mobile-drawer-sublink" onClick={() => setMobileDrawerOpen(false)}>{t('nav_featured_parts')}</Link>
                                        <Link href="/shop" className="mobile-drawer-sublink" onClick={() => setMobileDrawerOpen(false)}>{t('nav_shop_all_parts')}</Link>
                                        <Link href="/vehicle-finder" className="mobile-drawer-sublink" onClick={() => setMobileDrawerOpen(false)}>{t('nav_vehicle_fitment_finder')}</Link>
                                        <Link href="/categories" className="mobile-drawer-sublink" onClick={() => setMobileDrawerOpen(false)}>{t('nav_browse_categories')}</Link>
                                        <Link href="/brands" className="mobile-drawer-sublink" onClick={() => setMobileDrawerOpen(false)}>{t('nav_top_brands')}</Link>
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
                                        {t('footer_performance_parts')}
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
                                        <Link href="/shop" className="mobile-drawer-sublink highlight-sublink" onClick={() => setMobileDrawerOpen(false)}>{t('nav_all_performance')}</Link>
                                        <Link href="/shop?category=tires" className="mobile-drawer-sublink" onClick={() => setMobileDrawerOpen(false)}>{t('nav_tires_track')}</Link>
                                        <Link href="/shop?category=brakes" className="mobile-drawer-sublink" onClick={() => setMobileDrawerOpen(false)}>{t('nav_rotors_brakes')}</Link>
                                        <Link href="/shop?category=intake" className="mobile-drawer-sublink" onClick={() => setMobileDrawerOpen(false)}>{t('nav_cold_air_intake')}</Link>
                                        <Link href="/shop?category=exhaust" className="mobile-drawer-sublink" onClick={() => setMobileDrawerOpen(false)}>{t('nav_cat_back_exhaust')}</Link>
                                        <Link href="/shop?category=suspension" className="mobile-drawer-sublink" onClick={() => setMobileDrawerOpen(false)}>{t('nav_adjustable_coilovers')}</Link>
                                    </div>
                                )}
                            </div>

                            {/* Shop By Vehicle */}
                            <Link
                                href="/vehicle-finder"
                                className="mobile-drawer-link"
                                onClick={() => setMobileDrawerOpen(false)}
                            >
                                <span className="vehicle-nav-text">
                                    {t('shop_by_vehicle')}
                                    {activeVehicle && (
                                        <span
                                            className="vehicle-active-dot"
                                            title={`Active Vehicle: ${activeVehicle.year} ${activeVehicle.make} ${activeVehicle.model}`}
                                        />
                                    )}
                                </span>
                            </Link>

                            {/* Brands with Accordion */}
                            <div className="mobile-drawer-item">
                                <div className="mobile-drawer-item-row">
                                    <Link
                                        href="/brands"
                                        className="mobile-drawer-link-text"
                                        onClick={() => setMobileDrawerOpen(false)}
                                    >
                                        {t('brands')}
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
                                            {t('view_all_brands')}
                                        </Link>
                                        {navBrands.length > 0 ? (
                                            navBrands.map(b => (
                                                <Link key={b.id} href={`/shop?brand=${b.slug}`} className="mobile-drawer-sublink" onClick={() => setMobileDrawerOpen(false)}>
                                                    {localize(b, 'name')}
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
                                <span className="site-header-deals-icon">%</span> {t('deals')}
                            </Link>

                            {/* Support with Accordion */}
                            <div className="mobile-drawer-item">
                                <div className="mobile-drawer-item-row">
                                    <Link
                                        href="/contact-us"
                                        className="mobile-drawer-link-text"
                                        onClick={() => setMobileDrawerOpen(false)}
                                    >
                                        {t('support')}
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
                                        <Link href="/track-order" className="mobile-drawer-sublink" onClick={() => setMobileDrawerOpen(false)}>{t('track_order')}</Link>
                                        <Link href="/shipping-policy" className="mobile-drawer-sublink" onClick={() => setMobileDrawerOpen(false)}>{t('nav_shipping_policy')}</Link>
                                        <Link href="/return-policy" className="mobile-drawer-sublink" onClick={() => setMobileDrawerOpen(false)}>{t('nav_return_refund')}</Link>
                                        <Link href="/terms" className="mobile-drawer-sublink" onClick={() => setMobileDrawerOpen(false)}>{t('footer_terms')}</Link>
                                        <Link href="/faqs" className="mobile-drawer-sublink" onClick={() => setMobileDrawerOpen(false)}>{t('footer_faqs')}</Link>
                                        <Link href="/help-center" className="mobile-drawer-sublink" onClick={() => setMobileDrawerOpen(false)}>{t('footer_help_center')}</Link>
                                    </div>
                                )}
                            </div>

                            {/* About Us */}
                            <Link
                                href="/about-us"
                                className="mobile-drawer-link"
                                onClick={() => setMobileDrawerOpen(false)}
                            >
                                {t('footer_about_us')}
                            </Link>

                            {/* Contact Us */}
                            <Link
                                href="/contact-us"
                                className="mobile-drawer-link"
                                onClick={() => setMobileDrawerOpen(false)}
                            >
                                {t('footer_contact_us')}
                            </Link>

                            {/* Mobile Drawer Language & Currency Selectors */}
                            <div className="mobile-drawer-utilities">
                                <span className="mobile-drawer-util-title">{t('regional_settings')}</span>
                                <div className="mobile-drawer-util-row">
                                    {/* Mobile Language Selector */}
                                    <div
                                        className={`mobile-drawer-util-dropdown ${mobileDrawerLangOpen ? 'is-open' : ''}`}
                                        ref={mobileDrawerLangRef}
                                    >
                                        <button
                                            type="button"
                                            className={`mobile-drawer-util-btn ${mobileDrawerLangOpen ? 'is-active' : ''}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setMobileDrawerLangOpen((prev) => {
                                                    const next = !prev;
                                                    if (next) setMobileDrawerCurrOpen(false);
                                                    return next;
                                                });
                                            }}
                                            aria-expanded={mobileDrawerLangOpen}
                                            aria-label="Select Mobile Language"
                                        >
                                            <span className="util-btn-label">Lang:</span>
                                            <span className="util-btn-val">{selectedLang}</span>
                                            <ChevronDown size={13} className={`util-btn-chevron ${mobileDrawerLangOpen ? 'is-rotated' : ''}`} />
                                        </button>

                                        {mobileDrawerLangOpen && (
                                            <div className="mobile-drawer-util-options">
                                                {languageOptions.map((lang) => (
                                                    <button
                                                        key={lang.code}
                                                        type="button"
                                                        className={`mobile-drawer-option ${selectedLang === lang.code ? 'is-active' : ''}`}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedLang(lang.code);
                                                            setMobileDrawerLangOpen(false);
                                                        }}
                                                    >
                                                        <span>{lang.name}</span>
                                                        <span className="option-code">{lang.code}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Mobile Currency Selector */}
                                    <div
                                        className={`mobile-drawer-util-dropdown ${mobileDrawerCurrOpen ? 'is-open' : ''}`}
                                        ref={mobileDrawerCurrRef}
                                    >
                                        <button
                                            type="button"
                                            className={`mobile-drawer-util-btn ${mobileDrawerCurrOpen ? 'is-active' : ''}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setMobileDrawerCurrOpen((prev) => {
                                                    const next = !prev;
                                                    if (next) setMobileDrawerLangOpen(false);
                                                    return next;
                                                });
                                            }}
                                            aria-expanded={mobileDrawerCurrOpen}
                                            aria-label="Select Mobile Currency"
                                        >
                                            <span className="util-btn-label">Curr:</span>
                                            <span className="util-btn-val">{selectedCurrency}</span>
                                            <ChevronDown size={13} className={`util-btn-chevron ${mobileDrawerCurrOpen ? 'is-rotated' : ''}`} />
                                        </button>

                                        {mobileDrawerCurrOpen && (
                                            <div className="mobile-drawer-util-options curr-options">
                                                {currencyOptions.map((curr) => (
                                                    <button
                                                        key={curr.code}
                                                        type="button"
                                                        className={`mobile-drawer-option ${selectedCurrency === curr.code ? 'is-active' : ''}`}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedCurrency(curr.code);
                                                            setMobileDrawerCurrOpen(false);
                                                        }}
                                                    >
                                                        <span>{curr.code} ({curr.symbol}) — {curr.name}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
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
