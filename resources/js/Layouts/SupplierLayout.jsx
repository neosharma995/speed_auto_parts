import React, { useEffect, useRef, useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import SupplierSidebar from '@/Components/Supplier/SupplierSidebar';
import FlashToast from '@/Components/Common/FlashToast';
import { ChevronDown, LogOut, Menu, User } from 'lucide-react';

export default function SupplierLayout({ title = 'Supplier Portal', children }) {
    const { auth } = usePage().props;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        };

        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                setMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);
        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
            document.removeEventListener('keydown', handleEscape);
        };
    }, []);

    const handleLogout = () => {
        setMenuOpen(false);
        router.post('/logout');
    };

    return (
        <div className="admin-shell">
            <Head title={`${title} | SPEED AUTOS PARTS Supplier`} />

            <SupplierSidebar
                sidebarOpen={sidebarOpen}
                onCloseSidebar={() => setSidebarOpen(false)}
            />

            <div className="admin-shell-main">
                <header className="admin-shell-main-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <button
                            type="button"
                            className="mobile-menu-trigger"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            aria-label="Toggle Navigation"
                        >
                            <Menu size={22} />
                        </button>
                        <h1 className="admin-page-title">{title}</h1>
                    </div>

                    <div className="header-right">
                        <div className="user-menu" ref={menuRef}>
                            <button
                                type="button"
                                className={`user-pill ${menuOpen ? 'user-pill--open' : ''}`}
                                onClick={() => setMenuOpen((prev) => !prev)}
                                aria-expanded={menuOpen}
                                aria-haspopup="menu"
                            >
                                <div
                                    style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '50%',
                                        backgroundColor: 'rgba(243, 107, 22, 0.1)',
                                        color: '#F36B16',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <User size={16} />
                                </div>
                                <div style={{ lineHeight: 1.2, textAlign: 'left' }}>
                                    <div style={{ fontSize: '13px', fontWeight: 700 }}>
                                        {auth?.user?.company_name || auth?.user?.name || 'Supplier'}
                                    </div>
                                    {auth?.user?.company_name && (
                                        <div style={{ fontSize: '11px', color: '#64748B' }}>{auth.user.name}</div>
                                    )}
                                </div>
                                <ChevronDown size={15} style={{ color: '#64748B' }} />
                            </button>

                            {menuOpen && (
                                <div className="user-menu-dropdown" role="menu">
                                    <div className="user-menu-header">
                                        <div className="user-menu-name">
                                            {auth?.user?.company_name || auth?.user?.name || 'Supplier'}
                                        </div>
                                        {auth?.user?.email && (
                                            <div className="user-menu-email">{auth.user.email}</div>
                                        )}
                                    </div>

                                    <div className="user-menu-divider" />

                                    <button
                                        type="button"
                                        className="user-menu-item user-menu-item--danger"
                                        role="menuitem"
                                        onClick={handleLogout}
                                    >
                                        <LogOut size={15} />
                                        <span>Sign Out</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <FlashToast />

                <div className="admin-shell-main-body">{children}</div>
            </div>
        </div>
    );
}
