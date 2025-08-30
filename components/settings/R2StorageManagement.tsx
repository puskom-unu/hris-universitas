
import React, { useState, useEffect } from 'react';
import Card from '../shared/Card';
import Button from '../shared/Button';
import { R2StorageSettings } from '../../types';
import { getR2Settings, saveR2Settings, testR2Connection } from '../../services/apiService';

const R2StorageManagement: React.FC = () => {
    const [settings, setSettings] = useState<R2StorageSettings>({
        enabled: false,
        accountId: '',
        bucketName: '',
        accessKeyId: '',
        secretAccessKey: '',
    });
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [isTesting, setIsTesting] = useState<boolean>(false);
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
    const [saveMessage, setSaveMessage] = useState<string | null>(null);
    const [showSecrets, setShowSecrets] = useState<boolean>(false);

    useEffect(() => {
        setIsLoading(true);
        getR2Settings().then(dataFromApi => {
            setSettings(prev => ({
                ...prev,
                enabled: dataFromApi.enabled,
                accountId: dataFromApi.accountId,
                bucketName: dataFromApi.bucketName,
                accessKeyId: '',
                secretAccessKey: '',
            }));
            setIsLoading(false);
        }).catch(err => {
            console.error("Failed to load R2 settings:", err);
            alert("Gagal memuat pengaturan penyimpanan.");
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
        
        testR2Connection()
            .then(result => setTestResult(result))
            .catch(error => setTestResult({ success: false, message: `Terjadi kesalahan: ${error.message}` }))
            .finally(() => setIsTesting(false));
    };

    const handleSave = () => {
        setIsSaving(true);
        setSaveMessage('Menyimpan...');

        saveR2Settings(settings)
            .then(response => {
                setSaveMessage(response.message);
                setSettings(prev => ({ ...prev, accessKeyId: '', secretAccessKey: '' })); // Clear secrets from state
            })
            .catch(error => {
                setSaveMessage(`Gagal menyimpan: ${error.message}`);
            })
            .finally(() => {
                setIsSaving(false);
                setTimeout(() => setSaveMessage(null), 5000);
            });
    };
    
    if (isLoading) {
        return (
            <Card>
                <div className="flex justify-center items-center p-8">
                    <i className="fas fa-spinner fa-spin fa-2x text-blue-500"></i>
                    <span className="ml-3">Memuat pengaturan penyimpanan...</span>
                </div>
            </Card>
        );
    }

    return (
        <Card>
            <h2 className="text-2xl font-bold mb-4">Konfigurasi Penyimpanan Objek (Cloudflare R2)</h2>
            <div className="space-y-6">
                <div className="p-4 border dark:border-gray-700 rounded-lg">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Status Penyimpanan Objek</h3>
                        <label htmlFor="enabled" className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" id="enabled" name="enabled" className="sr-only peer" checked={settings.enabled} onChange={handleToggleChange} />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-500 peer-checked:bg-blue-600"></div>
                            <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">{settings.enabled ? 'Aktif' : 'Nonaktif'}</span>
                        </label>
                    </div>
                </div>

                <div className="p-4 border dark:border-gray-700 rounded-lg space-y-4">
                     <h3 className="text-lg font-semibold border-b dark:border-gray-600 pb-2 mb-4">Detail Koneksi R2</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 -mt-2">Kredensial API hanya perlu diisi jika Anda ingin mengubahnya. Biarkan kosong jika tidak ada perubahan.</p>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="accountId" className="block mb-2 text-sm font-medium">Cloudflare Account ID</label>
                            <input type="text" id="accountId" name="accountId" value={settings.accountId} onChange={handleInputChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600"/>
                        </div>
                         <div>
                            <label htmlFor="bucketName" className="block mb-2 text-sm font-medium">Nama R2 Bucket</label>
                            <input type="text" id="bucketName" name="bucketName" value={settings.bucketName} onChange={handleInputChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600"/>
                        </div>
                        <div>
                            <label htmlFor="accessKeyId" className="block mb-2 text-sm font-medium">Access Key ID</label>
                            <input type="password" id="accessKeyId" name="accessKeyId" value={settings.accessKeyId} onChange={handleInputChange} placeholder="••••••••••••••••" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600"/>
                        </div>
                         <div>
                            <label htmlFor="secretAccessKey" className="block mb-2 text-sm font-medium">Secret Access Key</label>
                            <div className="relative">
                                <input type={showSecrets ? 'text' : 'password'} id="secretAccessKey" name="secretAccessKey" value={settings.secretAccessKey} onChange={handleInputChange} placeholder="••••••••••••••••" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600"/>
                                <button type="button" onClick={() => setShowSecrets(!showSecrets)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500"><i className={`fas ${showSecrets ? 'fa-eye-slash' : 'fa-eye'}`}></i></button>
                            </div>
                        </div>
                     </div>
                </div>

                <div className="p-4 border dark:border-gray-700 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Uji Koneksi</h3>
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                         <p className="text-sm text-gray-600 dark:text-gray-400">Menguji koneksi menggunakan pengaturan yang <span className="font-bold">sudah tersimpan</span> di server.</p>
                        <Button onClick={handleTestConnection} disabled={isSaving || isTesting || !settings.enabled} icon={isTesting ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-cloud"></i>}>
                            {isTesting ? 'Menguji...' : 'Uji Koneksi R2'}
                        </Button>
                    </div>
                     {!settings.enabled && <p className="text-xs text-yellow-600 mt-2">Penyimpanan R2 harus diaktifkan untuk melakukan tes.</p>}
                     {testResult && (
                         <div className={`flex items-center text-sm mt-3 p-3 rounded-md ${testResult.success ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'}`}>
                            <i className={`fas ${testResult.success ? 'fa-check-circle' : 'fa-times-circle'} mr-2`}></i>
                            <span>{testResult.message}</span>
                        </div>
                    )}
                </div>
                
                <div className="flex justify-end items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                    {saveMessage && <p className="text-sm text-green-600 dark:text-green-400 mr-4">{saveMessage}</p>}
                    <Button onClick={handleSave} disabled={isSaving} icon={isSaving ? <i className="fas fa-spinner fa-spin"></i> : null}>
                        {isSaving ? 'Menyimpan...' : 'Simpan Pengaturan'}
                    </Button>
                </div>
            </div>
        </Card>
    );
};

export default R2StorageManagement;
