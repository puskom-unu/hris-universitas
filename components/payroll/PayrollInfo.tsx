
import React, { useMemo, useState, useEffect } from 'react';
import Card from '../shared/Card';
import Button from '../shared/Button';
import Modal from '../shared/Modal';
import PayslipView from './PayslipView';
import { Payslip, Employee } from '../../types';
import { mockEmployees, mockPayslips } from '../../data/mockData';
import Pagination from '../shared/Pagination';
import { useAuth } from '../../context/AuthContext';

const PayrollInfo: React.FC = () => {
    const { user } = useAuth();
    if (!user) return null;
    const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);
    const [payslipToPrint, setPayslipToPrint] = useState<Payslip | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedYear, setSelectedYear] = useState<string>('All');
    const RECORDS_PER_PAGE = 10;

    const employeeData: Employee | undefined = useMemo(() => {
        return mockEmployees.find(e => e.email.toLowerCase() === user.email.toLowerCase());
    }, [user.email]);

    const monthMap: { [key: string]: number } = {
        'Januari': 0, 'Februari': 1, 'Maret': 2, 'April': 3, 'Mei': 4, 'Juni': 5,
        'Juli': 6, 'Agustus': 7, 'September': 8, 'Oktober': 9, 'November': 10, 'Desember': 11
    };

    const payslips: Payslip[] = useMemo(() => {
        if (!employeeData) return [];
        return mockPayslips
            .filter(p => p.employeeId === employeeData.id)
            .sort((a, b) => {
                const [monthA, yearA] = a.period.split(' ');
                const [monthB, yearB] = b.period.split(' ');
                const dateA = new Date(parseInt(yearA), monthMap[monthA]);
                const dateB = new Date(parseInt(yearB), monthMap[monthB]);
                return dateB.getTime() - dateA.getTime();
            });
    }, [employeeData]);
    
    const availableYears = useMemo(() => {
        if (!payslips.length) return [];
        const years = new Set(payslips.map(p => p.period.split(' ')[1]));
        return ['All', ...Array.from(years).sort((a, b) => parseInt(b) - parseInt(a))];
    }, [payslips]);

    useEffect(() => {
        if (availableYears.length > 1) {
            setSelectedYear(availableYears[1]); // Default to the most recent year instead of 'All'
        } else if (availableYears.length === 1 && availableYears[0] !== 'All') {
            setSelectedYear(availableYears[0]);
        }
    }, [availableYears]);

    const filteredPayslips = useMemo(() => {
        if (selectedYear === 'All') {
            return payslips;
        }
        return payslips.filter(p => p.period.endsWith(selectedYear));
    }, [payslips, selectedYear]);
    
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedYear]);

    const totalPages = Math.ceil(filteredPayslips.length / RECORDS_PER_PAGE);
    const paginatedPayslips = useMemo(() => {
        const startIndex = (currentPage - 1) * RECORDS_PER_PAGE;
        return filteredPayslips.slice(startIndex, startIndex + RECORDS_PER_PAGE);
    }, [filteredPayslips, currentPage]);

    useEffect(() => {
        if (payslipToPrint) {
            const printContent = document.getElementById('printable-payslip-info');
            if (printContent) {
                const tailwindCssUrl = "https://cdn.tailwindcss.com";
                const printWindow = window.open('', '_blank');

                if (printWindow) {
                    printWindow.document.write(`
                        <html>
                            <head>
                                <title>Slip Gaji - ${payslipToPrint.employeeName}</title>
                                <script src="${tailwindCssUrl}"></script>
                            </head>
                            <body class="bg-white">
                                ${printContent.innerHTML}
                            </body>
                        </html>
                    `);
                    printWindow.document.close();
                    printWindow.focus();
                    setTimeout(() => {
                        printWindow.print();
                        printWindow.close();
                        setPayslipToPrint(null); // Reset state after printing
                    }, 500);
                } else {
                    alert("Mohon izinkan pop-up untuk mencetak slip gaji.");
                    setPayslipToPrint(null);
                }
            }
        }
    }, [payslipToPrint]);

    const formatCurrency = (amount: number) => `IDR ${amount.toLocaleString('id-ID')}`;

    if (!employeeData) {
        return (
            <Card>
                <h2 className="text-2xl font-bold mb-4">Info Payroll</h2>
                <p>Data pegawai tidak dapat ditemukan.</p>
            </Card>
        );
    }

    return (
        <div>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-6">Riwayat Slip Gaji</h2>
            <Card>
                <div className="flex justify-end mb-4">
                     <div className="flex items-center gap-2">
                        <label htmlFor="year-filter" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Filter Tahun:
                        </label>
                        <select
                            id="year-filter"
                            value={selectedYear}
                            onChange={e => setSelectedYear(e.target.value)}
                            className="bg-gray-100 dark:bg-gray-700 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 px-3 py-1.5 text-sm"
                        >
                            {availableYears.map(year => (
                                <option key={year} value={year}>
                                    {year === 'All' ? 'Semua Tahun' : year}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">Periode</th>
                                <th scope="col" className="px-6 py-3 text-right">Gaji Bersih</th>
                                <th scope="col" className="px-6 py-3 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedPayslips.map(slip => (
                                <tr key={slip.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{slip.period}</td>
                                    <td className="px-6 py-4 text-right font-mono font-semibold">{formatCurrency(slip.netSalary)}</td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex justify-center space-x-2">
                                            <Button variant="secondary" onClick={() => setSelectedPayslip(slip)}>Lihat Slip</Button>
                                            <Button variant="secondary" icon={<i className="fas fa-download"></i>} onClick={() => setPayslipToPrint(slip)}>Unduh Slip</Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredPayslips.length === 0 && (
                        <p className="text-center text-gray-500 py-6">
                            {payslips.length > 0 ? 'Tidak ada riwayat slip gaji untuk tahun yang dipilih.' : 'Tidak ada riwayat slip gaji.'}
                        </p>
                    )}
                </div>
                
                 <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            </Card>

            <Modal isOpen={!!selectedPayslip} onClose={() => setSelectedPayslip(null)} title={`Slip Gaji - ${selectedPayslip?.period}`}>
                {selectedPayslip && <PayslipView payslip={selectedPayslip} />}
            </Modal>

            {/* Hidden div for printing */}
            <div style={{ display: 'none' }}>
                {payslipToPrint && <div id="printable-payslip-info"><PayslipView payslip={payslipToPrint} /></div>}
            </div>
        </div>
    );
};

export default PayrollInfo;
