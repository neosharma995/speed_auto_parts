import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { Star, ShoppingCart, Heart, Check, ChevronDown } from 'lucide-react';
import { useCart } from '@/Context/CartContext';
import { useCurrency } from '@/Context/CurrencyContext';
import { useLanguage } from '@/Context/LanguageContext';
import { useWishlist } from '@/Context/WishlistContext';

export default function ProductCard({ product }) {
    const { addToCart } = useCart();
    const { formatPrice } = useCurrency();
    const { t, localize } = useLanguage();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const [quantity, setQuantity] = useState(1);
    const [added, setAdded] = useState(false);

    const displayName = localize(product, 'name');
    const displayShortDesc = localize(product, 'short_description');
    const displayBrand = product.brand
        ? (typeof product.brand === 'object' ? localize(product.brand, 'name') : product.brand)
        : '';

    const isFav = isInWishlist(product.id);
    const regularPrice = Number(product.base_price || product.regular_price || 0);
    const sellingPrice = Number(product.effective_price || product.sale_price || product.base_price || 0);
    const hasDiscount = product.discount_percentage > 0 || (regularPrice > sellingPrice && regularPrice > 0);
    const discountPercent = product.discount_percentage || (regularPrice > sellingPrice ? Math.round(((regularPrice - sellingPrice) / regularPrice) * 100) : 0);
    const inStock = product.is_in_stock !== false;

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!inStock) return;

        const defaultVar = product.variations?.find(v => v.is_default) || product.variations?.[0] || null;
        addToCart(product, defaultVar, quantity);
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
    };

    return (
        <div className="product-card">
            {/* Discount Badge */}
            {hasDiscount && discountPercent > 0 && (
                <div className="product-card-badge">
                    <span className="badge-discount">-{discountPercent}% {t('off')}</span>
                </div>
            )}

            {/* Wishlist Button */}
            <button 
                type="button"
                className={`product-card-wishlist ${isFav ? 'product-card-wishlist--active' : ''}`}
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleWishlist(product.id);
                }}
                aria-label="Wishlist"
            >
                <Heart size={16} fill={isFav ? '#D93025' : 'none'} stroke={isFav ? '#D93025' : '#888888'} />
            </button>

            {/* Media */}
            <Link href={`/products/${product.slug || ''}`} className="product-card-media">
                <img 
                    src={product.main_image || '/assets/images/products/performance-tire.webp'} 
                    alt={displayName} 
                    loading="lazy" 
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/assets/images/products/performance-tire.webp';
                    }}
                />
            </Link>

            {/* Body */}
            <div className="product-card-body">
                {displayBrand && (
                    <span className="product-card-brand">{displayBrand}</span>
                )}

                <h3 className="product-card-title">
                    <Link href={`/products/${product.slug || ''}`}>{displayName}</Link>
                </h3>

                {displayShortDesc && (
                    <p className="product-card-desc">{displayShortDesc}</p>
                )}

                {/* Rating */}
                <div className="product-card-rating">
                    <div className="product-card-rating-stars">
                        {[1, 2, 3, 4, 5].map((s) => (
                            <Star 
                                key={s} 
                                size={12} 
                                fill={s <= Math.round(Number(product.rating || 5)) ? '#E37400' : 'none'} 
                                stroke="#E37400"
                            />
                        ))}
                    </div>
                    <span className="rating-num">{Number(product.rating || 5).toFixed(1)}</span>
                    <span className="rating-count">({product.rating_count || 124})</span>
                </div>

                {/* Stock Status */}
                <div className="product-card-stock">
                    <span className="stock-dot">●</span>
                    <span className="stock-text">{inStock ? t('in_stock') : t('out_of_stock')}</span>
                </div>

                {/* Price */}
                <div className="product-card-price-wrap">
                    <span className="product-card-price">
                        {formatPrice(sellingPrice)}
                    </span>
                    {hasDiscount && regularPrice > sellingPrice && (
                        <span className="product-card-original">
                            {formatPrice(regularPrice)}
                        </span>
                    )}
                </div>
            </div>

            {/* Actions: Quantity Selector & Add to Cart */}
            <div className="product-card-actions">
                <div className="qty-select-wrap">
                    <select 
                        value={quantity} 
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        className="qty-dropdown"
                        disabled={!inStock}
                        aria-label="Quantity"
                    >
                        {[1, 2, 3, 4, 5].map(q => (
                            <option key={q} value={q}>{q}</option>
                        ))}
                    </select>
                    <ChevronDown size={12} className="qty-arrow" />
                </div>

                <button 
                    type="button" 
                    className="btn-add-cart"
                    onClick={handleAddToCart}
                    disabled={!inStock}
                >
                    {added ? (
                        <>
                            <Check size={15} /> {t('added')}
                        </>
                    ) : (
                        <>
                            <ShoppingCart size={15} /> {t('add_to_cart')}
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
