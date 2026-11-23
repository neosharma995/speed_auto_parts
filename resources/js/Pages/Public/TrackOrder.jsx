import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Truck, Search, CheckCircle, Clock, PackageCheck } from 'lucide-react';
import axios from 'axios';

export default function TrackOrder() {
    const [orderNumber, setOrderNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [orderResult, setOrderResult] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');

    const handleTrack = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setOrderResult(null);
        if (!orderNumber.trim()) return;

        setLoading(true);
        try {
            const res = await axios.get(`/api/orders/track?order_number=${encodeURIComponent(orderNumber.trim())}`);
            if (res.data.success) {
                setOrderResult(res.data.order);
            } else {
                setErrorMsg(res.data.message || 'Order not found');
            }
        } catch (err) {
            setErrorMsg(err.response?.data?.message || 'Unable to locate order with this reference number.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AppLayout title="Track Your Shipment">
            <div className="section bg-light" style={{ minHeight: '75vh', padding: '56px 0' }}>
                <div className="container-narrow">
                    <div style={{ textAlign: 'center', marginBottom: '36px' }}>
                        <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(243, 107, 22, 0.1)', color: '#F36B16', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                            <Truck size={30} />
                        </div>
                        <h1 style={{ fontSize: '32px', fontWeight: 900, color: '#151515', textTransform: 'uppercase' }}>
                            TRACK YOUR SHIPMENT
                        </h1>
                        <p style={{ color: '#666', fontSize: '14px', maxWidth: '500px', margin: '8px auto 0' }}>
                            Enter your Speed Autos Parts order reference number to view live courier status, freight tracking, and delivery timeline.
                        </p>
                    </div>

                    <div style={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #DCDCDC',
                        borderRadius: '8px',
                        padding: '32px',
                        marginBottom: '32px'
                    }}>
                        <form onSubmit={handleTrack} style={{ display: 'flex', gap: '10px' }}>
                            <input 
                                type="text" 
                                className="form-input"
                                placeholder="Enter Order # (e.g. AP-20261119-DEMO1)"
                                value={orderNumber}
                                onChange={e => setOrderNumber(e.target.value)}
                                required
                                style={{ fontSize: '15px', padding: '12px 16px' }}
                            />
                            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                                <Search size={18} /> {loading ? 'Searching...' : 'Track'}
                            </button>
                        </form>

                        {errorMsg && (
                            <div style={{ color: '#D93025', fontSize: '13px', marginTop: '12px', fontWeight: 600 }}>
                                ⚠ {errorMsg}
                            </div>
                        )}
                    </div>

                    {orderResult && (
                        <div style={{
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #DCDCDC',
                            borderRadius: '8px',
                            padding: '32px'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #EEE', paddingBottom: '16px', marginBottom: '24px' }}>
                                <div>
                                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#F36B16', textTransform: 'uppercase' }}>Shipment Details</span>
                                    <h3 style={{ fontSize: '20px', fontWeight: 900 }}>Order #{orderResult.order_number}</h3>
                                </div>
                                <span className="badge badge-primary" style={{ fontSize: '12px', padding: '6px 12px' }}>
                                    {orderResult.delivery_status}
                                </span>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                                <div>
                                    <span style={{ fontSize: '12px', color: '#888' }}>Carrier</span>
                                    <p style={{ fontWeight: 700, fontSize: '14px' }}>{orderResult.tracking_carrier || 'Blue Dart Express'}</p>
                                </div>
                                <div>
                                    <span style={{ fontSize: '12px', color: '#888' }}>Tracking / AWB #</span>
                                    <p style={{ fontWeight: 700, fontSize: '14px', fontFamily: 'monospace' }}>{orderResult.tracking_number || 'Pending Dispatch Assignment'}</p>
                                </div>
                                <div>
                                    <span style={{ fontSize: '12px', color: '#888' }}>Delivery Destination</span>
                                    <p style={{ fontWeight: 700, fontSize: '14px' }}>{orderResult.city}, {orderResult.state} ({orderResult.pincode})</p>
                                </div>
                            </div>

                            {/* Tracking Milestones */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '24px 0', borderTop: '1px solid #EEE', borderBottom: '1px solid #EEE', textAlign: 'center' }}>
                                <div>
                                    <CheckCircle size={24} color="#168A35" style={{ margin: '0 auto 6px' }} />
                                    <strong style={{ fontSize: '13px', display: 'block' }}>Order Confirmed</strong>
                                    <span style={{ fontSize: '11px', color: '#888' }}>Verified & Paid</span>
                                </div>
                                <div>
                                    <PackageCheck size={24} color={orderResult.delivery_status !== 'pending' ? '#168A35' : '#BBB'} style={{ margin: '0 auto 6px' }} />
                                    <strong style={{ fontSize: '13px', display: 'block' }}>Packed & Dispatched</strong>
                                    <span style={{ fontSize: '11px', color: '#888' }}>Central Warehouse</span>
                                </div>
                                <div>
                                    <Truck size={24} color={['shipped', 'delivered'].includes(orderResult.delivery_status) ? '#168A35' : '#BBB'} style={{ margin: '0 auto 6px' }} />
                                    <strong style={{ fontSize: '13px', display: 'block' }}>Out for Delivery</strong>
                                    <span style={{ fontSize: '11px', color: '#888' }}>Local Hub</span>
                                </div>
                                <div>
                                    <CheckCircle size={24} color={orderResult.delivery_status === 'delivered' ? '#168A35' : '#BBB'} style={{ margin: '0 auto 6px' }} />
                                    <strong style={{ fontSize: '13px', display: 'block' }}>Delivered</strong>
                                    <span style={{ fontSize: '11px', color: '#888' }}>Doorstep</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
