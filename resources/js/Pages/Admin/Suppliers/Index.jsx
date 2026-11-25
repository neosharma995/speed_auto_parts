import React, { useEffect, useMemo, useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import AdminDataTable from '@/Components/Admin/AdminDataTable';
import { useCurrency } from '@/Context/CurrencyContext';
import {
    Plus,
    Edit,
    Trash2,
    X,
    CheckCircle2,
    Package,
    Truck,
    Inbox,
    History,
    Scale,
    Upload,
    Plug,
    FileText,
    ShieldCheck,
    XCircle,
    Download,
    RefreshCw,
    Star,
    Sliders,
    RotateCcw,
} from 'lucide-react';

const EMPTY_SUPPLIER_FORM = {
    name: '',
    company_name: '',
    email: '',
    phone: '',
    password: '',
    status: 'active',
    send_invitation: false,
    approval_status: 'approved',
    country_code: 'AE',
    country_name: 'United Arab Emirates',
    tax_id: '',
    registration_number: '',
    website: '',
    address: '',
    secondary_contact_name: '',
    secondary_contact_email: '',
    secondary_contact_phone: '',
    payment_terms: 'Net 30',
    default_discount_percent: '0',
    minimum_order_value: '0',
    currency_code: 'AED',
    commercial_conditions: '',
    shipping_methods: 'Express Air / UAE Courier',
    default_shipping_cost: '0',
    lead_time_days: '3',
    return_policy: '14-day return for unopened items',
    warranty_terms: '12-month manufacturer warranty',
    reliability_score: '90',
    priority_rank: '10',
    is_preferred: false,
    admin_notes: '',
};

export default function AdminSuppliersIndex({
    suppliers,
    allSuppliers = [],
    pendingLots = [],
    transfersCount = 0,
    activeTab: initialTab = 'suppliers',
    filters = {},
    offerComparisons = [],
    selectionRules = {},
    connectors = [],
    connectorDrivers = [],
    importLogs = [],
}) {
    const safeFilters = filters && !Array.isArray(filters) ? filters : {};
    const { errors, flash } = usePage().props;
    const { formatAdminPrice } = useCurrency();

    const validTabs = ['suppliers', 'incoming', 'offers', 'imports', 'connectors'];
    const [tab, setTab] = useState(validTabs.includes(initialTab) ? initialTab : 'suppliers');
    useEffect(() => {
        if (validTabs.includes(initialTab)) {
            setTab(initialTab);
        }
    }, [initialTab]);

    const handleSwitchTab = (nextTab) => {
        if (!validTabs.includes(nextTab)) return;
        setTab(nextTab);
        const url = new URL(window.location.href);
        url.searchParams.set('tab', nextTab);
        window.history.replaceState(window.history.state, '', url.toString());
    };

    const [search, setSearch] = useState(safeFilters.search || '');
    const [submitting, setSubmitting] = useState(false);

    // Supplier Create/Edit modal
    const [showModal, setShowModal] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState(null);
    const [supplierForm, setSupplierForm] = useState(EMPTY_SUPPLIER_FORM);

    // Supplier Documents modal
    const [docSupplier, setDocSupplier] = useState(null);
    const [docTitle, setDocTitle] = useState('');
    const [docType, setDocType] = useState('trade_license');
    const [docFile, setDocFile] = useState(null);
    const [docExpiresAt, setDocExpiresAt] = useState('');
    const [docNotes, setDocNotes] = useState('');

    // Reject single item or whole lot modal
    const [rejectTarget, setRejectTarget] = useState(null);
    const [rejectReason, setRejectReason] = useState('');

    // Auto-Selection Rules state
    const [rulesForm, setRulesForm] = useState({
        weight_price: selectionRules.weight_price ?? 35,
        weight_stock: selectionRules.weight_stock ?? 20,
        weight_delivery: selectionRules.weight_delivery ?? 15,
        weight_shipping: selectionRules.weight_shipping ?? 10,
        weight_reliability: selectionRules.weight_reliability ?? 12,
        weight_commercial: selectionRules.weight_commercial ?? 8,
        min_margin_percent: selectionRules.min_margin_percent ?? 15,
        require_in_stock: selectionRules.require_in_stock ?? true,
    });

    // Add Offer Modal
    const [showOfferModal, setShowOfferModal] = useState(false);
    const [offerForm, setOfferForm] = useState({
        product_id: offerComparisons[0]?.product?.id || '',
        supplier_id: allSuppliers[0]?.id || '',
        supplier_sku: '',
        purchase_price: '',
        currency_code: 'AED',
        stock_quantity: '25',
        preparation_days: '1',
        delivery_days: '2',
        shipping_cost: '20',
        commercial_discount_percent: '5',
        commercial_terms: 'Net 30',
        reliability_score: '',
    });
    const [offerSearch, setOfferSearch] = useState('');

    // Catalog Import Form
    const [importSupplierId, setImportSupplierId] = useState(allSuppliers[0]?.id || '');
    const [importFile, setImportFile] = useState(null);
    const [createMissingProducts, setCreateMissingProducts] = useState(false);

    // Connector Create Form
    const [connectorForm, setConnectorForm] = useState({
        supplier_id: allSuppliers[0]?.id || '',
        name: '',
        driver: 'mock_b2b',
        endpoint_url: '',
        auth_type: 'none',
        api_key: '',
        header_name: 'X-API-Key',
        token: '',
        username: '',
        password: '',
        sync_frequency: 'daily',
    });

    const groupedPendingLots = useMemo(() => {
        const groups = [];
        const map = {};
        pendingLots.forEach((lot) => {
            if (!map[lot.lot_number]) {
                map[lot.lot_number] = {
                    lot_number: lot.lot_number,
                    supplier: lot.supplier,
                    notes: lot.notes,
                    created_at: lot.created_at,
                    items: [],
                    total_qty: 0,
                    total_value: 0,
                };
                groups.push(map[lot.lot_number]);
            }
            const g = map[lot.lot_number];
            g.items.push(lot);
            g.total_qty += Number(lot.quantity || 0);
            g.total_value += Number(lot.quantity || 0) * Number(lot.unit_price || 0);
        });
        return groups;
    }, [pendingLots]);

    const filteredOfferComparisons = useMemo(() => {
        const q = offerSearch.trim().toLowerCase();
        if (!q) return offerComparisons;
        return offerComparisons.filter(
            (row) =>
                row.product.name?.toLowerCase().includes(q) ||
                row.product.sku?.toLowerCase().includes(q) ||
                row.offers.some((o) => o.supplier_name?.toLowerCase().includes(q))
        );
    }, [offerComparisons, offerSearch]);

    const openCreate = () => {
        setEditingSupplier(null);
        setSupplierForm({ ...EMPTY_SUPPLIER_FORM });
        setShowModal(true);
    };

    const openEdit = (s) => {
        const p = s.supplier_profile || {};
        setEditingSupplier(s);
        setSupplierForm({
            name: s.name || '',
            company_name: s.company_name || '',
            email: s.email || '',
            phone: s.phone || '',
            password: '',
            status: s.status || 'active',
            send_invitation: false,
            approval_status: p.approval_status || 'approved',
            country_code: p.country_code || 'AE',
            country_name: p.country_name || 'United Arab Emirates',
            tax_id: p.tax_id || '',
            registration_number: p.registration_number || '',
            website: p.website || '',
            address: p.address || '',
            secondary_contact_name: p.secondary_contact_name || '',
            secondary_contact_email: p.secondary_contact_email || '',
            secondary_contact_phone: p.secondary_contact_phone || '',
            payment_terms: p.payment_terms || 'Net 30',
            default_discount_percent: String(p.default_discount_percent ?? 0),
            minimum_order_value: String(p.minimum_order_value ?? 0),
            currency_code: p.currency_code || 'AED',
            commercial_conditions: p.commercial_conditions || '',
            shipping_methods: p.shipping_methods || 'Standard Courier',
            default_shipping_cost: String(p.default_shipping_cost ?? 0),
            lead_time_days: String(p.lead_time_days ?? 3),
            return_policy: p.return_policy || '',
            warranty_terms: p.warranty_terms || '',
            reliability_score: String(p.reliability_score ?? 85),
            priority_rank: String(p.priority_rank ?? 50),
            is_preferred: Boolean(p.is_preferred),
            admin_notes: p.admin_notes || '',
        });
        setShowModal(true);
    };

    const handleSaveSupplier = (e) => {
        e.preventDefault();
        setSubmitting(true);

        const payload = {
            ...supplierForm,
            password: supplierForm.password || null,
            default_discount_percent: Number(supplierForm.default_discount_percent || 0),
            minimum_order_value: Number(supplierForm.minimum_order_value || 0),
            default_shipping_cost: Number(supplierForm.default_shipping_cost || 0),
            lead_time_days: Number(supplierForm.lead_time_days || 3),
            reliability_score: Number(supplierForm.reliability_score || 85),
            priority_rank: Number(supplierForm.priority_rank || 50),
        };

        if (editingSupplier) {
            router.put(`/admin/suppliers/${editingSupplier.id}`, payload, {
                onSuccess: () => setShowModal(false),
                onFinish: () => setSubmitting(false),
            });
        } else {
            router.post('/admin/suppliers', payload, {
                onSuccess: () => setShowModal(false),
                onFinish: () => setSubmitting(false),
            });
        }
    };

    const handleApproveSupplier = (s) => {
        router.post(`/admin/suppliers/${s.id}/approve`, {}, { preserveScroll: true });
    };

    const handleRejectSupplier = (s) => {
        if (confirm(`Mark supplier "${s.company_name || s.name}" as rejected and suspend portal access?`)) {
            router.post(`/admin/suppliers/${s.id}/reject`, {}, { preserveScroll: true });
        }
    };

    const handleUploadDocument = (e) => {
        e.preventDefault();
        if (!docSupplier || !docFile) return;
        setSubmitting(true);
        router.post(
            `/admin/suppliers/${docSupplier.id}/documents`,
            {
                title: docTitle,
                document_type: docType,
                document_file: docFile,
                expires_at: docExpiresAt || null,
                notes: docNotes || null,
            },
            {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    setDocTitle('');
                    setDocFile(null);
                    setDocExpiresAt('');
                    setDocNotes('');
                    setDocSupplier(null);
                },
                onFinish: () => setSubmitting(false),
            }
        );
    };

    const handleDeleteDocument = (docId) => {
        if (confirm('Delete this supplier document?')) {
            router.delete(`/admin/suppliers/documents/${docId}`, {
                preserveScroll: true,
                onSuccess: () => setDocSupplier(null),
            });
        }
    };

    const handleDelete = (id, label) => {
        if (confirm(`Remove supplier "${label}"? Existing products will remain in the catalog.`)) {
            router.delete(`/admin/suppliers/${id}`);
        }
    };

    const handleSearch = () => {
        router.get('/admin/suppliers', { search, tab }, { preserveState: true });
    };

    const handleReceiveLot = (lot) => {
        router.post(`/admin/warehouse/lots/${lot.id}/receive`, {}, { preserveScroll: true });
    };

    const handleReceiveLotBatch = (lotNumber) => {
        router.post(`/admin/warehouse/lot-number/${encodeURIComponent(lotNumber)}/receive`, {}, { preserveScroll: true });
    };

    const handleRejectSubmit = (e) => {
        e.preventDefault();
        if (!rejectTarget) return;
        setSubmitting(true);
        const url =
            rejectTarget.type === 'batch'
                ? `/admin/warehouse/lot-number/${encodeURIComponent(rejectTarget.lot_number)}/reject`
                : `/admin/warehouse/lots/${rejectTarget.id}/reject`;

        router.post(
            url,
            { reason: rejectReason },
            {
                preserveScroll: true,
                onSuccess: () => setRejectTarget(null),
                onFinish: () => setSubmitting(false),
            }
        );
    };

    const handleSaveRules = (e) => {
        e.preventDefault();
        setSubmitting(true);
        router.post('/admin/suppliers/selection-rules', rulesForm, {
            preserveScroll: true,
            onFinish: () => setSubmitting(false),
        });
    };

    const handleSaveOffer = (e) => {
        e.preventDefault();
        setSubmitting(true);
        router.post(
            '/admin/suppliers/offers',
            {
                ...offerForm,
                reliability_score: offerForm.reliability_score === '' ? null : Number(offerForm.reliability_score),
            },
            {
                preserveScroll: true,
                onSuccess: () => setShowOfferModal(false),
                onFinish: () => setSubmitting(false),
            }
        );
    };

    const handleOverrideOffer = (productId, offerId) => {
        router.post(`/admin/suppliers/offers/${productId}/${offerId}/override`, {}, { preserveScroll: true });
    };

    const handleClearOverride = (productId) => {
        router.post(`/admin/suppliers/offers/${productId}/clear-override`, {}, { preserveScroll: true });
    };

    const handleDeleteOffer = (offerId) => {
        if (confirm('Delete this supplier offer?')) {
            router.delete(`/admin/suppliers/offers/${offerId}`, { preserveScroll: true });
        }
    };

    const handleCatalogImport = (e) => {
        e.preventDefault();
        if (!importSupplierId || !importFile) return;
        setSubmitting(true);
        router.post(
            '/admin/suppliers/import',
            {
                supplier_id: importSupplierId,
                catalog_file: importFile,
                create_missing_products: createMissingProducts,
            },
            {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => setImportFile(null),
                onFinish: () => setSubmitting(false),
            }
        );
    };

    const handleCreateConnector = (e) => {
        e.preventDefault();
        setSubmitting(true);
        router.post('/admin/suppliers/connectors', connectorForm, {
            preserveScroll: true,
            onSuccess: () =>
                setConnectorForm((prev) => ({
                    ...prev,
                    name: '',
                    endpoint_url: '',
                    api_key: '',
                    token: '',
                    username: '',
                    password: '',
                })),
            onFinish: () => setSubmitting(false),
        });
    };

    const handleTestConnector = (id) => {
        router.post(`/admin/suppliers/connectors/${id}/test`, {}, { preserveScroll: true });
    };

    const handleSyncConnector = (id) => {
        router.post(`/admin/suppliers/connectors/${id}/sync`, {}, { preserveScroll: true });
    };

    const handleDeleteConnector = (id) => {
        if (confirm('Delete this B2B connector?')) {
            router.delete(`/admin/suppliers/connectors/${id}`, { preserveScroll: true });
        }
    };

    const items = suppliers.data || [];

    const approvalBadgeClass = (approval) => {
        if (approval === 'approved') return 'badge-success';
        if (approval === 'invited' || approval === 'pending') return 'badge-warning';
        return 'badge-danger';
    };

    const columns = [
        {
            key: 'company',
            label: 'Company & Origin',
            render: (s) => {
                const p = s.supplier_profile;
                return (
                    <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            <strong>{s.company_name || s.name}</strong>
                            {p?.is_preferred && (
                                <span className="badge badge-warning" style={{ fontSize: '10px' }}>
                                    <Star size={10} style={{ display: 'inline', marginRight: '2px' }} /> Preferred
                                </span>
                            )}
                        </div>
                        <small style={{ display: 'block', color: '#64748B' }}>
                            {s.name} • {p?.country_name || 'UAE'} ({p?.country_code || 'AE'})
                            {p?.tax_id ? ` • TRN: ${p.tax_id}` : ''}
                        </small>
                    </>
                );
            },
        },
        {
            key: 'contact',
            label: 'Contact & Terms',
            render: (s) => {
                const p = s.supplier_profile;
                return (
                    <>
                        <div>{s.email}</div>
                        <small style={{ color: '#64748B' }}>
                            {s.phone || '—'} • {p?.payment_terms || 'Net 30'} ({p?.currency_code || 'AED'})
                        </small>
                    </>
                );
            },
        },
        {
            key: 'metrics',
            label: 'Reliability & Priority',
            render: (s) => {
                const p = s.supplier_profile;
                return (
                    <>
                        <div>
                            <strong>{Number(p?.reliability_score ?? 85).toFixed(0)}%</strong> reliability
                        </div>
                        <small style={{ color: '#64748B' }}>
                            Priority #{p?.priority_rank ?? 50} • {p?.lead_time_days ?? 3}d lead
                        </small>
                    </>
                );
            },
        },
        {
            key: 'counts',
            label: 'Catalog & Docs',
            render: (s) => (
                <>
                    <div>
                        <strong>{s.supplier_offers_count || 0}</strong> offers •{' '}
                        <strong>{s.supplied_products_count || 0}</strong> parts
                    </div>
                    <small style={{ color: '#64748B' }}>
                        {s.supplier_documents_count || 0} docs • {s.pending_lots_count || 0} pending lots
                    </small>
                </>
            ),
        },
        {
            key: 'approval',
            label: 'Approval / Status',
            render: (s) => {
                const approval = s.supplier_profile?.approval_status || 'approved';
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                        <span className={`badge ${approvalBadgeClass(approval)}`} style={{ textTransform: 'capitalize' }}>
                            {approval}
                        </span>
                        <small style={{ color: '#64748B', textTransform: 'capitalize' }}>Portal: {s.status || 'active'}</small>
                    </div>
                );
            },
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (s) => {
                const approval = s.supplier_profile?.approval_status || 'approved';
                return (
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {approval !== 'approved' && (
                            <button
                                type="button"
                                className="btn btn-primary btn-sm"
                                title="Approve Supplier"
                                onClick={() => handleApproveSupplier(s)}
                            >
                                <ShieldCheck size={14} /> Approve
                            </button>
                        )}
                        {approval !== 'rejected' && (
                            <button
                                type="button"
                                className="btn btn-outline btn-sm"
                                title="Reject / Suspend Supplier"
                                style={{ color: '#D93025' }}
                                onClick={() => handleRejectSupplier(s)}
                            >
                                <XCircle size={14} />
                            </button>
                        )}
                        <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            title="Supplier Documents"
                            onClick={() => setDocSupplier(s)}
                        >
                            <FileText size={14} />
                        </button>
                        <button type="button" className="btn btn-outline btn-sm" title="Edit Supplier Profile" onClick={() => openEdit(s)}>
                            <Edit size={14} />
                        </button>
                        <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            title="Delete Supplier"
                            style={{ color: '#D93025' }}
                            onClick={() => handleDelete(s.id, s.company_name || s.name)}
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                );
            },
        },
    ];

    const totalWeight =
        Number(rulesForm.weight_price || 0) +
        Number(rulesForm.weight_stock || 0) +
        Number(rulesForm.weight_delivery || 0) +
        Number(rulesForm.weight_shipping || 0) +
        Number(rulesForm.weight_reliability || 0) +
        Number(rulesForm.weight_commercial || 0);

    return (
        <AdminLayout title="Suppliers, Offers & B2B Supply Chain">
            {errors && Object.keys(errors).length > 0 && (
                <div
                    style={{
                        backgroundColor: '#FFF1F2',
                        color: '#D93025',
                        padding: '12px 16px',
                        borderRadius: '4px',
                        marginBottom: '16px',
                        fontSize: '13px',
                    }}
                >
                    {Object.values(errors).map((err, idx) => (
                        <div key={idx}>{err}</div>
                    ))}
                </div>
            )}

            {/* 5-Tab Supply Chain Toolbar */}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '10px',
                    marginBottom: '16px',
                }}
            >
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                        type="button"
                        className={`btn btn-sm ${tab === 'suppliers' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => handleSwitchTab('suppliers')}
                    >
                        <Truck size={15} />
                        <span>Suppliers ({suppliers.total || items.length})</span>
                    </button>

                    <button
                        type="button"
                        className={`btn btn-sm ${tab === 'offers' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => handleSwitchTab('offers')}
                    >
                        <Scale size={15} />
                        <span>Offers &amp; Auto-Selection</span>
                    </button>

                    <button
                        type="button"
                        className={`btn btn-sm ${tab === 'imports' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => handleSwitchTab('imports')}
                    >
                        <Upload size={15} />
                        <span>Catalog Import (CSV/XML/Excel)</span>
                    </button>

                    <button
                        type="button"
                        className={`btn btn-sm ${tab === 'connectors' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => handleSwitchTab('connectors')}
                    >
                        <Plug size={15} />
                        <span>B2B API Connectors ({connectors.length})</span>
                    </button>

                    <button
                        type="button"
                        className={`btn btn-sm ${tab === 'incoming' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => handleSwitchTab('incoming')}
                    >
                        <Inbox size={15} />
                        <span>Incoming Lots</span>
                        {groupedPendingLots.length > 0 && (
                            <span
                                style={{
                                    marginLeft: '4px',
                                    padding: '1px 7px',
                                    borderRadius: '999px',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    backgroundColor: tab === 'incoming' ? 'rgba(255,255,255,0.22)' : '#F36B16',
                                    color: '#FFF',
                                }}
                            >
                                {groupedPendingLots.length}
                            </span>
                        )}
                    </button>
                </div>

                <Link href="/admin/warehouse/logs" className="btn btn-outline btn-sm">
                    <History size={15} />
                    <span>Transfer Logs ({transfersCount})</span>
                </Link>
            </div>

            {/* TAB 1: SUPPLIERS DIRECTORY */}
            {tab === 'suppliers' && (
                <AdminDataTable
                    title="Registered & Invited Suppliers"
                    count={suppliers.total || items.length}
                    search={{
                        value: search,
                        onChange: setSearch,
                        placeholder: 'Search by supplier company, contact name, email, or phone...',
                    }}
                    onSearch={handleSearch}
                    actions={
                        <button type="button" className="btn btn-primary btn-sm" onClick={openCreate}>
                            <Plus size={16} /> Add / Invite Supplier
                        </button>
                    }
                    columns={columns}
                    rows={items}
                    emptyMessage='No suppliers found. Click "Add / Invite Supplier" to onboard a supplier account.'
                    pagination={suppliers}
                    itemLabel="suppliers"
                />
            )}

            {/* TAB 2: OFFERS COMPARISON & AUTO-SELECTION */}
            {tab === 'offers' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    {/* Configurable Profitability & Service Rules */}
                    <div className="admin-card" style={{ marginBottom: 0 }}>
                        <div className="admin-card-header">
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Sliders size={16} /> Automatic Supplier Selection Rules (Total Weight: {totalWeight}%)
                            </h3>
                        </div>
                        <div className="admin-card-body">
                            <form onSubmit={handleSaveRules} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                <div
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                                        gap: '12px',
                                    }}
                                >
                                    <div className="form-group">
                                        <label className="form-label">Price / Margin Weight (%)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            className="form-input"
                                            value={rulesForm.weight_price}
                                            onChange={(e) => setRulesForm({ ...rulesForm, weight_price: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Stock Availability Weight (%)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            className="form-input"
                                            value={rulesForm.weight_stock}
                                            onChange={(e) => setRulesForm({ ...rulesForm, weight_stock: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Prep &amp; Delivery Weight (%)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            className="form-input"
                                            value={rulesForm.weight_delivery}
                                            onChange={(e) => setRulesForm({ ...rulesForm, weight_delivery: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Shipping Cost Weight (%)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            className="form-input"
                                            value={rulesForm.weight_shipping}
                                            onChange={(e) => setRulesForm({ ...rulesForm, weight_shipping: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Reliability Weight (%)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            className="form-input"
                                            value={rulesForm.weight_reliability}
                                            onChange={(e) => setRulesForm({ ...rulesForm, weight_reliability: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Commercial Terms Weight (%)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            className="form-input"
                                            value={rulesForm.weight_commercial}
                                            onChange={(e) => setRulesForm({ ...rulesForm, weight_commercial: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Min Target Margin (%)</label>
                                        <input
                                            type="number"
                                            step="0.5"
                                            min="0"
                                            max="95"
                                            className="form-input"
                                            value={rulesForm.min_margin_percent}
                                            onChange={(e) => setRulesForm({ ...rulesForm, min_margin_percent: Number(e.target.value) })}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={Boolean(rulesForm.require_in_stock)}
                                            onChange={(e) => setRulesForm({ ...rulesForm, require_in_stock: e.target.checked })}
                                        />
                                        <span>Require in-stock offers when auto-selecting winning supplier</span>
                                    </label>
                                    <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
                                        <RefreshCw size={14} /> Save Rules &amp; Recalculate All Offers
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Multi-Supplier Comparison Table */}
                    <div className="admin-card" style={{ marginBottom: 0 }}>
                        <div className="admin-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                            <div>
                                <h3>Multi-Supplier Offer Comparison ({filteredOfferComparisons.length} products)</h3>
                                <small style={{ color: '#64748B' }}>
                                    Customers only see SpeedAutosParts selling prices — supplier purchase costs and offers remain strictly internal.
                                </small>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <input
                                    type="text"
                                    className="form-input"
                                    style={{ width: '240px', padding: '6px 10px', fontSize: '13px' }}
                                    placeholder="Filter by product, SKU, supplier..."
                                    value={offerSearch}
                                    onChange={(e) => setOfferSearch(e.target.value)}
                                />
                                <button type="button" className="btn btn-primary btn-sm" onClick={() => setShowOfferModal(true)}>
                                    <Plus size={15} /> Add Supplier Offer
                                </button>
                            </div>
                        </div>

                        <div className="admin-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {filteredOfferComparisons.filter((row) => row.offers.length > 0).length === 0 ? (
                                <p style={{ color: '#64748B', fontSize: '13px', margin: 0 }}>
                                    No supplier offers match your filter. Click &quot;Add Supplier Offer&quot; or import a supplier catalog.
                                </p>
                            ) : (
                                filteredOfferComparisons
                                    .filter((row) => row.offers.length > 0)
                                    .map((row) => {
                                        const hasOverride = row.offers.some((o) => o.is_manual_override);
                                        return (
                                            <div
                                                key={row.product.id}
                                                style={{
                                                    border: '1px solid #E2E8F0',
                                                    borderRadius: '6px',
                                                    overflow: 'hidden',
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        padding: '10px 14px',
                                                        backgroundColor: '#F8FAFC',
                                                        borderBottom: '1px solid #E2E8F0',
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        flexWrap: 'wrap',
                                                        gap: '8px',
                                                    }}
                                                >
                                                    <div>
                                                        <strong>{row.product.name}</strong>{' '}
                                                        <code style={{ fontSize: '12px', color: '#475569' }}>{row.product.sku}</code>
                                                        <span style={{ marginLeft: '10px', fontSize: '12px', color: '#0F172A' }}>
                                                            Selling Price:{' '}
                                                            <strong style={{ color: '#F36B16' }}>
                                                                {formatAdminPrice(row.product.effective_price)}
                                                            </strong>
                                                        </span>
                                                    </div>
                                                    {hasOverride && (
                                                        <button
                                                            type="button"
                                                            className="btn btn-outline btn-sm"
                                                            onClick={() => handleClearOverride(row.product.id)}
                                                        >
                                                            <RotateCcw size={13} /> Reset to Auto-Select
                                                        </button>
                                                    )}
                                                </div>

                                                <div style={{ overflowX: 'auto' }}>
                                                    <table className="admin-table">
                                                        <thead>
                                                            <tr>
                                                                <th>Supplier</th>
                                                                <th>Purchase</th>
                                                                <th>Discount / Ship</th>
                                                                <th>Landed Cost</th>
                                                                <th>Margin</th>
                                                                <th>Stock</th>
                                                                <th>Lead Time</th>
                                                                <th>Reliability</th>
                                                                <th>Score</th>
                                                                <th>Selection</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {row.offers.map((offer) => (
                                                                <tr
                                                                    key={offer.id}
                                                                    style={
                                                                        offer.is_selected
                                                                            ? { backgroundColor: '#FFF7ED' }
                                                                            : undefined
                                                                    }
                                                                >
                                                                    <td>
                                                                        <strong>{offer.supplier_name}</strong>
                                                                        <small style={{ display: 'block', color: '#64748B' }}>
                                                                            {offer.commercial_terms || 'Standard'} • Prio #{offer.priority_rank}
                                                                        </small>
                                                                    </td>
                                                                    <td>{formatAdminPrice(offer.purchase_price)}</td>
                                                                    <td>
                                                                        <div>-{offer.commercial_discount_percent}%</div>
                                                                        <small style={{ color: '#64748B' }}>
                                                                            +{formatAdminPrice(offer.shipping_cost)} ship
                                                                        </small>
                                                                    </td>
                                                                    <td>
                                                                        <strong>{formatAdminPrice(offer.landed_cost)}</strong>
                                                                    </td>
                                                                    <td>
                                                                        <span
                                                                            className={`badge ${offer.margin_percent >= Number(rulesForm.min_margin_percent || 15)
                                                                                ? 'badge-success'
                                                                                : 'badge-warning'
                                                                                }`}
                                                                        >
                                                                            {offer.margin_percent}%
                                                                        </span>
                                                                    </td>
                                                                    <td>{offer.stock_quantity} pcs</td>
                                                                    <td>
                                                                        {offer.lead_days}d{' '}
                                                                        <small style={{ color: '#64748B' }}>
                                                                            ({offer.preparation_days}+{offer.delivery_days})
                                                                        </small>
                                                                    </td>
                                                                    <td>{offer.reliability}%</td>
                                                                    <td>
                                                                        <strong>{offer.score}</strong>/100
                                                                    </td>
                                                                    <td>
                                                                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                                                                            {offer.is_manual_override ? (
                                                                                <span className="badge badge-warning">Manual Override</span>
                                                                            ) : offer.is_selected ? (
                                                                                <span className="badge badge-success">Auto-Selected</span>
                                                                            ) : (
                                                                                <button
                                                                                    type="button"
                                                                                    className="btn btn-outline btn-sm"
                                                                                    onClick={() =>
                                                                                        handleOverrideOffer(row.product.id, offer.id)
                                                                                    }
                                                                                >
                                                                                    Override
                                                                                </button>
                                                                            )}
                                                                            <button
                                                                                type="button"
                                                                                className="btn btn-outline btn-sm"
                                                                                style={{ color: '#D93025' }}
                                                                                onClick={() => handleDeleteOffer(offer.id)}
                                                                            >
                                                                                <Trash2 size={13} />
                                                                            </button>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        );
                                    })
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 3: CATALOG IMPORT (CSV, XML, EXCEL) */}
            {tab === 'imports' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '18px' }}>
                    <div className="admin-card" style={{ marginBottom: 0 }}>
                        <div className="admin-card-header">
                            <h3>Import Supplier Catalog (CSV, XML, Excel .xlsx)</h3>
                        </div>
                        <div className="admin-card-body">
                            <form onSubmit={handleCatalogImport} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                <div className="form-group">
                                    <label className="form-label">
                                        Target Supplier <span className="required">*</span>
                                    </label>
                                    <select
                                        className="form-select"
                                        required
                                        value={importSupplierId}
                                        onChange={(e) => setImportSupplierId(e.target.value)}
                                    >
                                        <option value="">-- Select Supplier --</option>
                                        {allSuppliers.map((s) => (
                                            <option key={s.id} value={s.id}>
                                                {s.company_name || s.name} ({s.email})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">
                                        Catalog File (.csv, .xml, .xlsx) <span className="required">*</span>
                                    </label>
                                    <input
                                        type="file"
                                        className="form-input"
                                        accept=".csv,.txt,.xml,.xlsx"
                                        required
                                        onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                                    />
                                    <small style={{ color: '#64748B', fontSize: '11px', marginTop: '4px', display: 'block' }}>
                                        Columns: sku, part_number, purchase_price, stock_quantity, preparation_days, delivery_days, shipping_cost, commercial_discount_percent, commercial_terms
                                    </small>
                                </div>

                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={createMissingProducts}
                                        onChange={(e) => setCreateMissingProducts(e.target.checked)}
                                    />
                                    <span>Create draft catalog products if SKU does not exist yet</span>
                                </label>

                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    <button type="submit" className="btn btn-primary" disabled={submitting || !importFile}>
                                        <Upload size={15} /> {submitting ? 'Importing...' : 'Run Catalog Import'}
                                    </button>
                                    <a href="/admin/suppliers/import-template/csv" className="btn btn-outline btn-sm">
                                        <Download size={14} /> CSV Template
                                    </a>
                                    <a href="/admin/suppliers/import-template/xml" className="btn btn-outline btn-sm">
                                        <Download size={14} /> XML Template
                                    </a>
                                </div>
                            </form>
                        </div>
                    </div>

                    <div className="admin-card" style={{ marginBottom: 0 }}>
                        <div className="admin-card-header">
                            <h3>Recent Catalog Imports &amp; Sync Logs ({importLogs.length})</h3>
                        </div>
                        <div className="admin-card-body" style={{ padding: 0, overflowX: 'auto' }}>
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Supplier</th>
                                        <th>Source</th>
                                        <th>Results</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {importLogs.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" style={{ textAlign: 'center', color: '#64748B', padding: '20px' }}>
                                                No catalog imports recorded yet.
                                            </td>
                                        </tr>
                                    ) : (
                                        importLogs.map((log) => (
                                            <tr key={log.id}>
                                                <td>
                                                    <strong>{log.supplier?.company_name || log.supplier?.name || 'Supplier'}</strong>
                                                    <small style={{ display: 'block', color: '#64748B' }}>{log.file_name || 'API Sync'}</small>
                                                </td>
                                                <td>
                                                    <span className="badge badge-neutral" style={{ textTransform: 'uppercase' }}>
                                                        {log.source_type}
                                                    </span>
                                                </td>
                                                <td style={{ fontSize: '12px' }}>
                                                    <strong>+{log.imported_rows}</strong> new • <strong>{log.updated_rows}</strong> upd •{' '}
                                                    <span style={{ color: log.failed_rows > 0 ? '#D93025' : '#64748B' }}>
                                                        {log.failed_rows} fail
                                                    </span>
                                                </td>
                                                <td>
                                                    <span
                                                        className={`badge ${log.status === 'completed'
                                                            ? 'badge-success'
                                                            : log.status === 'partial'
                                                                ? 'badge-warning'
                                                                : 'badge-danger'
                                                            }`}
                                                        style={{ textTransform: 'capitalize' }}
                                                    >
                                                        {log.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 4: B2B API CONNECTORS */}
            {tab === 'connectors' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '18px' }}>
                    <div className="admin-card" style={{ marginBottom: 0 }}>
                        <div className="admin-card-header">
                            <h3>Register Supplier API / B2B Connector</h3>
                        </div>
                        <div className="admin-card-body">
                            <form onSubmit={handleCreateConnector} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div className="form-group">
                                    <label className="form-label">Supplier *</label>
                                    <select
                                        className="form-select"
                                        required
                                        value={connectorForm.supplier_id}
                                        onChange={(e) => setConnectorForm({ ...connectorForm, supplier_id: e.target.value })}
                                    >
                                        <option value="">-- Select Supplier --</option>
                                        {allSuppliers.map((s) => (
                                            <option key={s.id} value={s.id}>
                                                {s.company_name || s.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Connector Name *</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        required
                                        placeholder="e.g. TecDoc / Supplier ERP REST Feed"
                                        value={connectorForm.name}
                                        onChange={(e) => setConnectorForm({ ...connectorForm, name: e.target.value })}
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                    <div className="form-group">
                                        <label className="form-label">Connector Driver *</label>
                                        <select
                                            className="form-select"
                                            value={connectorForm.driver}
                                            onChange={(e) => setConnectorForm({ ...connectorForm, driver: e.target.value })}
                                        >
                                            {(Array.isArray(connectorDrivers)
                                                ? connectorDrivers
                                                : Object.entries(connectorDrivers || {}).map(([driver, label]) => ({
                                                    driver,
                                                    label,
                                                }))
                                            ).map((item) => (
                                                <option key={item.driver} value={item.driver}>
                                                    {item.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Sync Frequency</label>
                                        <select
                                            className="form-select"
                                            value={connectorForm.sync_frequency}
                                            onChange={(e) => setConnectorForm({ ...connectorForm, sync_frequency: e.target.value })}
                                        >
                                            <option value="manual">Manual Only</option>
                                            <option value="hourly">Hourly</option>
                                            <option value="daily">Daily</option>
                                        </select>
                                    </div>
                                </div>

                                {connectorForm.driver !== 'mock_b2b' && (
                                    <div className="form-group">
                                        <label className="form-label">Endpoint URL</label>
                                        <input
                                            type="url"
                                            className="form-input"
                                            placeholder="https://b2b.supplier.com/api/v1/offers"
                                            value={connectorForm.endpoint_url}
                                            onChange={(e) => setConnectorForm({ ...connectorForm, endpoint_url: e.target.value })}
                                        />
                                    </div>
                                )}

                                <div className="form-group">
                                    <label className="form-label">Authentication Type</label>
                                    <select
                                        className="form-select"
                                        value={connectorForm.auth_type}
                                        onChange={(e) => setConnectorForm({ ...connectorForm, auth_type: e.target.value })}
                                    >
                                        <option value="none">None / Sandbox</option>
                                        <option value="api_key">API Key Header</option>
                                        <option value="bearer">Bearer Token</option>
                                        <option value="basic">HTTP Basic Auth</option>
                                    </select>
                                </div>

                                {connectorForm.auth_type === 'api_key' && (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                        <div className="form-group">
                                            <label className="form-label">Header Name</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={connectorForm.header_name}
                                                onChange={(e) => setConnectorForm({ ...connectorForm, header_name: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">API Key</label>
                                            <input
                                                type="password"
                                                className="form-input"
                                                value={connectorForm.api_key}
                                                onChange={(e) => setConnectorForm({ ...connectorForm, api_key: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                )}

                                {connectorForm.auth_type === 'bearer' && (
                                    <div className="form-group">
                                        <label className="form-label">Bearer Token</label>
                                        <input
                                            type="password"
                                            className="form-input"
                                            value={connectorForm.token}
                                            onChange={(e) => setConnectorForm({ ...connectorForm, token: e.target.value })}
                                        />
                                    </div>
                                )}

                                {connectorForm.auth_type === 'basic' && (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                        <div className="form-group">
                                            <label className="form-label">Username</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={connectorForm.username}
                                                onChange={(e) => setConnectorForm({ ...connectorForm, username: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Password</label>
                                            <input
                                                type="password"
                                                className="form-input"
                                                value={connectorForm.password}
                                                onChange={(e) => setConnectorForm({ ...connectorForm, password: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                )}

                                <button type="submit" className="btn btn-primary" disabled={submitting}>
                                    <Plus size={15} /> Save B2B Connector
                                </button>
                            </form>
                        </div>
                    </div>

                    <div className="admin-card" style={{ marginBottom: 0 }}>
                        <div className="admin-card-header">
                            <h3>Configured Supplier Connectors ({connectors.length})</h3>
                        </div>
                        <div className="admin-card-body" style={{ padding: 0, overflowX: 'auto' }}>
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Connector / Supplier</th>
                                        <th>Driver</th>
                                        <th>Last Sync</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {connectors.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" style={{ textAlign: 'center', color: '#64748B', padding: '20px' }}>
                                                No supplier API connectors configured yet.
                                            </td>
                                        </tr>
                                    ) : (
                                        connectors.map((c) => (
                                            <tr key={c.id}>
                                                <td>
                                                    <strong>{c.name}</strong>
                                                    <small style={{ display: 'block', color: '#64748B' }}>
                                                        {c.supplier?.company_name || c.supplier?.name} • {c.sync_frequency}
                                                    </small>
                                                </td>
                                                <td>
                                                    <span className="badge badge-neutral">{c.driver}</span>
                                                </td>
                                                <td style={{ fontSize: '12px' }}>
                                                    <span
                                                        className={`badge ${['synced', 'connected', 'success'].includes(c.last_status)
                                                            ? 'badge-success'
                                                            : c.last_status === 'failed'
                                                                ? 'badge-danger'
                                                                : 'badge-neutral'
                                                            }`}
                                                    >
                                                        {c.last_status || 'never'}
                                                    </span>
                                                    {c.last_message && (
                                                        <small style={{ display: 'block', color: '#64748B', marginTop: '2px' }}>
                                                            {c.last_message}
                                                        </small>
                                                    )}
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                        <button
                                                            type="button"
                                                            className="btn btn-outline btn-sm"
                                                            onClick={() => handleTestConnector(c.id)}
                                                        >
                                                            Test
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="btn btn-primary btn-sm"
                                                            onClick={() => handleSyncConnector(c.id)}
                                                        >
                                                            <RefreshCw size={13} /> Sync Now
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="btn btn-outline btn-sm"
                                                            style={{ color: '#D93025' }}
                                                            onClick={() => handleDeleteConnector(c.id)}
                                                        >
                                                            <Trash2 size={13} />
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
                </div>
            )}

            {/* TAB 5: INCOMING LOTS */}
            {tab === 'incoming' && (
                <div className="admin-card">
                    <div className="admin-card-header">
                        <h3>Incoming Supplier Lots Pending Receipt ({groupedPendingLots.length} lots)</h3>
                    </div>
                    <div className="admin-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {groupedPendingLots.length === 0 ? (
                            <p style={{ color: '#64748B', fontSize: '13px', margin: 0 }}>
                                No pending supplier lots waiting for warehouse check-in.
                            </p>
                        ) : (
                            groupedPendingLots.map((group) => (
                                <div
                                    key={group.lot_number}
                                    style={{ border: '1px solid #FDBA74', borderRadius: '6px', overflow: 'hidden' }}
                                >
                                    <div
                                        style={{
                                            padding: '12px 16px',
                                            backgroundColor: '#FFF7ED',
                                            borderBottom: '1px solid #FED7AA',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            flexWrap: 'wrap',
                                            gap: '12px',
                                        }}
                                    >
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                                <code style={{ fontWeight: 800, fontSize: '14px' }}>{group.lot_number}</code>
                                                <span className="badge badge-warning">Pending Receipt</span>
                                                <span style={{ fontSize: '13px', fontWeight: 700 }}>
                                                    {group.supplier?.company_name || group.supplier?.name || 'Supplier'}
                                                </span>
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>
                                                <Package
                                                    size={13}
                                                    style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }}
                                                />
                                                <strong>{group.items.length}</strong> items • <strong>{group.total_qty}</strong> total
                                                units • Lot Value: <strong>{formatAdminPrice(group.total_value)}</strong>
                                                {group.notes && (
                                                    <span style={{ marginLeft: '10px', color: '#64748B' }}>— {group.notes}</span>
                                                )}
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                type="button"
                                                className="btn btn-primary btn-sm"
                                                onClick={() => handleReceiveLotBatch(group.lot_number)}
                                            >
                                                <CheckCircle2 size={14} /> Receive Entire Lot ({group.items.length})
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-outline btn-sm"
                                                style={{ color: '#D93025' }}
                                                onClick={() => {
                                                    setRejectTarget({
                                                        type: 'batch',
                                                        lot_number: group.lot_number,
                                                        label: `${group.items.length} items in ${group.lot_number}`,
                                                        qty: group.total_qty,
                                                    });
                                                    setRejectReason('');
                                                }}
                                            >
                                                <X size={14} /> Reject Entire Lot
                                            </button>
                                        </div>
                                    </div>

                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                <th>Product</th>
                                                <th>Qty</th>
                                                <th>Supplier Price</th>
                                                <th>Line Total</th>
                                                <th>Item Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {group.items.map((lot) => (
                                                <tr key={lot.id}>
                                                    <td>
                                                        <strong>{lot.product?.name}</strong>
                                                        <small style={{ display: 'block', color: '#64748B', fontFamily: 'monospace' }}>
                                                            {lot.product?.sku}
                                                        </small>
                                                    </td>
                                                    <td>
                                                        <span className="badge badge-warning">{lot.quantity} units</span>
                                                    </td>
                                                    <td>{formatAdminPrice(lot.unit_price || 0)}</td>
                                                    <td>
                                                        <strong>{formatAdminPrice(lot.quantity * Number(lot.unit_price || 0))}</strong>
                                                    </td>
                                                    <td>
                                                        <div style={{ display: 'flex', gap: '6px' }}>
                                                            <button
                                                                type="button"
                                                                className="btn btn-outline btn-sm"
                                                                onClick={() => handleReceiveLot(lot)}
                                                            >
                                                                <CheckCircle2 size={13} /> Receive
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="btn btn-outline btn-sm"
                                                                style={{ color: '#D93025' }}
                                                                onClick={() => {
                                                                    setRejectTarget({
                                                                        type: 'item',
                                                                        id: lot.id,
                                                                        lot_number: lot.lot_number,
                                                                        label: lot.product?.name || 'item',
                                                                        qty: lot.quantity,
                                                                    });
                                                                    setRejectReason('');
                                                                }}
                                                            >
                                                                <X size={13} /> Reject
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* CREATE / EDIT FULL SUPPLIER PROFILE MODAL */}
            {showModal && (
                <>
                    <div className="header-backdrop" onClick={() => setShowModal(false)} />
                    <div
                        style={{
                            position: 'fixed',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            backgroundColor: '#FFF',
                            borderRadius: '8px',
                            padding: '24px',
                            width: '94%',
                            maxWidth: '780px',
                            maxHeight: '88vh',
                            overflowY: 'auto',
                            zIndex: 2200,
                            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 800 }}>
                                {editingSupplier ? 'Edit Supplier Profile & Commercial Terms' : 'Add / Invite New Supplier'}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                style={{ background: 'none', border: 'none', color: '#64748B' }}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveSupplier} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <strong style={{ fontSize: '13px', color: '#F36B16', textTransform: 'uppercase' }}>
                                1. Company, Country, Tax &amp; Account Details
                            </strong>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '12px' }}>
                                <div className="form-group">
                                    <label className="form-label">Company Name *</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        required
                                        value={supplierForm.company_name}
                                        onChange={(e) => setSupplierForm({ ...supplierForm, company_name: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Primary Contact Name *</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        required
                                        value={supplierForm.name}
                                        onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Login Email *</label>
                                    <input
                                        type="email"
                                        className="form-input"
                                        required
                                        value={supplierForm.email}
                                        onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Phone</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={supplierForm.phone}
                                        onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Country Code (ISO)</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        maxLength={5}
                                        value={supplierForm.country_code}
                                        onChange={(e) => setSupplierForm({ ...supplierForm, country_code: e.target.value.toUpperCase() })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Country Name</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={supplierForm.country_name}
                                        onChange={(e) => setSupplierForm({ ...supplierForm, country_name: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Tax ID / TRN / VAT #</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={supplierForm.tax_id}
                                        onChange={(e) => setSupplierForm({ ...supplierForm, tax_id: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Trade License / Reg #</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={supplierForm.registration_number}
                                        onChange={(e) => setSupplierForm({ ...supplierForm, registration_number: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Website</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="https://"
                                        value={supplierForm.website}
                                        onChange={(e) => setSupplierForm({ ...supplierForm, website: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Company Address</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={supplierForm.address}
                                    onChange={(e) => setSupplierForm({ ...supplierForm, address: e.target.value })}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                                <div className="form-group">
                                    <label className="form-label">Secondary Contact Name</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={supplierForm.secondary_contact_name}
                                        onChange={(e) => setSupplierForm({ ...supplierForm, secondary_contact_name: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Secondary Email</label>
                                    <input
                                        type="email"
                                        className="form-input"
                                        value={supplierForm.secondary_contact_email}
                                        onChange={(e) => setSupplierForm({ ...supplierForm, secondary_contact_email: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Secondary Phone</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={supplierForm.secondary_contact_phone}
                                        onChange={(e) => setSupplierForm({ ...supplierForm, secondary_contact_phone: e.target.value })}
                                    />
                                </div>
                            </div>

                            <strong style={{ fontSize: '13px', color: '#F36B16', textTransform: 'uppercase', marginTop: '4px' }}>
                                2. Commercial Terms, Shipping, Returns &amp; Priority
                            </strong>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
                                <div className="form-group">
                                    <label className="form-label">Payment Terms</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={supplierForm.payment_terms}
                                        onChange={(e) => setSupplierForm({ ...supplierForm, payment_terms: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Default Discount (%)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        className="form-input"
                                        value={supplierForm.default_discount_percent}
                                        onChange={(e) => setSupplierForm({ ...supplierForm, default_discount_percent: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Min Order Value</label>
                                    <input
                                        type="number"
                                        step="1"
                                        className="form-input"
                                        value={supplierForm.minimum_order_value}
                                        onChange={(e) => setSupplierForm({ ...supplierForm, minimum_order_value: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Billing Currency</label>
                                    <select
                                        className="form-select"
                                        value={supplierForm.currency_code}
                                        onChange={(e) => setSupplierForm({ ...supplierForm, currency_code: e.target.value })}
                                    >
                                        <option value="AED">AED</option>
                                        <option value="USD">USD</option>
                                        <option value="EUR">EUR</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Shipping Methods</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={supplierForm.shipping_methods}
                                        onChange={(e) => setSupplierForm({ ...supplierForm, shipping_methods: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Default Shipping Cost</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="form-input"
                                        value={supplierForm.default_shipping_cost}
                                        onChange={(e) => setSupplierForm({ ...supplierForm, default_shipping_cost: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Lead Time (Days)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        className="form-input"
                                        value={supplierForm.lead_time_days}
                                        onChange={(e) => setSupplierForm({ ...supplierForm, lead_time_days: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Reliability Score (0-100)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        className="form-input"
                                        value={supplierForm.reliability_score}
                                        onChange={(e) => setSupplierForm({ ...supplierForm, reliability_score: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Priority Rank (1 = Highest)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="100"
                                        className="form-input"
                                        value={supplierForm.priority_rank}
                                        onChange={(e) => setSupplierForm({ ...supplierForm, priority_rank: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div className="form-group">
                                    <label className="form-label">Return Policy</label>
                                    <textarea
                                        className="form-textarea"
                                        style={{ minHeight: '55px' }}
                                        value={supplierForm.return_policy}
                                        onChange={(e) => setSupplierForm({ ...supplierForm, return_policy: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Warranty &amp; Commercial Conditions</label>
                                    <textarea
                                        className="form-textarea"
                                        style={{ minHeight: '55px' }}
                                        value={supplierForm.warranty_terms}
                                        onChange={(e) => setSupplierForm({ ...supplierForm, warranty_terms: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                                <div className="form-group">
                                    <label className="form-label">Approval Status</label>
                                    <select
                                        className="form-select"
                                        value={supplierForm.approval_status}
                                        onChange={(e) => setSupplierForm({ ...supplierForm, approval_status: e.target.value })}
                                    >
                                        <option value="approved">Approved</option>
                                        <option value="pending">Pending Review</option>
                                        <option value="invited">Invited</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                </div>
                                {editingSupplier && (
                                    <div className="form-group">
                                        <label className="form-label">Portal Status</label>
                                        <select
                                            className="form-select"
                                            value={supplierForm.status}
                                            onChange={(e) => setSupplierForm({ ...supplierForm, status: e.target.value })}
                                        >
                                            <option value="active">Active</option>
                                            <option value="suspended">Suspended</option>
                                        </select>
                                    </div>
                                )}
                                <div className="form-group">
                                    <label className="form-label">
                                        {editingSupplier ? 'New Password (optional)' : 'Password (auto-generated if empty)'}
                                    </label>
                                    <input
                                        type="password"
                                        className="form-input"
                                        minLength={6}
                                        value={supplierForm.password}
                                        onChange={(e) => setSupplierForm({ ...supplierForm, password: e.target.value })}
                                        placeholder="Minimum 6 characters"
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={supplierForm.is_preferred}
                                        onChange={(e) => setSupplierForm({ ...supplierForm, is_preferred: e.target.checked })}
                                    />
                                    <span>Mark as Preferred / Priority Supplier</span>
                                </label>
                                {!editingSupplier && (
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={supplierForm.send_invitation}
                                            onChange={(e) => setSupplierForm({ ...supplierForm, send_invitation: e.target.checked })}
                                        />
                                        <span>Send Admin Invitation Email with Portal Credentials</span>
                                    </label>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    style={{ flex: 1 }}
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submitting}>
                                    {submitting ? 'Saving...' : editingSupplier ? 'Update Supplier Profile' : 'Create / Invite Supplier'}
                                </button>
                            </div>
                        </form>
                    </div>
                </>
            )}

            {/* SUPPLIER DOCUMENTS MODAL */}
            {docSupplier && (
                <>
                    <div className="header-backdrop" onClick={() => setDocSupplier(null)} />
                    <div
                        style={{
                            position: 'fixed',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            backgroundColor: '#FFF',
                            borderRadius: '8px',
                            padding: '24px',
                            width: '92%',
                            maxWidth: '620px',
                            maxHeight: '85vh',
                            overflowY: 'auto',
                            zIndex: 2200,
                            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                            <h3 style={{ fontSize: '17px', fontWeight: 800 }}>
                                Documents — {docSupplier.company_name || docSupplier.name}
                            </h3>
                            <button type="button" onClick={() => setDocSupplier(null)} style={{ background: 'none', border: 'none' }}>
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleUploadDocument} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '18px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <div className="form-group">
                                    <label className="form-label">Document Title *</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        required
                                        placeholder="e.g. Dubai Trade License 2026"
                                        value={docTitle}
                                        onChange={(e) => setDocTitle(e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Document Type *</label>
                                    <select className="form-select" value={docType} onChange={(e) => setDocType(e.target.value)}>
                                        <option value="trade_license">Trade License</option>
                                        <option value="tax_certificate">Tax / VAT Certificate</option>
                                        <option value="agreement">Commercial Agreement</option>
                                        <option value="catalog">Supplier Catalog</option>
                                        <option value="insurance">Insurance Certificate</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <div className="form-group">
                                    <label className="form-label">File *</label>
                                    <input
                                        type="file"
                                        className="form-input"
                                        required
                                        onChange={(e) => setDocFile(e.target.files?.[0] || null)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Expiry Date (Optional)</label>
                                    <input
                                        type="date"
                                        className="form-input"
                                        value={docExpiresAt}
                                        onChange={(e) => setDocExpiresAt(e.target.value)}
                                    />
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary btn-sm" disabled={submitting || !docFile}>
                                <Upload size={14} /> Upload Document
                            </button>
                        </form>

                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Type</th>
                                    <th>Expires</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(docSupplier.supplier_documents || []).length === 0 ? (
                                    <tr>
                                        <td colSpan="4" style={{ textAlign: 'center', color: '#64748B', padding: '14px' }}>
                                            No documents uploaded yet.
                                        </td>
                                    </tr>
                                ) : (
                                    (docSupplier.supplier_documents || []).map((doc) => (
                                        <tr key={doc.id}>
                                            <td>
                                                <a href={`/storage/${doc.file_path}`} target="_blank" rel="noreferrer" style={{ fontWeight: 600 }}>
                                                    {doc.title}
                                                </a>
                                                <small style={{ display: 'block', color: '#64748B' }}>{doc.original_name}</small>
                                            </td>
                                            <td>
                                                <span className="badge badge-neutral">{doc.document_type}</span>
                                            </td>
                                            <td>{doc.expires_at ? String(doc.expires_at).slice(0, 10) : '—'}</td>
                                            <td>
                                                <button
                                                    type="button"
                                                    className="btn btn-outline btn-sm"
                                                    style={{ color: '#D93025' }}
                                                    onClick={() => handleDeleteDocument(doc.id)}
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {/* ADD SUPPLIER OFFER MODAL */}
            {showOfferModal && (
                <>
                    <div className="header-backdrop" onClick={() => setShowOfferModal(false)} />
                    <div
                        style={{
                            position: 'fixed',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            backgroundColor: '#FFF',
                            borderRadius: '8px',
                            padding: '24px',
                            width: '92%',
                            maxWidth: '580px',
                            zIndex: 2200,
                            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                            <h3 style={{ fontSize: '17px', fontWeight: 800 }}>Add / Update Supplier Offer</h3>
                            <button type="button" onClick={() => setShowOfferModal(false)} style={{ background: 'none', border: 'none' }}>
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveOffer} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div className="form-group">
                                <label className="form-label">Product *</label>
                                <select
                                    className="form-select"
                                    required
                                    value={offerForm.product_id}
                                    onChange={(e) => setOfferForm({ ...offerForm, product_id: e.target.value })}
                                >
                                    <option value="">-- Select Product --</option>
                                    {offerComparisons.map((row) => (
                                        <option key={row.product.id} value={row.product.id}>
                                            {row.product.name} ({row.product.sku})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Supplier *</label>
                                <select
                                    className="form-select"
                                    required
                                    value={offerForm.supplier_id}
                                    onChange={(e) => setOfferForm({ ...offerForm, supplier_id: e.target.value })}
                                >
                                    <option value="">-- Select Supplier --</option>
                                    {allSuppliers.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.company_name || s.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                                <div className="form-group">
                                    <label className="form-label">Purchase Price *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        className="form-input"
                                        value={offerForm.purchase_price}
                                        onChange={(e) => setOfferForm({ ...offerForm, purchase_price: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Stock Qty *</label>
                                    <input
                                        type="number"
                                        min="0"
                                        required
                                        className="form-input"
                                        value={offerForm.stock_quantity}
                                        onChange={(e) => setOfferForm({ ...offerForm, stock_quantity: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Shipping Cost</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        className="form-input"
                                        value={offerForm.shipping_cost}
                                        onChange={(e) => setOfferForm({ ...offerForm, shipping_cost: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                                <div className="form-group">
                                    <label className="form-label">Prep Days *</label>
                                    <input
                                        type="number"
                                        min="0"
                                        required
                                        className="form-input"
                                        value={offerForm.preparation_days}
                                        onChange={(e) => setOfferForm({ ...offerForm, preparation_days: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Delivery Days *</label>
                                    <input
                                        type="number"
                                        min="1"
                                        required
                                        className="form-input"
                                        value={offerForm.delivery_days}
                                        onChange={(e) => setOfferForm({ ...offerForm, delivery_days: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Discount (%)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        max="100"
                                        className="form-input"
                                        value={offerForm.commercial_discount_percent}
                                        onChange={(e) => setOfferForm({ ...offerForm, commercial_discount_percent: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Commercial Terms</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={offerForm.commercial_terms}
                                    onChange={(e) => setOfferForm({ ...offerForm, commercial_terms: e.target.value })}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowOfferModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submitting}>
                                    Save Offer &amp; Compare
                                </button>
                            </div>
                        </form>
                    </div>
                </>
            )}

            {/* REJECT LOT / ITEM MODAL */}
            {rejectTarget && (
                <>
                    <div className="header-backdrop" onClick={() => setRejectTarget(null)} />
                    <div
                        style={{
                            position: 'fixed',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            backgroundColor: '#FFF',
                            borderRadius: '8px',
                            padding: '28px',
                            width: '90%',
                            maxWidth: '440px',
                            zIndex: 2200,
                            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                        }}
                    >
                        <h3 style={{ fontSize: '17px', fontWeight: 800, marginBottom: '8px' }}>Reject {rejectTarget.lot_number}</h3>
                        <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '16px' }}>
                            Rejecting returns <strong>{rejectTarget.qty} units</strong> ({rejectTarget.label}) back to the supplier&apos;s
                            available stock.
                        </p>
                        <form onSubmit={handleRejectSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div className="form-group">
                                <label className="form-label">Rejection Reason (Optional)</label>
                                <textarea
                                    className="form-textarea"
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    placeholder="Damaged packaging, wrong specification, etc."
                                    style={{ minHeight: '70px' }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    style={{ flex: 1 }}
                                    onClick={() => setRejectTarget(null)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    style={{ flex: 1, backgroundColor: '#D93025' }}
                                    disabled={submitting}
                                >
                                    Confirm Reject
                                </button>
                            </div>
                        </form>
                    </div>
                </>
            )}
        </AdminLayout>
    );
}
