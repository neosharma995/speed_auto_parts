import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    Package,
    Truck,
    Wrench,
    X
} from 'lucide-react';

export default function SupplierSidebar({ sidebarOpen, onCloseSidebar }) {
    const { url } = usePage();

    const isCurrent = (path) => url.startsWith(path);

    return (
        <>
            {sidebarOpen && (
                <div
                    style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 999 }}
                    onClick={onCloseSidebar}
                />
            )}
            <aside className={`admin-shell-sidebar ${sidebarOpen ? 'admin-shell-sidebar--open' : ''}`}>
                <div className="admin-shell-sidebar-brand">
                    <div style={{ width: '32px', height: '32px', borderRadius: '4px', backgroundColor: '#F36B16', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Wrench size={18} />
                    </div>
                    <span>SPEED <span style={{ color: '#F36B16' }}>AUTOS PARTS</span> <small style={{ fontSize: '10px', color: '#888' }}>SUPPLIER</small></span>
                    <button
                        type="button"
                        onClick={onCloseSidebar}
                        style={{ marginLeft: 'auto', color: '#888', background: 'none', border: 'none', display: 'flex' }}
                        className="mobile-close"
                    >
                        <X size={20} />
                    </button>
                </div>

                <nav className="admin-shell-sidebar-nav">
                    <span className="nav-group-title">Supplier Portal</span>
                    <Link href="/supplier/dashboard" className={url === '/supplier/dashboard' || url === '/supplier' ? 'active' : ''}>
                        <LayoutDashboard size={18} />
                        <span>Dashboard</span>
                    </Link>
                    <Link href="/supplier/products" className={isCurrent('/supplier/products') ? 'active' : ''}>
                        <Package size={18} />
                        <span>My Products & Stock</span>
                    </Link>
                    <Link href="/supplier/lots" className={isCurrent('/supplier/lots') ? 'active' : ''}>
                        <Truck size={18} />
                        <span>Send Lot to Admin</span>
                    </Link>
                </nav>
            </aside>
        </>
    );
}
