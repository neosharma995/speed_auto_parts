import React from 'react';
import { Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import CustomerSidebar from '@/Components/CustomerSidebar';
import ProductCard from '@/Components/ProductCard';
import { Heart } from 'lucide-react';
import { useLanguage } from '@/Context/LanguageContext';

export default function CustomerWishlist({ wishlistItems = [] }) {
    const { t } = useLanguage();
    return (
        <AppLayout title={t('cust_my_wishlist')}>
            <div className="customer-portal">
                <div className="container">
                    <div className="customer-portal-layout">
                        <CustomerSidebar
                            activeTab="wishlist"
                            wishlistCount={wishlistItems.length}
                        />

                        {/* Content */}
                        <div className="customer-portal-content">
                            <div className="portal-card">
                                <div className="portal-card-header">
                                    <h2>{t('cust_saved_wishlist')} ({wishlistItems.length})</h2>
                                </div>

                                {wishlistItems.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '48px 0', color: '#666' }}>
                                        <Heart size={48} color="#DCDCDC" style={{ margin: '0 auto 12px' }} />
                                        <h3>{t('cust_wishlist_empty')}</h3>
                                        <p style={{ fontSize: '13px', marginTop: '4px' }}>{t('cust_wishlist_empty_desc')}</p>
                                        <Link href="/shop" className="btn btn-primary btn-sm" style={{ marginTop: '16px' }}>
                                            {t('explore_products')}
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
