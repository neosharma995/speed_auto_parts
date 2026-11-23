import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Home, Grid, Search, Heart, User } from 'lucide-react';
import { useWishlist } from '@/Context/WishlistContext';

export default function MobileBottomBar() {
    const { url } = usePage();
    const { auth } = usePage().props;
    const { wishlistCount } = useWishlist();

    const isCurrent = (path) => {
        if (path === '/' && url === '/') return true;
        if (path !== '/' && url.startsWith(path)) return true;
        return false;
    };

    return (
        <div className="mobile-bottom-bar">
            <div className="mobile-bottom-bar-container">
                {/* 1. Home */}
                <Link 
                    href="/" 
                    className={`mobile-bottom-bar-item ${isCurrent('/') ? 'mobile-bottom-bar-item--active' : ''}`}
                >
                    <Home size={20} />
                    <span className="mobile-bottom-bar-label">Home</span>
                </Link>

                {/* 2. Categories */}
                <Link 
                    href="/categories" 
                    className={`mobile-bottom-bar-item ${isCurrent('/categories') ? 'mobile-bottom-bar-item--active' : ''}`}
                >
                    <Grid size={20} />
                    <span className="mobile-bottom-bar-label">Categories</span>
                </Link>

                {/* 3. Search */}
                <Link 
                    href="/shop" 
                    className={`mobile-bottom-bar-item ${isCurrent('/shop') ? 'mobile-bottom-bar-item--active' : ''}`}
                >
                    <Search size={20} />
                    <span className="mobile-bottom-bar-label">Search</span>
                </Link>

                {/* 4. Cart */}
                <Link 
                    href="/cart" 
                    className={`mobile-bottom-bar-item ${isCurrent('/cart') ? 'mobile-bottom-bar-item--active' : ''}`}
                >
                    <Heart size={20} />
                    {wishlistCount > 0 && <span className="badge-count">{wishlistCount}</span>}
                    <span className="mobile-bottom-bar-label">Saved</span>
                </Link>

                {/* 5. Admin / Support */}
                {auth?.user && (
                    <Link 
                        href="/admin/dashboard" 
                        className={`mobile-bottom-bar-item ${isCurrent('/admin') ? 'mobile-bottom-bar-item--active' : ''}`}
                    >
                        <User size={20} />
                        <span className="mobile-bottom-bar-label">Admin</span>
                    </Link>
                )}
            </div>
        </div>
    );
}
