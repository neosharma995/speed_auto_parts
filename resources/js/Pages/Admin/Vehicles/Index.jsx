import React, { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import AdminDataTable from '@/Components/Admin/AdminDataTable';
import { Plus, Edit, Trash2, X } from 'lucide-react';

const FUEL_TYPES = ['Petrol', 'Diesel', 'Hybrid', 'Electric', 'CNG'];

const EMPTY_FORM = {
    year: '2024',
    make: '',
    model: '',
    submodel: '',
    engine: '',
    engine_size: '',
    fuel_type: 'Petrol',
    transmission: '',
    body_type: '',
};

export default function AdminVehiclesIndex({ vehicles, makes = [], years = [], filters = {} }) {
    const { errors } = usePage().props;

    const items = Array.isArray(vehicles) ? vehicles : (vehicles?.data || []);
    const totalCount = vehicles?.total ?? items.length;

    const [search, setSearch] = useState(filters?.search || '');
    const [makeFilter, setMakeFilter] = useState(filters?.make || '');
    const [yearFilter, setYearFilter] = useState(filters?.year ? String(filters.year) : '');

    const [showModal, setShowModal] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [submitting, setSubmitting] = useState(false);

    const hasActiveFilters = Boolean(
        (filters?.search && String(filters.search).trim() !== '') ||
        filters?.make ||
        filters?.year
    );

    const handleFilter = (next = {}) => {
        const nextSearch = next.search !== undefined ? next.search : search;
        const nextMake = next.make !== undefined ? next.make : makeFilter;
        const nextYear = next.year !== undefined ? next.year : yearFilter;

        const params = {};
        if (nextSearch && nextSearch.trim()) params.search = nextSearch.trim();
        if (nextMake) params.make = nextMake;
        if (nextYear) params.year = nextYear;

        router.get('/admin/vehicles', params, { preserveState: true, replace: true });
    };

    const handleMakeChange = (val) => {
        setMakeFilter(val);
        handleFilter({ make: val });
    };

    const handleYearChange = (val) => {
        setYearFilter(val);
        handleFilter({ year: val });
    };

    const handleResetFilters = () => {
        setSearch('');
        setMakeFilter('');
        setYearFilter('');
        router.get('/admin/vehicles', {}, { preserveState: true, replace: true });
    };

    const openCreate = () => {
        setEditingVehicle(null);
        setForm({ ...EMPTY_FORM });
        setShowModal(true);
    };

    const openEdit = (vehicle) => {
        setEditingVehicle(vehicle);
        setForm({
            year: vehicle.year ? String(vehicle.year) : '2024',
            make: vehicle.make || '',
            model: vehicle.model || '',
            submodel: vehicle.submodel || '',
            engine: vehicle.engine || '',
            engine_size: vehicle.engine_size || '',
            fuel_type: vehicle.fuel_type || 'Petrol',
            transmission: vehicle.transmission || '',
            body_type: vehicle.body_type || '',
        });
        setShowModal(true);
    };

    const handleSave = (e) => {
        e.preventDefault();
        setSubmitting(true);

        const payload = {
            year: parseInt(form.year, 10),
            make: form.make.trim(),
            model: form.model.trim(),
            submodel: form.submodel.trim() || null,
            engine: form.engine.trim(),
            engine_size: form.engine_size.trim() || null,
            fuel_type: form.fuel_type || 'Petrol',
            transmission: form.transmission.trim() || null,
            body_type: form.body_type.trim() || null,
        };

        const options = {
            preserveScroll: true,
            onSuccess: () => {
                setShowModal(false);
                setEditingVehicle(null);
            },
            onFinish: () => setSubmitting(false),
        };

        if (editingVehicle) {
            router.put(`/admin/vehicles/${editingVehicle.id}`, payload, options);
        } else {
            router.post('/admin/vehicles', payload, options);
        }
    };

    const handleDelete = (vehicle) => {
        const displayName = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
        if (confirm(`Delete vehicle "${displayName}"?`)) {
            router.delete(`/admin/vehicles/${vehicle.id}`, { preserveScroll: true });
        }
    };

    const errorMessages = Object.values(errors || {}).filter(Boolean);

    const columns = [
        {
            key: 'year',
            label: 'Year',
            render: (v) => <strong>{v.year}</strong>,
        },
        {
            key: 'make_model',
            label: 'Make & Model',
            render: (v) => (
                <>
                    <strong>{v.make}</strong> {v.model}
                </>
            ),
        },
        {
            key: 'submodel',
            label: 'Trim / Submodel',
            render: (v) => v.submodel || '—',
        },
        {
            key: 'engine',
            label: 'Engine',
            render: (v) => (
                <>
                    <code>{v.engine}</code>
                    {v.engine_size && (
                        <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                            {v.engine_size}
                        </div>
                    )}
                </>
            ),
        },
        {
            key: 'specs',
            label: 'Specs',
            render: (v) => {
                const extraSpecs = [v.transmission, v.body_type].filter(Boolean).join(' • ');
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                        <span className="badge badge-neutral">{v.fuel_type || 'Petrol'}</span>
                        {extraSpecs && <small style={{ color: '#64748B', fontSize: '12px' }}>{extraSpecs}</small>}
                    </div>
                );
            },
        },
        {
            key: 'linked_parts',
            label: 'Linked Parts',
            render: (v) => <span className="badge badge-neutral">{v.product_vehicles_count ?? 0} linked</span>,
        },
        {
            key: 'actions',
            label: 'Actions',
            align: 'right',
            render: (v) => (
                <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                    <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        title="Edit Vehicle"
                        onClick={() => openEdit(v)}
                    >
                        <Edit size={14} />
                    </button>
                    <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        style={{ color: '#D93025', borderColor: '#FECDD3' }}
                        title="Delete Vehicle"
                        onClick={() => handleDelete(v)}
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <AdminLayout title="Vehicle Compatibility Database">
            <AdminDataTable
                title="Registered Vehicles"
                count={totalCount}
                search={{
                    value: search,
                    onChange: setSearch,
                    placeholder: 'Search by make, model, trim, engine, year...',
                }}
                filters={[
                    {
                        key: 'make',
                        value: makeFilter,
                        onChange: handleMakeChange,
                        placeholder: 'All Makes',
                        options: makes.map((m) => ({ value: m, label: m })),
                    },
                    {
                        key: 'year',
                        value: yearFilter,
                        onChange: handleYearChange,
                        placeholder: 'All Years',
                        options: years.map((y) => ({ value: String(y), label: String(y) })),
                    },
                ]}
                onSearch={() => handleFilter()}
                searchButtonLabel="Filter"
                hasActiveFilters={hasActiveFilters}
                onReset={handleResetFilters}
                actions={
                    <button type="button" className="btn btn-primary btn-sm" onClick={openCreate}>
                        <Plus size={16} /> Add Vehicle
                    </button>
                }
                columns={columns}
                rows={items}
                emptyMessage="No vehicles found matching your criteria."
                pagination={Array.isArray(vehicles) ? null : vehicles}
                itemLabel="vehicles"
            />

            {/* Create / Edit Vehicle Modal */}
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
                            padding: '28px',
                            width: '92%',
                            maxWidth: '580px',
                            maxHeight: '90vh',
                            overflowY: 'auto',
                            zIndex: 2200,
                            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '18px',
                            }}
                        >
                            <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>
                                {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
                            </h3>
                            <button
                                type="button"
                                className="btn btn-outline btn-sm"
                                onClick={() => setShowModal(false)}
                                aria-label="Close modal"
                            >
                                <X size={15} />
                            </button>
                        </div>

                        {errorMessages.length > 0 && (
                            <div
                                style={{
                                    backgroundColor: '#FEF2F2',
                                    border: '1px solid #FECACA',
                                    color: '#B91C1C',
                                    borderRadius: '6px',
                                    padding: '10px 14px',
                                    fontSize: '13px',
                                    marginBottom: '16px',
                                }}
                            >
                                <ul style={{ margin: 0, paddingLeft: '18px' }}>
                                    {errorMessages.map((msg, i) => (
                                        <li key={i}>{msg}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                                <div className="form-group">
                                    <label className="form-label">
                                        Year <span className="required">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="1970"
                                        max="2035"
                                        className="form-input"
                                        required
                                        value={form.year}
                                        onChange={(e) => setForm({ ...form, year: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Fuel Type</label>
                                    <select
                                        className="form-select"
                                        value={form.fuel_type}
                                        onChange={(e) => setForm({ ...form, fuel_type: e.target.value })}
                                    >
                                        {FUEL_TYPES.map((ft) => (
                                            <option key={ft} value={ft}>
                                                {ft}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">
                                        Make <span className="required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        required
                                        placeholder="e.g. Ford, BMW, Toyota"
                                        value={form.make}
                                        onChange={(e) => setForm({ ...form, make: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">
                                        Model <span className="required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        required
                                        placeholder="e.g. Mustang GT, M3"
                                        value={form.model}
                                        onChange={(e) => setForm({ ...form, model: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Submodel / Trim</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="e.g. Competition, Dark Horse"
                                        value={form.submodel}
                                        onChange={(e) => setForm({ ...form, submodel: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Engine Size</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="e.g. 5.0L, 3.0L"
                                        value={form.engine_size}
                                        onChange={(e) => setForm({ ...form, engine_size: e.target.value })}
                                    />
                                </div>

                                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                    <label className="form-label">
                                        Engine Specification <span className="required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        required
                                        placeholder="e.g. 5.0L V8 Coyote"
                                        value={form.engine}
                                        onChange={(e) => setForm({ ...form, engine: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Transmission</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="e.g. 6-Speed Manual, 8-Speed Auto"
                                        value={form.transmission}
                                        onChange={(e) => setForm({ ...form, transmission: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Body Type</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="e.g. Coupe, Sedan, Hatchback"
                                        value={form.body_type}
                                        onChange={(e) => setForm({ ...form, body_type: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={submitting}>
                                    {submitting
                                        ? 'Saving...'
                                        : editingVehicle
                                            ? 'Update Vehicle'
                                            : 'Create Vehicle'}
                                </button>
                            </div>
                        </form>
                    </div>
                </>
            )}
        </AdminLayout>
    );
}
