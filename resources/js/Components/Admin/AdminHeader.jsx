import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Menu, User, Bell, ExternalLink } from 'lucide-react';

export default function AdminHeader({ title = 'Administration', onToggleSidebar }) {
    const { auth } = usePage().props;

    return (
        <header className="admin-shell-main-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button 
                    type="button" 
                    className="mobile-menu-trigger"
                    onClick={onToggleSidebar}
                    aria-label="Toggle Navigation"
                >
                    <Menu size={22} />
                </button>
                <h1 className="admin-page-title">{title}</h1>
            </div>

            <div className="header-right">
                <Link href="/" target="_blank" className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>Storefront</span>
                    <ExternalLink size={13} />
                </Link>

                <div className="user-pill">
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(243, 107, 22, 0.1)', color: '#F36B16', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User size={16} />
                    </div>
                    <span>{auth?.user?.name || 'Admin'}</span>
                </div>
            </div>
        </header>
    );
}
