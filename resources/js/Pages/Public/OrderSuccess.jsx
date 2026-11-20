import React from 'react';
import { Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { CheckCircle, Package, ArrowRight, Home, Truck, Printer } from 'lucide-react';

export default function OrderSuccess({ order }) {
    if (!order) return null;

    return (
        <AppLayout title={`Order Confirmed #${order.order_number}`}>
            <div className="section bg-light" style={{ minHeight: '80vh', padding: '48px 0' }}>
                <div className="container-narrow">
                    <div style={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #DCDCDC',
                        borderRadius: '8px',
                        padding: '40px 32px',
                        textAlign: 'center',
                        marginBottom: '24px'
                    }}>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '50%',
                            backgroundColor: '#EAF5ED',
                            color: '#168A35',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 16px'
                        }}>
                            <CheckCircle size={36} />
                        </div>

                        <span style={{ fontSize: '12px', fontWeight: 800, color: '#F36B16', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            Order Verified & Confirmed
                        </span>
                        <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#151515', marginTop: '4px' }}>
                            THANK YOU FOR YOUR ORDER!
                        </h1>
                        <p style={{ color: '#666', fontSize: '14px', maxWidth: '520px', margin: '8px auto 20px' }}>
                            We have received your automotive spare parts order. Our logistics team will inspect and prepare your components for dispatch.
                        </p>

                        <div style={{
                            display: 'inline-flex',
                            gap: '24px',
                            backgroundColor: '#F8FAFC',
                            padding: '12px 24px',
                            borderRadius: '4px',
                            border: '1px solid #EEEEEE',
                            fontSize: '13px'
                        }}>
                            <span>Order Number: <strong>{order.order_number}</strong></span>
                            <span>Payment: <strong style={{ textTransform: 'uppercase', color: '#168A35' }}>{order.payment_status}</strong> ({order.payment_method})</span>
                            <span>Total: <strong style={{ color: '#F36B16' }}>₹{Number(order.total_amount).toLocaleString('en-IN')}</strong></span>
                        </div>
                    </div>

                    {/* Order Details Breakdown */}
                    <div style={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #DCDCDC',
                        borderRadius: '8px',
                        padding: '32px'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #EEE', paddingBottom: '16px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 800, textTransform: 'uppercase' }}>
                                Ordered Items
                            </h3>
                            <button 
                                type="button" 
                                onClick={() => window.print()} 
                                className="btn btn-outline btn-sm"
                            >
                                <Printer size={14} /> Print Receipt
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                            {order.items?.map((item, idx) => (
                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F5F5F5', paddingBottom: '12px' }}>
                                    <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                                        <img 
                                            src={item.product_image || '/images/products/placeholder.jpg'} 
                                            alt={item.product_name}
                                            style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px', backgroundColor: '#F5F5F5' }}
                                        />
                                        <div>
                                            <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#151515' }}>{item.product_name}</h4>
                                            {item.variation_name && (
                                                <span style={{ fontSize: '12px', color: '#666' }}>Spec: {item.variation_name}</span>
                                            )}
                                            {item.part_number && (
                                                <span style={{ fontSize: '11px', color: '#888', display: 'block', fontFamily: 'monospace' }}>Part #: {item.part_number}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <span style={{ fontSize: '13px', color: '#666' }}>Qty: {item.quantity} × ₹{Number(item.unit_price).toLocaleString('en-IN')}</span>
                                        <strong style={{ display: 'block', fontSize: '15px', color: '#151515' }}>₹{Number(item.total).toLocaleString('en-IN')}</strong>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', backgroundColor: '#F8FAFC', padding: '20px', borderRadius: '4px' }}>
                            <div>
                                <h4 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: '#64748B', marginBottom: '6px' }}>
                                    Shipping Destination
                                </h4>
                                <p style={{ fontSize: '13px', color: '#333', lineHeight: 1.5 }}>
                                    <strong>{order.customer_name}</strong><br />
                                    {order.shipping_address}<br />
                                    {order.apartment && <>{order.apartment}<br /></>}
                                    {order.city}, {order.state} - {order.pincode}<br />
                                    Phone: {order.customer_phone}
                                </p>
                            </div>

                            <div>
                                <h4 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: '#64748B', marginBottom: '6px' }}>
                                    Delivery Status
                                </h4>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#168A35', fontWeight: 700, fontSize: '14px', textTransform: 'uppercase' }}>
                                    <Truck size={18} />
                                    <span>{order.delivery_status}</span>
                                </div>
                                {order.tracking_number && (
                                    <p style={{ fontSize: '12px', color: '#666', marginTop: '6px' }}>
                                        Carrier: {order.tracking_carrier} | AWB: {order.tracking_number}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                            <Link href="/customer/orders" className="btn btn-outline" style={{ flex: 1 }}>
                                View All Orders in Account
                            </Link>
                            <Link href="/shop" className="btn btn-primary" style={{ flex: 1 }}>
                                Continue Shopping <ArrowRight size={16} />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
