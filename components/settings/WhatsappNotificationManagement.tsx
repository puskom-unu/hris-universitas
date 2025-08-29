import React, { useState, useEffect } from 'react';
import Card from '../shared/Card';
import Button from '../shared/Button';
import { mockWahaSettings } from '../../data/mockData';
import { WahaSettings, WahaTriggers } from '../../types';
import { sendWhatsappMessage } from '../../services/notificationService';

const WhatsappNotificationManagement: React.FC = () => {
    const [settings, setSettings] = useState<WahaSettings>(mockWahaSettings);
    const [testRecipient, setTestRecipient] = useState<string>('6285647818779');
    const [isTesting, setIsTesting] = useState<boolean>(false);
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleToggleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setSettings(prev => ({ ...prev, [name]: checked }));
    };

    const handleTriggerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setSettings(prev => ({
            ...prev,
            triggers: {
                ...prev.triggers,
                [name]: checked
            }
        }));
    };

    const handleTestConnection = () => {
        if (!testRecipient || !/^\d+$/.test(testRecipient)) {
            alert('Silakan masukkan nomor WhatsApp tujuan yang valid (hanya angka).');
            return;
        }
        setIsTesting(true);
        setTestResult(null);
        
        const testMessage = `[TEST] Pesan ini dikirim dari HRIS UNUGHA untuk menguji koneksi WhatsApp Gateway Anda.`;
        sendWhatsappMessage(testRecipient, testMessage, settings)
            .then(response => {
                setTestResult({ success: true, message: `✓ Pesan tes berhasil dikirim ke ${testRecipient}. (ID: ${response.messageId})` });
            })
            .catch(error => {
                setTestResult({ success: false, message: `✗ Gagal mengirim pesan: ${error.error || 'Terjadi kesalahan.'}` });
            })
            .finally(() => {
                setIsTesting(false);
            });
    };
    
    useEffect(() => {
        handleTestConnection();
    }, []); // Empty array ensures this runs only once on mount


    const handleSave = () => {
        // In a real app, this would update the mockData or send to a backend.
        // For now, we just update the local state which isn't persisted.
        Object.assign(mockWahaSettings, settings);
        alert('Pengaturan berhasil disimpan!');
        console.log('Pengaturan Tersimpan:', settings);
    };

    const FormField: React.FC<{ name: keyof WahaSettings, label: string, placeholder?: string }> = ({ name, label, placeholder }) => (
        <div>
            <label htmlFor={name as string} className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">{label}</label>
            <input
                type="text"
                id={name as string}
                name={name as string}
                value={settings[name] as string}
                onChange={handleInputChange}
                placeholder={placeholder}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
            />
        </div>
    );
    
    const CheckboxField: React.FC<{ name: keyof WahaTriggers, label: string }> = ({ name, label }) => (
         <label className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700/50">
            <input
                type="checkbox"
                name={name}
                checked={settings.triggers[name]}
                onChange={handleTriggerChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
        </label>
    );

    return (
        <Card>
            <h2 className="text-2xl font-bold mb-4">Pengaturan Notifikasi WhatsApp (WAHA)</h2>
            
            <div className="space-y-6">
                {/* General Settings */}
                <div className="p-4 border dark:border-gray-700 rounded-lg">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Status Notifikasi</h3>
                        <label htmlFor="enabled" className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" id="enabled" name="enabled" className="sr-only peer" checked={settings.enabled} onChange={handleToggleChange} />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-500 peer-checked:bg-blue-600"></div>
                            <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">{settings.enabled ? 'Aktif' : 'Nonaktif'}</span>
                        </label>
                    </div>
                </div>

                {/* Connection Settings */}
                <div className="p-4 border dark:border-gray-700 rounded-lg space-y-4">
                     <h3 className="text-lg font-semibold border-b dark:border-gray-600 pb-2 mb-4">Pengaturan Koneksi WAHA</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField name="endpoint" label="WAHA Endpoint URL" />
                        <FormField name="sessionName" label="Nama Sesi (Session Name)" />
                        <FormField name="apiKey" label="API Key (Opsional)" placeholder="Kosongkan jika tidak ada" />
                     </div>
                </div>

                {/* Notification Triggers */}
                 <div className="p-4 border dark:border-gray-700 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Pemicu Notifikasi (Triggers)</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                        <CheckboxField name="leaveApproved" label="Permintaan Cuti Disetujui"/>
                        <CheckboxField name="leaveRejected" label="Permintaan Cuti Ditolak"/>
                        <CheckboxField name="attendanceReminder" label="Pengingat Absensi Masuk/Pulang"/>
                        <CheckboxField name="payslipIssued" label="Slip Gaji Baru Diterbitkan"/>
                    </div>
                 </div>

                 {/* Test Connection */}
                 <div className="p-4 border dark:border-gray-700 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Uji Koneksi</h3>
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex-grow">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Pesan tes akan dikirimkan ke nomor berikut untuk verifikasi koneksi:</p>
                            <p className="font-semibold text-gray-900 dark:text-white mt-1">{testRecipient}</p>
                        </div>
                        <Button onClick={handleTestConnection} disabled={isTesting || !settings.enabled} icon={isTesting ? <i className="fas fa-spinner fa-spin"></i> : <i className="fa-brands fa-whatsapp"></i>}>
                            {isTesting ? 'Mengirim...' : 'Kirim Ulang Pesan Tes'}
                        </Button>
                    </div>
                     {!settings.enabled && <p className="text-xs text-yellow-600 mt-2">Fitur notifikasi harus diaktifkan untuk melakukan tes.</p>}
                     {testResult && (
                        <p className={`text-sm mt-3 p-3 rounded-md ${testResult.success ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'}`}>
                            {testResult.message}
                        </p>
                    )}
                </div>
                
                {/* Save Action */}
                <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button onClick={handleSave}>Simpan Pengaturan</Button>
                </div>
            </div>
        </Card>
    );
};

export default WhatsappNotificationManagement;