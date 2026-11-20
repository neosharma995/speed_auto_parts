import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Plus, Trash2, Car } from 'lucide-react';

export default function AdminVehiclesIndex({ vehicles = [] }) {
    const [year, setYear] = useState('2024');
    const [make, setMake] = useState('');
    const [model, setModel] = useState('');
    const [submodel, setSubmodel] = useState('');
    const [engine, setEngine] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleCreate = (e) => {
        e.preventDefault();
        setSubmitting(true);
        router.post('/admin/vehicles', {
            year: parseInt(year),
            make,
            model,
            submodel,
            engine,
        }, {
            onSuccess: () => {
                setMake('');
                setModel('');
                setSubmodel('');
                setEngine('');
            },
            onFinish: () => setSubmitting(false),
        });
    };

    const handleDelete = (id, displayName) => {
        if (confirm(`Delete vehicle "${displayName}"?`)) {
            router.delete(`/admin/vehicles/${id}`);
        }
    };

    return (
        <AdminLayout title="Vehicle Compatibility Database">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
                <div className="admin-card">
                    <div className="admin-card-header">
                        <h3>Add Vehicle Spec</h3>
                    </div>
                    <div className="admin-card-body">
                        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div className="form-group">
                                <label className="form-label">Year</label>
                                <input type="number" className="form-input" required value={year} onChange={e => setYear(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Make (e.g. Ford, BMW, Toyota)</label>
                                <input type="text" className="form-input" required value={make} onChange={e => setMake(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Model (e.g. Mustang GT, M3)</label>
                                <input type="text" className="form-input" required value={model} onChange={e => setModel(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Submodel / Trim (e.g. Competition)</label>
                                <input type="text" className="form-input" value={submodel} onChange={e => setSubmodel(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Engine Specification</label>
                                <input type="text" className="form-input" required value={engine} onChange={e => setEngine(e.target.value)} placeholder="e.g. 5.0L V8 Coyote" />
                            </div>
                            <button type="submit" className="btn btn-primary" disabled={submitting}>
                                <Plus size={16} /> Add to Vehicle Directory
                            </button>
                        </form>
                    </div>
                </div>

                <div className="admin-card">
                    <div className="admin-card-header">
                        <h3>Registered Vehicles ({vehicles.length})</h3>
                    </div>
                    <div className="admin-card-body" style={{ padding: 0 }}>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Year</th>
                                    <th>Make & Model</th>
                                    <th>Trim</th>
                                    <th>Engine</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {vehicles.map(v => (
                                    <tr key={v.id}>
                                        <td><strong>{v.year}</strong></td>
                                        <td><strong>{v.make}</strong> {v.model}</td>
                                        <td>{v.submodel || '—'}</td>
                                        <td><code>{v.engine}</code></td>
                                        <td>
                                            <button 
                                                type="button" 
                                                className="btn btn-outline btn-sm"
                                                style={{ color: '#D93025' }}
                                                onClick={() => handleDelete(v.id, `${v.year} ${v.make} ${v.model}`)}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
