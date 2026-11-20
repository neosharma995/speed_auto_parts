import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { Star, ShoppingCart, Heart, Check, AlertTriangle } from 'lucide-react';
import { useCart } from '@/Context/CartContext';
import { useWishlist } from '@/Context/WishlistContext';

export default function ProductCard({ product }) {
    const { addToCart } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const [quantity, setQuantity] = useState(1);
    const [added, setAdded] = useState(false);

    const isFav = isInWishlist(product.id);
    const regularPrice = Number(product.base_price || 0);
    const sellingPrice = Number(product.effective_price || product.sale_price || product.base_price);
    const hasDiscount = product.discount_percentage > 0;
    const inStock = product.is_in_stock !== false;

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!inStock) return;

        // If variable, pick default variation or first
        const defaultVar = product.variations?.find(v => v.is_default) || product.variations?.[0] || null;
        addToCart(product, defaultVar, quantity);
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
    };

    return (
        <div className="product-card">
            {/* Discount / Status Badges */}
            {hasDiscount && (
                <div className="product-card-badge">
                    <span className="badge badge-primary">-{product.discount_percentage}% OFF</span>
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
                <Heart size={16} fill={isFav ? '#D93025' : 'none'} />
            </button>

            {/* Media */}
            <Link href={`/product/${product.slug}`} className="product-card-media">
                <img 
                    src={product.main_image || '/images/products/placeholder.jpg'} 
                    alt={product.name} 
                    loading="lazy" 
                />
            </Link>

            {/* Body */}
            <div className="product-card-body">
                {product.brand && (
                    <span className="product-card-brand">{product.brand.name}</span>
                )}

                <h3 className="product-card-title">
                    <Link href={`/product/${product.slug}`}>{product.name}</Link>
                </h3>

                {product.part_number && (
                    <span className="product-card-part">Part #: {product.part_number}</span>
                )}

                {/* Rating */}
                <div className="product-card-rating">
                    <div className="product-card-rating-stars">
                        {[1, 2, 3, 4, 5].map((s) => (
                            <Star 
                                key={s} 
                                size={12} 
                                fill={s <= Math.round(Number(product.rating || 5)) ? '#E37400' : 'none'} 
                            />
                        ))}
                    </div>
                    <span>{Number(product.rating || 5).toFixed(1)}</span>
                    <span className="product-card-rating-count">({product.rating_count || 12})</span>
                </div>

                {/* Short Description */}
                {product.short_description && (
                    <p className="product-card-desc">{product.short_description}</p>
                )}

                {/* Price */}
                <div className="product-card-price-wrap">
                    <span className="product-card-price">
                        ₹{sellingPrice.toLocaleString('en-IN')}
                    </span>
                    {hasDiscount && (
                        <span className="product-card-original">
                            ₹{regularPrice.toLocaleString('en-IN')}
                        </span>
                    )}
                </div>

                {/* Stock Status */}
                <div className={`product-card-stock ${inStock ? 'product-card-stock--in' : 'product-card-stock--out'}`}>
                    <span>{inStock ? 'In Stock — Ready to Ship' : 'Out of Stock'}</span>
                </div>
            </div>

            {/* Actions: Quantity Picker & Add to Cart */}
            <div className="product-card-actions">
                <div className="qty-picker">
                    <button 
                        type="button" 
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={!inStock}
                    >
                        -
                    </button>
                    <span>{quantity}</span>
                    <button 
                        type="button" 
                        onClick={() => setQuantity(quantity + 1)}
                        disabled={!inStock}
                    >
                        +
                    </button>
                </div>

                <button 
                    type="button" 
                    className={`btn btn-add ${inStock ? 'btn-primary' : 'btn-dark'}`}
                    onClick={handleAddToCart}
                    disabled={!inStock}
                >
                    {added ? (
                        <>
                            <Check size={16} /> Added
                        </>
                    ) : (
                        <>
                            <ShoppingCart size={15} /> Add to Cart
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
