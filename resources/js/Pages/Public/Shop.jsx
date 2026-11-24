import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import ProductCard from '@/Components/ProductCard';
import { 
    SlidersHorizontal, 
    ChevronRight, 
    X, 
    RotateCcw, 
    Check, 
    Search,
    Barcode,
    Layers,
    BadgeCheck,
    PackageCheck,
    CircleDollarSign
} from 'lucide-react';

export default function Shop({ 
    products, 
    categories = [], 
    brands = [], 
    filters = {}, 
    activeVehicle = null 
}) {
    const safeFilters = filters && !Array.isArray(filters) ? filters : {};

    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(safeFilters.category || '');
    const [selectedBrand, setSelectedBrand] = useState(safeFilters.brand || '');
    const [selectedSort, setSelectedSort] = useState(typeof safeFilters.sort === 'string' ? safeFilters.sort : 'latest');
    const [minPrice, setMinPrice] = useState(safeFilters.min_price || '');
    const [maxPrice, setMaxPrice] = useState(safeFilters.max_price || '');
    const [inStockOnly, setInStockOnly] = useState(safeFilters.in_stock === 'true' || safeFilters.in_stock === true);
    const [partNumberQuery, setPartNumberQuery] = useState(safeFilters.part_number || '');

    const applyFilters = (overrides = {}) => {
        const query = {
            category: selectedCategory,
            brand: selectedBrand,
            sort: selectedSort,
            min_price: minPrice,
            max_price: maxPrice,
            in_stock: inStockOnly ? 'true' : '',
            part_number: partNumberQuery,
            vehicle_id: safeFilters.vehicle_id || '',
            ...overrides,
        };

        // Remove empty keys
        Object.keys(query).forEach(key => {
            if (!query[key]) delete query[key];
        });

        router.get('/shop', query, { preserveState: true });
        setMobileFiltersOpen(false);
    };

    const handleSortChange = (newSort) => {
        setSelectedSort(newSort);
        applyFilters({ sort: newSort });
    };

    const handleClearAll = () => {
        setSelectedCategory('');
        setSelectedBrand('');
        setSelectedSort('latest');
        setMinPrice('');
        setMaxPrice('');
        setInStockOnly(false);
        setPartNumberQuery('');
        router.get('/shop');
    };

    const items = products.data || [];

    return (
        <AppLayout title="Shop Automotive Performance Parts">
            <div className="shop-page">
                <div className="container">
                    {/* Breadcrumbs */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#888', marginBottom: '20px' }}>
                        <Link href="/" style={{ color: '#252525' }}>Home</Link>
                        <ChevronRight size={12} />
                        <span style={{ color: '#F36B16', fontWeight: 600 }}>Shop Catalog</span>
                        {safeFilters.category && (
                            <>
                                <ChevronRight size={12} />
                                <span style={{ textTransform: 'capitalize' }}>{safeFilters.category}</span>
                            </>
                        )}
                        {safeFilters.part_number && (
                            <>
                                <ChevronRight size={12} />
                                <span>Part #: {safeFilters.part_number}</span>
                            </>
                        )}
                    </div>

                    {/* Active Vehicle Notice if set */}
                    {activeVehicle && (
                        <div style={{
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #DCDCDC',
                            borderRadius: '6px',
                            padding: '12px 16px',
                            marginBottom: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700 }}>
                                <Check size={18} color="#168A35" />
                                <span>Showing Parts Verified Compatible With: {activeVehicle.year} {activeVehicle.make} {activeVehicle.model} ({activeVehicle.engine})</span>
                            </div>
                            <button 
                                type="button" 
                                onClick={() => router.post('/vehicles/clear', {}, { onSuccess: () => router.get('/shop') })}
                                style={{ fontSize: '12px', color: '#D93025', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
                            >
                                Clear Vehicle Filter
                            </button>
                        </div>
                    )}

                    {/* Shop Top Header */}
                    <div className="shop-page-top">
                        <div className="shop-page-top-info">
                            <h1>
                                <img src="/assets/icons/heading-stripe.webp" alt="" className="title-stripe-icon" />
                                Automotive Performance Catalog
                            </h1>
                            <p>Showing {products.total || items.length} verified automotive spare parts</p>
                        </div>

                        <div className="shop-page-top-actions">
                            <button 
                                type="button" 
                                className="mobile-filter-btn"
                                onClick={() => setMobileFiltersOpen(true)}
                            >
                                <SlidersHorizontal size={15} /> Filters
                            </button>

                            <select 
                                className="sort-select"
                                value={selectedSort}
                                onChange={(e) => handleSortChange(e.target.value)}
                            >
                                <option value="latest">Sort by: Newest Arrivals</option>
                                <option value="price_asc">Price: Low to High</option>
                                <option value="price_desc">Price: High to Low</option>
                                <option value="rating">Top Customer Rated</option>
                            </select>
                        </div>
                    </div>

                    {/* Layout Grid: Sidebar + Product Grid */}
                    <div className="shop-page-layout">
                        {/* Sidebar Filters */}
                        <aside className={`shop-page-sidebar ${mobileFiltersOpen ? 'shop-page-sidebar--mobile-open' : ''}`}>
                            <div className="sidebar-header">
                                <div className="sidebar-header-title">
                                    <SlidersHorizontal size={15} />
                                    <span>Filter Catalog</span>
                                </div>
                                <button 
                                    type="button" 
                                    className="sidebar-reset-btn"
                                    onClick={handleClearAll}
                                >
                                    <RotateCcw size={12} />
                                    <span>Reset All</span>
                                </button>
                                {mobileFiltersOpen && (
                                    <button type="button" className="sidebar-close-btn" onClick={() => setMobileFiltersOpen(false)}>
                                        <X size={18} />
                                    </button>
                                )}
                            </div>

                            {/* Part Number Search in Sidebar */}
                            <div className="filter-widget">
                                <h4 className="filter-widget-title">
                                    <Barcode size={15} className="widget-title-icon" />
                                    <span>Part Number</span>
                                </h4>
                                <div className="filter-search-box">
                                    <Search size={14} className="filter-search-icon" />
                                    <input 
                                        type="text" 
                                        className="filter-search-input"
                                        placeholder="e.g. AP-12345"
                                        value={partNumberQuery}
                                        onChange={(e) => setPartNumberQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                                    />
                                </div>
                            </div>

                            {/* Category Filter */}
                            <div className="filter-widget">
                                <h4 className="filter-widget-title">
                                    <Layers size={14} className="widget-title-icon" />
                                    <span>Category</span>
                                </h4>
                                <div className="filter-widget-list filter-widget-list--scrollable">
                                    <label className={`filter-option ${selectedCategory === '' ? 'is-active' : ''}`}>
                                        <input 
                                            type="radio" 
                                            name="cat_filter" 
                                            checked={selectedCategory === ''} 
                                            onChange={() => { setSelectedCategory(''); applyFilters({ category: '' }); }}
                                        />
                                        <span className="filter-option-name">All Categories</span>
                                    </label>
                                    {categories.map(cat => (
                                        <label key={cat.id} className={`filter-option ${selectedCategory === cat.slug ? 'is-active' : ''}`}>
                                            <input 
                                                type="radio" 
                                                name="cat_filter" 
                                                checked={selectedCategory === cat.slug} 
                                                onChange={() => { setSelectedCategory(cat.slug); applyFilters({ category: cat.slug }); }}
                                            />
                                            <span className="filter-option-name">{cat.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Brand Filter */}
                            <div className="filter-widget">
                                <h4 className="filter-widget-title">
                                    <BadgeCheck size={14} className="widget-title-icon" />
                                    <span>Brand</span>
                                </h4>
                                <div className="filter-widget-list filter-widget-list--scrollable">
                                    <label className={`filter-option ${selectedBrand === '' ? 'is-active' : ''}`}>
                                        <input 
                                            type="radio" 
                                            name="brand_filter" 
                                            checked={selectedBrand === ''} 
                                            onChange={() => { setSelectedBrand(''); applyFilters({ brand: '' }); }}
                                        />
                                        <span className="filter-option-name">All Brands</span>
                                    </label>
                                    {brands.map(b => (
                                        <label key={b.id} className={`filter-option ${selectedBrand === b.slug ? 'is-active' : ''}`}>
                                            <input 
                                                type="radio" 
                                                name="brand_filter" 
                                                checked={selectedBrand === b.slug} 
                                                onChange={() => { setSelectedBrand(b.slug); applyFilters({ brand: b.slug }); }}
                                            />
                                            <span className="filter-option-name">{b.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Availability Filter */}
                            <div className="filter-widget">
                                <h4 className="filter-widget-title">
                                    <PackageCheck size={14} className="widget-title-icon" />
                                    <span>Availability</span>
                                </h4>
                                <div className="filter-widget-list">
                                    <label className={`filter-option ${inStockOnly ? 'is-active' : ''}`}>
                                        <input 
                                            type="checkbox" 
                                            checked={inStockOnly}
                                            onChange={(e) => { setInStockOnly(e.target.checked); applyFilters({ in_stock: e.target.checked ? 'true' : '' }); }}
                                        />
                                        <span className="filter-option-name">In Stock Only</span>
                                    </label>
                                </div>
                            </div>

                            {/* Price Filter */}
                            <div className="filter-widget">
                                <h4 className="filter-widget-title">
                                    <CircleDollarSign size={14} className="widget-title-icon" />
                                    <span>Price Range</span>
                                </h4>
                                <div className="filter-price-inputs">
                                    <div className="price-input-wrapper">
                                        <span className="currency-prefix">₹</span>
                                        <input 
                                            type="number" 
                                            className="price-field" 
                                            placeholder="Min" 
                                            value={minPrice}
                                            onChange={(e) => setMinPrice(e.target.value)}
                                        />
                                    </div>
                                    <span className="price-separator">to</span>
                                    <div className="price-input-wrapper">
                                        <span className="currency-prefix">₹</span>
                                        <input 
                                            type="number" 
                                            className="price-field" 
                                            placeholder="Max" 
                                            value={maxPrice}
                                            onChange={(e) => setMaxPrice(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Overall Apply Filters Button */}
                            <div className="sidebar-action-wrapper">
                                <button 
                                    type="button" 
                                    className="btn-apply-filters"
                                    onClick={() => applyFilters()}
                                >
                                    <SlidersHorizontal size={15} />
                                    <span>Apply Filters</span>
                                </button>
                            </div>
                        </aside>

                        {/* Product Grid Area */}
                        <div className="shop-page-content">
                            {items.length === 0 ? (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '64px 20px',
                                    backgroundColor: '#FFFFFF',
                                    border: '1px solid #DCDCDC',
                                    borderRadius: '4px'
                                }}>
                                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#151515', marginBottom: '8px' }}>
                                        No Automotive Parts Found
                                    </h3>
                                    <p style={{ color: '#666666', fontSize: '14px', marginBottom: '20px' }}>
                                        Try broadening your vehicle selections, resetting filters, or searching a different part number.
                                    </p>
                                    <button 
                                        type="button" 
                                        className="btn btn-primary"
                                        onClick={handleClearAll}
                                    >
                                        <RotateCcw size={16} /> Reset All Filters
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="product-grid">
                                        {items.map(product => (
                                            <ProductCard key={product.id} product={product} />
                                        ))}
                                    </div>

                                    {/* Pagination Links */}
                                    {products.links && products.links.length > 3 && (
                                        <div className="pagination">
                                            {products.links.map((link, idx) => (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                    className={`pagination-item ${link.active ? 'pagination-item--active' : ''}`}
                                                    onClick={() => link.url && router.visit(link.url)}
                                                    disabled={!link.url}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
