import React, { useState } from 'react';
import { router, Link } from '@inertiajs/react';
import { 
    Info, 
    Image, 
    DollarSign, 
    Boxes, 
    Layers, 
    Sliders, 
    GitMerge, 
    Car, 
    Receipt, 
    Search,
    Save,
    ArrowLeft,
    Plus,
    Trash2
} from 'lucide-react';

export default function ProductForm({ 
    product = null, 
    categories = [], 
    brands = [], 
    taxClasses = [], 
    attributes = [], 
    vehicles = [],
    isEditing = false 
}) {
    const [activeTab, setActiveTab] = useState('general');

    // 1. General
    const [name, setName] = useState(product?.name || '');
    const [slug, setSlug] = useState(product?.slug || '');
    const [sku, setSku] = useState(product?.sku || '');
    const [partNumber, setPartNumber] = useState(product?.part_number || '');
    const [shortDescription, setShortDescription] = useState(product?.short_description || '');
    const [description, setDescription] = useState(product?.description || '');
    const [techSpecs, setTechSpecs] = useState(product?.technical_specifications || '');
    const [productType, setProductType] = useState(product?.product_type || 'simple');
    const [status, setStatus] = useState(product?.status || 'published');
    const [isFeatured, setIsFeatured] = useState(Boolean(product?.is_featured));
    const [isBestSeller, setIsBestSeller] = useState(Boolean(product?.is_best_seller));
    const [isNewArrival, setIsNewArrival] = useState(Boolean(product?.is_new_arrival));

    // 2. Images
    const [mainImage, setMainImage] = useState(product?.main_image || '');
    const [galleryImages, setGalleryImages] = useState(product?.gallery_images || []);
    const [newGalleryUrl, setNewGalleryUrl] = useState('');

    // 3. Pricing
    const [basePrice, setBasePrice] = useState(product?.base_price || '');
    const [salePrice, setSalePrice] = useState(product?.sale_price || '');
    const [costPrice, setCostPrice] = useState(product?.cost_price || '');

    // 4. Inventory
    const [stockQuantity, setStockQuantity] = useState(product?.stock_quantity ?? 10);
    const [stockStatus, setStockStatus] = useState(product?.stock_status || 'in_stock');
    const [weight, setWeight] = useState(product?.weight || '');
    const [weightUnit, setWeightUnit] = useState(product?.weight_unit || 'kg');

    // 5. Categories & Brand
    const [categoryId, setCategoryId] = useState(product?.category_id || '');
    const [brandId, setBrandId] = useState(product?.brand_id || '');

    // 6. Attributes
    const [selectedAttributes, setSelectedAttributes] = useState(
        product?.attributes?.map(a => a.id) || []
    );

    // 7. Variations
    const [variationsList, setVariationsList] = useState(product?.variations || []);
    const [newVarName, setNewVarName] = useState('');
    const [newVarSku, setNewVarSku] = useState('');
    const [newVarPart, setNewVarPart] = useState('');
    const [newVarPrice, setNewVarPrice] = useState('');
    const [newVarStock, setNewVarStock] = useState('10');

    // 8. Vehicle Fitment
    const [selectedVehicleIds, setSelectedVehicleIds] = useState(
        product?.product_vehicles?.map(pv => pv.vehicle_id) || []
    );
    const [fitmentNotes, setFitmentNotes] = useState('');

    // 9. Tax
    const [taxClassId, setTaxClassId] = useState(product?.tax_class_id || '');

    // 10. SEO
    const [seoTitle, setSeoTitle] = useState(product?.seo_title || '');
    const [seoDescription, setSeoDescription] = useState(product?.seo_description || '');

    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    const handleAddGalleryImage = () => {
        if (newGalleryUrl.trim()) {
            setGalleryImages([...galleryImages, newGalleryUrl.trim()]);
            setNewGalleryUrl('');
        }
    };

    const handleRemoveGalleryImage = (index) => {
        setGalleryImages(galleryImages.filter((_, i) => i !== index));
    };

    const handleAddVariation = () => {
        if (!newVarName || !newVarPrice) return;
        const newVar = {
            id: 'temp_' + Date.now(),
            name: newVarName,
            sku: newVarSku || `${sku}-${variationsList.length + 1}`,
            part_number: newVarPart || `${partNumber}-${variationsList.length + 1}`,
            price: newVarPrice,
            stock_quantity: parseInt(newVarStock) || 10,
            stock_status: 'in_stock',
        };
        setVariationsList([...variationsList, newVar]);
        setNewVarName('');
        setNewVarSku('');
        setNewVarPart('');
        setNewVarPrice('');
        setNewVarStock('10');
    };

    const handleRemoveVariation = (index) => {
        setVariationsList(variationsList.filter((_, i) => i !== index));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitting(true);
        setErrors({});

        const payload = {
            name,
            slug,
            sku,
            part_number: partNumber,
            short_description: shortDescription,
            description,
            technical_specifications: techSpecs,
            product_type: productType,
            status,
            is_featured: isFeatured,
            is_best_seller: isBestSeller,
            is_new_arrival: isNewArrival,
            main_image: mainImage,
            gallery_images: galleryImages,
            base_price: basePrice,
            sale_price: salePrice || null,
            cost_price: costPrice || null,
            stock_quantity: parseInt(stockQuantity) || 0,
            stock_status: stockStatus,
            weight: weight || null,
            weight_unit: weightUnit,
            category_id: categoryId || null,
            brand_id: brandId || null,
            tax_class_id: taxClassId || null,
            attributes: selectedAttributes,
            variations: variationsList,
            vehicle_ids: selectedVehicleIds,
            fitment_notes: fitmentNotes,
            seo_title: seoTitle,
            seo_description: seoDescription,
        };

        if (isEditing) {
            router.put(`/admin/products/${product.id}`, payload, {
                onError: (err) => setErrors(err),
                onFinish: () => setSubmitting(false),
            });
        } else {
            router.post('/admin/products', payload, {
                onError: (err) => setErrors(err),
                onFinish: () => setSubmitting(false),
            });
        }
    };

    const tabs = [
        { id: 'general', label: '1. General Info', icon: Info },
        { id: 'images', label: '2. Images & Media', icon: Image },
        { id: 'pricing', label: '3. Pricing', icon: DollarSign },
        { id: 'inventory', label: '4. Inventory', icon: Boxes },
        { id: 'categories', label: '5. Category & Brand', icon: Layers },
        { id: 'attributes', label: '6. Attributes', icon: Sliders },
        { id: 'variations', label: '7. Variations', icon: GitMerge },
        { id: 'fitment', label: '8. Vehicle Fitment', icon: Car },
        { id: 'tax', label: '9. GST & Tax', icon: Receipt },
        { id: 'seo', label: '10. SEO Metadata', icon: Search },
    ];

    return (
        <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <Link href="/admin/products" className="btn btn-outline btn-sm">
                    <ArrowLeft size={14} /> Back to Products
                </Link>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                    <Save size={16} /> {submitting ? 'Saving...' : (isEditing ? 'Update Product' : 'Publish Product')}
                </button>
            </div>

            {Object.keys(errors).length > 0 && (
                <div style={{ backgroundColor: '#FFF1F2', color: '#D93025', padding: '12px 16px', borderRadius: '4px', marginBottom: '20px', fontSize: '13px' }}>
                    <strong>Please resolve the following form errors:</strong>
                    <ul style={{ marginLeft: '16px', marginTop: '4px' }}>
                        {Object.entries(errors).map(([key, msg]) => <li key={key}>{msg}</li>)}
                    </ul>
                </div>
            )}

            <div className="admin-card" style={{ padding: 0 }}>
                {/* 10 Tab Navigation Bar */}
                <div className="product-form-tabs">
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                className={activeTab === tab.id ? 'active' : ''}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <Icon size={15} style={{ display: 'inline', marginRight: '6px' }} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                <div className="admin-card-body">
                    {/* SECTION 1: General Info */}
                    {activeTab === 'general' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div className="form-group">
                                <label className="form-label">Product Name <span className="required">*</span></label>
                                <input 
                                    type="text" 
                                    className="form-input" 
                                    required 
                                    placeholder="e.g. Slotted & Drilled Brake Rotor"
                                    value={name} 
                                    onChange={e => setName(e.target.value)} 
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                                <div className="form-group">
                                    <label className="form-label">SKU <span className="required">*</span></label>
                                    <input 
                                        type="text" 
                                        className="form-input" 
                                        required 
                                        placeholder="AP-BRK-5401"
                                        value={sku} 
                                        onChange={e => setSku(e.target.value)} 
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Part Number <span className="required">*</span></label>
                                    <input 
                                        type="text" 
                                        className="form-input" 
                                        required 
                                        placeholder="AP-54012"
                                        value={partNumber} 
                                        onChange={e => setPartNumber(e.target.value)} 
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Product Architecture</label>
                                    <select 
                                        className="form-select"
                                        value={productType}
                                        onChange={e => setProductType(e.target.value)}
                                    >
                                        <option value="simple">Simple Product (Single Part)</option>
                                        <option value="variable">Variable Product (Multiple Sizes/Specs)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Short Summary Description</label>
                                <textarea 
                                    className="form-textarea" 
                                    placeholder="Brief highlight of part engineering..."
                                    value={shortDescription}
                                    onChange={e => setShortDescription(e.target.value)}
                                    style={{ minHeight: '60px' }}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Full Technical Description</label>
                                <textarea 
                                    className="form-textarea" 
                                    placeholder="Full technical copy, metallurgy, dyno notes..."
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    style={{ minHeight: '120px' }}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Engineering Specs (Table format)</label>
                                <textarea 
                                    className="form-textarea" 
                                    placeholder="e.g. Material: G3000 Alloy | Finish: Zinc Plated"
                                    value={techSpecs}
                                    onChange={e => setTechSpecs(e.target.value)}
                                    style={{ minHeight: '80px' }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                                    <input type="checkbox" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} />
                                    <span>Featured Product</span>
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                                    <input type="checkbox" checked={isBestSeller} onChange={e => setIsBestSeller(e.target.checked)} />
                                    <span>Best Seller</span>
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                                    <input type="checkbox" checked={isNewArrival} onChange={e => setIsNewArrival(e.target.checked)} />
                                    <span>New Arrival</span>
                                </label>
                            </div>
                        </div>
                    )}

                    {/* SECTION 2: Images */}
                    {activeTab === 'images' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div className="form-group">
                                <label className="form-label">Main Image URL / Asset Path</label>
                                <input 
                                    type="text" 
                                    className="form-input" 
                                    placeholder="https://... or /images/products/brake.jpg"
                                    value={mainImage} 
                                    onChange={e => setMainImage(e.target.value)} 
                                />
                                {mainImage && (
                                    <img 
                                        src={mainImage} 
                                        alt="Preview" 
                                        style={{ width: '120px', height: '120px', objectFit: 'cover', marginTop: '10px', borderRadius: '4px', border: '1px solid #DDD' }} 
                                    />
                                )}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Additional Gallery Angles</label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <input 
                                        type="text" 
                                        className="form-input" 
                                        placeholder="Add photo URL..."
                                        value={newGalleryUrl} 
                                        onChange={e => setNewGalleryUrl(e.target.value)} 
                                    />
                                    <button type="button" className="btn btn-outline" onClick={handleAddGalleryImage}>
                                        <Plus size={16} /> Add Image
                                    </button>
                                </div>

                                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '12px' }}>
                                    {galleryImages.map((img, idx) => (
                                        <div key={idx} style={{ position: 'relative', width: '100px', height: '100px', borderRadius: '4px', overflow: 'hidden', border: '1px solid #DDD' }}>
                                            <img src={img} alt={`Gallery ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            <button 
                                                type="button" 
                                                onClick={() => handleRemoveGalleryImage(idx)}
                                                style={{ position: 'absolute', top: '4px', right: '4px', backgroundColor: 'rgba(217, 48, 37, 0.9)', color: '#FFF', width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none' }}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SECTION 3: Pricing */}
                    {activeTab === 'pricing' && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                            <div className="form-group">
                                <label className="form-label">Base Retail Price (₹) <span className="required">*</span></label>
                                <input 
                                    type="number" 
                                    step="0.01" 
                                    className="form-input" 
                                    required 
                                    value={basePrice} 
                                    onChange={e => setBasePrice(e.target.value)} 
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Special Sale Price (₹ Optional)</label>
                                <input 
                                    type="number" 
                                    step="0.01" 
                                    className="form-input" 
                                    value={salePrice} 
                                    onChange={e => setSalePrice(e.target.value)} 
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Cost Price (₹ For internal profit calculation)</label>
                                <input 
                                    type="number" 
                                    step="0.01" 
                                    className="form-input" 
                                    value={costPrice} 
                                    onChange={e => setCostPrice(e.target.value)} 
                                />
                            </div>
                        </div>
                    )}

                    {/* SECTION 4: Inventory */}
                    {activeTab === 'inventory' && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                            <div className="form-group">
                                <label className="form-label">Depot Stock Quantity</label>
                                <input 
                                    type="number" 
                                    className="form-input" 
                                    value={stockQuantity} 
                                    onChange={e => setStockQuantity(e.target.value)} 
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Stock Status</label>
                                <select 
                                    className="form-select"
                                    value={stockStatus}
                                    onChange={e => setStockStatus(e.target.value)}
                                >
                                    <option value="in_stock">In Stock</option>
                                    <option value="out_of_stock">Out of Stock</option>
                                    <option value="on_backorder">On Backorder</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Weight (kg)</label>
                                <input 
                                    type="number" 
                                    step="0.01" 
                                    className="form-input" 
                                    value={weight} 
                                    onChange={e => setWeight(e.target.value)} 
                                />
                            </div>
                        </div>
                    )}

                    {/* SECTION 5: Categories & Brand */}
                    {activeTab === 'categories' && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
                            <div className="form-group">
                                <label className="form-label">Primary Category</label>
                                <select 
                                    className="form-select"
                                    value={categoryId}
                                    onChange={e => setCategoryId(e.target.value)}
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Manufacturer Brand</label>
                                <select 
                                    className="form-select"
                                    value={brandId}
                                    onChange={e => setBrandId(e.target.value)}
                                >
                                    <option value="">Select Brand</option>
                                    {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                </select>
                            </div>
                        </div>
                    )}

                    {/* SECTION 6: Attributes */}
                    {activeTab === 'attributes' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <p style={{ fontSize: '13px', color: '#666' }}>
                                Select the mechanical attributes that apply to this automotive component:
                            </p>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                                {attributes.map(attr => (
                                    <label key={attr.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', border: '1px solid #DCDCDC', borderRadius: '4px', cursor: 'pointer' }}>
                                        <input 
                                            type="checkbox" 
                                            checked={selectedAttributes.includes(attr.id)}
                                            onChange={(e) => {
                                                if (e.target.checked) setSelectedAttributes([...selectedAttributes, attr.id]);
                                                else setSelectedAttributes(selectedAttributes.filter(id => id !== attr.id));
                                            }}
                                        />
                                        <span><strong>{attr.name}</strong> ({attr.slug})</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* SECTION 7: Variations */}
                    {activeTab === 'variations' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '4px', border: '1px solid #DCDCDC' }}>
                                <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>Add Variation Specification</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                                    <input type="text" className="form-input" placeholder="Name (e.g. 355mm Front)" value={newVarName} onChange={e => setNewVarName(e.target.value)} />
                                    <input type="text" className="form-input" placeholder="SKU" value={newVarSku} onChange={e => setNewVarSku(e.target.value)} />
                                    <input type="text" className="form-input" placeholder="Part Number" value={newVarPart} onChange={e => setNewVarPart(e.target.value)} />
                                    <input type="number" step="0.01" className="form-input" placeholder="Price (₹)" value={newVarPrice} onChange={e => setNewVarPrice(e.target.value)} />
                                    <input type="number" className="form-input" placeholder="Stock" value={newVarStock} onChange={e => setNewVarStock(e.target.value)} />
                                </div>
                                <button type="button" className="btn btn-dark btn-sm" style={{ marginTop: '12px' }} onClick={handleAddVariation}>
                                    <Plus size={14} /> Add Variation Row
                                </button>
                            </div>

                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Variation Name</th>
                                        <th>SKU</th>
                                        <th>Part #</th>
                                        <th>Price</th>
                                        <th>Stock</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {variationsList.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" style={{ textAlign: 'center', color: '#888', padding: '20px' }}>
                                                No variations created yet.
                                            </td>
                                        </tr>
                                    ) : (
                                        variationsList.map((v, i) => (
                                            <tr key={i}>
                                                <td><strong>{v.name}</strong></td>
                                                <td>{v.sku}</td>
                                                <td>{v.part_number}</td>
                                                <td>₹{Number(v.price).toLocaleString('en-IN')}</td>
                                                <td>{v.stock_quantity}</td>
                                                <td>
                                                    <button type="button" onClick={() => handleRemoveVariation(i)} style={{ color: '#D93025', background: 'none', border: 'none' }}>
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* SECTION 8: Vehicle Fitment */}
                    {activeTab === 'fitment' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <p style={{ fontSize: '13px', color: '#666' }}>
                                Select vehicles verified compatible with this spare part:
                            </p>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px', maxHeight: '300px', overflowY: 'auto' }}>
                                {vehicles.map(v => (
                                    <label key={v.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', border: '1px solid #EEE', borderRadius: '4px', cursor: 'pointer' }}>
                                        <input 
                                            type="checkbox" 
                                            checked={selectedVehicleIds.includes(v.id)}
                                            onChange={(e) => {
                                                if (e.target.checked) setSelectedVehicleIds([...selectedVehicleIds, v.id]);
                                                else setSelectedVehicleIds(selectedVehicleIds.filter(id => id !== v.id));
                                            }}
                                        />
                                        <span style={{ fontSize: '12px' }}>
                                            <strong>{v.year} {v.make} {v.model}</strong> ({v.engine})
                                        </span>
                                    </label>
                                ))}
                            </div>
                            <div className="form-group" style={{ marginTop: '12px' }}>
                                <label className="form-label">Fitment Notes / Requirements (e.g. Front axle only, 18-inch wheels required)</label>
                                <input type="text" className="form-input" value={fitmentNotes} onChange={e => setFitmentNotes(e.target.value)} />
                            </div>
                        </div>
                    )}

                    {/* SECTION 9: Tax */}
                    {activeTab === 'tax' && (
                        <div className="form-group">
                            <label className="form-label">Applicable GST Tax Class</label>
                            <select 
                                className="form-select"
                                value={taxClassId}
                                onChange={e => setTaxClassId(e.target.value)}
                            >
                                <option value="">Default GST (18%)</option>
                                {taxClasses.map(t => (
                                    <option key={t.id} value={t.id}>{t.name} ({t.slug})</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* SECTION 10: SEO */}
                    {activeTab === 'seo' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div className="form-group">
                                <label className="form-label">SEO Meta Title</label>
                                <input type="text" className="form-input" placeholder="e.g. Brembo Slotted Brake Rotors | Autos Parts" value={seoTitle} onChange={e => setSeoTitle(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">SEO Meta Description</label>
                                <textarea className="form-textarea" placeholder="Google search summary..." value={seoDescription} onChange={e => setSeoDescription(e.target.value)} style={{ minHeight: '80px' }} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </form>
    );
}
