import React from 'react';
import { Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import ProductCard from '@/Components/ProductCard';
import { LayoutDashboard, ShoppingBag, MapPin, Heart, LogOut } from 'lucide-react';

export default function CustomerWishlist({ wishlistItems = [] }) {
    return (
        <AppLayout title="My Wishlist">
            <div className="customer-portal">
                <div className="container">
                    <div className="customer-portal-layout">
                        {/* Sidebar */}
                        <aside className="customer-portal-sidebar">
                            <nav className="portal-nav">
                                <Link href="/customer/dashboard" className="portal-nav-link">
                                    <LayoutDashboard size={18} />
                                    <span>Dashboard Overview</span>
                                </Link>
                                <Link href="/customer/orders" className="portal-nav-link">
                                    <ShoppingBag size={18} />
                                    <span>My Orders</span>
                                </Link>
                                <Link href="/customer/addresses" className="portal-nav-link">
                                    <MapPin size={18} />
                                    <span>Saved Addresses</span>
                                </Link>
                                <Link href="/customer/wishlist" className="portal-nav-link portal-nav-link--active">
                                    <Heart size={18} />
                                    <span>My Wishlist ({wishlistItems.length})</span>
                                </Link>
                                <Link href="/logout" method="post" as="button" className="portal-nav-link" style={{ width: '100%', textAlign: 'left', color: '#D93025' }}>
                                    <LogOut size={18} />
                                    <span>Sign Out</span>
                                </Link>
                            </nav>
                        </aside>

                        {/* Content */}
                        <div className="customer-portal-content">
                            <div className="portal-card">
                                <div className="portal-card-header">
                                    <h2>Saved Wishlist Parts ({wishlistItems.length})</h2>
                                </div>

                                {wishlistItems.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '48px 0', color: '#666' }}>
                                        <Heart size={48} color="#DCDCDC" style={{ margin: '0 auto 12px' }} />
                                        <h3>Your Wishlist is Empty</h3>
                                        <p style={{ fontSize: '13px', marginTop: '4px' }}>Save components to your wishlist while researching builds.</p>
                                        <Link href="/shop" className="btn btn-primary btn-sm" style={{ marginTop: '16px' }}>
                                            Explore Catalog
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="product-grid">
                                        {wishlistItems.map(item => (
                                            item.product && <ProductCard key={item.id} product={item.product} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
