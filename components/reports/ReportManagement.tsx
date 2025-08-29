
import React, { useState } from 'react';
import Card from '../shared/Card';
import Button from '../shared/Button';
import { ReportView } from '../../types';
import EmployeeListReport from './EmployeeListReport';
import PayrollPeriodReport from './PayrollPeriodReport';
import BankTransferReport from './BankTransferReport';
import AttendanceSummaryReport from './AttendanceSummaryReport';

interface ReportCardProps {
    title: string;
    description: string;
    icon: string;
    onClick: () => void;
}

const ReportCard: React.FC<ReportCardProps> = ({ title, description, icon, onClick }) => (
    <Card className="flex flex-col text-center items-center">
        <div className="p-4 bg-blue-100 dark:bg-blue-900/50 rounded-full mb-4">
            <i className={`fas ${icon} fa-2x text-blue-600 dark:text-blue-300`}></i>
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 flex-grow">{description}</p>
        <div className="mt-4 w-full">
            <Button variant="secondary" onClick={onClick}>
                Buka Laporan
            </Button>
        </div>
    </Card>
);

const ReportManagement: React.FC = () => {
    const [currentView, setCurrentView] = useState<ReportView>(ReportView.NONE);

    const renderView = () => {
        switch(currentView) {
            case ReportView.EMPLOYEE_LIST:
                return <EmployeeListReport />;
            case ReportView.PAYROLL_PERIOD:
                return <PayrollPeriodReport />;
            case ReportView.BANK_TRANSFER:
                return <BankTransferReport />;
            case ReportView.ATTENDANCE_SUMMARY:
                return <AttendanceSummaryReport />;
            default:
                return renderOverview();
        }
    };

    const renderOverview = () => (
        <div>
            <h2 className="text-2xl font-bold mb-4">Pusat Laporan</h2>
            <p className="mb-6 text-gray-600 dark:text-gray-400">
                Akses berbagai laporan untuk mendapatkan wawasan tentang data kepegawaian, penggajian, dan kehadiran.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <ReportCard 
                    title="Laporan Data Pegawai"
                    description="Lihat, filter, dan ekspor data induk seluruh pegawai aktif dan nonaktif."
                    icon="fa-users"
                    onClick={() => setCurrentView(ReportView.EMPLOYEE_LIST)}
                />
                <ReportCard 
                    title="Laporan Penggajian"
                    description="Rincian rekapitulasi penggajian (pendapatan, potongan, gaji bersih) per periode."
                    icon="fa-file-invoice-dollar"
                    onClick={() => setCurrentView(ReportView.PAYROLL_PERIOD)}
                />
                 <ReportCard 
                    title="Laporan Transfer Bank"
                    description="Hasilkan file untuk keperluan transfer gaji ke bank dengan format yang sesuai."
                    icon="fa-university"
                    onClick={() => setCurrentView(ReportView.BANK_TRANSFER)}
                />
                 <ReportCard 
                    title="Laporan Rekap Presensi"
                    description="Laporan rekapitulasi kehadiran pegawai dalam rentang waktu tertentu."
                    icon="fa-calendar-alt"
                    onClick={() => setCurrentView(ReportView.ATTENDANCE_SUMMARY)}
                />
            </div>
        </div>
    );

    return (
         <div>
            {currentView !== ReportView.NONE && (
                <div className="mb-4">
                    <Button variant="secondary" onClick={() => setCurrentView(ReportView.NONE)} icon={<i className="fas fa-arrow-left"></i>}>
                        Kembali ke Pusat Laporan
                    </Button>
                </div>
            )}
            {renderView()}
        </div>
    );
};

export default ReportManagement;