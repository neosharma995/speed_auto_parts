import React, { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import SupplierLayout from '@/Layouts/SupplierLayout';
import { Plus, Search, Edit, Truck, Boxes, X } from 'lucide-react';

export default function SupplierProductsIndex({ products, categories = [], brands = [], filters = {} }) {
    const safeFilters = filters && !Array.isArray(filters) ? filters : {};
    const { errors } = usePage().props;

    const [search, setSearch] = useState(safeFilters.search || '');

    // Create / Edit Product Modal
    const [showProductModal, setShowProductModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [name, setName] = useState('');
    const [sku, setSku] = useState('');
    const [partNumber, setPartNumber] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [brandId, setBrandId] = useState('');
    const [supplierPrice, setSupplierPrice] = useState('');
    const [supplierStock, setSupplierStock] = useState('25');
    const [shortDescription, setShortDescription] = useState('');
    const [mainImage, setMainImage] = useState('');
    const [sendLotNow, setSendLotNow] = useState(false);
    const [lotQuantity, setLotQuantity] = useState('10');
    const [lotNotes, setLotNotes] = useState('');

    // Restock Modal
    const [restockProduct, setRestockProduct] = useState(null);
    const [addQty, setAddQty] = useState('20');
    const [newSupplierPrice, setNewSupplierPrice] = useState('');

    // Quick Send Lot Modal
    const [lotProduct, setLotProduct] = useState(null);
    const [sendQty, setSendQty] = useState('10');
    const [sendPrice, setSendPrice] = useState('');
    const [sendNotes, setSendNotes] = useState('');

    const [submitting, setSubmitting] = useState(false);

    const openCreateModal = () => {
        setEditingProduct(null);
        setName('');
        setSku('');
        setPartNumber('');
        setCategoryId('');
        setBrandId('');
        setSupplierPrice('');
        setSupplierStock('25');
        setShortDescription('');
        setMainImage('');
        setSendLotNow(false);
        setLotQuantity('10');
        setLotNotes('');
        setShowProductModal(true);
    };

    const openEditModal = (p) => {
        setEditingProduct(p);
        setName(p.name);
        setSku(p.sku);
        setPartNumber(p.part_number);
        setCategoryId(p.category_id || '');
        setBrandId(p.brand_id || '');
        setSupplierPrice(p.supplier_price || p.cost_price || '');
        setShortDescription(p.short_description || '');
        setMainImage(p.main_image || '');
        setShowProductModal(true);
    };

    const handleProductSubmit = (e) => {
        e.preventDefault();
        setSubmitting(true);

        if (editingProduct) {
            router.put(`/supplier/products/${editingProduct.id}`, {
                name,
                category_id: categoryId || null,
                brand_id: brandId || null,
                supplier_price: supplierPrice,
                short_description: shortDescription,
                main_image: mainImage,
            }, {
                onSuccess: () => setShowProductModal(false),
                onFinish: () => setSubmitting(false),
            });
        } else {
            router.post('/supplier/products', {
                name,
                sku,
                part_number: partNumber,
                category_id: categoryId || null,
                brand_id: brandId || null,
                supplier_price: supplierPrice,
                supplier_stock: parseInt(supplierStock) || 0,
                short_description: shortDescription,
                main_image: mainImage,
                send_lot_now: sendLotNow,
                lot_quantity: sendLotNow ? (parseInt(lotQuantity) || 0) : null,
                lot_notes: lotNotes,
            }, {
                onSuccess: () => setShowProductModal(false),
                onFinish: () => setSubmitting(false),
            });
        }
    };

    const handleRestockSubmit = (e) => {
        e.preventDefault();
        if (!restockProduct) return;
        setSubmitting(true);
        router.post(`/supplier/products/${restockProduct.id}/restock`, {
            add_quantity: parseInt(addQty) || 0,
            supplier_price: newSupplierPrice || undefined,
        }, {
            onSuccess: () => setRestockProduct(null),
            onFinish: () => setSubmitting(false),
        });
    };

    const handleQuickSendLot = (e) => {
        e.preventDefault();
        if (!lotProduct) return;
        setSubmitting(true);
        router.post('/supplier/lots', {
            items: [{
                product_id: lotProduct.id,
                quantity: parseInt(sendQty) || 0,
                unit_price: parseFloat(sendPrice || lotProduct.supplier_price || lotProduct.cost_price || 0),
            }],
            notes: sendNotes,
        }, {
            onSuccess: () => setLotProduct(null),
            onFinish: () => setSubmitting(false),
        });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/supplier/products', { search }, { preserveState: true });
    };

    const items = products.data || [];

    return (
        <SupplierLayout title="My Products & Supplier Stock">
            {errors && Object.keys(errors).length > 0 && (
                <div style={{ backgroundColor: '#FFF1F2', color: '#D93025', padding: '12px 16px', borderRadius: '4px', marginBottom: '16px', fontSize: '13px' }}>
                    {Object.values(errors).map((err, idx) => <div key={idx}>{err}</div>)}
                </div>
            )}

            <div className="admin-card">
                <div className="admin-card-header">
                    <h3>Supplied Auto Parts ({products.total || items.length})</h3>
                    <button type="button" className="btn btn-primary btn-sm" onClick={openCreateModal}>
                        <Plus size={16} /> Create New Product
                    </button>
                </div>

                <div className="admin-card-body" style={{ borderBottom: '1px solid #DCDCDC' }}>
                    <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px' }}>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Search by product name, SKU, or part number..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{ maxWidth: '380px' }}
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
                                <th>Product</th>
                                <th>Category / Brand</th>
                                <th>My Supplier Price</th>
                                <th>My Stock</th>
                                <th>Admin Warehouse</th>
                                <th>Live Website</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.length === 0 ? (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: '#64748B' }}>
                                        You haven't created any products yet. Click "Create New Product" to add parts and send a lot to Admin.
                                    </td>
                                </tr>
                            ) : (
                                items.map(p => (
                                    <tr key={p.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <img
                                                    src={p.main_image || '/images/products/placeholder.jpg'}
                                                    alt={p.name}
                                                    style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', backgroundColor: '#F1F5F9' }}
                                                />
                                                <div>
                                                    <strong>{p.name}</strong>
                                                    <div style={{ fontSize: '11px', color: '#64748B', fontFamily: 'monospace' }}>
                                                        SKU: {p.sku} | Part: {p.part_number}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span>{p.category?.name || '—'}</span>
                                            <small style={{ display: 'block', color: '#64748B', fontSize: '11px' }}>{p.brand?.name || '—'}</small>
                                        </td>
                                        <td><strong>₹{Number(p.supplier_price || p.cost_price || 0).toLocaleString('en-IN')}</strong></td>
                                        <td>
                                            <span className={`badge ${p.supplier_stock > 10 ? 'badge-success' : (p.supplier_stock > 0 ? 'badge-warning' : 'badge-danger')}`}>
                                                {p.supplier_stock} units
                                            </span>
                                        </td>
                                        <td>
                                            <span className="badge badge-neutral">{p.warehouse_stock} units</span>
                                        </td>
                                        <td>
                                            <span className={`badge ${p.status === 'published' ? 'badge-success' : 'badge-neutral'}`} style={{ textTransform: 'capitalize' }}>
                                                {p.status} ({p.stock_quantity})
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                <button
                                                    type="button"
                                                    className="btn btn-primary btn-sm"
                                                    disabled={p.supplier_stock <= 0}
                                                    onClick={() => {
                                                        setLotProduct(p);
                                                        setSendQty(String(Math.min(10, p.supplier_stock || 1)));
                                                        setSendPrice(String(p.supplier_price || p.cost_price || ''));
                                                        setSendNotes('');
                                                    }}
                                                    title="Send Lot to Admin Warehouse"
                                                >
                                                    <Truck size={14} /> Send Lot
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-outline btn-sm"
                                                    onClick={() => {
                                                        setRestockProduct(p);
                                                        setAddQty('20');
                                                        setNewSupplierPrice(String(p.supplier_price || p.cost_price || ''));
                                                    }}
                                                    title="Add Stock"
                                                >
                                                    <Boxes size={14} /> +Stock
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-outline btn-sm"
                                                    onClick={() => openEditModal(p)}
                                                    title="Edit Product"
                                                >
                                                    <Edit size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create / Edit Modal */}
            {showProductModal && (
                <>
                    <div className="header-backdrop" onClick={() => setShowProductModal(false)} />
                    <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: '#FFF', borderRadius: '8px', padding: '28px', width: '92%', maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto', zIndex: 2200, boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 800 }}>
                                {editingProduct ? 'Edit Supplier Product' : 'Create Product & Set Supplier Price'}
                            </h3>
                            <button type="button" onClick={() => setShowProductModal(false)} style={{ background: 'none', border: 'none', color: '#64748B' }}>
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleProductSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div className="form-group">
                                <label className="form-label">Product Name <span className="required">*</span></label>
                                <input type="text" className="form-input" required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Titanium Turbo Downpipe" />
                            </div>

                            {!editingProduct && (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div className="form-group">
                                        <label className="form-label">SKU <span className="required">*</span></label>
                                        <input type="text" className="form-input" required value={sku} onChange={e => setSku(e.target.value)} placeholder="SUP-EXH-101" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Part Number <span className="required">*</span></label>
                                        <input type="text" className="form-input" required value={partNumber} onChange={e => setPartNumber(e.target.value)} placeholder="PN-10199" />
                                    </div>
                                </div>
                            )}

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div className="form-group">
                                    <label className="form-label">Category</label>
                                    <select className="form-select" value={categoryId} onChange={e => setCategoryId(e.target.value)}>
                                        <option value="">Select Category</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Brand</label>
                                    <select className="form-select" value={brandId} onChange={e => setBrandId(e.target.value)}>
                                        <option value="">Select Brand</option>
                                        {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: editingProduct ? '1fr' : '1fr 1fr', gap: '12px' }}>
                                <div className="form-group">
                                    <label className="form-label">Supplier Supply Price (₹ per unit) <span className="required">*</span></label>
                                    <input type="number" step="0.01" min="1" className="form-input" required value={supplierPrice} onChange={e => setSupplierPrice(e.target.value)} placeholder="5500" />
                                </div>
                                {!editingProduct && (
                                    <div className="form-group">
                                        <label className="form-label">Initial Supplier Stock <span className="required">*</span></label>
                                        <input type="number" min="0" className="form-input" required value={supplierStock} onChange={e => setSupplierStock(e.target.value)} />
                                    </div>
                                )}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Image URL</label>
                                <input type="text" className="form-input" value={mainImage} onChange={e => setMainImage(e.target.value)} placeholder="/images/products/placeholder.jpg" />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Short Description</label>
                                <textarea className="form-textarea" value={shortDescription} onChange={e => setShortDescription(e.target.value)} style={{ minHeight: '60px' }} />
                            </div>

                            {!editingProduct && (
                                <div style={{ padding: '12px', backgroundColor: '#F8FAFC', border: '1px solid #DCDCDC', borderRadius: '4px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                                        <input type="checkbox" checked={sendLotNow} onChange={e => setSendLotNow(e.target.checked)} />
                                        <span>Dispatch initial lot to Admin Warehouse right away</span>
                                    </label>
                                    {sendLotNow && (
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px', marginTop: '10px' }}>
                                            <div className="form-group">
                                                <label className="form-label">Lot Quantity</label>
                                                <input type="number" min="1" max={supplierStock} className="form-input" required={sendLotNow} value={lotQuantity} onChange={e => setLotQuantity(e.target.value)} />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Dispatch Notes</label>
                                                <input type="text" className="form-input" value={lotNotes} onChange={e => setLotNotes(e.target.value)} placeholder="Initial shipment batch" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowProductModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submitting}>
                                    {submitting ? 'Saving...' : (editingProduct ? 'Save Changes' : 'Create Product')}
                                </button>
                            </div>
                        </form>
                    </div>
                </>
            )}

            {/* Restock Modal */}
            {restockProduct && (
                <>
                    <div className="header-backdrop" onClick={() => setRestockProduct(null)} />
                    <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: '#FFF', borderRadius: '8px', padding: '28px', width: '90%', maxWidth: '420px', zIndex: 2200, boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
                        <h3 style={{ fontSize: '17px', fontWeight: 800, marginBottom: '12px' }}>Restock: {restockProduct.name}</h3>
                        <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '16px' }}>
                            Current supplier stock: <strong>{restockProduct.supplier_stock} units</strong>
                        </p>
                        <form onSubmit={handleRestockSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div className="form-group">
                                <label className="form-label">Add Units to Supplier Stock</label>
                                <input type="number" min="1" className="form-input" required value={addQty} onChange={e => setAddQty(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Supplier Price (₹)</label>
                                <input type="number" step="0.01" min="1" className="form-input" value={newSupplierPrice} onChange={e => setNewSupplierPrice(e.target.value)} />
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setRestockProduct(null)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submitting}>Add Stock</button>
                            </div>
                        </form>
                    </div>
                </>
            )}

            {/* Quick Send Lot Modal */}
            {lotProduct && (
                <>
                    <div className="header-backdrop" onClick={() => setLotProduct(null)} />
                    <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: '#FFF', borderRadius: '8px', padding: '28px', width: '90%', maxWidth: '440px', zIndex: 2200, boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
                        <h3 style={{ fontSize: '17px', fontWeight: 800, marginBottom: '8px' }}>Send Lot to Admin Warehouse</h3>
                        <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '16px' }}>
                            <strong>{lotProduct.name}</strong> — Available: <strong>{lotProduct.supplier_stock} units</strong>
                        </p>
                        <form onSubmit={handleQuickSendLot} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div className="form-group">
                                <label className="form-label">Quantity to Dispatch</label>
                                <input type="number" min="1" max={lotProduct.supplier_stock} className="form-input" required value={sendQty} onChange={e => setSendQty(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Lot Unit Price (₹)</label>
                                <input type="number" step="0.01" min="1" className="form-input" required value={sendPrice} onChange={e => setSendPrice(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Dispatch Notes</label>
                                <input type="text" className="form-input" value={sendNotes} onChange={e => setSendNotes(e.target.value)} placeholder="Truck / challan reference..." />
                            </div>
                            <div style={{ padding: '10px 12px', backgroundColor: '#F8FAFC', borderRadius: '4px', fontSize: '13px', display: 'flex', justifyContent: 'space-between' }}>
                                <span>Total Lot Value:</span>
                                <strong>₹{((parseInt(sendQty) || 0) * (parseFloat(sendPrice) || 0)).toLocaleString('en-IN')}</strong>
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setLotProduct(null)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submitting}>
                                    <Truck size={15} /> Dispatch Lot
                                </button>
                            </div>
                        </form>
                    </div>
                </>
            )}
        </SupplierLayout>
    );
}
