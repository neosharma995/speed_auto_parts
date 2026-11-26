import React from 'react';
import { Link } from '@inertiajs/react';
import { Search, Tag, TrendingUp, Check, ArrowRight, Loader2, AlertCircle, Layers, Grid } from 'lucide-react';
import { useCurrency } from '@/Context/CurrencyContext';
import { useLanguage } from '@/Context/LanguageContext';

export default function SearchDropdown({
    isOpen,
    loading,
    results,
    searchQuery,
    selectedIndex,
    onSelectPopular,
    onClose,
    isMobile = false,
}) {
    const { formatPrice } = useCurrency();
    const { t, localize } = useLanguage();
    if (!isOpen) return null;

    const hasQuery = searchQuery.trim().length > 0;
    const products = results?.products || [];
    const categories = results?.categories || [];
    const brands = results?.brands || [];
    const popularSearches = results?.popularSearches || [];
    const totalCount = results?.total_count || products.length;

    const hasAnyResults = products.length > 0 || categories.length > 0 || brands.length > 0;

    return (
        <div
            className={`site-search-dropdown ${isMobile ? 'is-mobile' : ''}`}
            role="listbox"
            aria-label="Search suggestions"
            onMouseDown={(e) => e.stopPropagation()} // Prevent blur before click
        >
            {/* Top Loading Progress Line */}
            {loading && (
                <div className="search-dropdown-loading-bar" aria-hidden="true">
                    <div className="search-dropdown-loading-pulse" />
                </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* STATE 1: Empty Query - Show Popular Searches & Quick Browse   */}
            {/* ------------------------------------------------------------- */}
            {!hasQuery && (
                <div className="search-dropdown-section search-dropdown-initial">
                    {/* Popular Searches */}
                    {popularSearches.length > 0 && (
                        <div className="search-dropdown-block">
                            <div className="search-dropdown-block-title">
                                <TrendingUp size={13} className="block-title-icon" />
                                <span>{t('sd_popular_searches')}</span>
                            </div>
                            <div className="search-popular-tags">
                                {popularSearches.map((term, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        className="search-popular-tag-btn"
                                        onClick={() => onSelectPopular(term)}
                                    >
                                        <Search size={11} className="tag-search-icon" />
                                        <span>{term}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quick Category Jump */}
                    {categories.length > 0 && (
                        <div className="search-dropdown-block">
                            <div className="search-dropdown-block-title">
                                <Grid size={13} className="block-title-icon" />
                                <span>{t('nav_browse_categories')}</span>
                            </div>
                            <div className="search-quick-links">
                                {categories.map((cat) => (
                                    <Link
                                        key={cat.id}
                                        href={`/shop?category=${cat.slug}`}
                                        className="search-quick-link-chip"
                                        onClick={onClose}
                                    >
                                        <Layers size={12} />
                                        <span>{localize(cat, 'name')}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quick Brands Jump */}
                    {brands.length > 0 && (
                        <div className="search-dropdown-block">
                            <div className="search-dropdown-block-title">
                                <Tag size={13} className="block-title-icon" />
                                <span>{t('sd_featured_brands')}</span>
                            </div>
                            <div className="search-quick-links">
                                {brands.map((b) => (
                                    <Link
                                        key={b.id}
                                        href={`/shop?brand=${b.slug}`}
                                        className="search-quick-link-chip"
                                        onClick={onClose}
                                    >
                                        <span>{localize(b, 'name')}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* STATE 2: Query Active - Matching Categories, Brands, Products */}
            {/* ------------------------------------------------------------- */}
            {hasQuery && (
                <>
                    {/* Matching Categories & Brands Pills */}
                    {(categories.length > 0 || brands.length > 0) && (
                        <div className="search-dropdown-tags-bar">
                            {categories.map((cat) => (
                                <Link
                                    key={`cat-${cat.id}`}
                                    href={`/shop?category=${cat.slug}`}
                                    className="search-match-chip category-chip"
                                    onClick={onClose}
                                >
                                    <span className="chip-label">{t('category')}:</span>
                                    <span className="chip-value">{localize(cat, 'name')}</span>
                                    <ArrowRight size={11} />
                                </Link>
                            ))}
                            {brands.map((b) => (
                                <Link
                                    key={`brand-${b.id}`}
                                    href={`/shop?brand=${b.slug}`}
                                    className="search-match-chip brand-chip"
                                    onClick={onClose}
                                >
                                    <span className="chip-label">{t('brand')}:</span>
                                    <span className="chip-value">{localize(b, 'name')}</span>
                                    <ArrowRight size={11} />
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Matching Products List */}
                    {products.length > 0 && (
                        <div className="search-dropdown-products-list">
                            <div className="search-dropdown-header">
                                <span>{t('sd_matching_parts')}</span>
                                <span className="results-count">({totalCount} {t('sd_found')})</span>
                            </div>

                            {products.map((item, idx) => {
                                const isSelected = selectedIndex === idx;
                                const regularPrice = Number(item.base_price || 0);
                                const sellingPrice = Number(item.effective_price || item.sale_price || regularPrice);
                                const hasDiscount = item.discount_percentage > 0 || (regularPrice > sellingPrice && regularPrice > 0);

                                return (
                                    <Link
                                        key={item.id}
                                        href={`/products/${item.slug}`}
                                        className={`search-result-item ${isSelected ? 'is-selected' : ''}`}
                                        onClick={onClose}
                                    >
                                        {/* Product Thumbnail */}
                                        <div className="search-result-thumb">
                                            {item.main_image ? (
                                                <img
                                                    src={item.main_image}
                                                    alt={item.name}
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className="search-result-placeholder">
                                                    <Tag size={16} />
                                                </div>
                                            )}
                                        </div>

                                        {/* Product Details */}
                                        <div className="search-result-info">
                                            <div className="search-result-meta-row">
                                                {item.brand_name && (
                                                    <span className="search-result-brand">{item.brand_name}</span>
                                                )}
                                                {item.category_name && (
                                                    <span className="search-result-category">· {item.category_name}</span>
                                                )}
                                            </div>

                                            <div className="search-result-title" title={item.name}>
                                                {item.name}
                                            </div>

                                            <div className="search-result-badges">
                                                {item.part_number && (
                                                    <span className="search-badge part-badge">
                                                        Part #{item.part_number}
                                                    </span>
                                                )}
                                                {item.sku && (
                                                    <span className="search-badge sku-badge">
                                                        SKU: {item.sku}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Product Pricing & Stock Status */}
                                        <div className="search-result-aside">
                                            <div className="search-result-price-group">
                                                <span className="search-price-effective">
                                                    {formatPrice(sellingPrice)}
                                                </span>
                                                {hasDiscount && regularPrice > sellingPrice && (
                                                    <span className="search-price-regular">
                                                        {formatPrice(regularPrice)}
                                                    </span>
                                                )}
                                            </div>

                                            {item.is_in_stock ? (
                                                <span className="search-stock in-stock">
                                                    <Check size={11} strokeWidth={2.5} /> {t('in_stock')}
                                                </span>
                                            ) : (
                                                <span className="search-stock out-of-stock">
                                                    {t('out_of_stock')}
                                                </span>
                                            )}
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}

                    {/* View All Matching Results Footer */}
                    {hasAnyResults && (
                        <div className="search-dropdown-footer">
                            <Link
                                href={`/shop?search=${encodeURIComponent(searchQuery.trim())}`}
                                className="search-dropdown-view-all-btn"
                                onClick={onClose}
                            >
                                <span>{t('sd_view_all_results')} &ldquo;<strong>{searchQuery.trim()}</strong>&rdquo; ({totalCount})</span>
                                <ArrowRight size={14} />
                            </Link>
                        </div>
                    )}

                    {/* No Results Empty State */}
                    {!loading && !hasAnyResults && (
                        <div className="search-dropdown-empty">
                            <div className="empty-icon-wrap">
                                <AlertCircle size={28} />
                            </div>
                            <div className="empty-title">
                                {t('sd_no_results')} &ldquo;{searchQuery.trim()}&rdquo;
                            </div>
                            <p className="empty-desc">
                                {t('sd_try_searching')}
                            </p>
                            <Link
                                href="/shop"
                                className="empty-browse-btn"
                                onClick={onClose}
                            >
                                {t('sd_browse_catalog')}
                            </Link>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
