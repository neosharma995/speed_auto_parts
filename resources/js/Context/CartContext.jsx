import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const CartContext = createContext();

export function CartProvider({ children, initialCart = [] }) {
    const [cartItems, setCartItems] = useState(() => {
        if (typeof window !== 'undefined') {
            try {
                const stored = localStorage.getItem('autoparts_cart');
                if (stored) return JSON.parse(stored);
            } catch (e) {
                console.error('Error reading cart from localStorage', e);
            }
        }
        return Array.isArray(initialCart) ? initialCart : [];
    });

    const [isCartOpen, setIsCartOpen] = useState(false);

    // Synchronize to localStorage and backend session
    const syncCart = async (items) => {
        setCartItems(items);
        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem('autoparts_cart', JSON.stringify(items));
            } catch (e) {
                console.error('Error saving cart to localStorage', e);
            }
        }
        try {
            await axios.post('/cart/sync', { cart: items });
        } catch (e) {
            console.error('Failed to sync cart with server session', e);
        }
    };

    const addToCart = (product, variation = null, quantity = 1) => {
        const itemPrice = variation ? Number(variation.effective_price || variation.sale_price || variation.price) : Number(product.effective_price || product.sale_price || product.base_price);
        const itemImage = variation?.image || product.main_image || '/images/products/placeholder.jpg';
        const itemSku = variation?.sku || product.sku;
        const itemPartNumber = variation?.part_number || product.part_number;
        const variationLabel = variation?.name || null;
        const cartItemId = variation ? `p${product.id}_v${variation.id}` : `p${product.id}`;

        const existingIndex = cartItems.findIndex(item => item.id === cartItemId);
        let updatedItems = [];

        if (existingIndex > -1) {
            updatedItems = cartItems.map((item, idx) => 
                idx === existingIndex ? { ...item, quantity: item.quantity + quantity } : item
            );
        } else {
            updatedItems = [
                ...cartItems,
                {
                    id: cartItemId,
                    productId: product.id,
                    variationId: variation?.id || null,
                    name: product.name,
                    variationLabel,
                    sku: itemSku,
                    partNumber: itemPartNumber,
                    price: itemPrice,
                    quantity,
                    image: itemImage,
                    slug: product.slug,
                }
            ];
        }

        syncCart(updatedItems);
        setIsCartOpen(true);
    };

    const updateQuantity = (itemId, quantity) => {
        if (quantity <= 0) {
            removeFromCart(itemId);
            return;
        }
        const updated = cartItems.map(item => item.id === itemId ? { ...item, quantity } : item);
        syncCart(updated);
    };

    const removeFromCart = (itemId) => {
        const updated = cartItems.filter(item => item.id !== itemId);
        syncCart(updated);
    };

    const clearCart = () => {
        syncCart([]);
    };

    const itemCount = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);
    const subtotal = cartItems.reduce((acc, item) => acc + (Number(item.price) * (item.quantity || 1)), 0);

    return (
        <CartContext.Provider value={{
            cartItems,
            itemCount,
            subtotal,
            isCartOpen,
            setIsCartOpen,
            addToCart,
            updateQuantity,
            removeFromCart,
            clearCart,
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    return useContext(CartContext);
}
