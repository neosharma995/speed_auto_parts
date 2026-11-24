import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    Package,
    Layers,
    Tag,
    Car,
    Boxes,
    ShoppingCart,
    Users,
    Percent,
    Star,
    Settings,
    Shield,
    X,
    Wrench,
    Store,
    Truck,
} from 'lucide-react';

export default function AdminSidebar({ sidebarOpen, onCloseSidebar }) {
    const { url, props } = usePage();
    const pendingLotsCount = props?.pendingLotsCount || 0;

    const userRoles = props?.auth?.user?.roles || [];
    const userPermissions = props?.auth?.user?.permissions || [];
    const isAdmin = userRoles.includes('admin');

    const canAccess = (permission) => isAdmin || userPermissions.includes(permission);
    const isCurrent = (path) => url.startsWith(path);

    const navGroups = [
        {
            title: 'Operations',
            items: [
                {
                    label: 'Dashboard',
                    href: '/admin/dashboard',
                    icon: LayoutDashboard,
                    permission: 'view dashboard',
                    active: url === '/admin/dashboard' || url === '/admin',
                },
                {
                    label: 'Orders',
                    href: '/admin/orders',
                    icon: ShoppingCart,
                    permission: 'manage orders',
                    active: isCurrent('/admin/orders'),
                },
            ],
        },
        {
            title: 'Supply Chain',
            items: [
                {
                    label: 'Suppliers',
                    href: '/admin/suppliers',
                    icon: Truck,
                    permission: 'manage suppliers',
                    active: isCurrent('/admin/suppliers'),
                    badge: pendingLotsCount > 0 ? pendingLotsCount : null,
                },
                {
                    label: 'Warehouse',
                    href: '/admin/warehouse',
                    icon: Boxes,
                    permission: 'manage warehouse',
                    active: url === '/admin/warehouse' || isCurrent('/admin/warehouse/logs'),
                },
                {
                    label: 'Website Catalogue',
                    href: '/admin/catalogue',
                    icon: Store,
                    permission: 'manage catalogue',
                    active: isCurrent('/admin/catalogue'),
                },
            ],
        },
        {
            title: 'Automotive Catalog',
            items: [
                {
                    label: 'Products',
                    href: '/admin/products',
                    icon: Package,
                    permission: 'manage products',
                    active: isCurrent('/admin/products'),
                },
                {
                    label: 'Categories',
                    href: '/admin/categories',
                    icon: Layers,
                    permission: 'manage categories',
                    active: isCurrent('/admin/categories'),
                },
                {
                    label: 'Brands',
                    href: '/admin/brands',
                    icon: Tag,
                    permission: 'manage brands',
                    active: isCurrent('/admin/brands'),
                },
                {
                    label: 'Vehicles & Fitment',
                    href: '/admin/vehicles',
                    icon: Car,
                    permission: 'manage vehicles',
                    active: isCurrent('/admin/vehicles'),
                },
            ],
        },
        {
            title: 'Customers & Marketing',
            items: [
                {
                    label: 'Customers',
                    href: '/admin/customers',
                    icon: Users,
                    permission: 'manage customers',
                    active: isCurrent('/admin/customers'),
                },
                {
                    label: 'Coupons',
                    href: '/admin/coupons',
                    icon: Percent,
                    permission: 'manage coupons',
                    active: isCurrent('/admin/coupons'),
                },
                {
                    label: 'Reviews',
                    href: '/admin/reviews',
                    icon: Star,
                    permission: 'manage reviews',
                    active: isCurrent('/admin/reviews'),
                },
            ],
        },
        {
            title: 'Settings',
            items: [
                {
                    label: 'Roles & Permissions',
                    href: '/admin/roles',
                    icon: Shield,
                    permission: 'manage roles',
                    active: isCurrent('/admin/roles'),
                },
                {
                    label: 'Settings',
                    href: '/admin/settings',
                    icon: Settings,
                    permission: 'manage settings',
                    active: isCurrent('/admin/settings') || isCurrent('/admin/taxes'),
                },
            ],
        },
    ];

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
                    <div
                        style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '4px',
                            backgroundColor: '#F36B16',
                            color: '#FFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Wrench size={18} />
                    </div>
                    <span>
                        SPEED <span style={{ color: '#F36B16' }}>AUTOS PARTS</span>{' '}
                        <small style={{ fontSize: '10px', color: '#888' }}>ADMIN</small>
                    </span>
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
                    {navGroups.map((group) => {
                        const visibleItems = group.items.filter((item) => canAccess(item.permission));
                        if (visibleItems.length === 0) {
                            return null;
                        }

                        return (
                            <React.Fragment key={group.title}>
                                <span className="nav-group-title">{group.title}</span>
                                {visibleItems.map((item) => {
                                    const IconComponent = item.icon;
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={item.active ? 'active' : ''}
                                        >
                                            <IconComponent size={18} />
                                            <span>{item.label}</span>
                                            {item.badge !== null && item.badge !== undefined && (
                                                <span className="badge-count">{item.badge}</span>
                                            )}
                                        </Link>
                                    );
                                })}
                            </React.Fragment>
                        );
                    })}
                </nav>
            </aside>
        </>
    );
}
