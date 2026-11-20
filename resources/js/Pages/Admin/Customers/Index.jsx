import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Search, Mail, Phone, ShoppingBag } from 'lucide-react';

export default function AdminCustomersIndex({ customers, filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/admin/customers', { search }, { preserveState: true });
    };

    const items = customers.data || [];

    return (
        <AdminLayout title="Customer Directory">
            <div className="admin-card">
                <div className="admin-card-header">
                    <h3>Registered Customers ({customers.total || items.length})</h3>
                </div>

                <div className="admin-card-body" style={{ borderBottom: '1px solid #DCDCDC' }}>
                    <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px' }}>
                        <input 
                            type="text"
                            className="form-input"
                            placeholder="Search by name, email or phone..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{ maxWidth: '400px' }}
                        />
                        <button type="submit" className="btn btn-dark btn-sm">
                            <Search size={14} /> Search
                        </button>
                    </form>
                </div>

                <div className="admin-card-body" style={{ padding: 0 }}>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Orders Placed</th>
                                <th>Registered</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map(user => (
                                <tr key={user.id}>
                                    <td><strong>{user.name}</strong></td>
                                    <td>{user.email}</td>
                                    <td>{user.phone || '—'}</td>
                                    <td>{user.orders_count || 0} orders</td>
                                    <td>{new Date(user.created_at).toLocaleDateString()}</td>
                                    <td>
                                        <span className="badge badge-success" style={{ textTransform: 'uppercase' }}>
                                            {user.status || 'Active'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
