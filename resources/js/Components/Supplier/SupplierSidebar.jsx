import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    Package,
    Truck,
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
                    <Link
                        href="/supplier/dashboard"
                        style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', minWidth: 0 }}
                    >
                        <img
                            src="/assets/images/logo/speedautoparts-official.png"
                            alt="Speed Autos Parts"
                            style={{ height: '36px', width: 'auto', maxWidth: '220px', objectFit: 'contain' }}
                        />
                    </Link>
                    <button
                        type="button"
                        onClick={onCloseSidebar}
                        className="mobile-close"
                        aria-label="Close navigation"
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
