
import React, { useState, useMemo } from 'react';
import Card from '../shared/Card';
import Button from '../shared/Button';
import { mockPayslips } from '../../data/mockData';
import { exportToExcel } from '../../services/reportService';

const PayrollPeriodReport: React.FC = () => {
    const payrollPeriods = useMemo(() => [...new Set(mockPayslips.map(p => p.period))], []);
    const [selectedPeriod, setSelectedPeriod] = useState<string>(payrollPeriods[0] || '');

    const reportData = useMemo(() => {
        return mockPayslips.filter(p => p.period === selectedPeriod);
    }, [selectedPeriod]);

    const totals = useMemo(() => {
        return reportData.reduce((acc, slip) => {
            acc.gross += slip.grossSalary;
            acc.deductions += slip.totalDeductions;
            acc.net += slip.netSalary;
            return acc;
        }, { gross: 0, deductions: 0, net: 0 });
    }, [reportData]);

    const handleExport = () => {
        const dataToExport = reportData.map(p => ({
            'Nama Pegawai': p.employeeName,
            'Periode': p.period,
            'Pendapatan Kotor (IDR)': p.grossSalary,
            'Total Potongan (IDR)': p.totalDeductions,
            'Gaji Bersih (IDR)': p.netSalary,
        }));
        
        // Add totals row
        dataToExport.push({
            'Nama Pegawai': 'TOTAL',
            'Periode': '',
            'Pendapatan Kotor (IDR)': totals.gross,
            'Total Potongan (IDR)': totals.deductions,
            'Gaji Bersih (IDR)': totals.net,
        });

        exportToExcel(dataToExport, `Laporan_Penggajian_${selectedPeriod.replace(' ', '_')}`, 'Laporan Gaji');
    };

    const formatCurrency = (amount: number) => `IDR ${amount.toLocaleString('id-ID')}`;

    return (
        <Card>
            <h2 className="text-2xl font-bold mb-4">Laporan Penggajian per Periode</h2>
            <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                <div>
                    <label htmlFor="period-select" className="text-sm font-medium mr-2">Pilih Periode:</label>
                    <select
                        id="period-select"
                        value={selectedPeriod}
                        onChange={e => setSelectedPeriod(e.target.value)}
                        className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm"
                    >
                        {payrollPeriods.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                </div>
                <Button onClick={handleExport} icon={<i className="fas fa-file-excel"></i>} variant="secondary">Export ke Excel</Button>
            </div>
             <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th className="px-6 py-3">Nama Pegawai</th>
                            <th className="px-6 py-3 text-right">Pendapatan Kotor</th>
                            <th className="px-6 py-3 text-right">Total Potongan</th>
                            <th className="px-6 py-3 text-right">Gaji Bersih</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reportData.map(slip => (
                             <tr key={slip.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{slip.employeeName}</td>
                                <td className="px-6 py-4 text-right font-mono">{formatCurrency(slip.grossSalary)}</td>
                                <td className="px-6 py-4 text-right font-mono text-red-500">{formatCurrency(slip.totalDeductions)}</td>
                                <td className="px-6 py-4 text-right font-mono font-bold text-green-600">{formatCurrency(slip.netSalary)}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="font-bold bg-gray-100 dark:bg-gray-700">
                        <tr className="border-t-2 border-gray-300 dark:border-gray-600">
                            <td className="px-6 py-3 text-right">TOTAL</td>
                            <td className="px-6 py-3 text-right font-mono">{formatCurrency(totals.gross)}</td>
                            <td className="px-6 py-3 text-right font-mono">{formatCurrency(totals.deductions)}</td>
                            <td className="px-6 py-3 text-right font-mono">{formatCurrency(totals.net)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </Card>
    );
};

export default PayrollPeriodReport;
