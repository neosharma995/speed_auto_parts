import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import ProductForm from './ProductForm';

export default function ProductEdit({ product, categories, brands, attributes, vehicles }) {
    return (
        <AdminLayout title={`Edit Product: ${product.name}`}>
            <ProductForm 
                product={product}
                categories={categories}
                brands={brands}
                attributes={attributes}
                vehicles={vehicles}
                isEditing={true}
            />
        </AdminLayout>
    );
}
