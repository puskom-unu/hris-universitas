import React, { useState, useEffect } from 'react';
import Modal from '../shared/Modal';
import Button from '../shared/Button';
import { PartnerBank } from '../../types';
import { mockPayslips, mockEmployees } from '../../data/mockData';
import { exportToExcel } from '../../services/reportService';

interface ExportBankModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPeriod: string;
  periods: string[];
  banks: PartnerBank[];
}

const ExportBankModal: React.FC<ExportBankModalProps> = ({ isOpen, onClose, selectedPeriod, periods, banks }) => {
    const [period, setPeriod] = useState(selectedPeriod);
    const [bankFilter, setBankFilter] = useState('All');
    const [isLoading, setIsLoading] = useState(false);

    // Update local period state if the prop changes
    useEffect(() => {
        setPeriod(selectedPeriod);
    }, [selectedPeriod]);

    const handleExport = () => {
        setIsLoading(true);

        const slipsForPeriod = mockPayslips.filter(p => p.period === period);
        const enrichedData = slipsForPeriod.map(slip => {
            const employee = mockEmployees.find(e => e.id === slip.employeeId);
            return {
                ...slip,
                bankName: employee?.bankName || 'N/A',
                accountNumber: employee?.accountNumber || 'N/A',
            };
        });
        
        const filteredByBank = bankFilter === 'All' 
            ? enrichedData 
            : enrichedData.filter(item => item.bankName === bankFilter);
        
        if (filteredByBank.length === 0) {
            alert(`Tidak ada data transfer untuk bank yang dipilih pada periode ${period}.`);
            setIsLoading(false);
            return;
        }

        const dataToExport = filteredByBank.map(item => ({
            'Nama Pegawai': item.employeeName,
            'Nama Bank': item.bankName,
            'Nomor Rekening': item.accountNumber,
            'Jumlah Transfer (IDR)': item.netSalary,
        }));
        
        // Add a totals row for summary
        const totalAmount = filteredByBank.reduce((sum, item) => sum + item.netSalary, 0);
        dataToExport.push({
            'Nama Pegawai': 'TOTAL',
            'Nama Bank': '',
            'Nomor Rekening': '',
            'Jumlah Transfer (IDR)': totalAmount,
        });

        const bankNameForFile = bankFilter.replace(/\s+/g, '_');
        const periodForFile = period.replace(/\s+/g, '_');

        exportToExcel(
            dataToExport,
            `Laporan_Transfer_Bank_${periodForFile}_${bankNameForFile}`,
            'Data Transfer',
            {
                mainHeader: 'Laporan Transfer Bank - UNUGHA Cilacap',
                subHeader: `Periode: ${period} | Bank: ${bankFilter}`
            }
        );
        
        setIsLoading(false);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Export Data Transfer Bank">
            <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Pilih periode dan bank untuk diekspor. File akan diunduh dalam format Excel.</p>
                <div>
                    <label htmlFor="export-period-select" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Periode Penggajian</label>
                    <select
                        id="export-period-select"
                        value={period}
                        onChange={e => setPeriod(e.target.value)}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                        {periods.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="export-bank-select" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Bank Mitra</label>
                    <select
                        id="export-bank-select"
                        value={bankFilter}
                        onChange={e => setBankFilter(e.target.value)}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                        <option value="All">Semua Bank</option>
                        {banks.map(bank => <option key={bank.id} value={bank.name}>{bank.name}</option>)}
                    </select>
                </div>
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button variant="secondary" onClick={onClose}>Batal</Button>
                    <Button onClick={handleExport} disabled={isLoading} icon={isLoading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-file-excel"></i>}>
                        {isLoading ? 'Mengekspor...' : 'Export ke Excel'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default ExportBankModal;
