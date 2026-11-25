import React from 'react';
import { Link } from '@inertiajs/react';
import SupplierLayout from '@/Layouts/SupplierLayout';
import { useCurrency } from '@/Context/CurrencyContext';
import { Package, Boxes, Clock, CheckCircle2, Truck, Plus, AlertTriangle } from 'lucide-react';

export default function SupplierDashboard({ stats = {}, recentLots = [], lowStockProducts = [] }) {
    const { formatAdminPrice } = useCurrency();
    const statusBadge = (status) => {
        if (status === 'received') return 'badge-success';
        if (status === 'rejected') return 'badge-danger';
        return 'badge-warning';
    };

    return (
        <SupplierLayout title="Supplier Overview">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <p style={{ color: '#64748B', fontSize: '13px', margin: 0 }}>
                    Create automotive parts with your supplier price, manage your stock, and dispatch lots to the Admin Warehouse.
                </p>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <Link href="/supplier/products" className="btn btn-outline btn-sm">
                        <Plus size={15} /> Create / Manage Products
                    </Link>
                    <Link href="/supplier/lots" className="btn btn-primary btn-sm">
                        <Truck size={15} /> Dispatch Lot to Admin
                    </Link>
                </div>
            </div>

            {/* Stats */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-info">
                        <span>My Products</span>
                        <strong>{stats.total_products || 0}</strong>
                    </div>
                    <div className="stat-icon stat-icon--primary">
                        <Package size={24} />
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-info">
                        <span>My Available Stock</span>
                        <strong>{stats.supplier_stock_units || 0}</strong>
                    </div>
                    <div className="stat-icon stat-icon--success">
                        <Boxes size={24} />
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-info">
                        <span>Pending Lots (In Transit)</span>
                        <strong>{stats.pending_lots_count || 0} <small style={{ fontSize: '12px', color: '#64748B' }}>({stats.pending_units || 0} units)</small></strong>
                    </div>
                    <div className="stat-icon stat-icon--warning">
                        <Clock size={24} />
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-info">
                        <span>Received by Warehouse</span>
                        <strong>{stats.received_units || 0} <small style={{ fontSize: '12px', color: '#64748B' }}>units ({stats.received_lots_count || 0} lots)</small></strong>
                    </div>
                    <div className="stat-icon stat-icon--primary">
                        <CheckCircle2 size={24} />
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
                {/* Low Stock Products */}
                <div className="admin-card">
                    <div className="admin-card-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#D93025' }}>
                            <AlertTriangle size={18} />
                            <h3 style={{ color: '#D93025' }}>Low Supplier Stock (≤ 10 units)</h3>
                        </div>
                        <Link href="/supplier/products" className="btn btn-outline btn-sm">Restock</Link>
                    </div>
                    <div className="admin-card-body" style={{ padding: 0 }}>
                        {lowStockProducts.length === 0 ? (
                            <p style={{ padding: '20px', color: '#666', fontSize: '13px' }}>
                                All your products have healthy supplier stock.
                            </p>
                        ) : (
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>Supplier Price</th>
                                        <th>My Stock</th>
                                        <th>Warehouse</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {lowStockProducts.map(p => (
                                        <tr key={p.id}>
                                            <td>
                                                <strong>{p.name}</strong>
                                                <small style={{ display: 'block', color: '#64748B', fontFamily: 'monospace' }}>{p.sku}</small>
                                            </td>
                                            <td>{formatAdminPrice(p.supplier_price || p.cost_price || 0)}</td>
                                            <td>
                                                <span className={`badge ${p.supplier_stock <= 0 ? 'badge-danger' : 'badge-warning'}`}>
                                                    {p.supplier_stock} units
                                                </span>
                                            </td>
                                            <td>{p.warehouse_stock} units</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Recent Lots */}
                <div className="admin-card">
                    <div className="admin-card-header">
                        <h3>Recent Dispatched Lots</h3>
                        <Link href="/supplier/lots" className="btn btn-outline btn-sm">All Lots</Link>
                    </div>
                    <div className="admin-card-body" style={{ padding: 0 }}>
                        {recentLots.length === 0 ? (
                            <p style={{ padding: '20px', color: '#666', fontSize: '13px' }}>
                                No lots dispatched to Admin Warehouse yet.
                            </p>
                        ) : (
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Lot #</th>
                                        <th>Product</th>
                                        <th>Qty</th>
                                        <th>Unit Price</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentLots.map(lot => (
                                        <tr key={lot.id}>
                                            <td><code>{lot.lot_number}</code></td>
                                            <td><strong>{lot.product?.name || 'Product'}</strong></td>
                                            <td>{lot.quantity} units</td>
                                            <td>{formatAdminPrice(lot.unit_price || 0)}</td>
                                            <td>
                                                <span className={`badge ${statusBadge(lot.status)}`} style={{ textTransform: 'capitalize' }}>
                                                    {lot.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </SupplierLayout>
    );
}
