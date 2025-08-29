
import React, { useState, useEffect } from 'react';
import Modal from '../shared/Modal';
import Button from '../shared/Button';
import ConfirmationModal from '../shared/ConfirmationModal';

interface GeneratePayrollModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (period: string) => void;
  existingPeriods: string[];
}

const GeneratePayrollModal: React.FC<GeneratePayrollModalProps> = ({ isOpen, onClose, onGenerate, existingPeriods }) => {
    const currentYear = new Date().getFullYear();
    const [year, setYear] = useState(currentYear);
    const [month, setMonth] = useState(new Date().getMonth());
    const [showConfirm, setShowConfirm] = useState(false);

    const period = `${new Intl.DateTimeFormat('id-ID', { month: 'long' }).format(new Date(year, month))} ${year}`;
    const isDuplicate = existingPeriods.includes(period);

    const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
    const months = Array.from({ length: 12 }, (_, i) => ({
        value: i,
        name: new Intl.DateTimeFormat('id-ID', { month: 'long' }).format(new Date(2000, i))
    }));

    useEffect(() => {
        if (!isOpen) {
            setShowConfirm(false);
        }
    }, [isOpen]);

    const handleGenerateClick = () => {
        if (!isDuplicate) {
            setShowConfirm(true);
        }
    };

    const handleConfirmGenerate = () => {
        onGenerate(period);
        setShowConfirm(false);
    };

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} title="Generate Payroll Periode Baru">
                <div className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Pilih periode (bulan dan tahun) untuk membuat slip gaji bagi semua pegawai aktif. Sistem akan mencegah jika periode yang dipilih sudah pernah dibuat sebelumnya.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="year-select" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Tahun</label>
                            <select
                                id="year-select"
                                value={year}
                                onChange={e => setYear(parseInt(e.target.value))}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            >
                                {years.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>
                         <div>
                            <label htmlFor="month-select" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Bulan</label>
                            <select
                                id="month-select"
                                value={month}
                                onChange={e => setMonth(parseInt(e.target.value))}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            >
                                {months.map(m => <option key={m.value} value={m.value}>{m.name}</option>)}
                            </select>
                        </div>
                    </div>

                    {isDuplicate && (
                        <div className="p-3 bg-red-100 dark:bg-red-900/50 rounded-lg text-center">
                            <p className="text-sm font-semibold text-red-700 dark:text-red-300">
                                <i className="fas fa-exclamation-triangle mr-2"></i>
                                Payroll untuk periode <span className="font-bold">{period}</span> sudah pernah di-generate.
                            </p>
                        </div>
                    )}
                    
                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Button variant="secondary" onClick={onClose}>Batal</Button>
                        <Button onClick={handleGenerateClick} disabled={isDuplicate}>
                            Generate
                        </Button>
                    </div>
                </div>
            </Modal>
            
            {showConfirm && (
                 <ConfirmationModal
                    isOpen={showConfirm}
                    onClose={() => setShowConfirm(false)}
                    onConfirm={handleConfirmGenerate}
                    title="Konfirmasi Generate Payroll"
                    message={`Anda akan membuat slip gaji dan mengirim notifikasi untuk periode ${period}. Apakah Anda yakin ingin melanjutkan?`}
                    confirmText="Ya, Generate Sekarang"
                    confirmVariant="primary"
                />
            )}
        </>
    );
};

export default GeneratePayrollModal;
