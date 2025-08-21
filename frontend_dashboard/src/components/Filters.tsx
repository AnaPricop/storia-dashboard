import React from 'react';
import { useFilters } from '../contexts/FiltersContext';
import Slider from 'rc-slider';

const Filters: React.FC = () => {
    const { filters, setFilters } = useFilters();

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilters(prev => ({ ...prev, searchTerm: e.target.value }));
    };
    const handleRoomChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilters(prev => ({ ...prev, roomFilter: e.target.value }));
    };
    const handlePriceChange = (value: number | number[]) => {
        setFilters(prev => ({ ...prev, priceRange: value as [number, number] }));
    };
    const handleSurfaceChange = (value: number | number[]) => {
        setFilters(prev => ({ ...prev, surfaceRange: value as [number, number] }));
    };

    return (
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-md mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 items-end">
            <div>
                <label htmlFor="search-input" className="text-sm font-medium text-dark-brown block mb-2">Căutare după titlu sau locație</label>
                <input
                    id="search-input" type="text" placeholder="ex: Tineretului, Titan..."
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-olive"
                    value={filters.searchTerm} onChange={handleSearchChange}
                />
            </div>
            <div>
                <label htmlFor="rooms-select" className="text-sm font-medium text-dark-brown block mb-2">Număr camere</label>
                <select
                    id="rooms-select"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-olive"
                    value={filters.roomFilter} onChange={handleRoomChange}
                >
                    <option value="">Toate</option>
                    <option value="1">1 Cameră</option>
                    <option value="2">2 Camere</option>
                    <option value="3">3 Camere</option>
                    <option value="4">4 Camere</option>
                    <option value="5">5+ Camere</option>
                </select>
            </div>
            <div className="px-2">
                <label className="text-sm font-medium text-dark-brown block mb-2">
                    Interval Preț: {filters.priceRange[0].toLocaleString()}€ - {filters.priceRange[1].toLocaleString()}€
                </label>
                <Slider
                    range min={0} max={500000} step={10000}
                    value={filters.priceRange} onChange={handlePriceChange}
                    trackStyle={{ backgroundColor: '#A98467' }}
                    handleStyle={{ borderColor: '#6C584C' }}
                />
            </div>
            <div className="px-2">
                <label className="text-sm font-medium text-dark-brown block mb-2">
                    Interval Suprafață: {filters.surfaceRange[0]}m² - {filters.surfaceRange[1]}m²
                </label>
                <Slider
                    range min={0} max={200} step={5}
                    value={filters.surfaceRange} onChange={handleSurfaceChange}
                    trackStyle={{ backgroundColor: '#A98467' }}
                    handleStyle={{ borderColor: '#6C584C' }}
                />
            </div>
        </div>
    );
};

export default Filters;