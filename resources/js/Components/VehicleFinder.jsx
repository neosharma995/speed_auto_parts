import React, { useState, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { Car, Search, RotateCcw, Check, AlertCircle } from 'lucide-react';

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

        // Call backend route to set active vehicle in session and redirect to compatible shop
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
        <section className="vehicle-finder-bar">
            <div className="container">
                <div className="vehicle-finder-bar-inner">
                    <div className="vehicle-finder-bar-title">
                        <Car size={20} />
                        <span>Select Your Vehicle</span>
                    </div>

                    <form onSubmit={handleSearch} className="vehicle-finder-bar-form">
                        {/* 1. Year */}
                        <select 
                            className="form-select"
                            value={selectedYear}
                            onChange={(e) => handleYearChange(e.target.value)}
                            disabled={loadingYears}
                            aria-label="Select Year"
                        >
                            <option value="">1. Select Year</option>
                            {years.map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>

                        {/* 2. Make */}
                        <select 
                            className="form-select"
                            value={selectedMake}
                            onChange={(e) => handleMakeChange(e.target.value)}
                            disabled={!selectedYear || loadingMakes}
                            aria-label="Select Make"
                        >
                            <option value="">2. Select Make</option>
                            {makes.map(m => (
                                <option key={m} value={m}>{m}</option>
                            ))}
                        </select>

                        {/* 3. Model */}
                        <select 
                            className="form-select"
                            value={selectedModel}
                            onChange={(e) => handleModelChange(e.target.value)}
                            disabled={!selectedMake || loadingModels}
                            aria-label="Select Model"
                        >
                            <option value="">3. Select Model</option>
                            {models.map(m => (
                                <option key={m} value={m}>{m}</option>
                            ))}
                        </select>

                        {/* 4. Engine */}
                        <select 
                            className="form-select"
                            value={selectedEngineId}
                            onChange={(e) => {
                                setSelectedEngineId(e.target.value);
                                setErrorMessage('');
                            }}
                            disabled={!selectedModel || loadingEngines}
                            aria-label="Select Engine"
                        >
                            <option value="">4. Select Engine</option>
                            {engines.map(eng => (
                                <option key={eng.id} value={eng.id}>
                                    {eng.engine} {eng.submodel ? `(${eng.submodel})` : ''}
                                </option>
                            ))}
                        </select>

                        {/* Submit CTA */}
                        <button 
                            type="submit" 
                            className="btn btn-primary"
                            disabled={!selectedEngineId}
                        >
                            <Search size={16} /> FIND PARTS
                        </button>

                        {/* Reset button */}
                        {(selectedYear || selectedMake || selectedModel || selectedEngineId) && (
                            <button 
                                type="button" 
                                className="btn btn-outline"
                                onClick={() => handleYearChange('')}
                                title="Reset Selections"
                            >
                                <RotateCcw size={16} />
                            </button>
                        )}
                    </form>
                </div>

                {errorMessage && (
                    <div style={{ color: '#D93025', fontSize: '12px', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <AlertCircle size={14} /> {errorMessage}
                    </div>
                )}

                {/* Display active selected vehicle if in session */}
                {activeVehicle && (
                    <div className="vehicle-finder-bar-active-vehicle">
                        <div className="vehicle-info">
                            <Check size={18} />
                            <span>Currently Filtering For: <strong>{activeVehicle.year} {activeVehicle.make} {activeVehicle.model} ({activeVehicle.engine})</strong></span>
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
        </section>
    );
}
