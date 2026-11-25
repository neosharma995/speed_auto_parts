import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { ChevronRight, Truck, Search, CheckCircle, PackageCheck } from 'lucide-react';
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
            <div className="support-page">
                <div className="container">
                    {/* Breadcrumbs matching Shop, Brands, Categories */}
                    <div className="breadcrumb-nav">
                        <Link href="/" className="breadcrumb-link">Home</Link>
                        <ChevronRight size={12} className="breadcrumb-arrow" />
                        <Link href="/contact-us" className="breadcrumb-link">Support</Link>
                        <ChevronRight size={12} className="breadcrumb-arrow" />
                        <span className="breadcrumb-current">Track Shipment</span>
                    </div>

                    {/* Left-Aligned Header matching Shop, Brands, Categories */}
                    <div className="support-page-header">
                        <h1>
                            <img src="/assets/icons/heading-stripe.webp" alt="" className="title-stripe-icon" />
                            Track Your Shipment
                        </h1>
                        <p>Enter your SPEED AUTOS PARTS order reference number to view live courier status, freight tracking, and delivery timeline.</p>
                    </div>

                    {/* Search Form Card */}
                    <div className="track-order-card">
                        <form onSubmit={handleTrack} className="track-order-form">
                            <input 
                                type="text" 
                                className="form-input"
                                placeholder="Enter Order # (e.g. AP-20261119-DEMO1)"
                                value={orderNumber}
                                onChange={e => setOrderNumber(e.target.value)}
                                required
                            />
                            <button type="submit" className="btn-track" disabled={loading}>
                                <Search size={16} />
                                <span>{loading ? 'Searching...' : 'Track'}</span>
                            </button>
                        </form>

                        {errorMsg && (
                            <div className="track-order-error">
                                ⚠ {errorMsg}
                            </div>
                        )}
                    </div>

                    {orderResult && (
                        <div className="track-result-card">
                            <div className="result-header">
                                <div>
                                    <span className="result-title-tag">Shipment Details</span>
                                    <h3>Order #{orderResult.order_number}</h3>
                                </div>
                                <span className="result-status-badge">
                                    {orderResult.delivery_status}
                                </span>
                            </div>

                            <div className="result-grid">
                                <div className="grid-item">
                                    <span>Carrier</span>
                                    <p>{orderResult.tracking_carrier || 'Aramex Express UAE'}</p>
                                </div>
                                <div className="grid-item">
                                    <span>Tracking / AWB #</span>
                                    <p className="mono">{orderResult.tracking_number || 'Pending Dispatch Assignment'}</p>
                                </div>
                                <div className="grid-item">
                                    <span>Delivery Destination</span>
                                    <p>{orderResult.shipping_city}, {orderResult.shipping_state}</p>
                                </div>
                            </div>

                            {/* Tracking Milestones */}
                            <div className="result-milestones">
                                <div className="milestone-step">
                                    <CheckCircle size={22} color="#168A35" className="milestone-icon" />
                                    <strong>Order Confirmed</strong>
                                    <span>Verified & Paid</span>
                                </div>
                                <div className="milestone-step">
                                    <PackageCheck size={22} color={orderResult.delivery_status !== 'pending' ? '#168A35' : '#BBB'} className="milestone-icon" />
                                    <strong>Packed & Dispatched</strong>
                                    <span>Central Warehouse</span>
                                </div>
                                <div className="milestone-step">
                                    <Truck size={22} color={['shipped', 'delivered'].includes(orderResult.delivery_status) ? '#168A35' : '#BBB'} className="milestone-icon" />
                                    <strong>Out for Delivery</strong>
                                    <span>Local Hub</span>
                                </div>
                                <div className="milestone-step">
                                    <CheckCircle size={22} color={orderResult.delivery_status === 'delivered' ? '#168A35' : '#BBB'} className="milestone-icon" />
                                    <strong>Delivered</strong>
                                    <span>Doorstep</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
