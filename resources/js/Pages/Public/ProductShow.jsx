import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import ProductCard from '@/Components/ProductCard';
import {
    Star,
    ShoppingCart,
    Heart,
    Check,
    ShieldCheck,
    AlertTriangle,
    ChevronRight,
    Truck,
    Wrench,
    Car,
    FileText,
    MessageSquare
} from 'lucide-react';
import { useCart } from '@/Context/CartContext';
import { useWishlist } from '@/Context/WishlistContext';
import { useCurrency } from '@/Context/CurrencyContext';

export default function ProductShow({
    product,
    variations = [],
    compatibleVehicles = [],
    relatedProducts = [],
    activeVehicle = null,
    fitmentStatus = null
}) {
    const { addToCart } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const { formatPrice } = useCurrency();

    // Select default variation or first
    const defaultVar = variations.find(v => v.is_default) || variations[0] || null;
    const [selectedVariation, setSelectedVariation] = useState(defaultVar);
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState('specs');
    const [activeImage, setActiveImage] = useState(product.main_image);
    const [addedToast, setAddedToast] = useState(false);

    const isFav = isInWishlist(product.id);

    // Dynamic price based on selected variation
    const currentPrice = selectedVariation ? Number(selectedVariation.price) : Number(product.base_price);
    const currentSalePrice = selectedVariation ? (selectedVariation.sale_price ? Number(selectedVariation.sale_price) : null) : (product.sale_price ? Number(product.sale_price) : null);
    const effectivePrice = currentSalePrice && currentSalePrice < currentPrice ? currentSalePrice : currentPrice;
    const hasDiscount = currentSalePrice && currentSalePrice < currentPrice;
    const currentSku = selectedVariation?.sku || product.sku;
    const currentPartNumber = selectedVariation?.part_number || product.part_number;
    const currentStock = selectedVariation ? selectedVariation.stock_quantity : product.stock_quantity;
    const isInStock = selectedVariation ? (selectedVariation.stock_status === 'in_stock' && currentStock > 0) : (product.stock_status === 'in_stock' && currentStock > 0);

    const galleryImages = [
        product.main_image,
        ...(Array.isArray(product.gallery_images) ? product.gallery_images : []),
    ].filter(Boolean);

    const handleAddToCart = () => {
        if (!isInStock) return;
        addToCart(product, selectedVariation, quantity);
        setAddedToast(true);
        setTimeout(() => setAddedToast(false), 2000);
    };

    return (
        <AppLayout title={product.name}>
            <div className="product-single">
                <div className="container">
                    {/* Breadcrumbs */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#888', marginBottom: '24px' }}>
                        <Link href="/" style={{ color: '#252525' }}>Home</Link>
                        <ChevronRight size={12} />
                        <Link href="/shop" style={{ color: '#252525' }}>Shop</Link>
                        {product.category && (
                            <>
                                <ChevronRight size={12} />
                                <Link href={`/shop?category=${product.category.slug}`} style={{ color: '#252525' }}>
                                    {product.category.name}
                                </Link>
                            </>
                        )}
                        <ChevronRight size={12} />
                        <span style={{ color: '#F36B16', fontWeight: 600 }}>{product.name}</span>
                    </div>

                    {/* Main Layout */}
                    <div className="product-single-layout">
                        {/* Left: Gallery */}
                        <div className="product-single-gallery">
                            <div className="product-single-gallery-main">
                                <img
                                    src={activeImage || product.main_image || '/assets/images/products/performance-tire.webp'}
                                    alt={product.name}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = '/assets/images/products/performance-tire.webp';
                                    }}
                                />
                            </div>

                            {galleryImages.length > 1 && (
                                <div className="product-single-gallery-thumbs">
                                    {galleryImages.map((img, idx) => (
                                        <div
                                            key={idx}
                                            className={`thumb-item ${activeImage === img ? 'thumb-item--active' : ''}`}
                                            onClick={() => setActiveImage(img)}
                                        >
                                            <img src={img} alt={`${product.name} angle ${idx + 1}`} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Right: Info, Price, Variations, Fitment & Buy */}
                        <div className="product-single-info">
                            {product.brand && (
                                <Link href={`/brands/${product.brand.slug}`} className="brand-link">
                                    {product.brand.name} Precision Spares
                                </Link>
                            )}

                            <h1>{product.name}</h1>

                            <div className="meta-row">
                                <span>SKU: <strong className="sku-tag">{currentSku}</strong></span>
                                <span>•</span>
                                <span>Part #: <strong className="sku-tag">{currentPartNumber}</strong></span>
                            </div>

                            {/* Pricing */}
                            <div className="pricing-box">
                                <span className="current-price">{formatPrice(effectivePrice)}</span>
                                {hasDiscount && (
                                    <>
                                        <span className="old-price">{formatPrice(currentPrice)}</span>
                                        <span className="discount-badge">
                                            SAVE {Math.round(((currentPrice - effectivePrice) / currentPrice) * 100)}%
                                        </span>
                                    </>
                                )}
                            </div>

                            {/* Vehicle Fitment Verification Widget */}
                            <div className="fitment-box">
                                <div className="fitment-box-header">
                                    <Car size={16} />
                                    <span>Vehicle Fitment Verification</span>
                                </div>
                                {activeVehicle ? (
                                    fitmentStatus?.compatible ? (
                                        <div className="fitment-box-result fitment-box-result--verified">
                                            <Check size={18} />
                                            <div>
                                                <span>✓ Guaranteed to fit your {activeVehicle.year} {activeVehicle.make} {activeVehicle.model} ({activeVehicle.engine})</span>
                                                {fitmentStatus.notes && (
                                                    <p style={{ fontSize: '11px', color: '#666', marginTop: '2px', fontWeight: 'normal' }}>
                                                        Installation Note: {fitmentStatus.notes}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="fitment-box-result fitment-box-result--unverified">
                                            <AlertTriangle size={18} />
                                            <span>
                                                Warning: This component is NOT verified for your selected {activeVehicle.year} {activeVehicle.make} {activeVehicle.model}.
                                            </span>
                                        </div>
                                    )
                                ) : (
                                    <div style={{ fontSize: '13px', color: '#666', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <span>Select your vehicle to confirm fitment before ordering:</span>
                                        <Link href="/vehicle-finder" className="btn btn-outline btn-sm">
                                            Select Vehicle
                                        </Link>
                                    </div>
                                )}
                            </div>

                            {/* Product Variations Selector if applicable */}
                            {variations.length > 0 && (
                                <div className="variations-box">
                                    <span className="variation-label">Select Specification / Size:</span>
                                    <div className="variation-options">
                                        {variations.map(variation => (
                                            <button
                                                key={variation.id}
                                                type="button"
                                                className={`var-btn ${selectedVariation?.id === variation.id ? 'var-btn--active' : ''}`}
                                                onClick={() => {
                                                    setSelectedVariation(variation);
                                                    if (variation.image) setActiveImage(variation.image);
                                                }}
                                            >
                                                {variation.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Stock Indicator */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', marginTop: '4px' }}>
                                <span style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    backgroundColor: isInStock ? '#168A35' : '#D93025'
                                }} />
                                <strong style={{ color: isInStock ? '#168A35' : '#D93025' }}>
                                    {isInStock ? `In Stock (${currentStock} units available at central depot)` : 'Temporarily Out of Stock'}
                                </strong>
                            </div>

                            {/* Purchase Action Row */}
                            <div className="purchase-row">
                                <div className="qty-selector">
                                    <button
                                        type="button"
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        disabled={!isInStock}
                                    >
                                        -
                                    </button>
                                    <span>{quantity}</span>
                                    <button
                                        type="button"
                                        onClick={() => setQuantity(quantity + 1)}
                                        disabled={!isInStock}
                                    >
                                        +
                                    </button>
                                </div>

                                <button
                                    type="button"
                                    className="btn btn-primary btn-add-cart"
                                    onClick={handleAddToCart}
                                    disabled={!isInStock}
                                >
                                    {addedToast ? (
                                        <>
                                            <Check size={18} /> Added to Cart!
                                        </>
                                    ) : (
                                        <>
                                            <ShoppingCart size={18} /> Add to Cart — {formatPrice(effectivePrice * quantity)}
                                        </>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    className={`btn-wishlist ${isFav ? 'btn-wishlist--active' : ''}`}
                                    onClick={() => toggleWishlist(product.id)}
                                    title="Add to Wishlist"
                                >
                                    <Heart size={20} fill={isFav ? '#D93025' : 'none'} />
                                </button>
                            </div>

                            {/* Trust badges */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginTop: '12px', paddingTop: '16px', borderTop: '1px solid #EEEEEE' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#666' }}>
                                    <Truck size={16} color="#F36B16" />
                                    <span>Insured Dubai &amp; UAE Express Freight</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#666' }}>
                                    <ShieldCheck size={16} color="#168A35" />
                                    <span>Manufacturer Direct Warranty</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Detailed Specifications & Compatible Vehicles Tabs */}
                    <div className="product-single-tabs">
                        <div className="tabs-nav">
                            <button
                                type="button"
                                className={activeTab === 'specs' ? 'active' : ''}
                                onClick={() => setActiveTab('specs')}
                            >
                                Technical Specifications
                            </button>
                            <button
                                type="button"
                                className={activeTab === 'vehicles' ? 'active' : ''}
                                onClick={() => setActiveTab('vehicles')}
                            >
                                Compatible Vehicles ({compatibleVehicles.length})
                            </button>
                        </div>

                        {/* Tab 1: Specs */}
                        {activeTab === 'specs' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div style={{ fontSize: '14px', lineHeight: 1.7, color: '#333' }}>
                                    {product.description}
                                </div>

                                <table className="specs-table">
                                    <tbody>
                                        <tr>
                                            <th>Manufacturer / Brand</th>
                                            <td>{product.brand?.name || 'Automotive Performance'}</td>
                                        </tr>
                                        <tr>
                                            <th>Part Number</th>
                                            <td>{currentPartNumber}</td>
                                        </tr>
                                        <tr>
                                            <th>SKU</th>
                                            <td>{currentSku}</td>
                                        </tr>
                                        {product.weight && (
                                            <tr>
                                                <th>Shipping Weight</th>
                                                <td>{product.weight} {product.weight_unit || 'kg'}</td>
                                            </tr>
                                        )}
                                        {product.technical_specifications && (
                                            <tr>
                                                <th>Engineering Specs</th>
                                                <td>{product.technical_specifications}</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Tab 2: Compatible Vehicles */}
                        {activeTab === 'vehicles' && (
                            <div>
                                <p style={{ fontSize: '13px', color: '#666', marginBottom: '16px' }}>
                                    The following makes and models have verified direct or configured bolt-on fitment with this part:
                                </p>
                                <table className="specs-table">
                                    <thead>
                                        <tr>
                                            <th style={{ width: '15%' }}>Year</th>
                                            <th style={{ width: '25%' }}>Make & Model</th>
                                            <th style={{ width: '25%' }}>Engine</th>
                                            <th style={{ width: '35%' }}>Fitment Position & Notes</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {compatibleVehicles.length === 0 ? (
                                            <tr>
                                                <td colSpan="4" style={{ textAlign: 'center', padding: '24px' }}>
                                                    Universal fitment or specific vehicle chart available upon request from support.
                                                </td>
                                            </tr>
                                        ) : (
                                            compatibleVehicles.map((item, idx) => (
                                                <tr key={idx}>
                                                    <td><strong>{item.vehicle?.year}</strong></td>
                                                    <td>{item.vehicle?.make} {item.vehicle?.model}</td>
                                                    <td>{item.vehicle?.engine}</td>
                                                    <td>{item.notes || 'Direct OEM Replacement'}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Related Products */}
                    {relatedProducts.length > 0 && (
                        <div style={{ marginTop: '64px' }}>
                            <h3 style={{ fontSize: '20px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '24px' }}>
                                Related Performance Spares
                            </h3>
                            <div className="product-grid">
                                {relatedProducts.map(rel => (
                                    <ProductCard key={rel.id} product={rel} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Sticky Mobile Add-to-Cart Bar */}
            <div className="product-single-sticky-mobile">
                <div className="sticky-price">
                    <span>Total</span>
                    <strong>{formatPrice(effectivePrice * quantity)}</strong>
                </div>
                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleAddToCart}
                    disabled={!isInStock}
                >
                    <ShoppingCart size={16} /> Add to Cart
                </button>
            </div>
        </AppLayout>
    );
}
