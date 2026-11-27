import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import PageForm from './PageForm';

export default function AdminPagesEdit({ page }) {
    return (
        <AdminLayout title={`Edit Page: ${page?.title || ''}`}>
            <PageForm page={page} isEditing={true} />
        </AdminLayout>
    );
}
