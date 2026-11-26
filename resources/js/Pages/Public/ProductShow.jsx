import React, { useState, useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
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
    Maximize2,
    X,
    RotateCcw,
    ArrowRight,
    ShoppingBag,
    Gauge,
    Sliders,
    Disc3,
    Activity,
    CheckCircle2
} from 'lucide-react';
import { useCart } from '@/Context/CartContext';
import { useWishlist } from '@/Context/WishlistContext';
import { useCurrency } from '@/Context/CurrencyContext';
import { useLanguage } from '@/Context/LanguageContext';

export default function ProductShow({
    product,
    variations = [],
    compatibleVehicles = [],
    relatedProducts = [],
    reviews = [],
    activeVehicle = null,
    fitmentStatus = null
}) {
    const { addToCart } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const { formatPrice } = useCurrency();
    const { t, localize, translateTerm } = useLanguage();

    const displayName = localize(product, 'name');
    const displayDescription = localize(product, 'description');
    const displayTechSpecs = localize(product, 'technical_specifications');
    const displayCategoryName = product.category ? localize(product.category, 'name') : '';
    const displayBrandName = product.brand ? localize(product.brand, 'name') : '';

    const defaultVar = variations.find(v => v.is_default) || variations[0] || null;
    const [selectedVariation, setSelectedVariation] = useState(defaultVar);
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState('specs');
    const [activeImage, setActiveImage] = useState(defaultVar?.image || product.main_image);
    const [addedToast, setAddedToast] = useState(false);
    const [isZoomOpen, setIsZoomOpen] = useState(false);
    const [isRotating, setIsRotating] = useState(false);

    const attributeGroups = useMemo(() => {
        if (!Array.isArray(variations) || variations.length === 0) return [];
        const labelMap = {};
        (product.attributes || []).forEach((attr) => {
            if (attr?.slug) {
                labelMap[attr.slug] = attr.name;
            }
        });

        const groupsBySlug = {};
        const orderedSlugs = [];

        variations.forEach((v) => {
            const attrs = v.attributes_json && typeof v.attributes_json === 'object' ? v.attributes_json : {};
            Object.entries(attrs).forEach(([attrSlug, rawVal]) => {
                const val = String(rawVal || '').trim();
                if (!val) return;
                if (!groupsBySlug[attrSlug]) {
                    const fallbackLabel = attrSlug
                        .split('-')
                        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                        .join(' ');
                    groupsBySlug[attrSlug] = {
                        slug: attrSlug,
                        label: labelMap[attrSlug] || fallbackLabel,
                        values: [],
                    };
                    orderedSlugs.push(attrSlug);
                }
                if (!groupsBySlug[attrSlug].values.includes(val)) {
                    groupsBySlug[attrSlug].values.push(val);
                }
            });
        });

        return orderedSlugs.map((s) => groupsBySlug[s]);
    }, [variations, product.attributes]);

    const handleSelectAttributeValue = (attrSlug, value) => {
        const currentAttrs =
            selectedVariation?.attributes_json && typeof selectedVariation.attributes_json === 'object'
                ? selectedVariation.attributes_json
                : {};
        const desiredAttrs = { ...currentAttrs, [attrSlug]: value };

        let matched = variations.find((v) => {
            const vAttrs = v.attributes_json || {};
            return Object.entries(desiredAttrs).every(([k, val]) => vAttrs[k] === val);
        });

        if (!matched) {
            matched = variations.find((v) => (v.attributes_json || {})[attrSlug] === value);
        }

        if (matched) {
            setSelectedVariation(matched);
            setActiveImage(matched.image || product.main_image);
        }
    };

    const isFav = isInWishlist(product.id);

    // Dynamic price based on selected variation
    const currentPrice = selectedVariation ? Number(selectedVariation.price) : Number(product.base_price);
    const currentSalePrice = selectedVariation ? (selectedVariation.sale_price ? Number(selectedVariation.sale_price) : null) : (product.sale_price ? Number(product.sale_price) : null);
    const effectivePrice = currentSalePrice && currentSalePrice < currentPrice ? currentSalePrice : currentPrice;
    const hasDiscount = currentSalePrice && currentSalePrice < currentPrice;
    const discountPercentage = hasDiscount ? Math.round(((currentPrice - effectivePrice) / currentPrice) * 100) : 0;
    const currentSku = selectedVariation?.sku || product.sku;
    const currentPartNumber = selectedVariation?.part_number || product.part_number;
    const currentStock = selectedVariation ? selectedVariation.stock_quantity : product.stock_quantity;
    const isInStock = selectedVariation ? (selectedVariation.stock_status === 'in_stock' && currentStock > 0) : (product.stock_status === 'in_stock' && currentStock > 0);

    const galleryImages = [
        product.main_image,
        ...(Array.isArray(product.gallery_images) ? product.gallery_images : []),
    ].filter(Boolean);

    // Ensure distinct images
    const uniqueGallery = Array.from(new Set(galleryImages));

    const handleAddToCart = () => {
        if (!isInStock) return;
        addToCart(product, selectedVariation, quantity);
        setAddedToast(true);
        setTimeout(() => setAddedToast(false), 2000);
    };

    const handle360Click = () => {
        setIsRotating(true);
        setTimeout(() => setIsRotating(false), 1200);
    };

    return (
        <AppLayout title={displayName}>
            <div className="product-single bg-light">
                <div className="container">
                    {/* Breadcrumbs */}
                    <nav className="product-single-breadcrumbs" aria-label="Breadcrumb">
                        <Link href="/">{t('home')}</Link>
                        <ChevronRight size={13} className="breadcrumb-separator" />
                        <Link href="/shop">{t('shop')}</Link>
                        {product.category && (
                            <>
                                <ChevronRight size={13} className="breadcrumb-separator" />
                                <Link href={`/shop?category=${product.category.slug}`}>
                                    {displayCategoryName}
                                </Link>
                            </>
                        )}
                        <ChevronRight size={13} className="breadcrumb-separator" />
                        <span className="breadcrumb-current">{displayName}</span>
                    </nav>

                    {/* Main 60-40 Layout */}
                    <div className="product-single-layout">
                        {/* ---------------------------------------------------- */}
                        {/* Left: Gallery & Image Preview (60%)                   */}
                        {/* ---------------------------------------------------- */}
                        <div className="product-single-gallery">
                            {/* Vertical Thumbnail Column */}
                            <div className="product-single-gallery-thumbs">
                                {uniqueGallery.map((img, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        className={`thumb-box ${activeImage === img ? 'thumb-box--active' : ''}`}
                                        onClick={() => setActiveImage(img)}
                                        aria-label={`View angle ${idx + 1}`}
                                    >
                                        <img src={img} alt={`${product.name} angle ${idx + 1}`} />
                                    </button>
                                ))}

                                {/* 360 Degree View Interactive Button */}
                                <button
                                    type="button"
                                    className={`btn-360-degree ${isRotating ? 'btn-360-degree--active' : ''}`}
                                    onClick={handle360Click}
                                    title="Interactive 360° View"
                                >
                                    <svg viewBox="0 0 40 24" className="icon-360" fill="none" stroke="currentColor" strokeWidth="2">
                                        <ellipse cx="20" cy="12" rx="16" ry="7" strokeDasharray="3 2" />
                                        <path d="M6 13 L4 10 L1 12" fill="currentColor" />
                                    </svg>
                                    <span className="text-360">360°</span>
                                </button>
                            </div>

                            {/* Big Image Preview (Transparent background, no white box, no border) */}
                            <div className="product-single-gallery-main">
                                {/* Diagonal Dynamic Orange Graphic Background */}
                                <img
                                    src="/assets/images/products/product-preview-bg.png"
                                    alt=""
                                    className="preview-bg-graphic"
                                    aria-hidden="true"
                                />

                                {/* Main Floating Product Image */}
                                <img
                                    src={activeImage || product.main_image}
                                    alt={product.name}
                                    className={`preview-product-img ${isRotating ? 'preview-product-img--spinning' : ''}`}
                                    onClick={() => setIsZoomOpen(true)}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = product.main_image;
                                    }}
                                />

                                {/* Wishlist Trigger Icon Button (Top Right) */}
                                <button
                                    type="button"
                                    className={`preview-wishlist-btn ${isFav ? 'preview-wishlist-btn--active' : ''}`}
                                    onClick={() => toggleWishlist(product.id)}
                                    title="Add to Wishlist"
                                    aria-label="Add to Wishlist"
                                >
                                    <Heart size={16} fill={isFav ? '#D93025' : 'none'} color={isFav ? '#D93025' : 'currentColor'} />
                                </button>

                                {/* Fullscreen / Zoom Trigger Icon Button */}
                                <button
                                    type="button"
                                    className="preview-zoom-btn"
                                    onClick={() => setIsZoomOpen(true)}
                                    title="View Full Resolution"
                                    aria-label="Expand image"
                                >
                                    <Maximize2 size={16} />
                                </button>
                            </div>
                        </div>

                        {/* ---------------------------------------------------- */}
                        {/* Right: Product Details & Buying Actions (40%)        */}
                        {/* ---------------------------------------------------- */}
                        <div className="product-single-info">
                            {/* Brand Header */}
                            <div className="product-info-top-row">
                                <span className="brand-subtitle">
                                    <img src="/assets/icons/heading-stripe.webp" alt="" className="title-stripe-icon" />
                                    {displayBrandName ? `${displayBrandName.toUpperCase()} ${t('pdp_precision_spares')}` : t('pdp_precision_hardware')}
                                </span>
                            </div>

                            {/* Product Title */}
                            <h1 className="product-title">
                                {displayName}
                            </h1>

                            {/* SKU, Part Number, Rating, Sold */}
                            <div className="product-meta-row">
                                <div className="meta-item">
                                    <span className="meta-label">{t('sku')}:</span>
                                    <strong className="meta-value">{currentSku}</strong>
                                </div>
                                <span className="meta-divider">|</span>
                                <div className="meta-item">
                                    <span className="meta-label">{t('part_number')}:</span>
                                    <strong className="meta-value">{currentPartNumber}</strong>
                                </div>
                                <span className="meta-divider">|</span>
                                <div className="meta-item rating-item">
                                    <Star size={14} className="star-filled" />
                                    <strong className="rating-score">{Number(product.rating || 4.9).toFixed(1)}</strong>
                                    <span className="rating-count">({product.rating_count || 84} {t('pdp_reviews')})</span>
                                </div>
                                <span className="meta-divider">|</span>
                                <div className="meta-item sold-item">
                                    <ShoppingBag size={14} />
                                    <span>1,240+ {t('pdp_sold')}</span>
                                </div>
                            </div>

                            {/* Pricing Box */}
                            <div className="product-pricing-card">
                                <div className="pricing-primary-row">
                                    <span className="price-effective">{formatPrice(effectivePrice)}</span>
                                    {hasDiscount && (
                                        <>
                                            <span className="price-strikethrough">{formatPrice(currentPrice)}</span>
                                            <span className="badge-discount">{t('pdp_save')} {discountPercentage}%</span>
                                        </>
                                    )}
                                </div>
                                <p className="tax-notice-text">
                                    {t('pdp_vat_notice')}
                                </p>
                            </div>

                            {/* Vehicle Fitment Verification Card */}
                            <div className="vehicle-fitment-banner">
                                <div className="fitment-banner-content">
                                    <div className="fitment-banner-icon">
                                        <Car size={22} />
                                    </div>
                                    <div className="fitment-banner-text">
                                        <strong>{t('pdp_fitment_title')}</strong>
                                        <p>
                                            {activeVehicle
                                                ? (fitmentStatus?.compatible
                                                    ? `${t('pdp_fitment_guaranteed')} ${activeVehicle.year} ${activeVehicle.make} ${activeVehicle.model}`
                                                    : `${t('pdp_fitment_may_not')} ${activeVehicle.year} ${activeVehicle.make} ${activeVehicle.model}`)
                                                : t('pdp_fitment_prompt')
                                            }
                                        </p>
                                    </div>
                                </div>
                                <Link href="/vehicle-finder" className="btn-fitment-action">
                                    {t('pdp_select_vehicle')} <ArrowRight size={14} />
                                </Link>
                            </div>

                            {/* Product Variations / Attribute Selectors */}
                            {attributeGroups.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                    {attributeGroups.map((group) => {
                                        const selectedValue = selectedVariation?.attributes_json?.[group.slug] || '';
                                        return (
                                            <div key={group.slug} className="variations-selector-wrap">
                                                <span className="selector-title">
                                                    {translateTerm(group.label)}: {selectedValue && <strong dir="auto">{translateTerm(selectedValue)}</strong>}
                                                </span>
                                                <div className="selector-pills-row">
                                                    {group.values.map((val) => {
                                                        const isActive = selectedValue === val;
                                                        const translatedVal = translateTerm(val);
                                                        const isMeasurement = /^\d/.test(translatedVal);
                                                        return (
                                                            <button
                                                                key={val}
                                                                type="button"
                                                                className={`pill-option ${isActive ? 'pill-option--active' : ''}`}
                                                                onClick={() => handleSelectAttributeValue(group.slug, val)}
                                                            >
                                                                <span dir={isMeasurement ? 'ltr' : 'auto'}>{translatedVal}</span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                variations.length > 0 && (
                                    <div className="variations-selector-wrap">
                                        <span className="selector-title">{t('pdp_select_spec')}</span>
                                        <div className="selector-pills-row">
                                            {variations.map(variation => (
                                                <button
                                                    key={variation.id}
                                                    type="button"
                                                    className={`pill-option ${selectedVariation?.id === variation.id ? 'pill-option--active' : ''}`}
                                                    onClick={() => {
                                                        setSelectedVariation(variation);
                                                        if (variation.image) {
                                                            setActiveImage(variation.image);
                                                        } else {
                                                            setActiveImage(product.main_image);
                                                        }
                                                    }}
                                                >
                                                    {translateTerm(variation.name)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )
                            )}

                            {/* Stock Indicator */}
                            <div className="stock-indicator-row">
                                <span className={`stock-dot ${isInStock ? 'stock-dot--in' : 'stock-dot--out'}`} />
                                <span className="stock-text">
                                    {isInStock
                                        ? <><strong>{t('in_stock')}</strong> ({currentStock} {t('pdp_units_available')})</>
                                        : <strong className="text-danger">{t('pdp_temp_out_of_stock')}</strong>
                                    }
                                </span>
                            </div>

                            {/* Purchase Action Row (Qty + Add to Cart + Wishlist) */}
                            <div className="purchase-action-group">
                                <div className="qty-counter">
                                    <button
                                        type="button"
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        disabled={!isInStock}
                                        aria-label="Decrease quantity"
                                    >
                                        -
                                    </button>
                                    <span className="qty-number">{quantity}</span>
                                    <button
                                        type="button"
                                        onClick={() => setQuantity(quantity + 1)}
                                        disabled={!isInStock}
                                        aria-label="Increase quantity"
                                    >
                                        +
                                    </button>
                                </div>

                                <button
                                    type="button"
                                    className="btn-add-to-cart"
                                    onClick={handleAddToCart}
                                    disabled={!isInStock}
                                >
                                    {addedToast ? (
                                        <>
                                            <Check size={18} /> {t('pdp_added_to_cart')}
                                        </>
                                    ) : (
                                        <>
                                            <ShoppingCart size={18} /> {t('add_to_cart')} — {formatPrice(effectivePrice * quantity)}
                                        </>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    className={`btn-wishlist-toggle ${isFav ? 'btn-wishlist-toggle--active' : ''}`}
                                    onClick={() => toggleWishlist(product.id)}
                                    title="Add to Wishlist"
                                    aria-label="Add to Wishlist"
                                >
                                    <Heart size={20} fill={isFav ? '#D93025' : 'none'} color={isFav ? '#D93025' : '#888'} />
                                </button>
                            </div>

                            {/* 3 Trust Badges in a Row */}
                            <div className="trust-badges-bar">
                                <div className="trust-badge-item">
                                    <Truck size={18} className="trust-icon" />
                                    <span>{t('pdp_trust_freight')}</span>
                                </div>
                                <div className="trust-badge-item">
                                    <ShieldCheck size={18} className="trust-icon" />
                                    <span>{t('pdp_trust_warranty')}</span>
                                </div>
                                <div className="trust-badge-item">
                                    <RotateCcw size={18} className="trust-icon" />
                                    <span>{t('pdp_trust_returns')}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ---------------------------------------------------- */}
                    {/* Bottom: Detailed Specifications & Reviews Tabs        */}
                    {/* ---------------------------------------------------- */}
                    <div className="product-single-tabs">
                        <div className="tabs-header-strip">
                            <button
                                type="button"
                                className={`tab-nav-btn ${activeTab === 'specs' ? 'tab-nav-btn--active' : ''}`}
                                onClick={() => setActiveTab('specs')}
                            >
                                <Sliders size={16} />
                                <span>{t('technical_specs')}</span>
                            </button>
                            <button
                                type="button"
                                className={`tab-nav-btn ${activeTab === 'vehicles' ? 'tab-nav-btn--active' : ''}`}
                                onClick={() => setActiveTab('vehicles')}
                            >
                                <Car size={16} />
                                <span>{t('pdp_compatible_vehicles')} ({compatibleVehicles.length})</span>
                            </button>
                            <button
                                type="button"
                                className={`tab-nav-btn ${activeTab === 'reviews' ? 'tab-nav-btn--active' : ''}`}
                                onClick={() => setActiveTab('reviews')}
                            >
                                <Star size={16} />
                                <span>{t('customer_reviews')} ({reviews.length || 1})</span>
                            </button>
                        </div>

                        {/* Tab 1: Technical Specifications */}
                        {activeTab === 'specs' && (
                            <div className="tab-pane-specs">
                                <div className="specs-layout-grid">
                                    {/* Left: Description & 4 Engineering Pillars */}
                                    <div className="specs-overview-col">
                                        <p className="specs-description">
                                            {displayDescription}
                                        </p>

                                        {/* 4 Feature Pillars with Orange Icons */}
                                        <div className="engineering-pillars-row">
                                            <div className="pillar-item">
                                                <div className="pillar-icon-box">
                                                    <Disc3 size={24} />
                                                </div>
                                                <span className="pillar-title">{t('pdp_pillar_grip')}</span>
                                            </div>
                                            <div className="pillar-item">
                                                <div className="pillar-icon-box">
                                                    <Gauge size={24} />
                                                </div>
                                                <span className="pillar-title">{t('pdp_pillar_stability')}</span>
                                            </div>
                                            <div className="pillar-item">
                                                <div className="pillar-icon-box">
                                                    <Activity size={24} />
                                                </div>
                                                <span className="pillar-title">{t('pdp_pillar_braking')}</span>
                                            </div>
                                            <div className="pillar-item">
                                                <div className="pillar-icon-box">
                                                    <CheckCircle2 size={24} />
                                                </div>
                                                <span className="pillar-title">{t('pdp_pillar_tread')}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Technical Specs Table */}
                                    <div className="specs-table-col">
                                        <table className="specs-structured-table">
                                            <tbody>
                                                <tr>
                                                    <th>{t('pdp_manufacturer_brand')}</th>
                                                    <td>{displayBrandName || 'Michelin'}</td>
                                                </tr>
                                                <tr>
                                                    <th>{t('part_number')}</th>
                                                    <td>{currentPartNumber}</td>
                                                </tr>
                                                <tr>
                                                    <th>{t('sku')}</th>
                                                    <td>{currentSku}</td>
                                                </tr>
                                                <tr>
                                                    <th>{t('pdp_shipping_weight')}</th>
                                                    <td>{product.weight || '11.20'} {product.weight_unit || 'kg'}</td>
                                                </tr>
                                                <tr>
                                                    <th>{t('pdp_engineering_specs')}</th>
                                                    <td>{displayTechSpecs || 'Treadwear: 300 | Traction: AA | Temperature: A | Speed Rating: (Y) >300 km/h | Construction: Radial Steel Belted | Origin: France'}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tab 2: Compatible Vehicles */}
                        {activeTab === 'vehicles' && (
                            <div className="tab-pane-vehicles">
                                <p className="tab-intro-text">
                                    {t('pdp_fitment_intro')}
                                </p>
                                <table className="specs-structured-table">
                                    <thead>
                                        <tr>
                                            <th style={{ width: '15%' }}>{t('vf_year')}</th>
                                            <th style={{ width: '30%' }}>{t('pdp_make_model')}</th>
                                            <th style={{ width: '25%' }}>{t('vf_engine')}</th>
                                            <th style={{ width: '30%' }}>{t('pdp_fitment_notes')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {compatibleVehicles.length === 0 ? (
                                            <tr>
                                                <td colSpan="4" className="text-center-padded">
                                                    {t('pdp_universal_fitment')}
                                                </td>
                                            </tr>
                                        ) : (
                                            compatibleVehicles.map((item, idx) => (
                                                <tr key={idx}>
                                                    <td><strong>{item.vehicle?.year}</strong></td>
                                                    <td>{item.vehicle?.make} {item.vehicle?.model}</td>
                                                    <td>{item.vehicle?.engine}</td>
                                                    <td>{item.notes || t('pdp_direct_oem')}</td>
                                                    <td>{item.notes ? translateTerm(item.notes) : t('pdp_direct_oem')}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Tab 3: Reviews */}
                        {activeTab === 'reviews' && (
                            <div className="tab-pane-reviews">
                                {reviews.length === 0 ? (
                                    <div className="review-card">
                                        <div className="review-top">
                                            <div className="review-stars">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} size={14} className="star-filled" />
                                                ))}
                                            </div>
                                            <strong>Benchmark Dry Traction & Crisp Turn-In</strong>
                                            <span className="badge-verified">{t('pdp_verified_buyer')}</span>
                                        </div>
                                        <p className="review-body">
                                            Installed these on my 992 GT3 for weekend track sessions. The dry grip is extraordinary right out of the pit box with immediate steering precision.
                                        </p>
                                        <span className="review-author">
                                            By Rajesh M. on Nov 15, 2026
                                        </span>
                                    </div>
                                ) : (
                                    reviews.map((rev) => (
                                        <div key={rev.id} className="review-card">
                                            <div className="review-top">
                                                <div className="review-stars">
                                                    {[...Array(rev.rating)].map((_, i) => (
                                                        <Star key={i} size={14} className="star-filled" />
                                                    ))}
                                                </div>
                                                <strong>{rev.title || 'Verified Performance'}</strong>
                                                {rev.is_verified_purchase && (
                                                    <span className="badge-verified">{t('pdp_verified_buyer')}</span>
                                                )}
                                            </div>
                                            <p className="review-body">
                                                {rev.comment}
                                            </p>
                                            <span className="review-author">
                                                By {rev.reviewer_name} on {new Date(rev.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    {/* Related Products Section */}
                    {relatedProducts.length > 0 && (
                        <div className="product-single-related">
                            <h3 className="related-heading">
                                {t('pdp_related_heading')}
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

            {/* Lightbox / Fullscreen Image Zoom Modal */}
            {isZoomOpen && (
                <div className="product-image-lightbox-modal" onClick={() => setIsZoomOpen(false)}>
                    <div className="lightbox-content" onClick={e => e.stopPropagation()}>
                        <button
                            type="button"
                            className="lightbox-close-btn"
                            onClick={() => setIsZoomOpen(false)}
                            aria-label="Close Preview"
                        >
                            <X size={24} />
                        </button>
                        <img
                            src={activeImage || product.main_image}
                            alt={displayName}
                            className="lightbox-img"
                        />
                    </div>
                </div>
            )}

            {/* Sticky Mobile Add-to-Cart Bar */}
            <div className="product-single-sticky-mobile">
                <div className="sticky-price">
                    <span>{t('pdp_total')}</span>
                    <strong>{formatPrice(effectivePrice * quantity)}</strong>
                </div>
                <div className="sticky-actions">
                    <div className="qty-counter-mobile">
                        <button
                            type="button"
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            disabled={!isInStock}
                            aria-label="Decrease quantity"
                        >
                            -
                        </button>
                        <span className="qty-number">{quantity}</span>
                        <button
                            type="button"
                            onClick={() => setQuantity(quantity + 1)}
                            disabled={!isInStock}
                            aria-label="Increase quantity"
                        >
                            +
                        </button>
                    </div>
                    <button
                        type="button"
                        className="btn btn-primary sticky-add-btn"
                        onClick={handleAddToCart}
                        disabled={!isInStock}
                    >
                        {addedToast ? (
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
        </AppLayout>
    );
}
