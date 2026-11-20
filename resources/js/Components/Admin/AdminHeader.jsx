import React from 'react';
import { usePage } from '@inertiajs/react';
import { Menu, User } from 'lucide-react';

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
