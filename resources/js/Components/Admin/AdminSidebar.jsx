import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { 
    LayoutDashboard, 
    Package, 
    Layers, 
    Tag, 
    Sliders, 
    Car, 
    Boxes, 
    ShoppingCart, 
    Users, 
    Receipt, 
    Percent, 
    Star, 
    Settings, 
    LogOut, 
    Shield, 
    X,
    Wrench
} from 'lucide-react';

export default function AdminSidebar({ sidebarOpen, onCloseSidebar }) {
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
                    <span>SPEED <span style={{ color: '#F36B16' }}>AUTOS PARTS</span> <small style={{ fontSize: '10px', color: '#888' }}>ADMIN</small></span>
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
                    <span className="nav-group-title">Operations</span>
                    <Link href="/admin/dashboard" className={url === '/admin/dashboard' ? 'active' : ''}>
                        <LayoutDashboard size={18} />
                        <span>Dashboard</span>
                    </Link>
                    <Link href="/admin/orders" className={isCurrent('/admin/orders') ? 'active' : ''}>
                        <ShoppingCart size={18} />
                        <span>Orders</span>
                    </Link>
                    <Link href="/admin/inventory" className={isCurrent('/admin/inventory') ? 'active' : ''}>
                        <Boxes size={18} />
                        <span>Inventory</span>
                    </Link>

                    <span className="nav-group-title">Automotive Catalog</span>
                    <Link href="/admin/products" className={isCurrent('/admin/products') ? 'active' : ''}>
                        <Package size={18} />
                        <span>Products</span>
                    </Link>
                    <Link href="/admin/categories" className={isCurrent('/admin/categories') ? 'active' : ''}>
                        <Layers size={18} />
                        <span>Categories</span>
                    </Link>
                    <Link href="/admin/brands" className={isCurrent('/admin/brands') ? 'active' : ''}>
                        <Tag size={18} />
                        <span>Brands</span>
                    </Link>
                    <Link href="/admin/attributes" className={isCurrent('/admin/attributes') ? 'active' : ''}>
                        <Sliders size={18} />
                        <span>Attributes</span>
                    </Link>
                    <Link href="/admin/vehicles" className={isCurrent('/admin/vehicles') ? 'active' : ''}>
                        <Car size={18} />
                        <span>Vehicles & Fitment</span>
                    </Link>

                    <span className="nav-group-title">Marketing</span>
                    <Link href="/admin/coupons" className={isCurrent('/admin/coupons') ? 'active' : ''}>
                        <Percent size={18} />
                        <span>Coupons</span>
                    </Link>
                    <Link href="/admin/reviews" className={isCurrent('/admin/reviews') ? 'active' : ''}>
                        <Star size={18} />
                        <span>Reviews</span>
                    </Link>

                    <span className="nav-group-title">Store</span>
                    <Link href="/admin/settings" className={isCurrent('/admin/settings') ? 'active' : ''}>
                        <Settings size={18} />
                        <span>Store Settings</span>
                    </Link>
                </nav>

                <div className="admin-shell-sidebar-footer">
                    <Link href="/logout" method="post" as="button" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#EF4444', fontSize: '13px', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
                        <LogOut size={16} /> Sign Out
                    </Link>
                </div>
            </aside>
        </>
    );
}
