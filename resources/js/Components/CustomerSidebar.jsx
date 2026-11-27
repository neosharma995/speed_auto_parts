import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    ShoppingBag,
    MapPin,
    Heart,
    LogOut,
    Menu,
    ChevronLeft,
    X,
} from 'lucide-react';
import { useLanguage } from '@/Context/LanguageContext';

export default function CustomerSidebar({
    activeTab = 'dashboard',
    user: propUser = null,
    ordersCount = null,
    wishlistCount: propWishlistCount = null,
}) {
    const { auth, wishlistCount: sharedWishlistCount } = usePage().props;
    const { t } = useLanguage();
    const [mobileModalOpen, setMobileModalOpen] = useState(false);

    const user = propUser || auth?.user;
    const wishlistCount = propWishlistCount !== null ? propWishlistCount : sharedWishlistCount;

    const handleBack = () => {
        if (typeof window !== 'undefined' && window.history.length > 1) {
            window.history.back();
        } else {
            window.location.href = '/';
        }
    };

    const navItems = [
        {
            key: 'dashboard',
            href: '/customer/dashboard',
            label: t('cust_dashboard_overview'),
            mobileLabel: t('cust_dashboard_short'),
            icon: LayoutDashboard,
        },
        {
            key: 'orders',
            href: '/customer/orders',
            label: ordersCount !== null ? `${t('cust_my_orders')} (${ordersCount})` : t('cust_my_orders'),
            mobileLabel: ordersCount !== null ? `${t('cust_orders_short')} (${ordersCount})` : t('cust_my_orders'),
            icon: ShoppingBag,
        },
        {
            key: 'addresses',
            href: '/customer/addresses',
            label: t('cust_saved_addresses'),
            mobileLabel: t('cust_saved_addresses'),
            icon: MapPin,
        },
        {
            key: 'wishlist',
            href: '/customer/wishlist',
            label: wishlistCount !== undefined && wishlistCount !== null ? `${t('cust_my_wishlist')} (${wishlistCount})` : t('cust_my_wishlist'),
            mobileLabel: wishlistCount !== undefined && wishlistCount !== null ? `${t('mob_wishlist')} (${wishlistCount})` : t('cust_my_wishlist'),
            icon: Heart,
        },
    ];

    return (
        <>
            {/* Mobile Top Bar (Back button + My Account button) */}
            <div className="customer-mobile-bar">
                <button
                    type="button"
                    className="customer-mobile-back-btn"
                    onClick={handleBack}
                    aria-label="Go Back"
                >
                    <ChevronLeft size={18} strokeWidth={2.4} />
                </button>

                <button
                    type="button"
                    className="customer-mobile-account-btn"
                    onClick={() => setMobileModalOpen(true)}
                >
                    <Menu size={16} strokeWidth={2.4} />
                    <span>{t('my_account')}</span>
                </button>
            </div>

            {/* Desktop Sidebar Navigation */}
            <aside className="customer-portal-sidebar">
                {user && (
                    <div className="user-greeting">
                        <h3>{user.name}</h3>
                        <span>{user.email}</span>
                    </div>
                )}

                <nav className="portal-nav">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.key;
                        return (
                            <Link
                                key={item.key}
                                href={item.href}
                                className={`portal-nav-link ${isActive ? 'portal-nav-link--active' : ''}`}
                            >
                                <Icon size={18} />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}

                    <Link
                        href="/logout"
                        method="post"
                        as="button"
                        className="portal-nav-link portal-nav-link--logout"
                    >
                        <LogOut size={18} />
                        <span>{t('sign_out')}</span>
                    </Link>
                </nav>
            </aside>

            {/* Mobile Account Navigation Popup Modal */}
            {mobileModalOpen && (
                <div
                    className="customer-account-modal-backdrop"
                    onClick={() => setMobileModalOpen(false)}
                >
                    <div
                        className="customer-account-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="customer-account-modal-header">
                            <div className="modal-title-group">
                                <h3>{t('my_account')}</h3>
                                {user?.name && <span>{user.name}</span>}
                            </div>
                            <button
                                type="button"
                                className="customer-account-modal-close"
                                onClick={() => setMobileModalOpen(false)}
                                aria-label="Close My Account menu"
                            >
                                <X size={16} strokeWidth={2.4} />
                            </button>
                        </div>

                        <div className="customer-account-modal-grid">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = activeTab === item.key;
                                return (
                                    <Link
                                        key={item.key}
                                        href={item.href}
                                        className={`customer-modal-tile ${isActive ? 'is-active' : ''}`}
                                        onClick={() => setMobileModalOpen(false)}
                                    >
                                        <Icon size={20} strokeWidth={2} />
                                        <span>{item.mobileLabel}</span>
                                    </Link>
                                );
                            })}

                            <Link
                                href="/logout"
                                method="post"
                                as="button"
                                className="customer-modal-tile is-logout"
                                onClick={() => setMobileModalOpen(false)}
                            >
                                <LogOut size={20} strokeWidth={2} />
                                <span>{t('sign_out')}</span>
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
