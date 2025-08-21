import React, { createContext, useState, useContext } from 'react';

interface IFilters {
    searchTerm: string;
    roomFilter: string;
    priceRange: [number, number];
    surfaceRange: [number, number];
}

interface IFiltersContext {
    filters: IFilters;
    setFilters: React.Dispatch<React.SetStateAction<IFilters>>;
}

const FiltersContext = createContext<IFiltersContext | undefined>(undefined);

export const FiltersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [filters, setFilters] = useState<IFilters>({
        searchTerm: '',
        roomFilter: '',
        priceRange: [0, 500000],
        surfaceRange: [0, 200],
    });

    return (
        <FiltersContext.Provider value={{ filters, setFilters }}>
            {children}
        </FiltersContext.Provider>
    );
};

export const useFilters = () => {
    const context = useContext(FiltersContext);
    if (context === undefined) {
        throw new Error('useFilters must be used within a FiltersProvider');
    }
    return context;
};