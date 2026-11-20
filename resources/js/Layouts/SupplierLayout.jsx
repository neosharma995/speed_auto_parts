import React, { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import SupplierSidebar from '@/Components/Supplier/SupplierSidebar';
import { CheckCircle2, AlertCircle, Menu, User } from 'lucide-react';

export default function SupplierLayout({ title = 'Supplier Portal', children }) {
    const { auth, flash } = usePage().props;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="admin-shell">
            <Head title={`${title} | AUTO PARTS Supplier`} />

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
                        <div className="user-pill">
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(243, 107, 22, 0.1)', color: '#F36B16', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <User size={16} />
                            </div>
                            <div style={{ lineHeight: 1.2 }}>
                                <div style={{ fontSize: '13px', fontWeight: 700 }}>{auth?.user?.company_name || auth?.user?.name || 'Supplier'}</div>
                                {auth?.user?.company_name && (
                                    <div style={{ fontSize: '11px', color: '#64748B' }}>{auth.user.name}</div>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {flash?.success && (
                    <div style={{
                        backgroundColor: '#ECFDF5',
                        color: '#059669',
                        borderBottom: '1px solid #A7F3D0',
                        padding: '12px 24px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '13px',
                        fontWeight: 600
                    }}>
                        <CheckCircle2 size={16} />
                        <span>{flash.success}</span>
                    </div>
                )}

                {flash?.error && (
                    <div style={{
                        backgroundColor: '#FFF1F2',
                        color: '#E11D48',
                        borderBottom: '1px solid #FECDD3',
                        padding: '12px 24px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '13px',
                        fontWeight: 600
                    }}>
                        <AlertCircle size={16} />
                        <span>{flash.error}</span>
                    </div>
                )}

                <div className="admin-shell-main-body">
                    {children}
                </div>
            </div>
        </div>
    );
}
