import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import AdminDataTable from '@/Components/Admin/AdminDataTable';
import { useCurrency } from '@/Context/CurrencyContext';
import { Eye } from 'lucide-react';

export default function AdminOrdersIndex({ orders, filters = {} }) {
    const { formatAdminPrice } = useCurrency();
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');
    const [selectedPayment, setSelectedPayment] = useState(filters.payment || '');

    const hasActiveFilters = Boolean(
        (filters.search && String(filters.search).trim() !== '') ||
        filters.status ||
        filters.payment
    );

    const applyFilters = (next = {}) => {
        const nextSearch = next.search !== undefined ? next.search : searchTerm;
        const nextStatus = next.status !== undefined ? next.status : selectedStatus;
        const nextPayment = next.payment !== undefined ? next.payment : selectedPayment;

        const params = {};
        if (nextSearch && nextSearch.trim()) params.search = nextSearch.trim();
        if (nextStatus) params.status = nextStatus;
        if (nextPayment) params.payment = nextPayment;

        router.get('/admin/orders', params, { preserveState: true, replace: true });
    };

    const handleSearch = () => applyFilters();

    const handleStatusChange = (val) => {
        setSelectedStatus(val);
        applyFilters({ status: val });
    };

    const handlePaymentChange = (val) => {
        setSelectedPayment(val);
        applyFilters({ payment: val });
    };

    const handleResetFilters = () => {
        setSearchTerm('');
        setSelectedStatus('');
        setSelectedPayment('');
        router.get('/admin/orders', {}, { preserveState: true, replace: true });
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
            render: (order) => <strong>{formatAdminPrice(order.total_amount)}</strong>,
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
                        onChange: handleStatusChange,
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
                        onChange: handlePaymentChange,
                        placeholder: 'All Payment Statuses',
                        options: [
                            { value: 'paid', label: 'Paid' },
                            { value: 'pending', label: 'Pending' },
                            { value: 'failed', label: 'Failed' },
                        ],
                    },
                ]}
                onSearch={handleSearch}
                hasActiveFilters={hasActiveFilters}
                onReset={handleResetFilters}
                columns={columns}
                rows={items}
                emptyMessage="No orders found."
                pagination={orders}
                itemLabel="orders"
            />
        </AdminLayout>
    );
}
