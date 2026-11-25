import React from 'react';
import { Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { useCurrency } from '@/Context/CurrencyContext';
import { LayoutDashboard, ShoppingBag, MapPin, Heart, LogOut, Package, Truck, ExternalLink } from 'lucide-react';

export default function CustomerOrders({ orders = [] }) {
    const { formatPrice } = useCurrency();

    return (
        <AppLayout title="My Orders">
            <div className="customer-portal">
                <div className="container">
                    <div className="customer-portal-layout">
                        {/* Sidebar */}
                        <aside className="customer-portal-sidebar">
                            <nav className="portal-nav">
                                <Link href="/customer/dashboard" className="portal-nav-link">
                                    <LayoutDashboard size={18} />
                                    <span>Dashboard Overview</span>
                                </Link>
                                <Link href="/customer/orders" className="portal-nav-link portal-nav-link--active">
                                    <ShoppingBag size={18} />
                                    <span>My Orders</span>
                                </Link>
                                <Link href="/customer/addresses" className="portal-nav-link">
                                    <MapPin size={18} />
                                    <span>Saved Addresses</span>
                                </Link>
                                <Link href="/customer/wishlist" className="portal-nav-link">
                                    <Heart size={18} />
                                    <span>My Wishlist</span>
                                </Link>
                                <Link href="/logout" method="post" as="button" className="portal-nav-link" style={{ width: '100%', textAlign: 'left', color: '#D93025' }}>
                                    <LogOut size={18} />
                                    <span>Sign Out</span>
                                </Link>
                            </nav>
                        </aside>

                        {/* Content */}
                        <div className="customer-portal-content">
                            <div className="portal-card">
                                <div className="portal-card-header">
                                    <h2>All Orders History ({orders.length})</h2>
                                </div>

                                {orders.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '48px 0', color: '#666' }}>
                                        <Package size={48} color="#DCDCDC" style={{ margin: '0 auto 12px' }} />
                                        <h3>No Orders Placed Yet</h3>
                                        <p style={{ fontSize: '13px', marginTop: '4px' }}>Browse our catalog for high-performance tires, brakes, intakes, and exhausts.</p>
                                        <Link href="/shop" className="btn btn-primary btn-sm" style={{ marginTop: '16px' }}>
                                            Shop Now
                                        </Link>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                        {orders.map(order => (
                                            <div key={order.id} style={{
                                                border: '1px solid #DCDCDC',
                                                borderRadius: '4px',
                                                padding: '20px',
                                                backgroundColor: '#FFFFFF'
                                            }}>
                                                <div style={{
                                                    display: 'flex',
                                                    flexWrap: 'wrap',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    gap: '12px',
                                                    borderBottom: '1px solid #EEE',
                                                    paddingBottom: '12px',
                                                    marginBottom: '16px'
                                                }}>
                                                    <div>
                                                        <span style={{ fontSize: '14px', fontWeight: 800, color: '#151515' }}>
                                                            Order #{order.order_number}
                                                        </span>
                                                        <span style={{ fontSize: '12px', color: '#888', marginLeft: '12px' }}>
                                                            Placed on {new Date(order.created_at).toLocaleDateString()}
                                                        </span>
                                                    </div>

                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <span className="badge badge-success" style={{ textTransform: 'uppercase' }}>
                                                            {order.payment_status}
                                                        </span>
                                                        <span className="badge badge-primary" style={{ textTransform: 'uppercase' }}>
                                                            {order.delivery_status}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Items List */}
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                    {order.items?.map((item, idx) => (
                                                        <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                                <img 
                                                                    src={item.product_image || '/images/products/placeholder.jpg'} 
                                                                    alt={item.product_name}
                                                                    style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '4px', backgroundColor: '#F5F5F5' }}
                                                                />
                                                                <div>
                                                                    <strong>{item.product_name}</strong>
                                                                    {item.variation_name && (
                                                                        <span style={{ display: 'block', fontSize: '11px', color: '#666' }}>{item.variation_name}</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <span>Qty: {item.quantity} × {formatPrice(item.unit_price)}</span>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div style={{
                                                    display: 'flex',
                                                    flexWrap: 'wrap',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    gap: '12px',
                                                    marginTop: '16px',
                                                    paddingTop: '16px',
                                                    borderTop: '1px solid #EEE'
                                                }}>
                                                    <div>
                                                        <span style={{ fontSize: '13px', color: '#666' }}>Total Amount: </span>
                                                        <strong style={{ fontSize: '16px', color: '#F36B16' }}>
                                                            {formatPrice(order.total_amount)}
                                                        </strong>
                                                    </div>

                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <Link href={`/order-success/${order.order_number}`} className="btn btn-outline btn-sm">
                                                            View Full Invoice
                                                        </Link>
                                                        {order.tracking_number && (
                                                            <a href={order.tracking_url || '#'} target="_blank" rel="noreferrer" className="btn btn-dark btn-sm">
                                                                <Truck size={14} /> Track Parcel
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
