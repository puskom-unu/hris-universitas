
import React from 'react';
import Card from '../shared/Card';
import { mockKpis } from '../../data/mockData';
import { Kpi } from '../../types';

const KpiCard: React.FC<{ kpi: Kpi }> = ({ kpi }) => {
    const statusClasses = {
        'On Track': 'bg-green-500',
        'At Risk': 'bg-yellow-500',
        'Completed': 'bg-blue-500',
    };
    
    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border-l-4 border-blue-500">
            <div className="flex justify-between items-start">
                <div>
                    <h4 className="font-bold text-md text-gray-900 dark:text-white">{kpi.title}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{kpi.employeeName}</p>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full text-white ${statusClasses[kpi.status]}`}>{kpi.status}</span>
            </div>
            <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-300">Progress</span>
                    <span className="font-bold">{kpi.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${kpi.progress}%` }}></div>
                </div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                <span>Target: {kpi.target}</span>
                <span>Aktual: {kpi.actual}</span>
            </div>
        </div>
    );
};

const PerformanceManagement: React.FC = () => {
    return (
        <Card>
            <h2 className="text-2xl font-bold mb-4">Manajemen Kinerja (KPI)</h2>
            <p className="mb-6 text-gray-600 dark:text-gray-400">
                Memonitor Key Performance Indicators (KPI) untuk setiap pegawai pada periode berjalan.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockKpis.map(kpi => (
                    <KpiCard key={kpi.id} kpi={kpi} />
                ))}
            </div>
        </Card>
    );
};

export default PerformanceManagement;
