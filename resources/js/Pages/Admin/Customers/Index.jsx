import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import AdminDataTable from '@/Components/Admin/AdminDataTable';

export default function AdminCustomersIndex({ customers, filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = () => {
        const params = {};
        if (search && search.trim()) params.search = search.trim();
        router.get('/admin/customers', params, { preserveState: true, replace: true });
    };

    const items = customers.data || [];

    const columns = [
        {
            key: 'name',
            label: 'Name',
            render: (user) => <strong>{user.name}</strong>,
        },
        {
            key: 'email',
            label: 'Email',
        },
        {
            key: 'phone',
            label: 'Phone',
            render: (user) => user.phone || '—',
        },
        {
            key: 'orders_count',
            label: 'Orders Placed',
            render: (user) => `${user.orders_count || 0} orders`,
        },
        {
            key: 'created_at',
            label: 'Registered',
            render: (user) => new Date(user.created_at).toLocaleDateString(),
        },
        {
            key: 'status',
            label: 'Status',
            render: (user) => (
                <span className="badge badge-success" style={{ textTransform: 'uppercase' }}>
                    {user.status || 'Active'}
                </span>
            ),
        },
    ];

    return (
        <AdminLayout title="Customer Directory">
            <AdminDataTable
                title="Registered Customers"
                count={customers.total || items.length}
                search={{
                    value: search,
                    onChange: setSearch,
                    placeholder: 'Search by name, email or phone...',
                }}
                onSearch={handleSearch}
                columns={columns}
                rows={items}
                emptyMessage="No registered customers found."
                pagination={customers}
                itemLabel="customers"
            />
        </AdminLayout>
    );
}
