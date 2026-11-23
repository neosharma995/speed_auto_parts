import React, { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AdminSidebar from '@/Components/Admin/AdminSidebar';
import AdminHeader from '@/Components/Admin/AdminHeader';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function AdminLayout({ title = 'Administration', children }) {
    const { flash } = usePage().props;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="admin-shell">
            <Head title={`${title} | Speed Autos Parts Control Panel`} />

            <AdminSidebar 
                sidebarOpen={sidebarOpen} 
                onCloseSidebar={() => setSidebarOpen(false)} 
            />

            <div className="admin-shell-main">
                <AdminHeader 
                    title={title} 
                    onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
                />

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
