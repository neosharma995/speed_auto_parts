import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AdminSidebar from '@/Components/Admin/AdminSidebar';
import AdminHeader from '@/Components/Admin/AdminHeader';
import FlashToast from '@/Components/Common/FlashToast';

export default function AdminLayout({ title = 'Administration', children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="admin-shell">
            <Head title={`${title} | SPEED AUTOS PARTS Control Panel`} />

            <AdminSidebar 
                sidebarOpen={sidebarOpen} 
                onCloseSidebar={() => setSidebarOpen(false)} 
            />

            <div className="admin-shell-main">
                <AdminHeader 
                    title={title} 
                    onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
                />

                <FlashToast />

                <div className="admin-shell-main-body">
                    {children}
                </div>
            </div>
        </div>
    );
}
