import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Search, Filter, Eye, Truck, CheckCircle2 } from 'lucide-react';

export default function AdminOrdersIndex({ orders, filters = {} }) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');
    const [selectedPayment, setSelectedPayment] = useState(filters.payment || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/admin/orders', {
            search: searchTerm,
            status: selectedStatus,
            payment: selectedPayment,
        }, { preserveState: true });
    };

    const items = orders.data || [];

    return (
        <AdminLayout title="Order Management">
            <div className="admin-card">
                <div className="admin-card-header">
                    <h3>All Customer Orders ({orders.total || items.length})</h3>
                </div>

                <div className="admin-card-body" style={{ borderBottom: '1px solid #DCDCDC' }}>
                    <form onSubmit={handleSearch} style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
                        <div style={{ flex: 1, minWidth: '220px' }}>
                            <input 
                                type="text"
                                className="form-input"
                                placeholder="Search by order number, customer name, email or phone..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <select 
                            className="form-select" 
                            style={{ width: 'auto' }}
                            value={selectedStatus}
                            onChange={e => setSelectedStatus(e.target.value)}
                        >
                            <option value="">All Fulfillment Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                        </select>

                        <select 
                            className="form-select" 
                            style={{ width: 'auto' }}
                            value={selectedPayment}
                            onChange={e => setSelectedPayment(e.target.value)}
                        >
                            <option value="">All Payment Statuses</option>
                            <option value="paid">Paid</option>
                            <option value="pending">Pending</option>
                            <option value="failed">Failed</option>
                        </select>

                        <button type="submit" className="btn btn-dark btn-sm">
                            <Search size={14} /> Search
                        </button>
                    </form>
                </div>

                <div className="admin-card-body" style={{ padding: 0 }}>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Order #</th>
                                <th>Date</th>
                                <th>Customer</th>
                                <th>Items</th>
                                <th>Total</th>
                                <th>Payment</th>
                                <th>Fulfillment</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.length === 0 ? (
                                <tr>
                                    <td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: '#666' }}>
                                        No orders found.
                                    </td>
                                </tr>
                            ) : (
                                items.map(order => (
                                    <tr key={order.id}>
                                        <td><strong>{order.order_number}</strong></td>
                                        <td>{new Date(order.created_at).toLocaleDateString()}</td>
                                        <td>
                                            <span>{order.customer_name}</span>
                                            <small style={{ display: 'block', color: '#64748B', fontSize: '11px' }}>{order.customer_phone}</small>
                                        </td>
                                        <td>{order.items_count || order.items?.length || 1} parts</td>
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
                                                <Eye size={14} /> Details
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {orders.links && orders.links.length > 3 && (
                    <div style={{ padding: '20px', display: 'flex', justifyContent: 'center' }}>
                        <div className="pagination">
                            {orders.links.map((link, idx) => (
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
