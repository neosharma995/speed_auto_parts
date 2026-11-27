import React from 'react';
import { Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import CustomerSidebar from '@/Components/CustomerSidebar';
import { useCurrency } from '@/Context/CurrencyContext';
import { useLanguage } from '@/Context/LanguageContext';
import { Package, Truck } from 'lucide-react';

export default function CustomerOrders({ orders = [] }) {
    const { formatPrice } = useCurrency();
    const { t, translateTerm } = useLanguage();

    return (
        <AppLayout title={t('cust_my_orders')}>
            <div className="customer-portal">
                <div className="container">
                    <div className="customer-portal-layout">
                        <CustomerSidebar
                            activeTab="orders"
                            ordersCount={orders.length}
                        />

                        {/* Content */}
                        <div className="customer-portal-content">
                            <div className="portal-card">
                                <div className="portal-card-header">
                                    <h2>{t('cust_all_orders_history')} ({orders.length})</h2>
                                </div>

                                {orders.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '48px 0', color: '#666' }}>
                                        <Package size={48} color="#DCDCDC" style={{ margin: '0 auto 12px' }} />
                                        <h3>{t('cust_no_orders')}</h3>
                                        <Link href="/shop" className="btn btn-primary btn-sm" style={{ marginTop: '16px' }}>
                                            {t('cust_shop_now')}
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
                                                            {t('track_order_prefix')}{order.order_number}
                                                        </span>
                                                        <span style={{ fontSize: '12px', color: '#888', marginLeft: '12px' }}>
                                                            {t('cust_placed_on')} {new Date(order.created_at).toLocaleDateString()}
                                                        </span>
                                                    </div>

                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <span className="badge badge-success" style={{ textTransform: 'uppercase' }}>
                                                            {translateTerm(order.payment_status)}
                                                        </span>
                                                        <span className="badge badge-primary" style={{ textTransform: 'uppercase' }}>
                                                            {translateTerm(order.delivery_status)}
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
                                                                    <strong>{translateTerm(item.product_name)}</strong>
                                                                    {item.variation_name && (
                                                                        <span style={{ display: 'block', fontSize: '11px', color: '#666' }}>{translateTerm(item.variation_name)}</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <span>{t('chk_qty')}: {item.quantity} × {formatPrice(item.unit_price)}</span>
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
                                                        <span style={{ fontSize: '13px', color: '#666' }}>{t('cust_total_amount')} </span>
                                                        <strong style={{ fontSize: '16px', color: '#F36B16' }}>
                                                            {formatPrice(order.total_amount)}
                                                        </strong>
                                                    </div>

                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <Link href={`/order-success/${order.order_number}`} className="btn btn-outline btn-sm">
                                                            {t('cust_view_invoice')}
                                                        </Link>
                                                        {order.tracking_number && (
                                                            <a href={order.tracking_url || '#'} target="_blank" rel="noreferrer" className="btn btn-dark btn-sm">
                                                                <Truck size={14} /> {t('cust_track_parcel')}
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
