import React, { useState, useEffect } from 'react';
import Card from '../shared/Card';
import Button from '../shared/Button';
import { D1DatabaseSettings } from '../../types';
import { getD1Settings, saveD1Settings, testD1Connection, seedInitialDataToD1 } from '../../services/apiService';

const DatabaseSettingsManagement: React.FC = () => {
    const [settings, setSettings] = useState<D1DatabaseSettings>({
        enabled: false,
        accountId: '',
        databaseId: '',
        authToken: '',
    });
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [isTesting, setIsTesting] = useState<boolean>(false);
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
    const [processMessage, setProcessMessage] = useState<string | null>(null);
    const [showToken, setShowToken] = useState<boolean>(false);

    useEffect(() => {
        setIsLoading(true);
        getD1Settings().then(dataFromApi => {
            setSettings(prev => ({
                ...prev,
                enabled: dataFromApi.enabled,
                accountId: dataFromApi.accountId,
                databaseId: dataFromApi.databaseId,
                authToken: '',
            }));
            setIsLoading(false);
        }).catch(err => {
            console.error("Failed to load settings:", err);
            alert("Gagal memuat pengaturan database.");
            setIsLoading(false);
        });
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleToggleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setSettings(prev => ({ ...prev, [name]: checked }));
    };

    const handleTestConnection = () => {
        setIsTesting(true);
        setTestResult(null);
        setProcessMessage(null);
        
        testD1Connection()
            .then(result => {
                setTestResult(result);
            })
            .catch(error => {
                setTestResult({ success: false, message: `Terjadi kesalahan: ${error.message}` });
            })
            .finally(() => {
                setIsTesting(false);
            });
    };

    const handleSave = () => {
        setIsProcessing(true);
        setProcessMessage('Menyimpan pengaturan...');
        setTestResult(null);

        saveD1Settings(settings)
            .then(() => {
                setSettings(prev => ({ ...prev, authToken: '' }));

                if (settings.enabled) {
                    setProcessMessage('Pengaturan disimpan! Memulai penyalinan data contoh ke D1...');
                    return seedInitialDataToD1();
                } else {
                    return Promise.resolve({ success: true, message: 'Pengaturan berhasil disimpan! Sinkronisasi dinonaktifkan, data contoh tidak disalin.' });
                }
            })
            .then(response => {
                setProcessMessage(response.message);
            })
            .catch(error => {
                setProcessMessage(`Gagal menyimpan: ${error.message}`);
            })
            .finally(() => {
                setIsProcessing(false);
                setTimeout(() => setProcessMessage(null), 6000);
            });
    };
    
    if (isLoading) {
        return (
            <Card>
                <div className="flex justify-center items-center p-8">
                    <i className="fas fa-spinner fa-spin fa-2x text-blue-500"></i>
                    <span className="ml-3">Memuat pengaturan...</span>
                </div>
            </Card>
        );
    }

    const FormField: React.FC<{ name: keyof Omit<D1DatabaseSettings, 'enabled' | 'authToken'>, label: string }> = ({ name, label }) => (
        <div>
            <label htmlFor={name} className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">{label}</label>
            <input
                type="text"
                id={name}
                name={name}
                value={settings[name]}
                onChange={handleInputChange}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
            />
        </div>
    );

    return (
        <Card>
            <h2 className="text-2xl font-bold mb-4">Konfigurasi Database (Cloudflare D1)</h2>
            
            <div className="space-y-6">
                <div className="p-4 border dark:border-gray-700 rounded-lg">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Status Sinkronisasi</h3>
                        <label htmlFor="enabled" className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" id="enabled" name="enabled" className="sr-only peer" checked={settings.enabled} onChange={handleToggleChange} />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-500 peer-checked:bg-blue-600"></div>
                            <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">{settings.enabled ? 'Aktif' : 'Nonaktif'}</span>
                        </label>
                    </div>
                </div>

                <div className="p-4 border dark:border-gray-700 rounded-lg space-y-4">
                     <h3 className="text-lg font-semibold border-b dark:border-gray-600 pb-2 mb-4">Detail Koneksi</h3>
                     <p className="text-xs text-gray-500 dark:text-gray-400 -mt-2">Kredensial disimpan di server. Token API hanya perlu dimasukkan saat ingin mengubahnya.</p>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField name="accountId" label="Cloudflare Account ID" />
                        <FormField name="databaseId" label="D1 Database ID" />
                     </div>
                     <div>
                        <label htmlFor="authToken" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">API Token / Auth Token (Isi untuk mengubah)</label>
                        <div className="relative">
                            <input
                                type={showToken ? 'text' : 'password'}
                                id="authToken"
                                name="authToken"
                                value={settings.authToken}
                                onChange={handleInputChange}
                                placeholder="••••••••••••••••••••"
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                            />
                            <button
                                type="button"
                                onClick={() => setShowToken(!showToken)}
                                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 dark:text-gray-400"
                                aria-label={showToken ? 'Sembunyikan token' : 'Tampilkan token'}
                            >
                                <i className={`fas ${showToken ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                            </button>
                        </div>
                    </div>
                </div>

                 <div className="p-4 border dark:border-gray-700 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Uji Koneksi</h3>
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                         <p className="text-sm text-gray-600 dark:text-gray-400">Menguji koneksi menggunakan pengaturan yang <span className="font-bold">sudah tersimpan</span> di server.</p>
                        <Button onClick={handleTestConnection} disabled={isProcessing || isTesting || !settings.enabled} icon={isTesting ? <i className="fas fa-spinner fa-spin"></i> : <i className="fa-solid fa-plug-circle-check"></i>}>
                            {isTesting ? 'Menguji...' : 'Uji Koneksi'}
                        </Button>
                    </div>
                     {!settings.enabled && <p className="text-xs text-yellow-600 mt-2">Sinkronisasi harus diaktifkan untuk melakukan tes.</p>}
                     {testResult && (
                        <div className={`flex items-center text-sm mt-3 p-3 rounded-md ${testResult.success ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'}`}>
                            <i className={`fas ${testResult.success ? 'fa-check-circle' : 'fa-times-circle'} mr-2`}></i>
                            <span>{testResult.message}</span>
                        </div>
                    )}
                </div>
                
                <div className="flex justify-end items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                    {processMessage && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mr-4 flex-grow">
                            {processMessage}
                        </p>
                    )}
                    <Button onClick={handleSave} disabled={isProcessing} icon={isProcessing ? <i className="fas fa-spinner fa-spin"></i> : null}>
                        {isProcessing ? 'Memproses...' : 'Simpan Pengaturan'}
                    </Button>
                </div>
            </div>
        </Card>
    );
};

export default DatabaseSettingsManagement;