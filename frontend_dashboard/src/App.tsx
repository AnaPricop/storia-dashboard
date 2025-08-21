import { useState, useEffect } from 'react';
import axios from 'axios';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import PieChartCard from './components/PieChartCard';
import KpiCards from './components/KpiCards';
import './index.css'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Listing {
    TITLU: string;
    LOCATIE: string;
    PRET: number;
    SUPRAFATA_MP: number;
    PRET_PE_MP: number;
    LINK: string;
}

interface DistrictStat {
    DISTRICT: string;
    AVG_PRICE_SQM: number;
}

export interface KpiData {
    TOTAL_LISTINGS: number;
    AVERAGE_PRICE: number;
    AVERAGE_PRICE_SQM: number;
    MOST_EXPENSIVE_DISTRICT: string;
}

interface RoomDistribution {
    ROOM_CATEGORY: string;
    AD_COUNT: number;
}
interface SectorDistribution {
    SECTOR: string;
    AD_COUNT: number;
}


const API_BASE_URL = 'http://localhost:3001';

function App() {
    const [listings, setListings] = useState<Listing[]>([]);
    const [stats, setStats] = useState<DistrictStat[]>([]);
    const [kpis, setKpis] = useState<KpiData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [roomDistribution, setRoomDistribution] = useState<RoomDistribution[]>([]);
    const [sectorDistribution, setSectorDistribution] = useState<SectorDistribution[]>([]);



    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [listingsResponse, statsResponse, kpisResponse, roomDistResponse, sectorDistResponse] = await Promise.all([
                    axios.get(`${API_BASE_URL}/api/listings`),
                    axios.get(`${API_BASE_URL}/api/stats/avg_price_by_district`),
                    axios.get<KpiData>(`${API_BASE_URL}/api/stats/kpis`),
                    axios.get<RoomDistribution[]>(`${API_BASE_URL}/api/stats/distribution_by_rooms`),
                    axios.get<SectorDistribution[]>(`${API_BASE_URL}/api/stats/distribution_by_sector`)
                ]);

                setListings(listingsResponse.data);
                setStats(statsResponse.data);
                setKpis(kpisResponse.data);
                setRoomDistribution(roomDistResponse.data);
                setSectorDistribution(sectorDistResponse.data);
                setError(null);
            } catch (err) {
                setError('Failed to fetch data from the server.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const barChartColors = [
        '#ADC178',
        '#6C584C',
        '#DDE5B6',

        '#ADC178',
        '#A98467',
        '#6C584C',
        '#DDE5B6',
        '#ADC178',
        '#A98467',
    ];


    const chartData = {
        labels: stats.map(s => s.DISTRICT),
        datasets: [
            {
                label: 'Preț Mediu €/m²',
                data: stats.map(s => s.AVG_PRICE_SQM),
                // Atribuim array-ul de culori
                backgroundColor: barChartColors,
                borderColor: '#F0EAD2', // Un chenar subtil, bej
                borderWidth: 1,
            },
        ],
    };
    const roomColors = [
        '#ADC178',
        '#A98467',
        '#DDE5B6',
        '#6C584C',
        '#BFB59E',
    ];

    const roomDistributionChartData = {
        labels: roomDistribution.map(item => item.ROOM_CATEGORY),
        datasets: [{
            label: 'Nr. Anunțuri',
            data: roomDistribution.map(item => item.AD_COUNT),
            backgroundColor: roomColors,
            borderColor: '#F0EAD2',
            borderWidth: 2,
        }],
    };

    const sectorColors = [
        'rgba(173, 193, 120, 1)',
        'rgba(169, 132, 103, 1)',
        'rgba(108, 88, 76, 1)',
        'rgba(173, 193, 120, 0.7)',
        'rgba(169, 132, 103, 0.7)',
        'rgba(108, 88, 76, 0.7)',
    ];

    const sectorDistributionChartData = {
        labels: sectorDistribution.map(item => item.SECTOR),
        datasets: [{
            label: 'Nr. Anunțuri',
            data: sectorDistribution.map(item => item.AD_COUNT),
            backgroundColor: sectorColors,
            borderColor: '#FFFFFF',
            borderWidth: 2,
        }],
    };
    if (loading) return <p>Loading data from Snowflake...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div className="bg-gray-100 min-h-screen font-sans">
            <main className="container mx-auto p-4 md:p-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard Imobiliare - Storia.ro</h1>

                <KpiCards data={kpis} />

                <div className="flex flex-wrap gap-6 justify-center mb-8">
                    <div className="w-full lg:flex-1 bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-lg font-semibold text-gray-700 text-center mb-4">Preț Mediu / m² pe Cartier</h2>
                        <div className="h-96">
                            <Bar data={chartData} options={{ indexAxis: 'y' as const,
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: {
                                        display: false
                                    }
                                } }} />
                        </div>
                    </div>

                    <PieChartCard title="Distribuție după Nr. Camere" chartData={roomDistributionChartData} />
                    <PieChartCard title="Distribuție pe Sectoare" chartData={sectorDistributionChartData} />
                </div>

                <section className="bg-white rounded-lg shadow-md overflow-hidden">
                    <h2 className="text-lg font-semibold text-gray-700 p-6">Ultimele Anunțuri</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-100">
                            <tr>
                                <th className="p-4 font-semibold text-sm text-gray-600">Titlu</th>
                                <th className="p-4 font-semibold text-sm text-gray-600">Locație</th>
                                <th className="p-4 font-semibold text-sm text-gray-600">Preț (€)</th>
                                <th className="p-4 font-semibold text-sm text-gray-600">Suprafață (m²)</th>
                                <th className="p-4 font-semibold text-sm text-gray-600">€/m²</th>
                            </tr>
                            </thead>
                            <tbody>
                            {listings.map((listing, index) => (
                                <tr key={index} className="border-t border-gray-200">
                                    <td className="p-4 text-sm text-gray-800">{listing.TITLU}</td>
                                    <td className="p-4 text-sm text-gray-700">{listing.LOCATIE}</td>
                                    <td className="p-4 text-sm text-gray-800">{listing.PRET.toLocaleString()}</td>
                                    <td className="p-4 text-sm text-gray-700">{listing.SUPRAFATA_MP}</td>
                                    <td className="p-4 text-sm text-gray-800">{Math.round(listing.PRET_PE_MP).toLocaleString()}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>
        </div>
    );
}

export default App;