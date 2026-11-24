import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Plus, Search, Edit, Trash2, Eye, Filter, CheckCircle2, XCircle } from 'lucide-react';

export default function AdminProductsIndex({ products, categories = [], brands = [], filters = {} }) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedCat, setSelectedCat] = useState(filters.category || '');
    const [selectedBrand, setSelectedBrand] = useState(filters.brand || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/admin/products', {
            search: searchTerm,
            category: selectedCat,
            brand: selectedBrand,
        }, { preserveState: true });
    };

    const handleDelete = (id, name) => {
        if (confirm(`Are you sure you want to delete ${name}?`)) {
            router.delete(`/admin/products/${id}`);
        }
    };

    const items = products.data || [];

    return (
        <AdminLayout title="Product Catalog Management">
            <div className="admin-card">
                <div className="admin-card-header">
                    <div>
                        <h3>All Automotive Products ({products.total || items.length})</h3>
                    </div>
                    <Link href="/admin/products/create" className="btn btn-primary btn-sm">
                        <Plus size={16} /> Add New Product
                    </Link>
                </div>

                <div className="admin-card-body" style={{ borderBottom: '1px solid #DCDCDC' }}>
                    <form onSubmit={handleSearch} style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
                        <div style={{ flex: '1', minWidth: '220px' }}>
                            <input 
                                type="text"
                                className="form-input"
                                placeholder="Search by name, SKU or part number..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <select 
                            className="form-select" 
                            style={{ width: 'auto' }}
                            value={selectedCat} 
                            onChange={e => setSelectedCat(e.target.value)}
                        >
                            <option value="">All Categories</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>

                        <select 
                            className="form-select" 
                            style={{ width: 'auto' }}
                            value={selectedBrand} 
                            onChange={e => setSelectedBrand(e.target.value)}
                        >
                            <option value="">All Brands</option>
                            {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>

                        <button type="submit" className="btn btn-dark btn-sm">
                            <Search size={14} /> Filter
                        </button>
                    </form>
                </div>

                <div className="admin-card-body" style={{ padding: 0 }}>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Photo</th>
                                <th>Product Name & Part #</th>
                                <th>Category / Brand</th>
                                <th>Supplier</th>
                                <th>Type</th>
                                <th>Base Price</th>
                                <th>Stock (Whs / Cat)</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.length === 0 ? (
                                <tr>
                                    <td colSpan="9" style={{ textAlign: 'center', padding: '32px', color: '#666' }}>
                                        No automotive products found matching your filters.
                                    </td>
                                </tr>
                            ) : (
                                items.map(product => (
                                    <tr key={product.id}>
                                        <td style={{ width: '60px' }}>
                                            <img 
                                                src={product.main_image || '/images/products/placeholder.jpg'} 
                                                alt={product.name}
                                                style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '4px', backgroundColor: '#F1F5F9' }}
                                            />
                                        </td>
                                        <td>
                                            <strong>{product.name}</strong>
                                            <div style={{ fontSize: '11px', color: '#64748B', fontFamily: 'monospace', marginTop: '2px' }}>
                                                SKU: {product.sku} | Part: {product.part_number}
                                            </div>
                                        </td>
                                        <td>
                                            <span>{product.category?.name || '—'}</span>
                                            <small style={{ display: 'block', color: '#64748B', fontSize: '11px' }}>
                                                {product.brand?.name || '—'}
                                            </small>
                                        </td>
                                        <td>
                                            <span style={{ fontSize: '12px' }}>
                                                {product.supplier?.company_name || product.supplier?.name || 'In-House'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="badge badge-neutral" style={{ textTransform: 'capitalize' }}>
                                                {product.product_type === 'variable'
                                                    ? `Variable (${product.variations_count || 0} vars)`
                                                    : product.product_type}
                                            </span>
                                        </td>
                                        <td>
                                            <strong>₹{Number(product.base_price).toLocaleString('en-IN')}</strong>
                                            {product.sale_price && (
                                                <small style={{ display: 'block', color: '#168A35', fontSize: '11px' }}>
                                                    Sale: ₹{Number(product.sale_price).toLocaleString('en-IN')}
                                                </small>
                                            )}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                <span className={`badge ${product.warehouse_stock > 0 ? 'badge-warning' : 'badge-neutral'}`}>
                                                    Whs: {product.warehouse_stock || 0}
                                                </span>
                                                <span className={`badge ${product.stock_quantity > 10 ? 'badge-success' : (product.stock_quantity > 0 ? 'badge-warning' : 'badge-danger')}`}>
                                                    Cat: {product.stock_quantity}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge ${product.status === 'published' ? 'badge-success' : 'badge-neutral'}`}>
                                                {product.status}
                                            </span>
                                        </td>
                                        <td>
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
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {products.links && products.links.length > 3 && (
                    <div style={{ padding: '20px', display: 'flex', justifyContent: 'center' }}>
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
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
