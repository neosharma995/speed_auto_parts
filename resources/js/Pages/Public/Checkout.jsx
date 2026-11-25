import React, { useState, useEffect } from 'react';
import { Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { useCart } from '@/Context/CartContext';
import { useCurrency } from '@/Context/CurrencyContext';
import { Lock, AlertCircle } from 'lucide-react';
import axios from 'axios';

const UAE_EMIRATES = [
    'Dubai',
    'Abu Dhabi',
    'Sharjah',
    'Ajman',
    'Umm Al Quwain',
    'Ras Al Khaimah',
    'Fujairah',
];

export default function Checkout({ savedAddresses = [], user = null }) {
    const { cartItems, subtotal, clearCart } = useCart();
    const { formatPrice, defaultCurrency } = useCurrency();

    const defaultAddr = savedAddresses.find((a) => a.is_default) || savedAddresses[0] || null;

    // Customer & Shipping Info (Dubai / UAE)
    const [name, setName] = useState(user?.name || defaultAddr?.full_name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [phone, setPhone] = useState(user?.phone || defaultAddr?.phone || '');
    const [address, setAddress] = useState(defaultAddr?.address_line1 || '');
    const [apartment, setApartment] = useState(defaultAddr?.address_line2 || '');
    const [city, setCity] = useState(defaultAddr?.city || 'Dubai');
    const [state, setState] = useState(defaultAddr?.state || 'Dubai');
    const [pincode, setPincode] = useState(defaultAddr?.pincode || '00000');

    // Billing
    const [billingSame] = useState(true);
    const [billingAddress] = useState('');
    const [billingCity] = useState('');
    const [billingState] = useState('');
    const [billingPincode] = useState('');

    // Shipping Method
    const [shippingCost] = useState(0);
    const shippingMethodTitle = `UAE Express Courier (Free over ${formatPrice(500)})`;

    // Coupon
    const [couponCode, setCouponCode] = useState('');
    const [discountAmount, setDiscountAmount] = useState(0);
    const [couponSuccessMsg, setCouponSuccessMsg] = useState('');
    const [couponErrorMsg, setCouponErrorMsg] = useState('');

    // Payment Method: 'stripe' or 'cod'
    const [paymentMethod, setPaymentMethod] = useState('stripe');
    const [orderNotes, setOrderNotes] = useState('');

    // Dynamic UAE VAT Calculation state
    const [taxData, setTaxData] = useState({
        tax_amount: 0,
        vat_amount: 0,
        tax_rate_percent: 5,
    });
    const [processingOrder, setProcessingOrder] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (cartItems.length === 0) return;

        axios
            .post('/api/checkout/calculate-tax', {
                items: cartItems,
                customer_state: state,
            })
            .then((res) => {
                if (res.data.success) {
                    setTaxData(res.data);
                }
            })
            .catch((err) => {
                console.error('VAT calculation error', err);
            });
    }, [cartItems, state]);

    const handleApplyCoupon = async (e) => {
        e.preventDefault();
        setCouponErrorMsg('');
        setCouponSuccessMsg('');
        if (!couponCode.trim()) return;

        try {
            const res = await axios.post('/api/coupons/validate', {
                code: couponCode.trim(),
                subtotal,
            });

            if (res.data.success) {
                const disc = Number(res.data.discount_amount ?? res.data.discount ?? 0);
                setDiscountAmount(disc);
                setCouponSuccessMsg(`Coupon applied: -${formatPrice(disc)}`);
            } else {
                setCouponErrorMsg(res.data.message || 'Invalid coupon');
            }
        } catch (err) {
            setCouponErrorMsg(err.response?.data?.message || 'Error validating coupon');
        }
    };

    const finalSubtotal = Math.max(0, subtotal - discountAmount);
    const grandTotal = finalSubtotal + Number(taxData.tax_amount || 0) + shippingCost;

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        if (!name || !email || !phone || !address || !city || !state || !pincode) {
            setErrorMessage('Please complete all required customer and UAE shipping address fields.');
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
            subtotal,
            total_amount: grandTotal,
            order_notes: orderNotes,
            items: cartItems,
            payment_method: paymentMethod,
        };

        if (paymentMethod === 'cod') {
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
            // Stripe Checkout Sessions flow
            try {
                const stripeRes = await axios.post('/checkout/stripe-session', orderPayload);
                if (stripeRes.data.success && stripeRes.data.checkout_url) {
                    window.location.href = stripeRes.data.checkout_url;
                } else {
                    setErrorMessage(stripeRes.data.message || 'Failed to initialize Stripe checkout.');
                    setProcessingOrder(false);
                }
            } catch (err) {
                setErrorMessage(err.response?.data?.message || 'Error connecting to Stripe payment gateway.');
                setProcessingOrder(false);
            }
        }
    };

    if (cartItems.length === 0) {
        return (
            <AppLayout title="Checkout">
                <div className="section bg-light" style={{ minHeight: '60vh', textAlign: 'center', padding: '64px 20px' }}>
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
                        <div
                            style={{
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
                                fontWeight: 600,
                            }}
                        >
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
                                        <label className="form-label">
                                            Full Name <span className="required">*</span>
                                        </label>
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
                                            <label className="form-label">
                                                Email Address <span className="required">*</span>
                                            </label>
                                            <input
                                                type="email"
                                                className="form-input"
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">
                                                UAE Phone Number <span className="required">*</span>
                                            </label>
                                            <input
                                                type="tel"
                                                className="form-input"
                                                placeholder="+971 50 123 4567"
                                                required
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Step 2: Shipping Address (UAE) */}
                            <div className="checkout-page-form-section">
                                <h2 className="section-title">
                                    <span className="step-num">2</span>
                                    <span>Shipping Address (United Arab Emirates)</span>
                                </h2>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                                    <div className="form-group">
                                        <label className="form-label">
                                            Street / Building / Villa &amp; Area <span className="required">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="e.g. Villa 18, Al Wasl Road, Jumeirah 1"
                                            required
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Apartment, Office, or Landmark (Optional)</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="Apartment, floor, or nearby landmark"
                                            value={apartment}
                                            onChange={(e) => setApartment(e.target.value)}
                                        />
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px' }}>
                                        <div className="form-group">
                                            <label className="form-label">
                                                City / District <span className="required">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                required
                                                value={city}
                                                onChange={(e) => setCity(e.target.value)}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">
                                                Emirate <span className="required">*</span>
                                            </label>
                                            <select
                                                className="form-select"
                                                value={state}
                                                onChange={(e) => setState(e.target.value)}
                                            >
                                                {UAE_EMIRATES.map((em) => (
                                                    <option key={em} value={em}>
                                                        {em}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">
                                                PO Box / Postal Code <span className="required">*</span>
                                            </label>
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
                                    <label
                                        className={`payment-option-card ${paymentMethod === 'stripe' ? 'payment-option-card--active' : ''}`}
                                    >
                                        <input
                                            type="radio"
                                            name="payment_choice"
                                            checked={paymentMethod === 'stripe'}
                                            onChange={() => setPaymentMethod('stripe')}
                                        />
                                        <div className="payment-desc">
                                            <strong>Online Card Payment via Stripe</strong>
                                            <span>
                                                Pay securely in {defaultCurrency.code} with Visa, Mastercard, American Express, Apple Pay, or Google Pay via Stripe Checkout.
                                            </span>
                                        </div>
                                    </label>

                                    <label
                                        className={`payment-option-card ${paymentMethod === 'cod' ? 'payment-option-card--active' : ''}`}
                                    >
                                        <input
                                            type="radio"
                                            name="payment_choice"
                                            checked={paymentMethod === 'cod'}
                                            onChange={() => setPaymentMethod('cod')}
                                        />
                                        <div className="payment-desc">
                                            <strong>Cash on Delivery (COD)</strong>
                                            <span>Pay in {defaultCurrency.code} upon delivery anywhere in Dubai and across the UAE.</span>
                                        </div>
                                    </label>
                                </div>

                                <div className="form-group" style={{ marginTop: '20px' }}>
                                    <label className="form-label">Order Notes / Delivery Instructions (Optional)</label>
                                    <textarea
                                        className="form-textarea"
                                        placeholder="Special handling instructions, villa gate code, workshop bay details..."
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
                                                Qty: {item.quantity} × {formatPrice(item.price)}
                                            </span>
                                        </div>
                                        <span className="summary-item-price">
                                            {formatPrice(Number(item.price) * item.quantity)}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Financial Breakdown with UAE VAT 5% */}
                            <div className="totals-breakdown">
                                <div className="total-row">
                                    <span>Subtotal</span>
                                    <strong>{formatPrice(subtotal)}</strong>
                                </div>

                                {discountAmount > 0 && (
                                    <div className="total-row total-row--discount">
                                        <span>Coupon Savings</span>
                                        <span>-{formatPrice(discountAmount)}</span>
                                    </div>
                                )}

                                <div className="total-row">
                                    <span>Shipping</span>
                                    <span>{shippingCost === 0 ? 'FREE UAE Delivery' : formatPrice(shippingCost)}</span>
                                </div>

                                <div className="total-row">
                                    <span>UAE VAT ({taxData.tax_rate_percent ?? 5}%)</span>
                                    <span>{formatPrice(taxData.tax_amount || 0)}</span>
                                </div>

                                <div className="total-row total-row--grand">
                                    <span>Total Payable</span>
                                    <span style={{ color: '#F36B16' }}>{formatPrice(grandTotal)}</span>
                                </div>
                            </div>

                            <button
                                type="button"
                                className="btn btn-primary btn-lg btn-full"
                                style={{ marginTop: '24px' }}
                                onClick={handlePlaceOrder}
                                disabled={processingOrder}
                            >
                                {processingOrder
                                    ? 'Processing Order...'
                                    : paymentMethod === 'stripe'
                                        ? `Pay ${formatPrice(grandTotal)} with Stripe`
                                        : `Place COD Order (${formatPrice(grandTotal)})`}
                            </button>

                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    fontSize: '11px',
                                    color: '#888',
                                    marginTop: '12px',
                                }}
                            >
                                <Lock size={12} />
                                <span>256-Bit SSL Encrypted Stripe Checkout (Dubai, UAE)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
