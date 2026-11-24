import React, { useState, useMemo } from 'react';
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
    Trash2,
    ChevronDown,
    ChevronUp,
    Wand2,
    X
} from 'lucide-react';

const slugify = (text) =>
    String(text || '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

const buildAttributeSignature = (attributesJson = {}) =>
    Object.keys(attributesJson || {})
        .sort()
        .map((k) => `${k}:${String(attributesJson[k] ?? '').trim().toLowerCase()}`)
        .join('|');

const cartesianProduct = (arrays) => {
    if (!arrays.length) return [];
    return arrays.reduce(
        (acc, curr) => acc.flatMap((prev) => curr.map((item) => [...prev, item])),
        [[]]
    );
};

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

    // 6. WooCommerce-style Inline Attributes
    const [productAttributes, setProductAttributes] = useState(() => {
        if (Array.isArray(product?.product_attributes) && product.product_attributes.length > 0) {
            return product.product_attributes.map((pa, idx) => ({
                key: `pa_${pa.id || slugify(pa.name) || idx}_${idx}`,
                id: pa.id || null,
                name: pa.name || '',
                slug: pa.slug || slugify(pa.name),
                values: Array.isArray(pa.values) ? pa.values : [],
                used_for_variations: Boolean(pa.used_for_variations),
                expanded: idx === 0,
            }));
        }
        return [];
    });
    const [selectedGlobalAttrId, setSelectedGlobalAttrId] = useState('');
    const [valueDrafts, setValueDrafts] = useState({});

    // 7. WooCommerce-style Variations
    const [variationsList, setVariationsList] = useState(() =>
        Array.isArray(product?.variations)
            ? product.variations.map((v, idx) => ({
                  ...v,
                  attributes_json: v.attributes_json && typeof v.attributes_json === 'object' ? v.attributes_json : {},
                  is_default: Boolean(v.is_default),
                  expanded: idx === 0 && product.variations.length === 1,
              }))
            : []
    );
    const [variationNotice, setVariationNotice] = useState('');

    // 8. Vehicle Fitment
    const [selectedVehicleIds, setSelectedVehicleIds] = useState(
        product?.vehicle_ids || product?.product_vehicles?.map((pv) => pv.vehicle_id) || []
    );
    const [fitmentNotes, setFitmentNotes] = useState(
        product?.fitment_notes || product?.product_vehicles?.[0]?.notes || ''
    );

    // 9. Tax
    const [taxClassId, setTaxClassId] = useState(product?.tax_class_id || '');

    // 10. SEO
    const [seoTitle, setSeoTitle] = useState(product?.seo_title || '');
    const [seoDescription, setSeoDescription] = useState(product?.seo_description || '');

    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    const globalAttributesById = useMemo(() => {
        const map = {};
        attributes.forEach((a) => {
            map[String(a.id)] = a;
        });
        return map;
    }, [attributes]);

    const availableGlobalAttributes = useMemo(() => {
        const usedIds = new Set(productAttributes.filter((a) => a.id).map((a) => String(a.id)));
        const usedSlugs = new Set(productAttributes.map((a) => a.slug || slugify(a.name)));
        return attributes.filter(
            (a) => !usedIds.has(String(a.id)) && !usedSlugs.has(a.slug)
        );
    }, [attributes, productAttributes]);

    const variationAttributes = useMemo(
        () =>
            productAttributes
                .filter((a) => a.used_for_variations && a.name.trim() !== '')
                .map((a) => ({
                    ...a,
                    slug: a.slug || slugify(a.name),
                })),
        [productAttributes]
    );

    const handleAddGalleryImage = () => {
        if (newGalleryUrl.trim()) {
            setGalleryImages([...galleryImages, newGalleryUrl.trim()]);
            setNewGalleryUrl('');
        }
    };

    const handleRemoveGalleryImage = (index) => {
        setGalleryImages(galleryImages.filter((_, i) => i !== index));
    };

    // Attribute handlers (WooCommerce-style)
    const handleAddExistingAttribute = () => {
        if (!selectedGlobalAttrId) return;
        const globalAttr = globalAttributesById[String(selectedGlobalAttrId)];
        if (!globalAttr) return;

        const nextAttr = {
            key: `pa_global_${globalAttr.id}_${Date.now()}`,
            id: globalAttr.id,
            name: globalAttr.name,
            slug: globalAttr.slug,
            values: (globalAttr.values || []).map((v) => v.value),
            used_for_variations: productType === 'variable',
            expanded: true,
        };

        setProductAttributes((prev) =>
            prev.map((a) => ({ ...a, expanded: false })).concat(nextAttr)
        );
        setSelectedGlobalAttrId('');
    };

    const handleAddCustomAttribute = () => {
        const nextAttr = {
            key: `pa_custom_${Date.now()}`,
            id: null,
            name: '',
            slug: '',
            values: [],
            used_for_variations: productType === 'variable',
            expanded: true,
        };
        setProductAttributes((prev) =>
            prev.map((a) => ({ ...a, expanded: false })).concat(nextAttr)
        );
    };

    const updateAttrField = (key, patch) => {
        setProductAttributes((prev) =>
            prev.map((attr) => {
                if (attr.key !== key) return attr;
                const updated = { ...attr, ...patch };
                if ('name' in patch && !attr.id) {
                    updated.slug = slugify(patch.name);
                }
                return updated;
            })
        );
    };

    const handleAddAttributeValues = (key) => {
        const raw = (valueDrafts[key] || '').trim();
        if (!raw) return;
        const parts = raw
            .split('|')
            .map((p) => p.trim())
            .filter(Boolean);
        if (!parts.length) return;

        setProductAttributes((prev) =>
            prev.map((attr) => {
                if (attr.key !== key) return attr;
                const merged = [...attr.values];
                parts.forEach((p) => {
                    if (!merged.some((existing) => existing.toLowerCase() === p.toLowerCase())) {
                        merged.push(p);
                    }
                });
                return { ...attr, values: merged };
            })
        );
        setValueDrafts((prev) => ({ ...prev, [key]: '' }));
    };

    const handleToggleGlobalValue = (key, valueLabel) => {
        setProductAttributes((prev) =>
            prev.map((attr) => {
                if (attr.key !== key) return attr;
                const exists = attr.values.some(
                    (existing) => existing.toLowerCase() === valueLabel.toLowerCase()
                );
                return {
                    ...attr,
                    values: exists
                        ? attr.values.filter((v) => v.toLowerCase() !== valueLabel.toLowerCase())
                        : [...attr.values, valueLabel],
                };
            })
        );
    };

    const handleRemoveAttributeValue = (key, valueLabel) => {
        setProductAttributes((prev) =>
            prev.map((attr) =>
                attr.key === key
                    ? { ...attr, values: attr.values.filter((v) => v !== valueLabel) }
                    : attr
            )
        );
    };

    const handleRemoveAttribute = (key) => {
        setProductAttributes((prev) => prev.filter((attr) => attr.key !== key));
    };

    // Variation handlers (WooCommerce-style)
    const handleGenerateVariationsFromAttributes = () => {
        const eligible = variationAttributes.filter((a) => a.values.length > 0 && a.slug);
        if (!eligible.length) {
            setVariationNotice(
                'Add at least one attribute with values and check "Used for variations" in the Attributes tab first.'
            );
            return;
        }

        const combos = cartesianProduct(
            eligible.map((a) => a.values.map((val) => ({ slug: a.slug, value: val })))
        );

        const existingSignatures = new Set(
            variationsList.map((v) => buildAttributeSignature(v.attributes_json))
        );

        const baseSku = (sku || 'PART').trim();
        const basePart = (partNumber || 'PN').trim();
        const defaultPrice = basePrice || '0';
        const defaultSale = salePrice || '';

        const added = [];
        combos.forEach((combo, idx) => {
            const attrJson = {};
            const labels = [];
            combo.forEach((pair) => {
                attrJson[pair.slug] = pair.value;
                labels.push(pair.value);
            });

            const sig = buildAttributeSignature(attrJson);
            if (existingSignatures.has(sig)) {
                return;
            }
            existingSignatures.add(sig);

            const suffix = variationsList.length + added.length + 1;
            const codeHint = labels
                .map((l) => slugify(l).toUpperCase().slice(0, 6))
                .filter(Boolean)
                .join('-');

            added.push({
                id: `temp_${Date.now()}_${idx}`,
                name: labels.join(' / '),
                sku: `${baseSku}-${codeHint || `V${suffix}`}`,
                part_number: `${basePart}-${suffix}`,
                attributes_json: attrJson,
                price: defaultPrice,
                sale_price: defaultSale,
                stock_quantity: 10,
                stock_status: 'in_stock',
                image: '',
                weight: weight || '',
                is_default: variationsList.length === 0 && added.length === 0,
                expanded: false,
            });
        });

        if (added.length > 0) {
            setVariationsList((prev) => [...prev, ...added]);
            setVariationNotice(`Generated ${added.length} new variation(s) from product attributes.`);
        } else {
            setVariationNotice('All attribute combinations already exist in variations.');
        }
    };

    const handleAddManualVariation = () => {
        const idx = variationsList.length + 1;
        const defaultAttrJson = {};
        variationAttributes.forEach((a) => {
            if (a.values.length > 0) {
                defaultAttrJson[a.slug] = a.values[0];
            }
        });
        const label = Object.values(defaultAttrJson).join(' / ');

        setVariationsList((prev) => [
            ...prev.map((v) => ({ ...v, expanded: false })),
            {
                id: `temp_${Date.now()}`,
                name: label || `Variation #${idx}`,
                sku: `${(sku || 'PART').trim()}-V${idx}`,
                part_number: `${(partNumber || 'PN').trim()}-V${idx}`,
                attributes_json: defaultAttrJson,
                price: basePrice || '',
                sale_price: salePrice || '',
                stock_quantity: 10,
                stock_status: 'in_stock',
                image: '',
                weight: weight || '',
                is_default: prev.length === 0,
                expanded: true,
            },
        ]);
        setVariationNotice('');
    };

    const updateVariationField = (index, patch) => {
        setVariationsList((prev) =>
            prev.map((v, i) => {
                if (i === index) {
                    return { ...v, ...patch };
                }
                if (patch.is_default) {
                    return { ...v, is_default: false };
                }
                return v;
            })
        );
    };

    const updateVariationAttrSelection = (index, attrSlug, valueLabel) => {
        setVariationsList((prev) =>
            prev.map((v, i) => {
                if (i !== index) return v;
                const nextJson = { ...(v.attributes_json || {}) };
                if (valueLabel) {
                    nextJson[attrSlug] = valueLabel;
                } else {
                    delete nextJson[attrSlug];
                }
                const derivedName = Object.values(nextJson).filter(Boolean).join(' / ');
                return {
                    ...v,
                    attributes_json: nextJson,
                    name: derivedName || v.name,
                };
            })
        );
    };

    const handleRemoveVariation = (index) => {
        setVariationsList((prev) => prev.filter((_, i) => i !== index));
    };

    const allVariationsExpanded =
        variationsList.length > 0 && variationsList.every((v) => Boolean(v.expanded));

    const handleToggleExpandAllVariations = () => {
        const nextState = !allVariationsExpanded;
        setVariationsList((prev) => prev.map((v) => ({ ...v, expanded: nextState })));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitting(true);
        setErrors({});

        const cleanAttributes = productAttributes
            .filter((a) => a.name.trim() !== '')
            .map((a) => ({
                id: a.id || null,
                name: a.name.trim(),
                slug: a.slug || slugify(a.name),
                values: a.values,
                used_for_variations: Boolean(a.used_for_variations),
            }));

        const cleanVariations = variationsList.map((v) => ({
            id: typeof v.id === 'number' ? v.id : null,
            name: v.name,
            sku: v.sku,
            part_number: v.part_number,
            attributes_json: v.attributes_json || {},
            price: v.price,
            sale_price: v.sale_price || null,
            stock_quantity: parseInt(v.stock_quantity, 10) || 0,
            stock_status: v.stock_status || 'in_stock',
            image: v.image || null,
            weight: v.weight || null,
            is_default: Boolean(v.is_default),
        }));

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
            stock_quantity: parseInt(stockQuantity, 10) || 0,
            stock_status: stockStatus,
            weight: weight || null,
            weight_unit: weightUnit,
            category_id: categoryId || null,
            brand_id: brandId || null,
            tax_class_id: taxClassId || null,
            attributes: cleanAttributes.map((a) => a.id).filter(Boolean),
            product_attributes: cleanAttributes,
            variations: cleanVariations,
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
        { id: 'general', label: 'General', icon: Info },
        { id: 'pricing', label: 'Pricing', icon: DollarSign },
        { id: 'inventory', label: 'Inventory', icon: Boxes },
        { id: 'images', label: 'Images & Media', icon: Image },
        { id: 'categories', label: 'Category & Brand', icon: Layers },
        { id: 'attributes', label: 'Attributes', icon: Sliders, count: productAttributes.length },
        { id: 'variations', label: 'Variations', icon: GitMerge, count: productType === 'variable' ? variationsList.length : null },
        { id: 'fitment', label: 'Vehicle Fitment', icon: Car, count: selectedVehicleIds.length || null },
        { id: 'tax', label: 'GST & Tax', icon: Receipt },
        { id: 'seo', label: 'SEO Metadata', icon: Search },
    ];

    return (
        <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
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

            {/* WordPress / WooCommerce-style Product Data Metabox */}
            <div className="wc-product-data">
                <div className="wc-product-data-header">
                    <div className="wc-title-group">
                        <h3>Product Data —</h3>
                        <select
                            className="form-select"
                            style={{ width: 'auto', padding: '6px 12px', fontSize: '13px', fontWeight: 700 }}
                            value={productType}
                            onChange={(e) => setProductType(e.target.value)}
                            aria-label="Product Type"
                        >
                            <option value="simple">Simple Product (Single Part)</option>
                            <option value="variable">Variable Product (With Attributes &amp; Variations)</option>
                        </select>
                    </div>

                    <div className="wc-status-group">
                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B' }}>Visibility Status:</span>
                        <select
                            className="form-select"
                            style={{ width: 'auto', padding: '6px 12px', fontSize: '13px' }}
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            aria-label="Product Status"
                        >
                            <option value="published">Published</option>
                            <option value="draft">Draft</option>
                            <option value="archived">Archived</option>
                        </select>
                    </div>
                </div>

                <div className="wc-product-data-layout">
                    {/* Left Vertical Tabs */}
                    <div className="wc-product-data-tabs" role="tablist">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    role="tab"
                                    aria-selected={activeTab === tab.id}
                                    className={activeTab === tab.id ? 'active' : ''}
                                    onClick={() => setActiveTab(tab.id)}
                                >
                                    <span className="wc-tab-label">
                                        <Icon size={15} />
                                        <span>{tab.label}</span>
                                    </span>
                                    {typeof tab.count === 'number' && tab.count > 0 && (
                                        <span className="wc-tab-count">{tab.count}</span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Right Active Panel */}
                    <div className="wc-product-data-panel">
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
                                        onChange={(e) => setName(e.target.value)}
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
                                            onChange={(e) => setSku(e.target.value)}
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
                                            onChange={(e) => setPartNumber(e.target.value)}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">URL Slug (Optional)</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="Auto-generated if left blank"
                                            value={slug}
                                            onChange={(e) => setSlug(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Short Summary Description</label>
                                    <textarea
                                        className="form-textarea"
                                        placeholder="Brief highlight of part engineering..."
                                        value={shortDescription}
                                        onChange={(e) => setShortDescription(e.target.value)}
                                        style={{ minHeight: '60px' }}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Full Technical Description</label>
                                    <textarea
                                        className="form-textarea"
                                        placeholder="Full technical copy, metallurgy, dyno notes..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        style={{ minHeight: '120px' }}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Engineering Specs (Table format)</label>
                                    <textarea
                                        className="form-textarea"
                                        placeholder="e.g. Material: G3000 Alloy | Finish: Zinc Plated"
                                        value={techSpecs}
                                        onChange={(e) => setTechSpecs(e.target.value)}
                                        style={{ minHeight: '80px' }}
                                    />
                                </div>

                                <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                                        <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
                                        <span>Featured Product</span>
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                                        <input type="checkbox" checked={isBestSeller} onChange={(e) => setIsBestSeller(e.target.checked)} />
                                        <span>Best Seller</span>
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                                        <input type="checkbox" checked={isNewArrival} onChange={(e) => setIsNewArrival(e.target.checked)} />
                                        <span>New Arrival</span>
                                    </label>
                                </div>
                            </div>
                        )}

                        {/* SECTION 2: Pricing */}
                        {activeTab === 'pricing' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {productType === 'variable' && (
                                    <div style={{ backgroundColor: '#FFF7ED', border: '1px solid #FDBA74', padding: '10px 14px', borderRadius: '4px', fontSize: '12px', color: '#9A3412' }}>
                                        Base pricing serves as the default for newly generated variations. You can override individual prices in the <strong>Variations</strong> tab.
                                    </div>
                                )}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                                    <div className="form-group">
                                        <label className="form-label">Base Retail Price (₹) <span className="required">*</span></label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="form-input"
                                            required
                                            value={basePrice}
                                            onChange={(e) => setBasePrice(e.target.value)}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Special Sale Price (₹ Optional)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="form-input"
                                            value={salePrice}
                                            onChange={(e) => setSalePrice(e.target.value)}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Cost Price (₹ Internal)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="form-input"
                                            value={costPrice}
                                            onChange={(e) => setCostPrice(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* SECTION 3: Inventory */}
                        {activeTab === 'inventory' && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                                <div className="form-group">
                                    <label className="form-label">Catalogue Stock Quantity</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={stockQuantity}
                                        onChange={(e) => setStockQuantity(e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Stock Status</label>
                                    <select
                                        className="form-select"
                                        value={stockStatus}
                                        onChange={(e) => setStockStatus(e.target.value)}
                                    >
                                        <option value="in_stock">In Stock</option>
                                        <option value="out_of_stock">Out of Stock</option>
                                        <option value="on_backorder">On Backorder</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Weight ({weightUnit})</label>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="form-input"
                                            value={weight}
                                            onChange={(e) => setWeight(e.target.value)}
                                        />
                                        <select
                                            className="form-select"
                                            style={{ width: '90px' }}
                                            value={weightUnit}
                                            onChange={(e) => setWeightUnit(e.target.value)}
                                        >
                                            <option value="kg">kg</option>
                                            <option value="g">g</option>
                                            <option value="lbs">lbs</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* SECTION 4: Images */}
                        {activeTab === 'images' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div className="form-group">
                                    <label className="form-label">Main Image URL / Asset Path</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="https://... or /images/products/brake.jpg"
                                        value={mainImage}
                                        onChange={(e) => setMainImage(e.target.value)}
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
                                            onChange={(e) => setNewGalleryUrl(e.target.value)}
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

                        {/* SECTION 5: Categories & Brand */}
                        {activeTab === 'categories' && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
                                <div className="form-group">
                                    <label className="form-label">Primary Category</label>
                                    <select
                                        className="form-select"
                                        value={categoryId}
                                        onChange={(e) => setCategoryId(e.target.value)}
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Manufacturer Brand</label>
                                    <select
                                        className="form-select"
                                        value={brandId}
                                        onChange={(e) => setBrandId(e.target.value)}
                                    >
                                        <option value="">Select Brand</option>
                                        {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* SECTION 6: WordPress / WooCommerce-style Inline Attributes */}
                        {activeTab === 'attributes' && (
                            <div>
                                <div className="wc-toolbar">
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                                        <select
                                            className="form-select"
                                            style={{ width: 'auto', minWidth: '220px' }}
                                            value={selectedGlobalAttrId}
                                            onChange={(e) => setSelectedGlobalAttrId(e.target.value)}
                                        >
                                            <option value="">Choose existing attribute...</option>
                                            {availableGlobalAttributes.map((attr) => (
                                                <option key={attr.id} value={attr.id}>
                                                    {attr.name} ({attr.values?.length || 0} values)
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            type="button"
                                            className="btn btn-dark btn-sm"
                                            disabled={!selectedGlobalAttrId}
                                            onClick={handleAddExistingAttribute}
                                        >
                                            <Plus size={14} /> Add Attribute
                                        </button>
                                    </div>

                                    <button
                                        type="button"
                                        className="btn btn-outline btn-sm"
                                        onClick={handleAddCustomAttribute}
                                    >
                                        <Plus size={14} /> Add Custom Attribute
                                    </button>
                                </div>

                                {productAttributes.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '32px 16px', border: '1px dashed #CBD5E1', borderRadius: '4px', color: '#64748B', fontSize: '13px' }}>
                                        No attributes attached to this product yet. Select an existing attribute or click <strong>Add Custom Attribute</strong> above (just like WordPress / WooCommerce).
                                    </div>
                                ) : (
                                    <div className="wc-accordion-list">
                                        {productAttributes.map((attr) => {
                                            const globalDef = attr.id ? globalAttributesById[String(attr.id)] : null;
                                            const globalValues = globalDef?.values || [];

                                            return (
                                                <div key={attr.key} className="wc-accordion-item">
                                                    <div className={`wc-accordion-header ${attr.expanded ? 'wc-accordion-header--open' : ''}`}>
                                                        <div
                                                            style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, cursor: 'pointer' }}
                                                            onClick={() => updateAttrField(attr.key, { expanded: !attr.expanded })}
                                                        >
                                                            <strong>{attr.name || 'New Custom Attribute'}</strong>
                                                            {attr.id ? (
                                                                <span className="badge badge-neutral" style={{ fontSize: '10px' }}>Global: {attr.slug}</span>
                                                            ) : (
                                                                <span className="badge badge-warning" style={{ fontSize: '10px' }}>Custom</span>
                                                            )}
                                                            <span style={{ fontSize: '12px', color: '#64748B' }}>
                                                                {attr.values.length} value{attr.values.length === 1 ? '' : 's'}
                                                            </span>
                                                            {attr.used_for_variations && (
                                                                <span className="badge badge-success" style={{ fontSize: '10px' }}>Used for variations</span>
                                                            )}
                                                        </div>

                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <button
                                                                type="button"
                                                                className="btn btn-outline btn-sm"
                                                                onClick={() => updateAttrField(attr.key, { expanded: !attr.expanded })}
                                                            >
                                                                {attr.expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="btn btn-outline btn-sm"
                                                                style={{ color: '#D93025' }}
                                                                onClick={() => handleRemoveAttribute(attr.key)}
                                                            >
                                                                Remove
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {attr.expanded && (
                                                        <div className="wc-accordion-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                                <div className="form-group">
                                                                    <label className="form-label">Attribute Name</label>
                                                                    <input
                                                                        type="text"
                                                                        className="form-input"
                                                                        placeholder="e.g. Rotor Diameter, Tire Size, Finish"
                                                                        value={attr.name}
                                                                        readOnly={Boolean(attr.id)}
                                                                        onChange={(e) => updateAttrField(attr.key, { name: e.target.value })}
                                                                    />
                                                                </div>

                                                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={attr.used_for_variations}
                                                                        onChange={(e) => {
                                                                            const checked = e.target.checked;
                                                                            updateAttrField(attr.key, { used_for_variations: checked });
                                                                            if (checked && productType !== 'variable') {
                                                                                setProductType('variable');
                                                                            }
                                                                        }}
                                                                    />
                                                                    <span>Used for variations</span>
                                                                </label>
                                                            </div>

                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                    <label className="form-label" style={{ marginBottom: 0 }}>Value(s):</label>
                                                                    {globalValues.length > 0 && (
                                                                        <div style={{ display: 'flex', gap: '10px', fontSize: '11px' }}>
                                                                            <button
                                                                                type="button"
                                                                                style={{ color: '#F36B16', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}
                                                                                onClick={() => updateAttrField(attr.key, { values: globalValues.map((gv) => gv.value) })}
                                                                            >
                                                                                Select all
                                                                            </button>
                                                                            <button
                                                                                type="button"
                                                                                style={{ color: '#64748B', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
                                                                                onClick={() => updateAttrField(attr.key, { values: [] })}
                                                                            >
                                                                                Select none
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {globalValues.length > 0 && (
                                                                    <div className="wc-chips-wrap">
                                                                        {globalValues.map((gv) => {
                                                                            const isSelected = attr.values.some(
                                                                                (v) => v.toLowerCase() === gv.value.toLowerCase()
                                                                            );
                                                                            return (
                                                                                <button
                                                                                    key={gv.id}
                                                                                    type="button"
                                                                                    className={`wc-value-chip ${isSelected ? '' : 'wc-value-chip--available'}`}
                                                                                    onClick={() => handleToggleGlobalValue(attr.key, gv.value)}
                                                                                >
                                                                                    <span>{isSelected ? '✓' : '+'} {gv.value}</span>
                                                                                </button>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                )}

                                                                {attr.values.length > 0 && (
                                                                    <div className="wc-chips-wrap">
                                                                        {attr.values.map((val) => (
                                                                            <span key={val} className="wc-value-chip">
                                                                                <span>{val}</span>
                                                                                <button
                                                                                    type="button"
                                                                                    aria-label={`Remove ${val}`}
                                                                                    onClick={() => handleRemoveAttributeValue(attr.key, val)}
                                                                                >
                                                                                    <X size={12} />
                                                                                </button>
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                )}

                                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                                    <input
                                                                        type="text"
                                                                        className="form-input"
                                                                        placeholder="Enter values separated by | (e.g. 330mm | 355mm)"
                                                                        value={valueDrafts[attr.key] || ''}
                                                                        onChange={(e) =>
                                                                            setValueDrafts((prev) => ({ ...prev, [attr.key]: e.target.value }))
                                                                        }
                                                                        onKeyDown={(e) => {
                                                                            if (e.key === 'Enter') {
                                                                                e.preventDefault();
                                                                                handleAddAttributeValues(attr.key);
                                                                            }
                                                                        }}
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-outline btn-sm"
                                                                        onClick={() => handleAddAttributeValues(attr.key)}
                                                                    >
                                                                        Add
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* SECTION 7: WordPress / WooCommerce-style Variations */}
                        {activeTab === 'variations' && (
                            <div>
                                {productType !== 'variable' ? (
                                    <div style={{ padding: '28px', backgroundColor: '#F8FAFC', border: '1px dashed #CBD5E1', borderRadius: '4px', textAlign: 'center' }}>
                                        <p style={{ fontSize: '14px', color: '#475569', marginBottom: '12px' }}>
                                            To create product variations (such as multiple Rotor Diameters or Tire Sizes), switch Product Data type to <strong>Variable Product</strong> and add attributes marked <em>"Used for variations"</em>.
                                        </p>
                                        <button
                                            type="button"
                                            className="btn btn-primary btn-sm"
                                            onClick={() => setProductType('variable')}
                                        >
                                            Switch to Variable Product
                                        </button>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="wc-toolbar">
                                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                <button
                                                    type="button"
                                                    className="btn btn-primary btn-sm"
                                                    onClick={handleGenerateVariationsFromAttributes}
                                                >
                                                    <Wand2 size={14} /> Generate variations from attributes
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-dark btn-sm"
                                                    onClick={handleAddManualVariation}
                                                >
                                                    <Plus size={14} /> Add Variation Manually
                                                </button>
                                            </div>

                                            {variationsList.length > 0 && (
                                                <button
                                                    type="button"
                                                    className="btn btn-outline btn-sm"
                                                    onClick={handleToggleExpandAllVariations}
                                                >
                                                    {allVariationsExpanded ? 'Collapse All' : 'Expand All'}
                                                </button>
                                            )}
                                        </div>

                                        {variationNotice && (
                                            <div style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', color: '#1E40AF', padding: '10px 14px', borderRadius: '4px', fontSize: '12px', marginBottom: '14px' }}>
                                                {variationNotice}
                                            </div>
                                        )}

                                        {variationsList.length === 0 ? (
                                            <div style={{ textAlign: 'center', padding: '32px 16px', border: '1px dashed #CBD5E1', borderRadius: '4px', color: '#64748B', fontSize: '13px' }}>
                                                No variations added yet. Add attributes with values in the <strong>Attributes</strong> tab and click <strong>Generate variations from attributes</strong>, or click <strong>Add Variation Manually</strong>.
                                            </div>
                                        ) : (
                                            <div className="wc-accordion-list">
                                                {variationsList.map((v, i) => (
                                                    <div key={v.id || i} className="wc-accordion-item">
                                                        <div className={`wc-accordion-header ${v.expanded ? 'wc-accordion-header--open' : ''}`}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', flex: 1 }}>
                                                                <span style={{ fontWeight: 800, fontSize: '12px', color: '#64748B' }}>#{i + 1}</span>
                                                                {variationAttributes.length > 0 ? (
                                                                    variationAttributes.map((va) => (
                                                                        <select
                                                                            key={va.key}
                                                                            className="form-select"
                                                                            style={{ width: 'auto', padding: '4px 8px', fontSize: '12px' }}
                                                                            value={(v.attributes_json && v.attributes_json[va.slug]) || ''}
                                                                            onChange={(e) => updateVariationAttrSelection(i, va.slug, e.target.value)}
                                                                        >
                                                                            <option value="">Any {va.name}</option>
                                                                            {va.values.map((val) => (
                                                                                <option key={val} value={val}>{val}</option>
                                                                            ))}
                                                                        </select>
                                                                    ))
                                                                ) : (
                                                                    <strong>{v.name}</strong>
                                                                )}
                                                                <span className="badge badge-neutral" style={{ fontSize: '11px' }}>
                                                                    ₹{Number(v.price || 0).toLocaleString('en-IN')}
                                                                </span>
                                                                <span className={`badge ${Number(v.stock_quantity) > 0 ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '11px' }}>
                                                                    {v.stock_quantity} in stock
                                                                </span>
                                                                {v.is_default && (
                                                                    <span className="badge badge-primary" style={{ fontSize: '10px' }}>Default</span>
                                                                )}
                                                            </div>

                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-outline btn-sm"
                                                                    onClick={() => updateVariationField(i, { expanded: !v.expanded })}
                                                                >
                                                                    {v.expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-outline btn-sm"
                                                                    style={{ color: '#D93025' }}
                                                                    onClick={() => handleRemoveVariation(i)}
                                                                >
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {v.expanded && (
                                                            <div className="wc-accordion-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                                                                    <div className="form-group">
                                                                        <label className="form-label">Variation Label</label>
                                                                        <input
                                                                            type="text"
                                                                            className="form-input"
                                                                            value={v.name || ''}
                                                                            onChange={(e) => updateVariationField(i, { name: e.target.value })}
                                                                        />
                                                                    </div>
                                                                    <div className="form-group">
                                                                        <label className="form-label">SKU</label>
                                                                        <input
                                                                            type="text"
                                                                            className="form-input"
                                                                            value={v.sku || ''}
                                                                            onChange={(e) => updateVariationField(i, { sku: e.target.value })}
                                                                        />
                                                                    </div>
                                                                    <div className="form-group">
                                                                        <label className="form-label">Part Number</label>
                                                                        <input
                                                                            type="text"
                                                                            className="form-input"
                                                                            value={v.part_number || ''}
                                                                            onChange={(e) => updateVariationField(i, { part_number: e.target.value })}
                                                                        />
                                                                    </div>
                                                                </div>

                                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                                                                    <div className="form-group">
                                                                        <label className="form-label">Regular Price (₹) <span className="required">*</span></label>
                                                                        <input
                                                                            type="number"
                                                                            step="0.01"
                                                                            className="form-input"
                                                                            value={v.price ?? ''}
                                                                            onChange={(e) => updateVariationField(i, { price: e.target.value })}
                                                                        />
                                                                    </div>
                                                                    <div className="form-group">
                                                                        <label className="form-label">Sale Price (₹ Optional)</label>
                                                                        <input
                                                                            type="number"
                                                                            step="0.01"
                                                                            className="form-input"
                                                                            value={v.sale_price ?? ''}
                                                                            onChange={(e) => updateVariationField(i, { sale_price: e.target.value })}
                                                                        />
                                                                    </div>
                                                                    <div className="form-group">
                                                                        <label className="form-label">Stock Quantity</label>
                                                                        <input
                                                                            type="number"
                                                                            className="form-input"
                                                                            value={v.stock_quantity ?? 0}
                                                                            onChange={(e) => updateVariationField(i, { stock_quantity: parseInt(e.target.value, 10) || 0 })}
                                                                        />
                                                                    </div>
                                                                    <div className="form-group">
                                                                        <label className="form-label">Stock Status</label>
                                                                        <select
                                                                            className="form-select"
                                                                            value={v.stock_status || 'in_stock'}
                                                                            onChange={(e) => updateVariationField(i, { stock_status: e.target.value })}
                                                                        >
                                                                            <option value="in_stock">In Stock</option>
                                                                            <option value="out_of_stock">Out of Stock</option>
                                                                            <option value="on_backorder">On Backorder</option>
                                                                        </select>
                                                                    </div>
                                                                </div>

                                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', alignItems: 'end' }}>
                                                                    <div className="form-group">
                                                                        <label className="form-label">Weight (kg)</label>
                                                                        <input
                                                                            type="number"
                                                                            step="0.01"
                                                                            className="form-input"
                                                                            value={v.weight ?? ''}
                                                                            onChange={(e) => updateVariationField(i, { weight: e.target.value })}
                                                                        />
                                                                    </div>
                                                                    <div className="form-group">
                                                                        <label className="form-label">Variation Image URL (Optional)</label>
                                                                        <input
                                                                            type="text"
                                                                            className="form-input"
                                                                            placeholder="/assets/images/products/..."
                                                                            value={v.image || ''}
                                                                            onChange={(e) => updateVariationField(i, { image: e.target.value })}
                                                                        />
                                                                    </div>
                                                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, paddingBottom: '8px', cursor: 'pointer' }}>
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={Boolean(v.is_default)}
                                                                            onChange={(e) => updateVariationField(i, { is_default: e.target.checked })}
                                                                        />
                                                                        <span>Default variation</span>
                                                                    </label>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* SECTION 8: Vehicle Fitment */}
                        {activeTab === 'fitment' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <p style={{ fontSize: '13px', color: '#666' }}>
                                    Select vehicles verified compatible with this spare part:
                                </p>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px', maxHeight: '300px', overflowY: 'auto' }}>
                                    {vehicles.map((v) => (
                                        <label key={v.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', border: '1px solid #EEE', borderRadius: '4px', cursor: 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                checked={selectedVehicleIds.includes(v.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) setSelectedVehicleIds([...selectedVehicleIds, v.id]);
                                                    else setSelectedVehicleIds(selectedVehicleIds.filter((id) => id !== v.id));
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
                                    <input type="text" className="form-input" value={fitmentNotes} onChange={(e) => setFitmentNotes(e.target.value)} />
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
                                    onChange={(e) => setTaxClassId(e.target.value)}
                                >
                                    <option value="">Default GST (18%)</option>
                                    {taxClasses.map((t) => (
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
                                    <input type="text" className="form-input" placeholder="e.g. Brembo Slotted Brake Rotors | Speed Autos Parts" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">SEO Meta Description</label>
                                    <textarea className="form-textarea" placeholder="Google search summary..." value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} style={{ minHeight: '80px' }} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </form>
    );
}
