import React, { useEffect } from 'react';
import { Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { useCart } from '@/Context/CartContext';
import { useCurrency } from '@/Context/CurrencyContext';
import { useLanguage } from '@/Context/LanguageContext';
import { CheckCircle, ArrowRight, Truck, Printer } from 'lucide-react';

export default function OrderSuccess({ order }) {
    const { clearCart } = useCart();
    const { formatPrice } = useCurrency();
    const { t } = useLanguage();

    useEffect(() => {
        if (order?.order_number) {
            clearCart();
        }
    }, [order?.order_number]);

    if (!order) return null;

    return (
        <AppLayout title={`Order Confirmed #${order.order_number}`}>
            <div className="section bg-light order-success-page">
                <div className="container-narrow">
                    <div className="order-success-hero-card">
                        <div className="order-success-check-icon">
                            <CheckCircle size={32} />
                        </div>

                        <span className="order-success-badge">
                            {t('os_badge')}
                        </span>
                        <h1 className="order-success-heading">
                            {t('os_heading')}
                        </h1>
                        <p className="order-success-desc">
                            {t('os_desc')}
                        </p>

                        <div className="order-success-meta-bar">
                            <span>{t('os_order_number')} <strong>{order.order_number}</strong></span>
                            <span>{t('os_payment')} <strong className="payment-status">{order.payment_status}</strong> ({order.payment_method})</span>
                            <span>{t('pdp_total')}: <strong className="total-amount">{formatPrice(order.total_amount)}</strong></span>
                        </div>
                    </div>

                    {/* Order Details Breakdown */}
                    <div className="order-success-details-card">
                        <div className="order-success-details-header">
                            <h3>
                                {t('os_ordered_items')}
                            </h3>
                            <button 
                                type="button" 
                                onClick={() => window.print()} 
                                className="btn btn-outline btn-sm"
                            >
                                <Printer size={14} /> {t('os_print_receipt')}
                            </button>
                        </div>

                        <div className="order-success-items-list">
                            {order.items?.map((item, idx) => (
                                <div key={idx} className="order-success-item-row">
                                    <div className="item-left">
                                        <img 
                                            src={item.product_image || '/images/products/placeholder.jpg'} 
                                            alt={item.product_name}
                                            className="item-thumb"
                                        />
                                        <div className="item-info">
                                            <h4>{item.product_name}</h4>
                                            {item.variation_name && (
                                                <span className="item-spec">Spec: {item.variation_name}</span>
                                            )}
                                            {item.part_number && (
                                                <span className="item-part">Part #: {item.part_number}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="item-right">
                                        <span className="item-qty-price">Qty: {item.quantity} × {formatPrice(item.unit_price)}</span>
                                        <strong className="item-total">{formatPrice(item.total)}</strong>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="order-success-shipping-grid">
                            <div className="shipping-col">
                                <h4>
                                    {t('os_shipping_dest')}
                                </h4>
                                <p>
                                    <strong>{order.customer_name}</strong><br />
                                    {order.shipping_address}<br />
                                    {order.apartment && <>{order.apartment}<br /></>}
                                    {order.city}, {order.state} - {order.pincode}<br />
                                    {order.customer_phone}
                                </p>
                            </div>

                            <div className="shipping-col">
                                <h4>
                                    {t('os_delivery_status')}
                                </h4>
                                <div className="delivery-status-badge">
                                    <Truck size={18} />
                                    <span>{order.delivery_status}</span>
                                </div>
                                {order.tracking_number && (
                                    <p className="tracking-meta">
                                        {t('track_carrier')}: {order.tracking_carrier} | AWB: {order.tracking_number}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="order-success-actions">
                            <Link href="/customer/orders" className="btn btn-outline">
                                {t('os_view_orders')}
                            </Link>
                            <Link href="/shop" className="btn btn-primary">
                                {t('continue_shopping')} <ArrowRight size={16} />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
