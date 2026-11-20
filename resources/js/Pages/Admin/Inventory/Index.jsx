import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Boxes, Save, AlertTriangle } from 'lucide-react';

export default function AdminInventoryIndex({ products = [] }) {
    const [stocks, setStocks] = useState(() => {
        const map = {};
        products.forEach(p => { map[p.id] = p.stock_quantity; });
        return map;
    });

    const handleUpdateStock = (productId) => {
        const newQty = stocks[productId];
        router.post(`/admin/inventory/${productId}/adjust`, {
            quantity: newQty,
        });
    };

    return (
        <AdminLayout title="Inventory & Stock Management">
            <div className="admin-card">
                <div className="admin-card-header">
                    <h3>Warehouse Stock Quantities</h3>
                </div>
                <div className="admin-card-body" style={{ padding: 0 }}>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Product Name</th>
                                <th>SKU & Part #</th>
                                <th>Category</th>
                                <th>Current Quantity</th>
                                <th>Stock Status</th>
                                <th>Quick Adjustment</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(p => (
                                <tr key={p.id}>
                                    <td><strong>{p.name}</strong></td>
                                    <td>
                                        <code>{p.sku}</code>
                                        <small style={{ display: 'block', color: '#888' }}>{p.part_number}</small>
                                    </td>
                                    <td>{p.category?.name || '—'}</td>
                                    <td>
                                        <span className={`badge ${p.stock_quantity <= 5 ? 'badge-danger' : (p.stock_quantity <= 15 ? 'badge-warning' : 'badge-success')}`}>
                                            {p.stock_quantity} units
                                        </span>
                                    </td>
                                    <td>
                                        <span className="badge badge-neutral" style={{ textTransform: 'uppercase' }}>
                                            {p.stock_status}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <input 
                                                type="number"
                                                className="form-input"
                                                style={{ width: '80px', padding: '6px 8px' }}
                                                value={stocks[p.id] ?? p.stock_quantity}
                                                onChange={e => setStocks({ ...stocks, [p.id]: parseInt(e.target.value) || 0 })}
                                            />
                                            <button 
                                                type="button" 
                                                className="btn btn-outline btn-sm"
                                                onClick={() => handleUpdateStock(p.id)}
                                            >
                                                <Save size={14} /> Update
                                            </button>
                                        </div>
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
