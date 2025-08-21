import React, {useState, useEffect} from 'react';
import axios from 'axios';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import KpiCards from '../components/KpiCards';
import PieChartCard from '../components/PieChartCard';
import {Bar} from 'react-chartjs-2';
import {useFilters} from "../contexts/FiltersContext.tsx";
import qs from 'qs';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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

const DashboardPage: React.FC = () => {
    const [stats, setStats] = useState<DistrictStat[]>([]);
    const [kpis, setKpis] = useState<KpiData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [roomDistribution, setRoomDistribution] = useState<RoomDistribution[]>([]);
    const [sectorDistribution, setSectorDistribution] = useState<SectorDistribution[]>([]);
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
    const {filters} = useFilters();
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                const [
                    kpisResponse,
                    districtStatsResponse,
                    roomDistResponse,
                    sectorDistResponse
                ] = await Promise.all([
                    axios.get<KpiData>(`${API_BASE_URL}/api/stats/kpis`, {params: filters, paramsSerializer: params => {
                            return qs.stringify(params, {arrayFormat: 'brackets'})
                        }}),
                    axios.get<DistrictStat[]>(`${API_BASE_URL}/api/stats/avg_price_by_district`, {
                        params: {...filters, sort: sortOrder, limit: 10},
                        paramsSerializer: params => {
                            return qs.stringify(params, {arrayFormat: 'brackets'})
                        }
                    }),
                    axios.get<RoomDistribution[]>(`${API_BASE_URL}/api/stats/distribution_by_rooms`, {
                        params: filters, paramsSerializer: params => {
                            return qs.stringify(params, {arrayFormat: 'brackets'})
                        }
                    }),
                    axios.get<SectorDistribution[]>(`${API_BASE_URL}/api/stats/distribution_by_sector`, {
                        params: filters, paramsSerializer: params => {
                            return qs.stringify(params, {arrayFormat: 'brackets'})
                        }
                    })
                ]);

                setStats(districtStatsResponse.data);
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
    }, [filters, sortOrder]);

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
            label: 'Nr. Anunturi',
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
            label: 'Nr. Anunturi',
            data: sectorDistribution.map(item => item.AD_COUNT),
            backgroundColor: sectorColors,
            borderColor: '#FFFFFF',
            borderWidth: 2,
        }],
    };
    if (loading) return <p>Loading data from Snowflake...</p>;
    if (error) return <p style={{color: 'red'}}>{error}</p>;
    const sortedStats = sortOrder === 'asc' ? [...stats].reverse() : stats;
    const chartData = {
        labels: sortedStats.map(s => s.DISTRICT),
        datasets: [
            {
                label: 'Pret Mediu €/m²',
                data: sortedStats.map(s => s.AVG_PRICE_SQM),
                backgroundColor: barChartColors,
                borderColor: '#F0EAD2',
                borderWidth: 1,
            },
        ],
    };
    return (
        <div className="bg-gray-100 min-h-screen font-sans">
            <main className="container mx-auto p-4 md:p-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard Storia.ro</h1>

                <KpiCards data={kpis}/>

                <div className="flex flex-col gap-6 mb-8">


                    <div className="flex flex-wrap lg:flex-nowrap gap-6">

                        <PieChartCard title="Distributie dupa nr. de camere" chartData={roomDistributionChartData}/>

                        <PieChartCard title="Distributie pe sectoare" chartData={sectorDistributionChartData}/>
                    </div>
                    <div className="w-full bg-white p-6 rounded-lg shadow-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-gray-700">
                                {sortOrder === 'desc' ? 'Top 10 Cele Mai Scumpe Cartiere' : 'Top 10 Cele Mai Ieftine Cartiere'}
                            </h2>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => setSortOrder('desc')}
                                    className={`px-3 py-1 text-sm rounded-md transition ${sortOrder === 'desc' ? 'bg-olive text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                                >
                                    Top Scumpe
                                </button>
                                <button
                                    onClick={() => setSortOrder('asc')}
                                    className={`px-3 py-1 text-sm rounded-md transition ${sortOrder === 'asc' ? 'bg-tan text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                                >
                                    Top Ieftine
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <div className="relative" style={{height: '450px', minWidth: '1200px'}}>
                                <Bar
                                    data={chartData}
                                    options={{
                                        indexAxis: 'x' as const,
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        scales: {
                                            x: {
                                                ticks: {
                                                    autoSkip: false,
                                                    maxRotation: 90,
                                                    minRotation: 90
                                                }
                                            },
                                            y: {
                                                beginAtZero: true
                                            }
                                        },
                                        plugins: {
                                            legend: {display: false}
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>


            </main>
        </div>
    );
}

export default DashboardPage;