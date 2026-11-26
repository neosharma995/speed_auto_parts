import React from 'react';
import { Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import CustomerSidebar from '@/Components/CustomerSidebar';
import { useCurrency } from '@/Context/CurrencyContext';
import { useLanguage } from '@/Context/LanguageContext';
import { 
    ShoppingBag, 
    Heart, 
    Package 
} from 'lucide-react';

export default function CustomerDashboard({ 
    user, 
    recentOrders = [], 
    ordersCount = 0, 
    defaultAddress = null, 
    wishlistCount = 0 
}) {
    const { formatPrice } = useCurrency();
    const { t } = useLanguage();

    return (
        <AppLayout title={t('cust_dashboard_title')}>
            <div className="customer-portal">
                <div className="container">
                    <div className="customer-portal-layout">
                        <CustomerSidebar
                            activeTab="dashboard"
                            user={user}
                            ordersCount={ordersCount}
                            wishlistCount={wishlistCount}
                        />

                        {/* Main Content */}
                        <div className="customer-portal-content">
                            {/* Summary Stats */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                                <div className="portal-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '8px', backgroundColor: 'rgba(243, 107, 22, 0.1)', color: '#F36B16', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <ShoppingBag size={24} />
                                    </div>
                                    <div>
                                        <span style={{ fontSize: '12px', color: '#666', textTransform: 'uppercase', fontWeight: 700 }}>{t('cust_total_orders')}</span>
                                        <h3 style={{ fontSize: '24px', fontWeight: 900, color: '#151515' }}>{ordersCount}</h3>
                                    </div>
                                </div>

                                <div className="portal-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '8px', backgroundColor: '#FFF1F2', color: '#D93025', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Heart size={24} />
                                    </div>
                                    <div>
                                        <span style={{ fontSize: '12px', color: '#666', textTransform: 'uppercase', fontWeight: 700 }}>{t('cust_wishlist_parts')}</span>
                                        <h3 style={{ fontSize: '24px', fontWeight: 900, color: '#151515' }}>{wishlistCount}</h3>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Orders */}
                            <div className="portal-card">
                                <div className="portal-card-header">
                                    <h2>{t('cust_recent_orders')}</h2>
                                    <Link href="/customer/orders" className="btn btn-outline btn-sm">
                                        {t('cust_view_all_orders')}
                                    </Link>
                                </div>

                                {recentOrders.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '32px 0', color: '#666' }}>
                                        <Package size={36} color="#DDD" style={{ margin: '0 auto 8px' }} />
                                        <p>{t('cust_no_orders')}</p>
                                        <Link href="/shop" className="btn btn-primary btn-sm" style={{ marginTop: '12px' }}>
                                            {t('cust_browse_catalog')}
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="orders-table-wrap">
                                        <table className="orders-table">
                                            <thead>
                                                <tr>
                                                    <th>Order #</th>
                                                    <th>Date</th>
                                                    <th>Items</th>
                                                    <th>Total</th>
                                                    <th>Payment</th>
                                                    <th>Status</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {recentOrders.map(order => (
                                                    <tr key={order.id}>
                                                        <td><strong>{order.order_number}</strong></td>
                                                        <td>{new Date(order.created_at).toLocaleDateString()}</td>
                                                        <td>{order.items_count || order.items?.length || 1} parts</td>
                                                        <td><strong>{formatPrice(order.total_amount)}</strong></td>
                                                        <td>
                                                            <span className="badge badge-success" style={{ textTransform: 'uppercase' }}>
                                                                {order.payment_status}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <span className="badge badge-primary" style={{ textTransform: 'uppercase' }}>
                                                                {order.delivery_status}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <Link href={`/order-success/${order.order_number}`} className="btn btn-outline btn-sm">
                                                                View
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            {/* Default Address & Account Info */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                                <div className="portal-card">
                                    <div className="portal-card-header">
                                        <h2>Default Shipping Address</h2>
                                        <Link href="/customer/addresses" className="btn btn-outline btn-sm">Manage</Link>
                                    </div>
                                    {defaultAddress ? (
                                        <div style={{ fontSize: '13px', color: '#444', lineHeight: 1.6 }}>
                                            <strong>{defaultAddress.full_name}</strong><br />
                                            {defaultAddress.address_line1}<br />
                                            {defaultAddress.address_line2 && <>{defaultAddress.address_line2}<br /></>}
                                            {defaultAddress.city}, {defaultAddress.state} - {defaultAddress.pincode}<br />
                                            Phone: {defaultAddress.phone}
                                        </div>
                                    ) : (
                                        <p style={{ color: '#888', fontSize: '13px' }}>
                                            No default shipping address saved yet.
                                        </p>
                                    )}
                                </div>

                                <div className="portal-card">
                                    <div className="portal-card-header">
                                        <h2>Security & Credentials</h2>
                                    </div>
                                    <div style={{ fontSize: '13px', color: '#444', lineHeight: 1.6 }}>
                                        <p><strong>Name:</strong> {user?.name}</p>
                                        <p><strong>Email:</strong> {user?.email}</p>
                                        <p><strong>Phone:</strong> {user?.phone || 'Not added'}</p>
                                        <p style={{ color: '#168A35', marginTop: '6px' }}>✓ Account Status: Active & Verified</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
