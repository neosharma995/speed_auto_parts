import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { ArrowLeft, Save, Truck, CheckCircle2, AlertTriangle, Printer } from 'lucide-react';

export default function AdminOrderShow({ order }) {
    const [deliveryStatus, setDeliveryStatus] = useState(order.delivery_status);
    const [paymentStatus, setPaymentStatus] = useState(order.payment_status);
    const [trackingNumber, setTrackingNumber] = useState(order.tracking_number || '');
    const [trackingCarrier, setTrackingCarrier] = useState(order.tracking_carrier || 'Blue Dart Express');
    const [trackingUrl, setTrackingUrl] = useState(order.tracking_url || '');
    const [submitting, setSubmitting] = useState(false);

    const handleUpdateStatus = (e) => {
        e.preventDefault();
        setSubmitting(true);
        router.put(`/admin/orders/${order.id}`, {
            delivery_status: deliveryStatus,
            payment_status: paymentStatus,
            tracking_number: trackingNumber,
            tracking_carrier: trackingCarrier,
            tracking_url: trackingUrl,
        }, {
            onFinish: () => setSubmitting(false),
        });
    };

    return (
        <AdminLayout title={`Order #${order.order_number}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <Link href="/admin/orders" className="btn btn-outline btn-sm">
                    <ArrowLeft size={14} /> Back to Orders
                </Link>
                <button type="button" onClick={() => window.print()} className="btn btn-outline btn-sm">
                    <Printer size={14} /> Print Invoice
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
                {/* Left: Items & Customer Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div className="admin-card">
                        <div className="admin-card-header">
                            <h3>Ordered Automotive Parts ({order.items?.length || 0})</h3>
                        </div>
                        <div className="admin-card-body" style={{ padding: 0 }}>
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Part</th>
                                        <th>Price</th>
                                        <th>Qty</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {order.items?.map((item, idx) => (
                                        <tr key={idx}>
                                            <td>
                                                <strong>{item.product_name}</strong>
                                                {item.variation_name && (
                                                    <small style={{ display: 'block', color: '#666' }}>{item.variation_name}</small>
                                                )}
                                                {item.part_number && (
                                                    <small style={{ display: 'block', color: '#888', fontFamily: 'monospace' }}>Part #: {item.part_number}</small>
                                                )}
                                            </td>
                                            <td>₹{Number(item.unit_price).toLocaleString('en-IN')}</td>
                                            <td>{item.quantity}</td>
                                            <td><strong>₹{Number(item.total).toLocaleString('en-IN')}</strong></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="admin-card">
                        <div className="admin-card-header">
                            <h3>Customer & Delivery Address</h3>
                        </div>
                        <div className="admin-card-body">
                            <p style={{ fontSize: '14px', lineHeight: 1.6 }}>
                                <strong>{order.customer_name}</strong><br />
                                Email: {order.customer_email}<br />
                                Phone: {order.customer_phone}<br />
                                Address: {order.shipping_address}<br />
                                {order.apartment && <>{order.apartment}<br /></>}
                                {order.city}, {order.state} - {order.pincode}<br />
                                Country: {order.country}
                            </p>
                            {order.order_notes && (
                                <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '4px', fontSize: '13px' }}>
                                    <strong>Customer Notes:</strong> {order.order_notes}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: Status Management & Financials */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div className="admin-card">
                        <div className="admin-card-header">
                            <h3>Fulfillment & Status Update</h3>
                        </div>
                        <div className="admin-card-body">
                            <form onSubmit={handleUpdateStatus} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div className="form-group">
                                    <label className="form-label">Delivery Status</label>
                                    <select 
                                        className="form-select"
                                        value={deliveryStatus}
                                        onChange={e => setDeliveryStatus(e.target.value)}
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="processing">Processing & Packing</option>
                                        <option value="shipped">Shipped</option>
                                        <option value="delivered">Delivered</option>
                                        <option value="cancelled">Cancelled & Restock</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Payment Status</label>
                                    <select 
                                        className="form-select"
                                        value={paymentStatus}
                                        onChange={e => setPaymentStatus(e.target.value)}
                                    >
                                        <option value="paid">Paid</option>
                                        <option value="pending">Pending</option>
                                        <option value="failed">Failed</option>
                                        <option value="refunded">Refunded</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Freight Carrier</label>
                                    <input 
                                        type="text" 
                                        className="form-input" 
                                        value={trackingCarrier} 
                                        onChange={e => setTrackingCarrier(e.target.value)} 
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Tracking / AWB Number</label>
                                    <input 
                                        type="text" 
                                        className="form-input" 
                                        value={trackingNumber} 
                                        onChange={e => setTrackingNumber(e.target.value)} 
                                        placeholder="e.g. BLUEDART-1234567"
                                    />
                                </div>

                                <button type="submit" className="btn btn-primary btn-full" disabled={submitting}>
                                    <Save size={16} /> {submitting ? 'Updating...' : 'Update Order Status'}
                                </button>
                            </form>
                        </div>
                    </div>

                    <div className="admin-card">
                        <div className="admin-card-header">
                            <h3>Financial Breakdown</h3>
                        </div>
                        <div className="admin-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Subtotal</span>
                                <strong>₹{Number(order.subtotal).toLocaleString('en-IN')}</strong>
                            </div>
                            {Number(order.discount_amount) > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#168A35' }}>
                                    <span>Discount ({order.coupon_code || 'Promo'})</span>
                                    <span>-₹{Number(order.discount_amount).toLocaleString('en-IN')}</span>
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Shipping Fee</span>
                                <span>₹{Number(order.shipping_cost).toLocaleString('en-IN')}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 800, color: '#F36B16', paddingTop: '10px', borderTop: '1px solid #EEE' }}>
                                <span>Grand Total</span>
                                <span>₹{Number(order.total_amount).toLocaleString('en-IN')}</span>
                            </div>
                            <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                                Gateway: <strong>{order.payment_method}</strong> ({order.razorpay_payment_id || 'COD'})
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
