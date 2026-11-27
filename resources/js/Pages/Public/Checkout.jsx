import React, { useState, useEffect } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { useCart } from '@/Context/CartContext';
import { useCurrency } from '@/Context/CurrencyContext';
import { useLanguage } from '@/Context/LanguageContext';
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
    const { regionalRules = [] } = usePage().props;
    const { cartItems, subtotal, clearCart } = useCart();
    const { formatPrice, activeCurrency } = useCurrency();
    const { t } = useLanguage();

    const defaultAddr = savedAddresses.find((a) => a.is_default) || savedAddresses[0] || null;
    const defaultRegion = regionalRules.find((r) => r.is_default) || regionalRules[0] || {
        country_code: 'AE',
        country_name: 'United Arab Emirates',
        tax_rate_percent: 5,
        flat_shipping_cost: 0,
        free_shipping_threshold: 500,
    };

    // Customer & Shipping Info (Regional Country Support)
    const [countryCode, setCountryCode] = useState(defaultRegion.country_code || 'AE');
    const selectedRegion =
        regionalRules.find((r) => r.country_code === countryCode) || defaultRegion;
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

    // Shipping Method (dynamically updated from regional pricing rule)
    const [shippingCost, setShippingCost] = useState(0);
    const shippingMethodTitle = `${selectedRegion.country_name || 'UAE'} Express Courier (Free over ${formatPrice(
        Number(selectedRegion.free_shipping_threshold || 500)
    )})`;

    // Coupon (auto-carries over any promo code applied on /cart)
    const [couponCode, setCouponCode] = useState(() => {
        try {
            const saved = JSON.parse(sessionStorage.getItem('sap_applied_coupon') || 'null');
            return saved?.code || '';
        } catch {
            return '';
        }
    });
    const [discountAmount, setDiscountAmount] = useState(0);
    const [couponSuccessMsg, setCouponSuccessMsg] = useState('');
    const [couponErrorMsg, setCouponErrorMsg] = useState('');

    // Payment Method: 'stripe' or 'cod'
    const [paymentMethod, setPaymentMethod] = useState('stripe');
    const [orderNotes, setOrderNotes] = useState('');

    // Dynamic Country VAT / Tax & Shipping Calculation state
    const [taxData, setTaxData] = useState({
        tax_amount: 0,
        vat_amount: 0,
        tax_rate_percent: Number(selectedRegion.tax_rate_percent ?? 5),
        country_name: selectedRegion.country_name || 'United Arab Emirates',
    });
    const [processingOrder, setProcessingOrder] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (cartItems.length === 0) return;

        axios
            .post('/api/checkout/calculate-tax', {
                items: cartItems,
                customer_state: state,
                country_code: countryCode,
            })
            .then((res) => {
                if (res.data.success) {
                    setTaxData(res.data);
                    if (res.data.shipping_cost !== undefined) {
                        setShippingCost(Number(res.data.shipping_cost || 0));
                    }
                }
            })
            .catch((err) => {
                console.error('VAT calculation error', err);
            });
    }, [cartItems, state, countryCode]);

    useEffect(() => {
        if (subtotal <= 0) return;
        try {
            const saved = JSON.parse(sessionStorage.getItem('sap_applied_coupon') || 'null');
            if (saved?.code && discountAmount === 0) {
                axios
                    .post('/api/coupons/validate', {
                        code: saved.code,
                        subtotal,
                    })
                    .then((res) => {
                        if (res.data.success) {
                            const disc = Number(res.data.discount_amount ?? res.data.discount ?? 0);
                            const resolvedCode = res.data.code || res.data.coupon?.code || saved.code;
                            setCouponCode(resolvedCode);
                            setDiscountAmount(disc);
                            setCouponSuccessMsg(`Coupon ${resolvedCode} applied: -${formatPrice(disc)}`);
                        }
                    })
                    .catch(() => {
                        sessionStorage.removeItem('sap_applied_coupon');
                    });
            }
        } catch {
            // ignore storage errors
        }
    }, [subtotal]);

    const handleApplyCoupon = async (e) => {
        e.preventDefault();
        setCouponErrorMsg('');
        setCouponSuccessMsg('');
        const normalizedCode = couponCode.trim().toUpperCase();
        if (!normalizedCode) return;

        try {
            const res = await axios.post('/api/coupons/validate', {
                code: normalizedCode,
                subtotal,
            });

            if (res.data.success) {
                const disc = Number(res.data.discount_amount ?? res.data.discount ?? 0);
                const resolvedCode = res.data.code || res.data.coupon?.code || normalizedCode;
                setCouponCode(resolvedCode);
                setDiscountAmount(disc);
                setCouponSuccessMsg(`Coupon ${resolvedCode} applied: -${formatPrice(disc)}`);
                try {
                    sessionStorage.setItem('sap_applied_coupon', JSON.stringify({ code: resolvedCode, discount: disc }));
                } catch {
                    // ignore
                }
            } else {
                setCouponErrorMsg(res.data.message || 'Invalid coupon');
            }
        } catch (err) {
            setCouponErrorMsg(err.response?.data?.message || 'Error validating coupon');
        }
    };

    const handleRemoveCoupon = () => {
        setCouponCode('');
        setDiscountAmount(0);
        setCouponSuccessMsg('');
        setCouponErrorMsg('');
        try {
            sessionStorage.removeItem('sap_applied_coupon');
        } catch {
            // ignore
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
            country_code: countryCode,
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
            currency: activeCurrency.code,
        };

        if (paymentMethod === 'cod') {
            try {
                const res = await axios.post('/checkout/cod', orderPayload);
                if (res.data.success) {
                    try {
                        sessionStorage.removeItem('sap_applied_coupon');
                    } catch {
                        // ignore
                    }
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
                        {t('secure_checkout')}
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

                            {/* Step 2: Shipping Address */}
                            <div className="checkout-page-form-section">
                                <h2 className="section-title">
                                    <span className="step-num">2</span>
                                    <span>Shipping Address ({selectedRegion.country_name || 'United Arab Emirates'})</span>
                                </h2>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                                    {regionalRules.length > 0 && (
                                        <div className="form-group">
                                            <label className="form-label">
                                                Destination Country <span className="required">*</span>
                                            </label>
                                            <select
                                                className="form-select"
                                                value={countryCode}
                                                onChange={(e) => setCountryCode(e.target.value)}
                                            >
                                                {regionalRules
                                                    .filter((r) => r.is_selling_enabled !== false)
                                                    .map((r) => (
                                                        <option key={r.country_code} value={r.country_code}>
                                                            {r.country_name} ({r.country_code}) — VAT/Tax {r.tax_rate_percent}%
                                                        </option>
                                                    ))}
                                            </select>
                                        </div>
                                    )}

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
                                                Pay securely in {activeCurrency.code} with Visa, Mastercard, American Express, Apple Pay, or Google Pay via Stripe Checkout.
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
                                            <span>Pay in {activeCurrency.code} upon delivery anywhere in Dubai and across the UAE.</span>
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
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        fontSize: '12px',
                                        color: '#168A35',
                                        fontWeight: 700,
                                        marginBottom: '12px',
                                    }}
                                >
                                    <span>✓ {couponSuccessMsg}</span>
                                    <button
                                        type="button"
                                        onClick={handleRemoveCoupon}
                                        style={{ background: 'none', border: 'none', color: '#D93025', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
                                    >
                                        Remove
                                    </button>
                                </div>
                            )}
                            {couponErrorMsg && (
                                <span style={{ fontSize: '12px', color: '#D93025', marginBottom: '12px', display: 'block' }}>
                                    {couponErrorMsg}
                                </span>
                            )}

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
                                    <span>Shipping ({selectedRegion.country_code || 'AE'})</span>
                                    <span>{shippingCost === 0 ? 'FREE Delivery' : formatPrice(shippingCost)}</span>
                                </div>

                                <div className="total-row">
                                    <span>
                                        {selectedRegion.country_code || 'AE'} VAT / Tax ({taxData.tax_rate_percent ?? 5}%)
                                    </span>
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
