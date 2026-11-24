import React from 'react';
import { Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useCurrency } from '@/Context/CurrencyContext';
import { 
    Package, 
    Layers, 
    Tag, 
    Car, 
    Plus
} from 'lucide-react';

export default function AdminDashboard({ 
    stats = {}, 
    recentProducts = []
}) {
    const { formatAdminPrice, defaultCurrency } = useCurrency();

    return (
        <AdminLayout title="Operations Overview">
            {/* Top Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-info">
                        <span>Active Catalog Parts</span>
                        <strong>{stats.total_products || 0}</strong>
                    </div>
                    <div className="stat-icon stat-icon--primary">
                        <Package size={24} />
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-info">
                        <span>Product Categories</span>
                        <strong>{stats.total_categories || 0}</strong>
                    </div>
                    <div className="stat-icon stat-icon--success">
                        <Layers size={24} />
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-info">
                        <span>Manufacturer Brands</span>
                        <strong>{stats.total_brands || 0}</strong>
                    </div>
                    <div className="stat-icon stat-icon--warning">
                        <Tag size={24} />
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-info">
                        <span>Compatible Vehicles</span>
                        <strong>{stats.total_vehicles || 0}</strong>
                    </div>
                    <div className="stat-icon stat-icon--danger">
                        <Car size={24} />
                    </div>
                </div>
            </div>

            {/* Recent Catalog Products Table */}
            <div className="admin-card">
                <div className="admin-card-header">
                    <h3>Recent Catalog Products</h3>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <Link href="/admin/products/create" className="btn btn-primary btn-sm">
                            <Plus size={14} /> Add Product
                        </Link>
                        <Link href="/admin/products" className="btn btn-outline btn-sm">
                            View Full Catalog
                        </Link>
                    </div>
                </div>
                <div className="admin-card-body" style={{ padding: 0 }}>
                    {recentProducts.length === 0 ? (
                        <p style={{ padding: '20px', color: '#666', fontSize: '13px' }}>
                            No products in the catalog yet.
                        </p>
                    ) : (
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>SKU / Part #</th>
                                    <th>Category</th>
                                    <th>Brand</th>
                                    <th>Price ({defaultCurrency.code})</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentProducts.map(product => (
                                    <tr key={product.id}>
                                        <td><strong>{product.name}</strong></td>
                                        <td style={{ fontFamily: 'monospace' }}>
                                            {product.sku} / {product.part_number}
                                        </td>
                                        <td>{product.category?.name || 'Uncategorized'}</td>
                                        <td>{product.brand?.name || 'Generic'}</td>
                                        <td><strong>{formatAdminPrice(product.effective_price ?? product.base_price)}</strong></td>
                                        <td>
                                            <span className={`badge ${product.status === 'published' ? 'badge-success' : 'badge-warning'}`}>
                                                {product.status}
                                            </span>
                                        </td>
                                        <td>
                                            <Link href={`/admin/products/${product.id}/edit`} className="btn btn-outline btn-sm">
                                                Edit
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
