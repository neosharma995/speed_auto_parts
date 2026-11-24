import React from 'react';
import { Link } from '@inertiajs/react';
import { X, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useCart } from '@/Context/CartContext';
import { useCurrency } from '@/Context/CurrencyContext';

export default function CartDrawer() {
    const { formatPrice } = useCurrency();
    const { 
        cartItems, 
        itemCount, 
        subtotal, 
        isCartOpen, 
        setIsCartOpen, 
        updateQuantity, 
        removeFromCart 
    } = useCart();

    if (!isCartOpen) return null;

    return (
        <>
            <div className="header-backdrop" onClick={() => setIsCartOpen(false)} />
            <div className="cart-drawer">
                <div className="cart-drawer-header">
                    <h3>
                        <ShoppingBag size={20} color="#F36B16" />
                        <span>Shopping Cart ({itemCount})</span>
                    </h3>
                    <button 
                        type="button" 
                        onClick={() => setIsCartOpen(false)}
                        className="close-btn"
                        aria-label="Close Cart"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="cart-drawer-body">
                    {cartItems.length === 0 ? (
                        <div className="cart-drawer-empty">
                            <ShoppingBag size={48} />
                            <p>Your shopping cart is currently empty.</p>
                            <button 
                                type="button" 
                                className="btn btn-primary"
                                onClick={() => setIsCartOpen(false)}
                            >
                                Continue Shopping
                            </button>
                        </div>
                    ) : (
                        cartItems.map((item) => (
                            <div key={item.id} className="cart-drawer-item">
                                <div className="cart-drawer-item-img">
                                    <img src={item.image || '/images/products/placeholder.jpg'} alt={item.name} />
                                </div>
                                <div className="cart-drawer-item-info">
                                    <span className="cart-drawer-item-title">{item.name}</span>
                                    {item.variationLabel && (
                                        <span className="cart-drawer-item-variation">
                                            Spec: {item.variationLabel}
                                        </span>
                                    )}
                                    {item.partNumber && (
                                        <span style={{ fontSize: '11px', color: '#888', fontFamily: 'monospace' }}>
                                            Part #: {item.partNumber}
                                        </span>
                                    )}
                                    <span className="cart-drawer-item-price">
                                        {formatPrice(item.price)}
                                    </span>
                                    <div className="cart-drawer-item-controls">
                                        <div className="cart-drawer-item-qty">
                                            <button 
                                                type="button"
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                            >
                                                -
                                            </button>
                                            <span>{item.quantity}</span>
                                            <button 
                                                type="button"
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            >
                                                +
                                            </button>
                                        </div>
                                        <button 
                                            type="button" 
                                            className="cart-drawer-item-remove"
                                            onClick={() => removeFromCart(item.id)}
                                        >
                                            <Trash2 size={14} /> Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {cartItems.length > 0 && (
                    <div className="cart-drawer-footer">
                        <div className="cart-subtotal">
                            <span>Estimated Subtotal</span>
                            <strong>{formatPrice(subtotal)}</strong>
                        </div>
                        <p style={{ fontSize: '11px', color: '#888', marginTop: '-4px' }}>
                            Taxes and shipping calculated at checkout.
                        </p>
                        <Link 
                            href="/checkout" 
                            className="btn btn-primary btn-full btn-lg"
                            onClick={() => setIsCartOpen(false)}
                        >
                            Proceed to Checkout <ArrowRight size={18} />
                        </Link>
                        <Link 
                            href="/cart" 
                            className="btn btn-outline btn-full"
                            onClick={() => setIsCartOpen(false)}
                        >
                            View Cart Details
                        </Link>
                    </div>
                )}
            </div>
        </>
    );
}
