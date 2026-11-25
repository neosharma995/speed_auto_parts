import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import AdminDataTable from '@/Components/Admin/AdminDataTable';
import { useCurrency } from '@/Context/CurrencyContext';
import { Plus, Edit, Trash2 } from 'lucide-react';

export default function AdminProductsIndex({ products, categories = [], brands = [], filters = {} }) {
    const { formatAdminPrice } = useCurrency();
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedCat, setSelectedCat] = useState(filters.category || '');
    const [selectedBrand, setSelectedBrand] = useState(filters.brand || '');

    const hasActiveFilters = Boolean(
        (filters.search && String(filters.search).trim() !== '') ||
        filters.category ||
        filters.brand
    );

    const applyFilters = (next = {}) => {
        const nextSearch = next.search !== undefined ? next.search : searchTerm;
        const nextCat = next.category !== undefined ? next.category : selectedCat;
        const nextBrand = next.brand !== undefined ? next.brand : selectedBrand;

        const params = {};
        if (nextSearch && nextSearch.trim()) params.search = nextSearch.trim();
        if (nextCat) params.category = nextCat;
        if (nextBrand) params.brand = nextBrand;

        router.get('/admin/products', params, { preserveState: true, replace: true });
    };

    const handleSearch = () => applyFilters();

    const handleCategoryChange = (val) => {
        setSelectedCat(val);
        applyFilters({ category: val });
    };

    const handleBrandChange = (val) => {
        setSelectedBrand(val);
        applyFilters({ brand: val });
    };

    const handleResetFilters = () => {
        setSearchTerm('');
        setSelectedCat('');
        setSelectedBrand('');
        router.get('/admin/products', {}, { preserveState: true, replace: true });
    };

    const handleDelete = (id, name) => {
        if (confirm(`Are you sure you want to delete ${name}?`)) {
            router.delete(`/admin/products/${id}`);
        }
    };

    const items = products.data || [];

    const columns = [
        {
            key: 'photo',
            label: 'Photo',
            width: '60px',
            render: (product) => (
                <img
                    src={product.main_image || '/images/products/placeholder.jpg'}
                    alt={product.name}
                    style={{
                        width: '48px',
                        height: '48px',
                        objectFit: 'cover',
                        borderRadius: '4px',
                        backgroundColor: '#F1F5F9',
                    }}
                />
            ),
        },
        {
            key: 'name',
            label: 'Product Name & Part #',
            render: (product) => (
                <>
                    <strong>{product.name}</strong>
                    <div style={{ fontSize: '11px', color: '#64748B', fontFamily: 'monospace', marginTop: '2px' }}>
                        SKU: {product.sku} | Part: {product.part_number}
                    </div>
                </>
            ),
        },
        {
            key: 'category_brand',
            label: 'Category / Brand',
            render: (product) => (
                <>
                    <span>{product.category?.name || '—'}</span>
                    <small style={{ display: 'block', color: '#64748B', fontSize: '11px' }}>
                        {product.brand?.name || '—'}
                    </small>
                </>
            ),
        },
        {
            key: 'supplier',
            label: 'Supplier',
            render: (product) => (
                <span style={{ fontSize: '12px' }}>
                    {product.supplier?.company_name || product.supplier?.name || 'In-House'}
                </span>
            ),
        },
        {
            key: 'type',
            label: 'Type',
            render: (product) => (
                <span className="badge badge-neutral" style={{ textTransform: 'capitalize' }}>
                    {product.product_type === 'variable'
                        ? `Variable (${product.variations_count || 0} vars)`
                        : product.product_type}
                </span>
            ),
        },
        {
            key: 'base_price',
            label: 'Base Price',
            render: (product) => (
                <>
                    <strong>{formatAdminPrice(product.base_price)}</strong>
                    {product.sale_price && (
                        <small style={{ display: 'block', color: '#168A35', fontSize: '11px' }}>
                            Sale: {formatAdminPrice(product.sale_price)}
                        </small>
                    )}
                </>
            ),
        },
        {
            key: 'stock',
            label: 'Stock (Whs / Cat)',
            render: (product) => (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span className={`badge ${product.warehouse_stock > 0 ? 'badge-warning' : 'badge-neutral'}`}>
                        Whs: {product.warehouse_stock || 0}
                    </span>
                    <span
                        className={`badge ${
                            product.stock_quantity > 10
                                ? 'badge-success'
                                : product.stock_quantity > 0
                                    ? 'badge-warning'
                                    : 'badge-danger'
                        }`}
                    >
                        Cat: {product.stock_quantity}
                    </span>
                </div>
            ),
        },
        {
            key: 'status',
            label: 'Status',
            render: (product) => (
                <span className={`badge ${product.status === 'published' ? 'badge-success' : 'badge-neutral'}`}>
                    {product.status}
                </span>
            ),
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (product) => (
                <div style={{ display: 'flex', gap: '6px' }}>
                    <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="btn btn-outline btn-sm"
                        title="Edit Product"
                    >
                        <Edit size={14} />
                    </Link>
                    <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        style={{ color: '#D93025', borderColor: '#FECDD3' }}
                        onClick={() => handleDelete(product.id, product.name)}
                        title="Delete Product"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <AdminLayout title="Product Catalog Management">
            <AdminDataTable
                title="All Automotive Products"
                count={products.total || items.length}
                search={{
                    value: searchTerm,
                    onChange: setSearchTerm,
                    placeholder: 'Search by name, SKU or part number...',
                }}
                filters={[
                    {
                        key: 'category',
                        value: selectedCat,
                        onChange: handleCategoryChange,
                        placeholder: 'All Categories',
                        options: categories.map((c) => ({ value: String(c.id), label: c.name })),
                    },
                    {
                        key: 'brand',
                        value: selectedBrand,
                        onChange: handleBrandChange,
                        placeholder: 'All Brands',
                        options: brands.map((b) => ({ value: String(b.id), label: b.name })),
                    },
                ]}
                onSearch={handleSearch}
                searchButtonLabel="Filter"
                hasActiveFilters={hasActiveFilters}
                onReset={handleResetFilters}
                actions={
                    <Link href="/admin/products/create" className="btn btn-primary btn-sm">
                        <Plus size={16} /> Add New Product
                    </Link>
                }
                columns={columns}
                rows={items}
                emptyMessage="No automotive products found matching your filters."
                pagination={products}
                itemLabel="products"
            />
        </AdminLayout>
    );
}
