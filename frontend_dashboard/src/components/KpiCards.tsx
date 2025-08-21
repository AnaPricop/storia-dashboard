import React, {type JSX} from 'react';
import type {KpiData} from '../App';

interface KpiCardsProps {
    data: KpiData | null;
}
const KpiCard: React.FC<{ title: string; value: string | number; icon: JSX.Element }> = ({ title, value, icon }) => {
    return (
        <div className="bg-beige border border-tan/20 rounded-lg shadow-lg p-6 flex items-center space-x-4 transition-transform transform hover:-translate-y-1">
            <div className="bg-light-green p-3 rounded-full">
                {icon}
            </div>
            <div>
                <h3 className="text-sm font-semibold text-tan">{title}</h3>
                <p className="text-2xl font-bold text-dark-brown mt-1">{value}</p>
            </div>
        </div>
    );
};


const KpiCards: React.FC<KpiCardsProps> = ({ data }) => {
    if (!data) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-pulse">
                <div className="bg-gray-200 h-24 rounded-lg"></div>
                <div className="bg-gray-200 h-24 rounded-lg"></div>
                <div className="bg-gray-200 h-24 rounded-lg"></div>
                <div className="bg-gray-200 h-24 rounded-lg"></div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <KpiCard
                title="Anunturi Totale"
                value={data.TOTAL_LISTINGS.toLocaleString()}
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-dark-brown" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>}
            />
            <KpiCard
                title="Pret Mediu"
                value={`${data.AVERAGE_PRICE.toLocaleString()} €`}
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-dark-brown" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
            />
            <KpiCard
                title="Pret Mediu / m²"
                value={`${data.AVERAGE_PRICE_SQM.toLocaleString()} €`}
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-dark-brown" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
            />
            <KpiCard
                title="Cel Mai Scump Cartier"
                value={data.MOST_EXPENSIVE_DISTRICT}
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-dark-brown" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
            />
        </div>
    );
};

export default KpiCards;