
import React, { useState, useEffect, useMemo } from 'react';
import Card from '../shared/Card';
import Button from '../shared/Button';
import Modal from '../shared/Modal';
import PayslipView from './PayslipView';
import { mockPayslips, mockEmployees, mockWahaSettings, mockEmployeeSalaryComponents, mockPayrollComponents, mockPartnerBanks } from '../../data/mockData';
import { Payslip, PayItem } from '../../types';
import Pagination from '../shared/Pagination';
import { sendWhatsappMessage } from '../../services/notificationService';
import GeneratePayrollModal from './GeneratePayrollModal';
import ExportBankModal from './ExportBankModal';

const PayrollManagement: React.FC = () => {
    const [payslips, setPayslips] = useState<Payslip[]>(mockPayslips);
    const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);
    const [payslipToPrint, setPayslipToPrint] = useState<Payslip | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processResult, setProcessResult] = useState('');
    const RECORDS_PER_PAGE = 10;

    const monthMap: { [key: string]: number } = {
        'Januari': 0, 'Februari': 1, 'Maret': 2, 'April': 3, 'Mei': 4, 'Juni': 5,
        'Juli': 6, 'Agustus': 7, 'September': 8, 'Oktober': 9, 'November': 10, 'Desember': 11
    };

    const payrollPeriods = useMemo(() => {
        const periods = new Set(payslips.map(p => p.period));
        return Array.from(periods).sort((a, b) => {
            const [monthA, yearA] = a.split(' ');
            const [monthB, yearB] = b.split(' ');
            const dateA = new Date(parseInt(yearA), monthMap[monthA]);
            const dateB = new Date(parseInt(yearB), monthMap[monthB]);
            return dateB.getTime() - dateA.getTime();
        });
    }, [payslips]);

    const [selectedPeriod, setSelectedPeriod] = useState<string>('');

    useEffect(() => {
        if(payrollPeriods.length > 0 && !selectedPeriod) {
            setSelectedPeriod(payrollPeriods[0]);
        }
    }, [payrollPeriods, selectedPeriod]);


    const filteredPayslips = useMemo(() => {
        if (!selectedPeriod) return [];
        return payslips.filter(p => p.period === selectedPeriod);
    }, [selectedPeriod, payslips]);

    useEffect(() => {
        setCurrentPage(1);
        setProcessResult(''); 
    }, [selectedPeriod]);

    const sendNotificationsForPayslips = async (payslipsToNotify: Payslip[]) => {
        setProcessResult(`Mengirim ${payslipsToNotify.length} notifikasi...`);
        
        if (!mockWahaSettings.enabled || !mockWahaSettings.triggers.payslipIssued) {
            setTimeout(() => {
                setProcessResult(`Proses generate selesai. Notifikasi WA nonaktif.`);
                setIsProcessing(false);
            }, 1000);
            return;
        }

        const notificationPromises = payslipsToNotify.map(payslip => {
            const employee = mockEmployees.find(e => e.id === payslip.employeeId);
            if (!employee || !employee.whatsappNumber) {
                return Promise.resolve({ success: false, employeeName: payslip.employeeName });
            }
    
            const message = `Yth. ${employee.name}, slip gaji Anda untuk periode ${payslip.period} telah terbit. Silakan cek di sistem HRIS UNUGHA.`;
            return sendWhatsappMessage(employee.whatsappNumber, message, mockWahaSettings)
                .then(() => ({ success: true, employeeName: payslip.employeeName }))
                .catch((error) => {
                    console.error(`Failed to send payslip notification to ${employee.name}:`, error.error || error);
                    return { success: false, employeeName: payslip.employeeName };
                });
        });

        const results = await Promise.all(notificationPromises);
        const successCount = results.filter(r => r.success).length;
    
        setProcessResult(`Proses selesai. ${successCount} dari ${payslipsToNotify.length} notifikasi berhasil dikirim.`);
        setIsProcessing(false);
    };

    const handleGeneratePayroll = (period: string) => {
        setIsGenerateModalOpen(false);
        setIsProcessing(true);
        setProcessResult('Membuat slip gaji...');

        // Simulate generation delay
        setTimeout(() => {
            const newPayslips: Payslip[] = mockEmployees
                .filter(e => e.status === 'Active')
                .map(employee => {
                    const earnings = mockEmployeeSalaryComponents
                        .filter(sc => sc.employeeId === employee.id && mockPayrollComponents.find(c => c.id === sc.componentId)?.type === 'Earning')
                        .reduce((sum, item) => sum + item.amount, 0);
                    const deductions = mockEmployeeSalaryComponents
                        .filter(sc => sc.employeeId === employee.id && mockPayrollComponents.find(c => c.id === sc.componentId)?.type === 'Deduction')
                        .reduce((sum, item) => sum + item.amount, 0);
                    
                    const payItems: PayItem[] = mockEmployeeSalaryComponents
                        .filter(sc => sc.employeeId === employee.id)
                        .map(sc => {
                            const component = mockPayrollComponents.find(c => c.id === sc.componentId);
                            return {
                                name: component?.name || 'Unknown',
                                type: component?.type || 'Earning',
                                amount: sc.amount,
                            };
                        });

                    return {
                        id: `PS-${employee.id}-${Date.now()}`,
                        employeeId: employee.id,
                        employeeName: employee.name,
                        period: period,
                        grossSalary: earnings,
                        totalDeductions: deductions,
                        netSalary: earnings - deductions,
                        items: payItems,
                    };
                });
            
            setPayslips(prev => [...prev, ...newPayslips]);
            setSelectedPeriod(period); // Switch view to the newly generated period
            sendNotificationsForPayslips(newPayslips);

        }, 1500);
    };

    const totalPages = Math.ceil(filteredPayslips.length / RECORDS_PER_PAGE);
    const paginatedPayslips = useMemo(() => {
        const startIndex = (currentPage - 1) * RECORDS_PER_PAGE;
        return filteredPayslips.slice(startIndex, startIndex + RECORDS_PER_PAGE);
    }, [filteredPayslips, currentPage]);


    const handleViewPayslip = (payslip: Payslip) => {
        setSelectedPayslip(payslip);
    };

    const handleCloseModal = () => {
        setSelectedPayslip(null);
    };
    
    useEffect(() => {
        if (payslipToPrint) {
            const printContent = document.getElementById('printable-payslip');
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
                    }, 500); // Timeout for styles to load
                } else {
                    alert("Mohon izinkan pop-up untuk mencetak slip gaji.");
                    setPayslipToPrint(null);
                }
            }
        }
    }, [payslipToPrint]);


    return (
        <Card>
            <h2 className="text-2xl font-bold mb-4">Manajemen Payroll</h2>
            <div className="flex flex-col md:flex-row justify-between items-start mb-4 gap-4">
                <div className="flex-grow">
                     <label htmlFor="period-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lihat Periode</label>
                    <select
                        id="period-select"
                        value={selectedPeriod}
                        onChange={e => setSelectedPeriod(e.target.value)}
                        className="bg-gray-100 dark:bg-gray-700 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 px-4 py-2"
                    >
                        {payrollPeriods.map(period => (
                            <option key={period} value={period}>{period}</option>
                        ))}
                    </select>
                </div>
                <div className="flex items-start space-x-2">
                    <div className="text-right">
                        <Button 
                            icon={isProcessing ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-cogs"></i>} 
                            onClick={() => setIsGenerateModalOpen(true)}
                            disabled={isProcessing}
                        >
                            {isProcessing ? 'Memproses...' : 'Generate Payroll Periode Baru'}
                        </Button>
                        {processResult && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{processResult}</p>}
                    </div>
                    <Button 
                        icon={<i className="fas fa-file-export"></i>}
                        onClick={() => setIsExportModalOpen(true)}
                    >
                        Export Bank
                    </Button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">Pegawai</th>
                            <th scope="col" className="px-6 py-3">Periode</th>
                            <th scope="col" className="px-6 py-3">Gaji Bersih (Net)</th>
                            <th scope="col" className="px-6 py-3">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedPayslips.map((payslip: Payslip) => (
                            <tr key={payslip.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{payslip.employeeName}</td>
                                <td className="px-6 py-4">{payslip.period}</td>
                                <td className="px-6 py-4 font-mono">IDR {payslip.netSalary.toLocaleString('id-ID')}</td>
                                <td className="px-6 py-4">
                                    <div className="flex space-x-2">
                                        <Button variant="secondary" onClick={() => handleViewPayslip(payslip)}>
                                            Lihat Slip
                                        </Button>
                                        <Button variant="secondary" icon={<i className="fas fa-file-pdf"></i>} onClick={() => setPayslipToPrint(payslip)}>
                                            Export PDF
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                         {filteredPayslips.length === 0 && !isProcessing && (
                            <tr>
                                <td colSpan={4} className="text-center py-10 text-gray-500">
                                    Tidak ada data payroll untuk periode yang dipilih.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />
            
            <Modal isOpen={!!selectedPayslip} onClose={handleCloseModal} title={`Slip Gaji - ${selectedPayslip?.employeeName}`}>
                {selectedPayslip && <PayslipView payslip={selectedPayslip} />}
            </Modal>

            <GeneratePayrollModal
                isOpen={isGenerateModalOpen}
                onClose={() => setIsGenerateModalOpen(false)}
                onGenerate={handleGeneratePayroll}
                existingPeriods={payrollPeriods}
            />
            
            <ExportBankModal
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                selectedPeriod={selectedPeriod}
                periods={payrollPeriods}
                banks={mockPartnerBanks}
            />

            {/* Hidden div for printing */}
            <div style={{ display: 'none' }}>
                {payslipToPrint && <div id="printable-payslip"><PayslipView payslip={payslipToPrint} /></div>}
            </div>
        </Card>
    );
};

export default PayrollManagement;
