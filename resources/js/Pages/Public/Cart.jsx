import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { useCart } from '@/Context/CartContext';
import { useCurrency } from '@/Context/CurrencyContext';
import { Trash2, ShoppingBag, ArrowRight, ArrowLeft, ShieldCheck, Tag } from 'lucide-react';
import axios from 'axios';

export default function Cart() {
    const { cartItems, itemCount, subtotal, updateQuantity, removeFromCart, clearCart } = useCart();
    const { formatPrice } = useCurrency();
    const [couponCode, setCouponCode] = useState('');
    const [couponDiscount, setCouponDiscount] = useState(0);
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponError, setCouponError] = useState('');
    const [couponLoading, setCouponLoading] = useState(false);

    const handleApplyCoupon = async (e) => {
        e.preventDefault();
        setCouponError('');
        if (!couponCode.trim()) return;

        setCouponLoading(true);
        try {
            const res = await axios.post('/api/coupons/validate', {
                code: couponCode.trim(),
                subtotal: subtotal,
            });

            if (res.data.success) {
                setCouponDiscount(res.data.discount_amount);
                setAppliedCoupon(res.data.code);
            } else {
                setCouponError(res.data.message || 'Invalid coupon code');
            }
        } catch (err) {
            setCouponError(err.response?.data?.message || 'Failed to apply coupon');
        } finally {
            setCouponLoading(false);
        }
    };

    const finalTotal = Math.max(0, subtotal - couponDiscount);

    if (cartItems.length === 0) {
        return (
            <AppLayout title="Shopping Cart">
                <div className="section bg-light" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center' }}>
                    <div className="container" style={{ textAlign: 'center' }}>
                        <div style={{ maxWidth: '400px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                            <ShoppingBag size={64} color="#DCDCDC" />
                            <h2 style={{ fontSize: '24px', fontWeight: 800 }}>Your Cart is Empty</h2>
                            <p style={{ color: '#666', fontSize: '14px' }}>
                                Looks like you haven't added any automotive performance spares to your build list yet.
                            </p>
                            <Link href="/shop" className="btn btn-primary btn-lg">
                                Explore Products <ArrowRight size={16} />
                            </Link>
                        </div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout title={`Shopping Cart (${itemCount} items)`}>
            <div className="section bg-light" style={{ minHeight: '80vh' }}>
                <div className="container">
                    <h1 style={{ fontSize: '28px', fontWeight: 900, textTransform: 'uppercase', marginBottom: '24px' }}>
                        Shopping Cart ({itemCount} {itemCount === 1 ? 'item' : 'items'})
                    </h1>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }} className="cart-grid-desktop">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>
                            {/* Line items table / cards */}
                            <div style={{
                                backgroundColor: '#FFFFFF',
                                border: '1px solid #DCDCDC',
                                borderRadius: '4px',
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    padding: '16px 24px',
                                    backgroundColor: '#F8FAFC',
                                    borderBottom: '1px solid #DCDCDC',
                                    fontSize: '13px',
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    color: '#64748B'
                                }}>
                                    <span>Product Details</span>
                                    <span>Quantity & Line Total</span>
                                </div>

                                <div style={{ padding: '0 24px' }}>
                                    {cartItems.map((item) => (
                                        <div 
                                            key={item.id} 
                                            style={{
                                                display: 'flex',
                                                flexWrap: 'wrap',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                gap: '16px',
                                                padding: '20px 0',
                                                borderBottom: '1px solid #EEEEEE'
                                            }}
                                        >
                                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', minWidth: '260px' }}>
                                                <img 
                                                    src={item.image || '/images/products/placeholder.jpg'} 
                                                    alt={item.name}
                                                    style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #EEE' }}
                                                />
                                                <div>
                                                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#151515', lineHeight: 1.3 }}>
                                                        <Link href={`/product/${item.slug}`}>{item.name}</Link>
                                                    </h3>
                                                    {item.variationLabel && (
                                                        <span style={{ fontSize: '12px', color: '#666', display: 'block', marginTop: '2px' }}>
                                                            Specification: {item.variationLabel}
                                                        </span>
                                                    )}
                                                    {item.partNumber && (
                                                        <span style={{ fontSize: '11px', color: '#888', fontFamily: 'monospace' }}>
                                                            Part #: {item.partNumber}
                                                        </span>
                                                    )}
                                                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#F36B16', display: 'block', marginTop: '4px' }}>
                                                        {formatPrice(item.price)}
                                                    </span>
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #DCDCDC', borderRadius: '4px' }}>
                                                    <button 
                                                        type="button" 
                                                        style={{ width: '32px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    >
                                                        -
                                                    </button>
                                                    <span style={{ width: '36px', textAlign: 'center', fontWeight: 700, fontSize: '14px' }}>
                                                        {item.quantity}
                                                    </span>
                                                    <button 
                                                        type="button" 
                                                        style={{ width: '32px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    >
                                                        +
                                                    </button>
                                                </div>

                                                <span style={{ fontSize: '16px', fontWeight: 800, color: '#151515', minWidth: '100px', textAlign: 'right' }}>
                                                    {formatPrice(Number(item.price) * item.quantity)}
                                                </span>

                                                <button 
                                                    type="button" 
                                                    onClick={() => removeFromCart(item.id)}
                                                    style={{ color: '#888', background: 'none', border: 'none', padding: '6px' }}
                                                    title="Remove item"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 24px', backgroundColor: '#FAFAFA' }}>
                                    <Link href="/shop" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#252525' }}>
                                        <ArrowLeft size={16} /> Continue Shopping
                                    </Link>
                                    <button 
                                        type="button" 
                                        onClick={clearCart}
                                        style={{ fontSize: '13px', color: '#D93025', fontWeight: 600, background: 'none', border: 'none' }}
                                    >
                                        Clear Entire Cart
                                    </button>
                                </div>
                            </div>

                            {/* Summary & Coupon */}
                            <div style={{
                                backgroundColor: '#FFFFFF',
                                border: '1px solid #DCDCDC',
                                borderRadius: '4px',
                                padding: '24px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '16px'
                            }}>
                                <h3 style={{ fontSize: '16px', fontWeight: 800, textTransform: 'uppercase' }}>
                                    Order Summary & Promo Codes
                                </h3>

                                <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '8px' }}>
                                    <input 
                                        type="text" 
                                        className="form-input"
                                        placeholder="Promo code (e.g. SPEED10, TRACKDAY)"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value)}
                                        style={{ textTransform: 'uppercase' }}
                                    />
                                    <button 
                                        type="submit" 
                                        className="btn btn-dark"
                                        disabled={couponLoading}
                                    >
                                        Apply
                                    </button>
                                </form>

                                {couponError && (
                                    <span style={{ fontSize: '12px', color: '#D93025' }}>{couponError}</span>
                                )}

                                {appliedCoupon && (
                                    <span style={{ fontSize: '12px', color: '#168A35', fontWeight: 700 }}>
                                        ✓ Coupon {appliedCoupon} applied: -{formatPrice(couponDiscount)}
                                    </span>
                                )}

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '16px', borderTop: '1px solid #EEE' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#666' }}>
                                        <span>Estimated Item Subtotal</span>
                                        <strong>{formatPrice(subtotal)}</strong>
                                    </div>
                                    {couponDiscount > 0 && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#168A35', fontWeight: 600 }}>
                                            <span>Coupon Discount</span>
                                            <span>-{formatPrice(couponDiscount)}</span>
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 900, color: '#151515', paddingTop: '12px', borderTop: '1px solid #DCDCDC' }}>
                                        <span>Order Total (Excl. Tax & Shipping)</span>
                                        <span>{formatPrice(finalTotal)}</span>
                                    </div>
                                </div>

                                <Link href="/checkout" className="btn btn-primary btn-lg btn-full" style={{ marginTop: '8px' }}>
                                    Proceed to Checkout <ArrowRight size={18} />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
