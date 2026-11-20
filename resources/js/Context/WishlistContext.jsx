import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';

const WishlistContext = createContext();

export function WishlistProvider({ children, initialWishlist = [] }) {
    const [wishlist, setWishlist] = useState(() => {
        if (typeof window !== 'undefined') {
            try {
                const stored = localStorage.getItem('autoparts_wishlist');
                if (stored) return JSON.parse(stored);
            } catch (e) {
                console.error('Error reading wishlist', e);
            }
        }
        return Array.isArray(initialWishlist) ? initialWishlist : [];
    });

    const toggleWishlist = async (productId) => {
        let updated = [];
        if (wishlist.includes(productId)) {
            updated = wishlist.filter(id => id !== productId);
        } else {
            updated = [...wishlist, productId];
        }
        setWishlist(updated);
        if (typeof window !== 'undefined') {
            localStorage.setItem('autoparts_wishlist', JSON.stringify(updated));
        }
        try {
            await axios.post('/wishlist/toggle', { product_id: productId });
        } catch (e) {
            // guest fallback
        }
    };

    const isInWishlist = (productId) => wishlist.includes(productId);

    return (
        <WishlistContext.Provider value={{
            wishlist,
            wishlistCount: wishlist.length,
            toggleWishlist,
            isInWishlist,
        }}>
            {children}
        </WishlistContext.Provider>
    );
}

export function useWishlist() {
    return useContext(WishlistContext);
}
