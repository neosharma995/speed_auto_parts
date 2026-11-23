import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import ProductForm from './ProductForm';

export default function ProductCreate({ categories, brands, attributes, vehicles }) {
    return (
        <AdminLayout title="Add New Automotive Product">
            <ProductForm 
                categories={categories}
                brands={brands}
                attributes={attributes}
                vehicles={vehicles}
                isEditing={false}
            />
        </AdminLayout>
    );
}
