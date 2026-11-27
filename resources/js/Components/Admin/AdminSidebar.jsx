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
    Store,
    Truck,
    Mail,
    FileText,
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
                    label: 'Subscribers',
                    href: '/admin/subscribers',
                    icon: Mail,
                    permission: 'manage customers',
                    active: isCurrent('/admin/subscribers'),
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
                    label: 'Pages',
                    href: '/admin/pages',
                    icon: FileText,
                    permission: 'manage settings',
                    active: isCurrent('/admin/pages'),
                },
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
                    <Link
                        href="/admin/dashboard"
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
