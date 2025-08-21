import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface PieChartCardProps {
    title: string;
    chartData: {
        labels: string[];
        datasets: {
            label: string;
            data: number[];
            backgroundColor: string[];
            borderColor: string[];
            borderWidth: number;
        }[];
    };
}

const PieChartCard: React.FC<PieChartCardProps> = ({ title, chartData }) => {
    return (
        <div className="flex-1 min-w-[300px] bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 text-center mb-4">{title}</h3>
            <div className="h-64 md:h-80">
                <Pie data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
        </div>
    );
};

export default PieChartCard;