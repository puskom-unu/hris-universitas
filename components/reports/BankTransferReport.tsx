
import React, { useState, useMemo } from 'react';
import Card from '../shared/Card';
import Button from '../shared/Button';
import { mockPayslips, mockEmployees, mockPartnerBanks } from '../../data/mockData';
import { exportToExcel } from '../../services/reportService';

const BankTransferReport: React.FC = () => {
    const payrollPeriods = useMemo(() => [...new Set(mockPayslips.map(p => p.period))], []);
    const [selectedPeriod, setSelectedPeriod] = useState<string>(payrollPeriods[0] || '');
    const [bankFilter, setBankFilter] = useState<string>('All');

    const reportData = useMemo(() => {
        const slipsForPeriod = mockPayslips.filter(p => p.period === selectedPeriod);
        const enrichedData = slipsForPeriod.map(slip => {
            const employee = mockEmployees.find(e => e.id === slip.employeeId);
            return {
                ...slip,
                bankName: employee?.bankName || 'N/A',
                accountNumber: employee?.accountNumber || 'N/A',
            };
        });

        if (bankFilter === 'All') {
            return enrichedData;
        }
        return enrichedData.filter(item => item.bankName === bankFilter);

    }, [selectedPeriod, bankFilter]);
    
    const totalAmount = useMemo(() => {
        return reportData.reduce((sum, item) => sum + item.netSalary, 0);
    }, [reportData]);

    const handleExport = () => {
        const dataToExport = reportData.map(item => ({
            'Nama Pegawai': item.employeeName,
            'Nama Bank': item.bankName,
            'Nomor Rekening': item.accountNumber,
            'Jumlah Transfer (IDR)': item.netSalary,
        }));
        exportToExcel(dataToExport, `Laporan_Transfer_Bank_${selectedPeriod.replace(' ', '_')}`, 'Transfer Bank');
    };

    const formatCurrency = (amount: number) => amount.toLocaleString('id-ID');

    return (
        <Card>
            <h2 className="text-2xl font-bold mb-4">Laporan Transfer Bank</h2>
            <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                <div className="flex items-center gap-4 flex-wrap">
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
                    <div>
                        <label htmlFor="bank-filter" className="text-sm font-medium mr-2">Filter Bank:</label>
                        <select
                            id="bank-filter"
                            value={bankFilter}
                            onChange={e => setBankFilter(e.target.value)}
                            className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm"
                        >
                            <option value="All">Semua Bank</option>
                            {mockPartnerBanks.map(bank => <option key={bank.id} value={bank.name}>{bank.name}</option>)}
                        </select>
                    </div>
                </div>
                <Button onClick={handleExport} icon={<i className="fas fa-file-excel"></i>} variant="secondary">Export ke Excel</Button>
            </div>
             <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th className="px-6 py-3">Nama Pegawai</th>
                            <th className="px-6 py-3">Bank</th>
                            <th className="px-6 py-3">Nomor Rekening</th>
                            <th className="px-6 py-3 text-right">Jumlah Transfer (IDR)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reportData.map(item => (
                             <tr key={item.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{item.employeeName}</td>
                                <td className="px-6 py-4">{item.bankName}</td>
                                <td className="px-6 py-4 font-mono">{item.accountNumber}</td>
                                <td className="px-6 py-4 text-right font-mono font-semibold">{formatCurrency(item.netSalary)}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="font-bold bg-gray-100 dark:bg-gray-700">
                        <tr className="border-t-2 border-gray-300 dark:border-gray-600">
                            <td colSpan={3} className="px-6 py-3 text-right">TOTAL TRANSFER</td>
                            <td className="px-6 py-3 text-right font-mono">IDR {formatCurrency(totalAmount)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </Card>
    );
};

export default BankTransferReport;
