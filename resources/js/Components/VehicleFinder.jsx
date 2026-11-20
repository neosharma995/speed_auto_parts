import React, { useState, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { Car, Search, RotateCcw, Check, AlertCircle, ArrowRight } from 'lucide-react';

export default function VehicleFinder() {
    const { activeVehicle } = usePage().props;

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
    const [errorMessage, setErrorMessage] = useState('');

    // Fetch initial years
    useEffect(() => {
        setLoadingYears(true);
        axios.get('/api/vehicles/years')
            .then(res => setYears(res.data.years || []))
            .catch(err => console.error('Failed to load years', err))
            .finally(() => setLoadingYears(false));
    }, []);

    // When Year changes, fetch Makes & reset dependent
    const handleYearChange = (year) => {
        setSelectedYear(year);
        setSelectedMake('');
        setSelectedModel('');
        setSelectedEngineId('');
        setMakes([]);
        setModels([]);
        setEngines([]);
        setErrorMessage('');

        if (year) {
            setLoadingMakes(true);
            axios.get(`/api/vehicles/makes?year=${year}`)
                .then(res => setMakes(res.data.makes || []))
                .catch(err => console.error(err))
                .finally(() => setLoadingMakes(false));
        }
    };

    // When Make changes, fetch Models & reset dependent
    const handleMakeChange = (make) => {
        setSelectedMake(make);
        setSelectedModel('');
        setSelectedEngineId('');
        setModels([]);
        setEngines([]);
        setErrorMessage('');

        if (make && selectedYear) {
            setLoadingModels(true);
            axios.get(`/api/vehicles/models?year=${selectedYear}&make=${encodeURIComponent(make)}`)
                .then(res => setModels(res.data.models || []))
                .catch(err => console.error(err))
                .finally(() => setLoadingModels(false));
        }
    };

    // When Model changes, fetch Engines & reset dependent
    const handleModelChange = (model) => {
        setSelectedModel(model);
        setSelectedEngineId('');
        setEngines([]);
        setErrorMessage('');

        if (model && selectedMake && selectedYear) {
            setLoadingEngines(true);
            axios.get(`/api/vehicles/engines?year=${selectedYear}&make=${encodeURIComponent(selectedMake)}&model=${encodeURIComponent(model)}`)
                .then(res => setEngines(res.data.engines || []))
                .catch(err => console.error(err))
                .finally(() => setLoadingEngines(false));
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (!selectedYear || !selectedMake || !selectedModel || !selectedEngineId) {
            setErrorMessage('Please select Year, Make, Model, and Engine to find verified compatible parts.');
            return;
        }

        router.post('/vehicles/select', {
            vehicle_id: selectedEngineId,
        }, {
            onSuccess: () => {
                router.visit(`/shop?vehicle_id=${selectedEngineId}`);
            }
        });
    };

    const handleClearVehicle = () => {
        router.post('/vehicles/clear', {}, {
            onSuccess: () => {
                setSelectedYear('');
                setSelectedMake('');
                setSelectedModel('');
                setSelectedEngineId('');
            }
        });
    };

    return (
        <div className="hero-vehicle-finder" aria-label="Vehicle Fitment Filter">
            <div className="container">
                <div className="hero-vehicle-finder-inner">
                    {/* Left Title: Car outline icon + Stacked Text */}
                    <div className="hvf-title">
                        <div className="hvf-icon-wrap">
                            <Car size={26} strokeWidth={2} />
                        </div>
                        <div className="hvf-text">
                            <span className="hvf-sub">Find Parts For</span>
                            <strong className="hvf-main">Your Vehicle</strong>
                        </div>
                    </div>

                    {/* Form: 4 Dropdowns + Submit CTA */}
                    <form onSubmit={handleSearch} className="hvf-form">
                        {/* 1. Year */}
                        <div className="hvf-field">
                            <label className="hvf-label">Year</label>
                            <select 
                                className="hvf-select"
                                value={selectedYear}
                                onChange={(e) => handleYearChange(e.target.value)}
                                disabled={loadingYears}
                                aria-label="Select Year"
                            >
                                <option value="">Select Year</option>
                                {years.map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>

                        {/* 2. Make */}
                        <div className="hvf-field">
                            <label className="hvf-label">Make</label>
                            <select 
                                className="hvf-select"
                                value={selectedMake}
                                onChange={(e) => handleMakeChange(e.target.value)}
                                disabled={!selectedYear || loadingMakes}
                                aria-label="Select Make"
                            >
                                <option value="">Select Make</option>
                                {makes.map(m => (
                                    <option key={m} value={m}>{m}</option>
                                ))}
                            </select>
                        </div>

                        {/* 3. Model */}
                        <div className="hvf-field">
                            <label className="hvf-label">Model</label>
                            <select 
                                className="hvf-select"
                                value={selectedModel}
                                onChange={(e) => handleModelChange(e.target.value)}
                                disabled={!selectedMake || loadingModels}
                                aria-label="Select Model"
                            >
                                <option value="">Select Model</option>
                                {models.map(m => (
                                    <option key={m} value={m}>{m}</option>
                                ))}
                            </select>
                        </div>

                        {/* 4. Engine */}
                        <div className="hvf-field">
                            <label className="hvf-label">Engine</label>
                            <select 
                                className="hvf-select"
                                value={selectedEngineId}
                                onChange={(e) => {
                                    setSelectedEngineId(e.target.value);
                                    setErrorMessage('');
                                }}
                                disabled={!selectedModel || loadingEngines}
                                aria-label="Select Engine"
                            >
                                <option value="">Select Engine</option>
                                {engines.map(eng => (
                                    <option key={eng.id} value={eng.id}>
                                        {eng.engine} {eng.submodel ? `(${eng.submodel})` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Action buttons */}
                        <div className="hvf-actions">
                            <button 
                                type="submit" 
                                className="btn btn-primary hvf-submit-btn"
                            >
                                <Search size={15} />
                                <span>Find Parts</span>
                                <ArrowRight size={15} />
                            </button>

                            {(selectedYear || selectedMake || selectedModel || selectedEngineId) && (
                                <button 
                                    type="button" 
                                    className="btn hvf-reset-btn"
                                    onClick={() => handleYearChange('')}
                                    title="Reset Selections"
                                >
                                    <RotateCcw size={15} />
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {errorMessage && (
                    <div style={{ color: '#F87171', fontSize: '12px', marginTop: '8px', padding: '0 28px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <AlertCircle size={14} /> {errorMessage}
                    </div>
                )}

                {activeVehicle && (
                    <div className="hvf-active-vehicle">
                        <div className="vehicle-info">
                            <Check size={18} />
                            <span>Filtering: <strong>{activeVehicle.year} {activeVehicle.make} {activeVehicle.model} ({activeVehicle.engine})</strong></span>
                        </div>
                        <button 
                            type="button" 
                            className="vehicle-clear"
                            onClick={handleClearVehicle}
                        >
                            Change Vehicle
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
