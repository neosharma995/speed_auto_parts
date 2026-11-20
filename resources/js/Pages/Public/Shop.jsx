import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import ProductCard from '@/Components/ProductCard';
import { SlidersHorizontal, ChevronRight, X, RotateCcw, Check } from 'lucide-react';

export default function Shop({ 
    products, 
    categories = [], 
    brands = [], 
    filters = {}, 
    activeVehicle = null 
}) {
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(filters.category || '');
    const [selectedBrand, setSelectedBrand] = useState(filters.brand || '');
    const [selectedSort, setSelectedSort] = useState(filters.sort || 'latest');
    const [minPrice, setMinPrice] = useState(filters.min_price || '');
    const [maxPrice, setMaxPrice] = useState(filters.max_price || '');
    const [inStockOnly, setInStockOnly] = useState(filters.in_stock === 'true' || filters.in_stock === true);
    const [partNumberQuery, setPartNumberQuery] = useState(filters.part_number || '');

    const applyFilters = (overrides = {}) => {
        const query = {
            category: selectedCategory,
            brand: selectedBrand,
            sort: selectedSort,
            min_price: minPrice,
            max_price: maxPrice,
            in_stock: inStockOnly ? 'true' : '',
            part_number: partNumberQuery,
            vehicle_id: filters.vehicle_id || '',
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
                        {filters.category && (
                            <>
                                <ChevronRight size={12} />
                                <span style={{ textTransform: 'capitalize' }}>{filters.category}</span>
                            </>
                        )}
                        {filters.part_number && (
                            <>
                                <ChevronRight size={12} />
                                <span>Part #: {filters.part_number}</span>
                            </>
                        )}
                    </div>

                    {/* Active Vehicle Notice if set */}
                    {activeVehicle && (
                        <div style={{
                            backgroundColor: '#F5F5F5',
                            border: '1px solid #DCDCDC',
                            borderRadius: '4px',
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
                            <h1>Automotive Performance Catalog</h1>
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
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                                <h3 style={{ fontSize: '14px', fontWeight: 800, textTransform: 'uppercase' }}>Filter Catalog</h3>
                                <button 
                                    type="button" 
                                    onClick={handleClearAll}
                                    style={{ fontSize: '11px', color: '#F36B16', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}
                                >
                                    Reset All
                                </button>
                                {mobileFiltersOpen && (
                                    <button type="button" onClick={() => setMobileFiltersOpen(false)}>
                                        <X size={18} />
                                    </button>
                                )}
                            </div>

                            {/* Part Number Search in Sidebar */}
                            <div className="filter-widget">
                                <h4 className="filter-widget-title">Part Number</h4>
                                <input 
                                    type="text" 
                                    className="form-input"
                                    placeholder="e.g. AP-12345"
                                    value={partNumberQuery}
                                    onChange={(e) => setPartNumberQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                                />
                            </div>

                            {/* Category Filter */}
                            <div className="filter-widget">
                                <h4 className="filter-widget-title">Category</h4>
                                <div className="filter-widget-list">
                                    <label>
                                        <input 
                                            type="radio" 
                                            name="cat_filter" 
                                            checked={selectedCategory === ''} 
                                            onChange={() => { setSelectedCategory(''); applyFilters({ category: '' }); }}
                                        />
                                        <span>All Categories</span>
                                    </label>
                                    {categories.map(cat => (
                                        <label key={cat.id}>
                                            <input 
                                                type="radio" 
                                                name="cat_filter" 
                                                checked={selectedCategory === cat.slug} 
                                                onChange={() => { setSelectedCategory(cat.slug); applyFilters({ category: cat.slug }); }}
                                            />
                                            <span>{cat.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Brand Filter */}
                            <div className="filter-widget">
                                <h4 className="filter-widget-title">Brand</h4>
                                <div className="filter-widget-list">
                                    <label>
                                        <input 
                                            type="radio" 
                                            name="brand_filter" 
                                            checked={selectedBrand === ''} 
                                            onChange={() => { setSelectedBrand(''); applyFilters({ brand: '' }); }}
                                        />
                                        <span>All Brands</span>
                                    </label>
                                    {brands.map(b => (
                                        <label key={b.id}>
                                            <input 
                                                type="radio" 
                                                name="brand_filter" 
                                                checked={selectedBrand === b.slug} 
                                                onChange={() => { setSelectedBrand(b.slug); applyFilters({ brand: b.slug }); }}
                                            />
                                            <span>{b.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Availability Filter */}
                            <div className="filter-widget">
                                <h4 className="filter-widget-title">Availability</h4>
                                <div className="filter-widget-list">
                                    <label>
                                        <input 
                                            type="checkbox" 
                                            checked={inStockOnly}
                                            onChange={(e) => { setInStockOnly(e.target.checked); applyFilters({ in_stock: e.target.checked ? 'true' : '' }); }}
                                        />
                                        <span>In Stock Only</span>
                                    </label>
                                </div>
                            </div>

                            {/* Price Filter */}
                            <div className="filter-widget">
                                <h4 className="filter-widget-title">Price Range (₹)</h4>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <input 
                                        type="number" 
                                        className="form-input" 
                                        placeholder="Min" 
                                        value={minPrice}
                                        onChange={(e) => setMinPrice(e.target.value)}
                                    />
                                    <span>-</span>
                                    <input 
                                        type="number" 
                                        className="form-input" 
                                        placeholder="Max" 
                                        value={maxPrice}
                                        onChange={(e) => setMaxPrice(e.target.value)}
                                    />
                                </div>
                                <button 
                                    type="button" 
                                    className="btn btn-outline btn-full btn-sm"
                                    style={{ marginTop: '8px' }}
                                    onClick={() => applyFilters()}
                                >
                                    Apply Price
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
