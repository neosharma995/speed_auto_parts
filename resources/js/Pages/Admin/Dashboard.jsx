import React from 'react';
import { Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { 
    DollarSign, 
    ShoppingCart, 
    Users, 
    Package, 
    AlertTriangle, 
    ArrowUpRight, 
    Clock, 
    TrendingUp,
    ShieldAlert,
    CheckCircle
} from 'lucide-react';

export default function AdminDashboard({ 
    stats = {}, 
    recentOrders = [], 
    lowStockProducts = [], 
    pendingOrders = [] 
}) {
    return (
        <AdminLayout title="Operations Overview">
            {/* Top Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-info">
                        <span>Total Revenue</span>
                        <strong>₹{Number(stats.total_sales || 0).toLocaleString('en-IN')}</strong>
                    </div>
                    <div className="stat-icon stat-icon--primary">
                        <DollarSign size={24} />
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-info">
                        <span>Total Orders</span>
                        <strong>{stats.total_orders || 0}</strong>
                    </div>
                    <div className="stat-icon stat-icon--success">
                        <ShoppingCart size={24} />
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-info">
                        <span>Registered Customers</span>
                        <strong>{stats.total_customers || 0}</strong>
                    </div>
                    <div className="stat-icon stat-icon--warning">
                        <Users size={24} />
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-info">
                        <span>Active Catalog Parts</span>
                        <strong>{stats.total_products || 0}</strong>
                    </div>
                    <div className="stat-icon stat-icon--danger">
                        <Package size={24} />
                    </div>
                </div>
            </div>

            {/* Middle Grid: Pending Orders & Low Stock Alerts */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '24px' }}>
                {/* Low Stock Warning Card */}
                <div className="admin-card">
                    <div className="admin-card-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#D93025' }}>
                            <AlertTriangle size={18} />
                            <h3 style={{ color: '#D93025' }}>Inventory Alerts (≤ 15 units)</h3>
                        </div>
                        <Link href="/admin/inventory" className="btn btn-outline btn-sm">
                            Manage Stock
                        </Link>
                    </div>
                    <div className="admin-card-body" style={{ padding: 0 }}>
                        {lowStockProducts.length === 0 ? (
                            <p style={{ padding: '20px', color: '#666', fontSize: '13px' }}>
                                All inventory levels are above safety thresholds.
                            </p>
                        ) : (
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>Part #</th>
                                        <th>Stock Left</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {lowStockProducts.map(p => (
                                        <tr key={p.id}>
                                            <td><strong>{p.name}</strong></td>
                                            <td style={{ fontFamily: 'monospace' }}>{p.part_number}</td>
                                            <td>
                                                <span className={`badge ${p.stock_quantity <= 5 ? 'badge-danger' : 'badge-warning'}`}>
                                                    {p.stock_quantity} units
                                                </span>
                                            </td>
                                            <td>
                                                <Link href={`/admin/products/${p.id}/edit`} className="btn btn-outline btn-sm">
                                                    Restock
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Pending Orders Waiting for Dispatch */}
                <div className="admin-card">
                    <div className="admin-card-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#F36B16' }}>
                            <Clock size={18} />
                            <h3>Pending Shipments ({pendingOrders.length})</h3>
                        </div>
                        <Link href="/admin/orders?status=pending" className="btn btn-outline btn-sm">
                            View All
                        </Link>
                    </div>
                    <div className="admin-card-body" style={{ padding: 0 }}>
                        {pendingOrders.length === 0 ? (
                            <p style={{ padding: '20px', color: '#666', fontSize: '13px' }}>
                                No orders currently waiting for dispatch.
                            </p>
                        ) : (
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Order #</th>
                                        <th>Customer</th>
                                        <th>Amount</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendingOrders.map(order => (
                                        <tr key={order.id}>
                                            <td><strong>{order.order_number}</strong></td>
                                            <td>{order.customer_name}</td>
                                            <td>₹{Number(order.total_amount).toLocaleString('en-IN')}</td>
                                            <td>
                                                <Link href={`/admin/orders/${order.id}`} className="btn btn-primary btn-sm">
                                                    Process
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Orders Table */}
            <div className="admin-card">
                <div className="admin-card-header">
                    <h3>Recent Store Orders</h3>
                    <Link href="/admin/orders" className="btn btn-outline btn-sm">
                        View Complete Order Log
                    </Link>
                </div>
                <div className="admin-card-body" style={{ padding: 0 }}>
                    {recentOrders.length === 0 ? (
                        <p style={{ padding: '20px', color: '#666', fontSize: '13px' }}>
                            No orders placed yet.
                        </p>
                    ) : (
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Order #</th>
                                    <th>Customer</th>
                                    <th>Date</th>
                                    <th>Total (INR)</th>
                                    <th>Payment</th>
                                    <th>Fulfillment</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.map(order => (
                                    <tr key={order.id}>
                                        <td><strong>{order.order_number}</strong></td>
                                        <td>
                                            <span>{order.customer_name}</span>
                                            <small style={{ display: 'block', color: '#888', fontSize: '11px' }}>{order.customer_email}</small>
                                        </td>
                                        <td>{new Date(order.created_at).toLocaleDateString()}</td>
                                        <td><strong>₹{Number(order.total_amount).toLocaleString('en-IN')}</strong></td>
                                        <td>
                                            <span className={`badge ${order.payment_status === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                                                {order.payment_status}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="badge badge-primary">
                                                {order.delivery_status}
                                            </span>
                                        </td>
                                        <td>
                                            <Link href={`/admin/orders/${order.id}`} className="btn btn-outline btn-sm">
                                                Manage
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
