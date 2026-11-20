import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { Hash, Search } from 'lucide-react';

export default function PartNumberSearch() {
    const [partNumber, setPartNumber] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        const clean = partNumber.trim();
        if (clean) {
            router.visit(`/shop?part_number=${encodeURIComponent(clean)}`);
        }
    };

    return (
        <section className="part-number-search-strip">
            <div className="container">
                <div className="part-number-search-strip-inner">
                    <div className="part-number-search-strip-label">
                        <Hash size={20} />
                        <span>Search by Part Number</span>
                    </div>

                    <form onSubmit={handleSearch} className="part-number-search-strip-form">
                        <input 
                            type="text" 
                            placeholder="Enter part number (e.g., AP-12345, AP-54012)"
                            value={partNumber}
                            onChange={(e) => setPartNumber(e.target.value)}
                            aria-label="Part Number"
                        />
                        <button type="submit" className="btn btn-dark">
                            <Search size={16} /> SEARCH
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
}
