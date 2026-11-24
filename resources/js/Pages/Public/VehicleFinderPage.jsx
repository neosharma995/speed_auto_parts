import React, { useState, useEffect } from 'react';
import { Link, router } from '@inertiajs/react';
import axios from 'axios';
import AppLayout from '@/Layouts/AppLayout';
import { ChevronRight, Search, ArrowRight, RotateCcw, CheckCircle } from 'lucide-react';

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
        <AppLayout title="Select Your Exact Vehicle">
            <div className="support-page vehicle-finder-page">
                <div className="container">
                    {/* Breadcrumbs matching Track Order, Shop, Brands, Categories */}
                    <div className="breadcrumb-nav">
                        <Link href="/" className="breadcrumb-link">Home</Link>
                        <ChevronRight size={12} className="breadcrumb-arrow" />
                        <span className="breadcrumb-current">Select Your Vehicle</span>
                    </div>

                    {/* Left-Aligned Header with official stripe icon matching other pages */}
                    <div className="support-page-header">
                        <h1>
                            <img src="/assets/icons/heading-stripe.webp" alt="" className="title-stripe-icon" />
                            Select Your Exact Vehicle
                        </h1>
                        <p>
                            Ensure every tire, brake rotor, suspension kit, and exhaust fits your car without guesswork or return shipping hassle.
                        </p>
                    </div>

                    {/* Active Vehicle Banner (if a vehicle profile is selected) */}
                    {activeVehicle && (
                        <div className="active-vehicle-banner">
                            <div className="active-vehicle-info">
                                <span className="active-vehicle-badge">
                                    <CheckCircle size={14} /> Active Vehicle Profile
                                </span>
                                <h3 className="active-vehicle-title">
                                    {activeVehicle.year} {activeVehicle.make} {activeVehicle.model} {activeVehicle.engine ? `(${activeVehicle.engine})` : ''}
                                </h3>
                            </div>
                            <div className="active-vehicle-actions">
                                <Link href={`/shop?vehicle_id=${activeVehicle.id}`} className="btn-shop-car">
                                    <span>Shop Parts For This Car</span>
                                    <ArrowRight size={14} />
                                </Link>
                                <button 
                                    type="button" 
                                    className="btn-clear-car"
                                    onClick={() => router.post('/vehicles/clear')}
                                >
                                    <RotateCcw size={13} />
                                    <span>Clear</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Full Width Card with All Form Fields in One Line */}
                    <div className="vehicle-finder-card">
                        <form onSubmit={handleSubmit} className="vehicle-finder-form">
                            {/* 1. Model Year */}
                            <div className="form-col">
                                <label className="form-label">
                                    1. Model Year <span className="required">*</span>
                                </label>
                                <select 
                                    className="form-select"
                                    value={selectedYear}
                                    onChange={(e) => handleYearChange(e.target.value)}
                                    disabled={loadingYears}
                                >
                                    <option value="">{loadingYears ? 'Loading...' : 'Choose Year'}</option>
                                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                            </div>

                            {/* 2. Vehicle Make */}
                            <div className="form-col">
                                <label className="form-label">
                                    2. Vehicle Make <span className="required">*</span>
                                </label>
                                <select 
                                    className="form-select"
                                    value={selectedMake}
                                    onChange={(e) => handleMakeChange(e.target.value)}
                                    disabled={!selectedYear || loadingMakes}
                                >
                                    <option value="">
                                        {loadingMakes ? 'Loading Makes...' : 'Choose Make'}
                                    </option>
                                    {makes.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>

                            {/* 3. Vehicle Model */}
                            <div className="form-col">
                                <label className="form-label">
                                    3. Vehicle Model <span className="required">*</span>
                                </label>
                                <select 
                                    className="form-select"
                                    value={selectedModel}
                                    onChange={(e) => handleModelChange(e.target.value)}
                                    disabled={!selectedMake || loadingModels}
                                >
                                    <option value="">
                                        {loadingModels ? 'Loading Models...' : 'Choose Model'}
                                    </option>
                                    {models.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>

                            {/* 4. Engine & Trim */}
                            <div className="form-col">
                                <label className="form-label">
                                    4. Engine & Trim <span className="required">*</span>
                                </label>
                                <select 
                                    className="form-select"
                                    value={selectedEngineId}
                                    onChange={(e) => setSelectedEngineId(e.target.value)}
                                    disabled={!selectedModel || loadingEngines}
                                >
                                    <option value="">
                                        {loadingEngines ? 'Loading Engines...' : 'Choose Engine'}
                                    </option>
                                    {engines.map(eng => (
                                        <option key={eng.id} value={eng.id}>
                                            {eng.engine} {eng.submodel ? `— ${eng.submodel}` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Action Button */}
                            <div className="form-col form-col-action">
                                <button 
                                    type="submit" 
                                    className="btn-vehicle-search"
                                    disabled={!selectedEngineId}
                                >
                                    <Search size={16} />
                                    <span>Find Parts</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
