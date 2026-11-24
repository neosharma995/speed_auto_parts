import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import AdminDataTable from '@/Components/Admin/AdminDataTable';
import { Eye } from 'lucide-react';

export default function AdminOrdersIndex({ orders, filters = {} }) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');
    const [selectedPayment, setSelectedPayment] = useState(filters.payment || '');

    const handleSearch = () => {
        router.get(
            '/admin/orders',
            {
                search: searchTerm,
                status: selectedStatus,
                payment: selectedPayment,
            },
            { preserveState: true }
        );
    };

    const items = orders.data || [];

    const columns = [
        {
            key: 'order_number',
            label: 'Order #',
            render: (order) => <strong>{order.order_number}</strong>,
        },
        {
            key: 'created_at',
            label: 'Date',
            render: (order) => new Date(order.created_at).toLocaleDateString(),
        },
        {
            key: 'customer',
            label: 'Customer',
            render: (order) => (
                <>
                    <span>{order.customer_name}</span>
                    <small style={{ display: 'block', color: '#64748B', fontSize: '11px' }}>
                        {order.customer_phone}
                    </small>
                </>
            ),
        },
        {
            key: 'items',
            label: 'Items',
            render: (order) => `${order.items_count || order.items?.length || 1} parts`,
        },
        {
            key: 'total_amount',
            label: 'Total',
            render: (order) => <strong>₹{Number(order.total_amount).toLocaleString('en-IN')}</strong>,
        },
        {
            key: 'payment_status',
            label: 'Payment',
            render: (order) => (
                <span className={`badge ${order.payment_status === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                    {order.payment_status}
                </span>
            ),
        },
        {
            key: 'delivery_status',
            label: 'Fulfillment',
            render: (order) => <span className="badge badge-primary">{order.delivery_status}</span>,
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (order) => (
                <Link href={`/admin/orders/${order.id}`} className="btn btn-outline btn-sm">
                    <Eye size={14} /> Details
                </Link>
            ),
        },
    ];

    return (
        <AdminLayout title="Order Management">
            <AdminDataTable
                title="All Orders"
                count={orders.total || items.length}
                search={{
                    value: searchTerm,
                    onChange: setSearchTerm,
                    placeholder: 'Search by order number, customer name, email or phone...',
                }}
                filters={[
                    {
                        key: 'status',
                        value: selectedStatus,
                        onChange: setSelectedStatus,
                        placeholder: 'All Fulfillment Statuses',
                        options: [
                            { value: 'pending', label: 'Pending' },
                            { value: 'processing', label: 'Processing' },
                            { value: 'shipped', label: 'Shipped' },
                            { value: 'delivered', label: 'Delivered' },
                            { value: 'cancelled', label: 'Cancelled' },
                        ],
                    },
                    {
                        key: 'payment',
                        value: selectedPayment,
                        onChange: setSelectedPayment,
                        placeholder: 'All Payment Statuses',
                        options: [
                            { value: 'paid', label: 'Paid' },
                            { value: 'pending', label: 'Pending' },
                            { value: 'failed', label: 'Failed' },
                        ],
                    },
                ]}
                onSearch={handleSearch}
                columns={columns}
                rows={items}
                emptyMessage="No orders found."
                pagination={orders}
                itemLabel="orders"
            />
        </AdminLayout>
    );
}
