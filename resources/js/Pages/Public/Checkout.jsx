import React, { useState, useEffect } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { useCart } from '@/Context/CartContext';
import { 
    CreditCard, 
    Truck, 
    ShieldCheck, 
    Lock, 
    ArrowRight, 
    AlertCircle, 
    Check, 
    MapPin, 
    User, 
    FileText 
} from 'lucide-react';
import axios from 'axios';

export default function Checkout({ savedAddresses = [], user = null }) {
    const { cartItems, subtotal, clearCart } = useCart();

    const defaultAddr = savedAddresses.find(a => a.is_default) || savedAddresses[0] || null;

    // Customer & Shipping Info
    const [name, setName] = useState(user?.name || defaultAddr?.full_name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [phone, setPhone] = useState(user?.phone || defaultAddr?.phone || '');
    const [address, setAddress] = useState(defaultAddr?.address_line1 || '');
    const [apartment, setApartment] = useState(defaultAddr?.address_line2 || '');
    const [city, setCity] = useState(defaultAddr?.city || 'New Delhi');
    const [state, setState] = useState(defaultAddr?.state || 'Delhi');
    const [pincode, setPincode] = useState(defaultAddr?.pincode || '110001');

    // Billing
    const [billingSame, setBillingSame] = useState(true);
    const [billingAddress, setBillingAddress] = useState('');
    const [billingCity, setBillingCity] = useState('');
    const [billingState, setBillingState] = useState('');
    const [billingPincode, setBillingPincode] = useState('');

    // Shipping Method
    const [shippingCost, setShippingCost] = useState(0);
    const [shippingMethodTitle, setShippingMethodTitle] = useState('Standard Ground Freight (Free over ₹10k)');

    // Coupon
    const [couponCode, setCouponCode] = useState('');
    const [discountAmount, setDiscountAmount] = useState(0);
    const [couponSuccessMsg, setCouponSuccessMsg] = useState('');
    const [couponErrorMsg, setCouponErrorMsg] = useState('');

    // Payment Method: 'razorpay' or 'cod'
    const [paymentMethod, setPaymentMethod] = useState('razorpay');
    const [orderNotes, setOrderNotes] = useState('');

    useEffect(() => {
        if (typeof window !== 'undefined' && !window.Razorpay) {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.async = true;
            document.body.appendChild(script);
        }
    }, []);

    // Dynamic Tax Calculation state
    const [taxData, setTaxData] = useState({
        tax_amount: 0,
        cgst_amount: 0,
        sgst_amount: 0,
        igst_amount: 0,
        is_interstate: false,
    });
    const [loadingTax, setLoadingTax] = useState(false);
    const [processingOrder, setProcessingOrder] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // Fetch dynamic GST tax calculation whenever items or shipping state changes
    useEffect(() => {
        if (cartItems.length === 0) return;

        setLoadingTax(true);
        axios.post('/api/checkout/calculate-tax', {
            items: cartItems,
            customer_state: state,
        }).then(res => {
            if (res.data.success) {
                setTaxData(res.data);
            }
        }).catch(err => {
            console.error('Tax calculation error', err);
        }).finally(() => {
            setLoadingTax(false);
        });
    }, [cartItems, state]);

    const handleApplyCoupon = async (e) => {
        e.preventDefault();
        setCouponErrorMsg('');
        if (!couponCode.trim()) return;

        try {
            const res = await axios.post('/api/coupons/validate', {
                code: couponCode.trim(),
                subtotal: subtotal,
            });

            if (res.data.success) {
                setDiscountAmount(res.data.discount_amount);
                setCouponSuccessMsg(`Coupon applied: -₹${res.data.discount_amount.toLocaleString('en-IN')}`);
            } else {
                setCouponErrorMsg(res.data.message || 'Invalid coupon');
            }
        } catch (err) {
            setCouponErrorMsg(err.response?.data?.message || 'Error validating coupon');
        }
    };

    const finalSubtotal = Math.max(0, subtotal - discountAmount);
    const grandTotal = finalSubtotal + taxData.tax_amount + shippingCost;

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        if (!name || !email || !phone || !address || !city || !state || !pincode) {
            setErrorMessage('Please complete all required customer and shipping address fields.');
            return;
        }

        if (cartItems.length === 0) {
            setErrorMessage('Your cart is empty.');
            return;
        }

        setProcessingOrder(true);

        const orderPayload = {
            customer_name: name,
            customer_email: email,
            customer_phone: phone,
            shipping_address: address,
            apartment,
            city,
            state,
            pincode,
            billing_same_as_shipping: billingSame,
            billing_address: billingSame ? address : billingAddress,
            billing_city: billingSame ? city : billingCity,
            billing_state: billingSame ? state : billingState,
            billing_pincode: billingSame ? pincode : billingPincode,
            shipping_method_title: shippingMethodTitle,
            shipping_cost: shippingCost,
            coupon_code: discountAmount > 0 ? couponCode : null,
            discount_amount: discountAmount,
            tax_amount: taxData.tax_amount,
            cgst_amount: taxData.cgst_amount,
            sgst_amount: taxData.sgst_amount,
            igst_amount: taxData.igst_amount,
            subtotal,
            total_amount: grandTotal,
            order_notes: orderNotes,
            items: cartItems,
            payment_method: paymentMethod,
        };

        if (paymentMethod === 'cod') {
            // Cash on delivery
            try {
                const res = await axios.post('/checkout/cod', orderPayload);
                if (res.data.success) {
                    clearCart();
                    router.visit(`/order-success/${res.data.order_number}`);
                } else {
                    setErrorMessage(res.data.message || 'Failed to place COD order.');
                }
            } catch (err) {
                setErrorMessage(err.response?.data?.message || 'Error processing order.');
            } finally {
                setProcessingOrder(false);
            }
        } else {
            // Razorpay payment-first flow
            try {
                const rzpOrderRes = await axios.post('/checkout/razorpay-init', orderPayload);
                if (!rzpOrderRes.data.success) {
                    setErrorMessage(rzpOrderRes.data.message || 'Failed to initialize payment gateway.');
                    setProcessingOrder(false);
                    return;
                }

                const rzpData = rzpOrderRes.data;

                // Check if Razorpay modal is available in browser
                if (typeof window.Razorpay !== 'undefined' && !rzpData.razorpay_order_id.startsWith('order_sim_') && !rzpData.razorpay_order_id.startsWith('order_mock_')) {
                    const options = {
                        key: rzpData.key,
                        amount: rzpData.amount,
                        currency: rzpData.currency || 'INR',
                        name: 'AUTO PARTS',
                        description: `Order ${rzpData.order_number}`,
                        order_id: rzpData.razorpay_order_id,
                        prefill: {
                            name: name,
                            email: email,
                            contact: phone,
                        },
                        theme: {
                            color: '#F36B16',
                        },
                        handler: async function (response) {
                            try {
                                const verifyRes = await axios.post('/checkout/verify-payment', {
                                    razorpay_order_id: response.razorpay_order_id,
                                    razorpay_payment_id: response.razorpay_payment_id,
                                    razorpay_signature: response.razorpay_signature,
                                });

                                if (verifyRes.data.success) {
                                    clearCart();
                                    router.visit(`/order-success/${verifyRes.data.order_number}`);
                                } else {
                                    setErrorMessage('Payment verification failed.');
                                }
                            } catch (e) {
                                setErrorMessage('Error verifying payment.');
                            } finally {
                                setProcessingOrder(false);
                            }
                        },
                        modal: {
                            ondismiss: function () {
                                setProcessingOrder(false);
                            }
                        }
                    };

                    const rzp = new window.Razorpay(options);
                    rzp.open();
                } else {
                    // Simulated / test verification fallback for local environments
                    const simVerifyRes = await axios.post('/checkout/verify-payment', {
                        razorpay_order_id: rzpData.razorpay_order_id,
                        razorpay_payment_id: 'pay_sim_' + Math.random().toString(36).substring(7),
                        razorpay_signature: 'simulated_success_signature',
                    });

                    if (simVerifyRes.data.success) {
                        clearCart();
                        router.visit(`/order-success/${simVerifyRes.data.order_number}`);
                    } else {
                        setErrorMessage('Simulation failed.');
                    }
                    setProcessingOrder(false);
                }
            } catch (err) {
                setErrorMessage(err.response?.data?.message || 'Error connecting to payment gateway.');
                setProcessingOrder(false);
            }
        }
    };

    if (cartItems.length === 0) {
        return (
            <AppLayout title="Checkout">
                <div className="section bg-white" style={{ minHeight: '60vh', textAlign: 'center', padding: '64px 20px' }}>
                    <h2>No items to checkout</h2>
                    <p style={{ color: '#666', marginTop: '8px' }}>Your shopping cart is currently empty.</p>
                    <Link href="/shop" className="btn btn-primary" style={{ marginTop: '16px' }}>
                        Browse Parts
                    </Link>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout title="Secure Checkout">
            <div className="checkout-page bg-light">
                <div className="container">
                    <h1 style={{ fontSize: '28px', fontWeight: 900, textTransform: 'uppercase', marginBottom: '24px' }}>
                        Secure Checkout
                    </h1>

                    {errorMessage && (
                        <div style={{
                            backgroundColor: '#FFF1F2',
                            color: '#D93025',
                            border: '1px solid #FECDD3',
                            borderRadius: '4px',
                            padding: '12px 16px',
                            marginBottom: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '13px',
                            fontWeight: 600
                        }}>
                            <AlertCircle size={16} />
                            <span>{errorMessage}</span>
                        </div>
                    )}

                    <div className="checkout-page-layout">
                        {/* Form Column */}
                        <div>
                            {/* Step 1: Customer Details */}
                            <div className="checkout-page-form-section">
                                <h2 className="section-title">
                                    <span className="step-num">1</span>
                                    <span>Customer Information</span>
                                </h2>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                                    <div className="form-group">
                                        <label className="form-label">Full Name <span className="required">*</span></label>
                                        <input 
                                            type="text" 
                                            className="form-input" 
                                            required
                                            value={name} 
                                            onChange={(e) => setName(e.target.value)} 
                                        />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                                        <div className="form-group">
                                            <label className="form-label">Email Address <span className="required">*</span></label>
                                            <input 
                                                type="email" 
                                                className="form-input" 
                                                required
                                                value={email} 
                                                onChange={(e) => setEmail(e.target.value)} 
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Phone Number <span className="required">*</span></label>
                                            <input 
                                                type="tel" 
                                                className="form-input" 
                                                required
                                                value={phone} 
                                                onChange={(e) => setPhone(e.target.value)} 
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Step 2: Shipping Address */}
                            <div className="checkout-page-form-section">
                                <h2 className="section-title">
                                    <span className="step-num">2</span>
                                    <span>Shipping Address (India)</span>
                                </h2>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                                    <div className="form-group">
                                        <label className="form-label">Street Address & House/Plot No. <span className="required">*</span></label>
                                        <input 
                                            type="text" 
                                            className="form-input" 
                                            placeholder="e.g. 402 Speedline Towers, Outer Ring Road"
                                            required
                                            value={address} 
                                            onChange={(e) => setAddress(e.target.value)} 
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Apartment, Suite, Unit (Optional)</label>
                                        <input 
                                            type="text" 
                                            className="form-input" 
                                            placeholder="Apartment, building floor, or landmark"
                                            value={apartment} 
                                            onChange={(e) => setApartment(e.target.value)} 
                                        />
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px' }}>
                                        <div className="form-group">
                                            <label className="form-label">City <span className="required">*</span></label>
                                            <input 
                                                type="text" 
                                                className="form-input" 
                                                required
                                                value={city} 
                                                onChange={(e) => setCity(e.target.value)} 
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">State <span className="required">*</span></label>
                                            <select 
                                                className="form-select"
                                                value={state}
                                                onChange={(e) => setState(e.target.value)}
                                            >
                                                <option value="Delhi">Delhi</option>
                                                <option value="Maharashtra">Maharashtra</option>
                                                <option value="Karnataka">Karnataka</option>
                                                <option value="Tamil Nadu">Tamil Nadu</option>
                                                <option value="Haryana">Haryana</option>
                                                <option value="Uttar Pradesh">Uttar Pradesh</option>
                                                <option value="Punjab">Punjab</option>
                                                <option value="Gujarat">Gujarat</option>
                                                <option value="Rajasthan">Rajasthan</option>
                                                <option value="Telangana">Telangana</option>
                                                <option value="West Bengal">West Bengal</option>
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">Pincode <span className="required">*</span></label>
                                            <input 
                                                type="text" 
                                                className="form-input" 
                                                required
                                                value={pincode} 
                                                onChange={(e) => setPincode(e.target.value)} 
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Step 3: Payment Method */}
                            <div className="checkout-page-form-section">
                                <h2 className="section-title">
                                    <span className="step-num">3</span>
                                    <span>Payment Method</span>
                                </h2>

                                <div className="payment-options">
                                    <label className={`payment-option-card ${paymentMethod === 'razorpay' ? 'payment-option-card--active' : ''}`}>
                                        <input 
                                            type="radio" 
                                            name="payment_choice"
                                            checked={paymentMethod === 'razorpay'}
                                            onChange={() => setPaymentMethod('razorpay')}
                                        />
                                        <div className="payment-desc">
                                            <strong>Online Payment via Razorpay</strong>
                                            <span>Pay instantly via UPI (Google Pay, PhonePe, Paytm), Credit/Debit Card, or Netbanking.</span>
                                        </div>
                                    </label>

                                    <label className={`payment-option-card ${paymentMethod === 'cod' ? 'payment-option-card--active' : ''}`}>
                                        <input 
                                            type="radio" 
                                            name="payment_choice"
                                            checked={paymentMethod === 'cod'}
                                            onChange={() => setPaymentMethod('cod')}
                                        />
                                        <div className="payment-desc">
                                            <strong>Cash on Delivery (COD)</strong>
                                            <span>Pay upon physical delivery of automotive spare parts at your doorstep.</span>
                                        </div>
                                    </label>
                                </div>

                                <div className="form-group" style={{ marginTop: '20px' }}>
                                    <label className="form-label">Order Notes / Delivery Instructions (Optional)</label>
                                    <textarea 
                                        className="form-textarea"
                                        placeholder="Special handling instructions, garage gate entry codes, etc."
                                        value={orderNotes}
                                        onChange={(e) => setOrderNotes(e.target.value)}
                                        style={{ minHeight: '60px' }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Order Summary Column */}
                        <div className="checkout-page-summary">
                            <h3>Order Summary ({cartItems.length} items)</h3>

                            <div className="order-items-list">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="summary-item">
                                        <img src={item.image || '/images/products/placeholder.jpg'} alt={item.name} />
                                        <div className="summary-item-info">
                                            <h4>{item.name}</h4>
                                            {item.variationLabel && <span>{item.variationLabel}</span>}
                                            <span style={{ display: 'block', fontSize: '11px', color: '#888' }}>
                                                Qty: {item.quantity} × ₹{Number(item.price).toLocaleString('en-IN')}
                                            </span>
                                        </div>
                                        <span className="summary-item-price">
                                            ₹{(Number(item.price) * item.quantity).toLocaleString('en-IN')}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Promo Code Form */}
                            <form onSubmit={handleApplyCoupon} className="coupon-box">
                                <input 
                                    type="text" 
                                    placeholder="COUPON (e.g. SPEED10)"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value)}
                                />
                                <button type="submit" className="btn btn-dark btn-sm">
                                    Apply
                                </button>
                            </form>

                            {couponSuccessMsg && (
                                <span style={{ fontSize: '12px', color: '#168A35', fontWeight: 700, marginBottom: '12px', display: 'block' }}>
                                    {couponSuccessMsg}
                                </span>
                            )}
                            {couponErrorMsg && (
                                <span style={{ fontSize: '12px', color: '#D93025', marginBottom: '12px', display: 'block' }}>
                                    {couponErrorMsg}
                                </span>
                            )}

                            {/* Financial Breakdown with Centralized GST */}
                            <div className="totals-breakdown">
                                <div className="total-row">
                                    <span>Subtotal</span>
                                    <strong>₹{subtotal.toLocaleString('en-IN')}</strong>
                                </div>

                                {discountAmount > 0 && (
                                    <div className="total-row total-row--discount">
                                        <span>Coupon Savings</span>
                                        <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                                    </div>
                                )}

                                <div className="total-row">
                                    <span>Shipping</span>
                                    <span>{shippingCost === 0 ? 'FREE Ground Shipping' : `₹${shippingCost}`}</span>
                                </div>

                                {/* Detailed GST breakdown */}
                                {taxData.is_interstate ? (
                                    <div className="total-row">
                                        <span>IGST (Integrated Tax)</span>
                                        <span>₹{taxData.igst_amount.toLocaleString('en-IN')}</span>
                                    </div>
                                ) : (
                                    <>
                                        <div className="total-row">
                                            <span>CGST (Central GST)</span>
                                            <span>₹{taxData.cgst_amount.toLocaleString('en-IN')}</span>
                                        </div>
                                        <div className="total-row">
                                            <span>SGST (State GST)</span>
                                            <span>₹{taxData.sgst_amount.toLocaleString('en-IN')}</span>
                                        </div>
                                    </>
                                )}

                                <div className="total-row total-row--grand">
                                    <span>Total Payable</span>
                                    <span style={{ color: '#F36B16' }}>₹{grandTotal.toLocaleString('en-IN')}</span>
                                </div>
                            </div>

                            <button 
                                type="button" 
                                className="btn btn-primary btn-lg btn-full"
                                style={{ marginTop: '24px' }}
                                onClick={handlePlaceOrder}
                                disabled={processingOrder}
                            >
                                {processingOrder ? 'Processing Order...' : `Pay ₹${grandTotal.toLocaleString('en-IN')} Now`}
                            </button>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '11px', color: '#888', marginTop: '12px' }}>
                                <Lock size={12} />
                                <span>256-Bit SSL Encrypted Razorpay Checkout</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
