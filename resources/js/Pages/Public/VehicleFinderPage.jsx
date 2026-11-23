import React, { useState, useEffect } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import AppLayout from '@/Layouts/AppLayout';
import { Car, Search, RotateCcw, Check, ArrowRight } from 'lucide-react';

export default function VehicleFinderPage({ activeVehicle = null }) {
    const [years, setYears] = useState([]);
    const [makes, setMakes] = useState([]);
    const [models, setModels] = useState([]);
    const [engines, setEngines] = useState([]);

    const [selectedYear, setSelectedYear] = useState('');
    const [selectedMake, setSelectedMake] = useState('');
    const [selectedModel, setSelectedModel] = useState('');
    const [selectedEngineId, setSelectedEngineId] = useState('');

    const [loadingYears, setLoadingYears] = useState(false);
    const [loadingMakes, setLoadingMakes] = useState(false);
    const [loadingModels, setLoadingModels] = useState(false);
    const [loadingEngines, setLoadingEngines] = useState(false);

    useEffect(() => {
        setLoadingYears(true);
        axios.get('/api/vehicles/years')
            .then(res => setYears(res.data.years || []))
            .finally(() => setLoadingYears(false));
    }, []);

    const handleYearChange = (year) => {
        setSelectedYear(year);
        setSelectedMake('');
        setSelectedModel('');
        setSelectedEngineId('');
        setMakes([]);
        setModels([]);
        setEngines([]);
        if (year) {
            setLoadingMakes(true);
            axios.get(`/api/vehicles/makes?year=${year}`)
                .then(res => setMakes(res.data.makes || []))
                .finally(() => setLoadingMakes(false));
        }
    };

    const handleMakeChange = (make) => {
        setSelectedMake(make);
        setSelectedModel('');
        setSelectedEngineId('');
        setModels([]);
        setEngines([]);
        if (make && selectedYear) {
            setLoadingModels(true);
            axios.get(`/api/vehicles/models?year=${selectedYear}&make=${encodeURIComponent(make)}`)
                .then(res => setModels(res.data.models || []))
                .finally(() => setLoadingModels(false));
        }
    };

    const handleModelChange = (model) => {
        setSelectedModel(model);
        setSelectedEngineId('');
        setEngines([]);
        if (model && selectedMake && selectedYear) {
            setLoadingEngines(true);
            axios.get(`/api/vehicles/engines?year=${selectedYear}&make=${encodeURIComponent(selectedMake)}&model=${encodeURIComponent(model)}`)
                .then(res => setEngines(res.data.engines || []))
                .finally(() => setLoadingEngines(false));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (selectedEngineId) {
            router.post('/vehicles/select', { vehicle_id: selectedEngineId }, {
                onSuccess: () => router.visit(`/shop?vehicle_id=${selectedEngineId}`)
            });
        }
    };

    return (
        <AppLayout title="Shop Automotive Parts By Vehicle">
            <div className="section bg-light" style={{ minHeight: '70vh' }}>
                <div className="container-narrow">
                    <div style={{ textAlign: 'center', marginBottom: '36px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 800, color: '#F36B16', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            Precision Fitment Guarantee
                        </span>
                        <h1 style={{ fontSize: '32px', fontWeight: 900, color: '#151515', marginTop: '4px' }}>
                            SELECT YOUR EXACT VEHICLE
                        </h1>
                        <p style={{ color: '#666', fontSize: '14px', maxWidth: '600px', margin: '8px auto 0' }}>
                            Ensure every tire, brake rotor, suspension kit, and exhaust fits your car without guesswork or return shipping hassle.
                        </p>
                    </div>

                    {activeVehicle && (
                        <div style={{
                            backgroundColor: '#EAF5ED',
                            border: '1px solid #A7F3D0',
                            borderRadius: '8px',
                            padding: '16px 20px',
                            marginBottom: '28px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <div>
                                <span style={{ fontSize: '11px', fontWeight: 700, color: '#168A35', textTransform: 'uppercase' }}>
                                    Active Vehicle Profile
                                </span>
                                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#151515' }}>
                                    {activeVehicle.year} {activeVehicle.make} {activeVehicle.model} ({activeVehicle.engine})
                                </h3>
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <Link href={`/shop?vehicle_id=${activeVehicle.id}`} className="btn btn-primary btn-sm">
                                    Shop Parts For This Car <ArrowRight size={14} />
                                </Link>
                                <button 
                                    type="button" 
                                    className="btn btn-outline btn-sm"
                                    onClick={() => router.post('/vehicles/clear')}
                                >
                                    Clear
                                </button>
                            </div>
                        </div>
                    )}

                    <div style={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #DCDCDC',
                        borderRadius: '8px',
                        padding: '32px'
                    }}>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div className="form-group">
                                <label className="form-label">1. Model Year <span className="required">*</span></label>
                                <select 
                                    className="form-select"
                                    value={selectedYear}
                                    onChange={(e) => handleYearChange(e.target.value)}
                                >
                                    <option value="">Choose Year</option>
                                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">2. Vehicle Make <span className="required">*</span></label>
                                <select 
                                    className="form-select"
                                    value={selectedMake}
                                    onChange={(e) => handleMakeChange(e.target.value)}
                                    disabled={!selectedYear}
                                >
                                    <option value="">Choose Make (e.g. BMW, Ford, Honda)</option>
                                    {makes.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">3. Vehicle Model <span className="required">*</span></label>
                                <select 
                                    className="form-select"
                                    value={selectedModel}
                                    onChange={(e) => handleModelChange(e.target.value)}
                                    disabled={!selectedMake}
                                >
                                    <option value="">Choose Model (e.g. M3, Mustang GT)</option>
                                    {models.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">4. Engine & Trim <span className="required">*</span></label>
                                <select 
                                    className="form-select"
                                    value={selectedEngineId}
                                    onChange={(e) => setSelectedEngineId(e.target.value)}
                                    disabled={!selectedModel}
                                >
                                    <option value="">Choose Engine Specification</option>
                                    {engines.map(eng => (
                                        <option key={eng.id} value={eng.id}>
                                            {eng.engine} {eng.submodel ? `— ${eng.submodel}` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <button 
                                type="submit" 
                                className="btn btn-primary btn-lg btn-full"
                                disabled={!selectedEngineId}
                            >
                                <Search size={18} /> View Guaranteed Compatible Spares
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
