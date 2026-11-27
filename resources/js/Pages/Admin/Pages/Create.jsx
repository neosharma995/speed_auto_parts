import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import PageForm from './PageForm';

export default function AdminPagesCreate() {
    return (
        <AdminLayout title="Create Dynamic Page">
            <PageForm isEditing={false} />
        </AdminLayout>
    );
}
