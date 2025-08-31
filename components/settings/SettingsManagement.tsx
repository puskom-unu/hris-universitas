
import React, { useState, useEffect } from 'react';
import Card from '../shared/Card';
import Button from '../shared/Button';
import { MasterDataView } from '../../types';
import PositionManagement from './PositionManagement';
import UnitManagement from './UnitManagement';
import LeaveTypeManagement from './LeaveTypeManagement';
import PayrollComponentManagement from './PayrollComponentManagement';
import WhatsappNotificationManagement from './WhatsappNotificationManagement';
import PartnerBankManagement from './PartnerBankManagement';
import DatabaseSettingsManagement from './DatabaseSettingsManagement';
import R2StorageManagement from './R2StorageManagement';
import { getWorkerConfigStatus } from '../../services/apiService';
import { WorkerConfigStatus } from '../../types';


interface MasterDataCardProps {
    title: string;
    description: string;
    icon: string;
    onClick: () => void;
}

const MasterDataCard: React.FC<MasterDataCardProps> = ({ title, description, icon, onClick }) => (
    <Card className="flex flex-col text-center items-center">
        <div className="p-4 bg-blue-100 dark:bg-blue-900/50 rounded-full mb-4">
            <i className={`fas ${icon} fa-2x text-blue-600 dark:text-blue-300`}></i>
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 flex-grow">{description}</p>
        <div className="mt-4 w-full">
            <Button variant="secondary" onClick={onClick}>
                Kelola
            </Button>
        </div>
    </Card>
);

const SettingsManagement: React.FC = () => {
    const [currentView, setCurrentView] = useState<MasterDataView>(MasterDataView.NONE);
    const [configStatus, setConfigStatus] = useState<WorkerConfigStatus | null>(null);

    useEffect(() => {
        getWorkerConfigStatus().then(setConfigStatus).catch(() => setConfigStatus(null));
    }, []);

    const renderView = () => {
        switch(currentView) {
            case MasterDataView.POSITIONS:
                return <PositionManagement />;
            case MasterDataView.UNITS:
                return <UnitManagement />;
            case MasterDataView.LEAVE_TYPES:
                return <LeaveTypeManagement />;
            case MasterDataView.PAYROLL_COMPONENTS:
                return <PayrollComponentManagement />;
            case MasterDataView.WHATSAPP_NOTIFICATIONS:
                return <WhatsappNotificationManagement />;
            case MasterDataView.PARTNER_BANKS:
                return <PartnerBankManagement />;
            case MasterDataView.DATABASE_SETTINGS:
                return <DatabaseSettingsManagement />;
            case MasterDataView.R2_STORAGE:
                return <R2StorageManagement />;
            default:
                return renderOverview();
        }
    };

    const renderOverview = () => (
        <div>
            <h2 className="text-2xl font-bold mb-4">Pengaturan Master Data & Integrasi</h2>
            {configStatus && (
                <div className="mb-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-md text-sm">
                    <p>API Key WAHA terpasang: {configStatus.waha.hasApiKey ? 'Ya' : 'Tidak'}</p>
                </div>
            )}
            <p className="mb-6 text-gray-600 dark:text-gray-400">
                Kelola data pokok yang digunakan di seluruh sistem HRIS dan konfigurasikan integrasi dengan layanan eksternal.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MasterDataCard 
                    title="Kelola Jabatan"
                    description="Tambah, edit, atau hapus daftar jabatan struktural dan fungsional di lingkungan universitas."
                    icon="fa-briefcase"
                    onClick={() => setCurrentView(MasterDataView.POSITIONS)}
                />
                <MasterDataCard 
                    title="Kelola Unit Kerja"
                    description="Atur semua unit kerja, termasuk fakultas, biro, lembaga, dan unit pelaksana teknis (UPT)."
                    icon="fa-building"
                    onClick={() => setCurrentView(MasterDataView.UNITS)}
                />
                 <MasterDataCard 
                    title="Kelola Jenis Cuti"
                    description="Definisikan berbagai jenis cuti dan izin yang berlaku, beserta kuota dan aturannya masing-masing."
                    icon="fa-calendar-check"
                    onClick={() => setCurrentView(MasterDataView.LEAVE_TYPES)}
                />
                 <MasterDataCard 
                    title="Komponen Gaji"
                    description="Tentukan item-item pendapatan (tunjangan) dan potongan yang menjadi dasar perhitungan payroll."
                    icon="fa-wallet"
                    onClick={() => setCurrentView(MasterDataView.PAYROLL_COMPONENTS)}
                />
                 <MasterDataCard
                    title="Bank Mitra"
                    description="Kelola daftar bank mitra kerja sama untuk keperluan transfer gaji dan administrasi lainnya."
                    icon="fa-landmark"
                    onClick={() => setCurrentView(MasterDataView.PARTNER_BANKS)}
                />
                 <MasterDataCard 
                    title="Notifikasi WhatsApp"
                    description="Konfigurasi integrasi dengan layanan notifikasi WhatsApp untuk mengirim pemberitahuan otomatis."
                    icon="fa-brands fa-whatsapp"
                    onClick={() => setCurrentView(MasterDataView.WHATSAPP_NOTIFICATIONS)}
                />
                <MasterDataCard
                    title="Konfigurasi Database"
                    description="Atur koneksi ke database cloud (Cloudflare D1) untuk sinkronisasi dan penyimpanan data."
                    icon="fa-database"
                    onClick={() => setCurrentView(MasterDataView.DATABASE_SETTINGS)}
                />
                <MasterDataCard
                    title="Penyimpanan Objek (R2)"
                    description="Atur koneksi ke Cloudflare R2 untuk menyimpan file dan dokumen seperti lampiran cuti."
                    icon="fa-archive"
                    onClick={() => setCurrentView(MasterDataView.R2_STORAGE)}
                />
            </div>
        </div>
    );

    return (
         <div>
            {currentView !== MasterDataView.NONE && (
                <div className="mb-4">
                    <Button variant="secondary" onClick={() => setCurrentView(MasterDataView.NONE)} icon={<i className="fas fa-arrow-left"></i>}>
                        Kembali ke Pengaturan
                    </Button>
                </div>
            )}
            {renderView()}
        </div>
    );
};

export default SettingsManagement;
