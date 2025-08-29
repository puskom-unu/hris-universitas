import React, { useState } from 'react';
import Modal from '../shared/Modal';
import Button from '../shared/Button';
import { Employee } from '../../types';

// Declare XLSX from the script tag
declare var XLSX: any;

interface ImportEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (employees: Omit<Employee, 'id' | 'avatarUrl'>[]) => void;
}

// FIX: Add bankName and accountNumber to required headers for import
const REQUIRED_HEADERS = ['name', 'nip', 'position', 'unit', 'email', 'whatsappNumber', 'joinDate', 'status', 'bankName', 'accountNumber'];

const ImportEmployeeModal: React.FC<ImportEmployeeModalProps> = ({ isOpen, onClose, onImport }) => {
    const [file, setFile] = useState<File | null>(null);
    const [parsedData, setParsedData] = useState<Omit<Employee, 'id' | 'avatarUrl'>[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const resetState = () => {
        setFile(null);
        setParsedData([]);
        setError(null);
        setIsLoading(false);
    };

    const handleClose = () => {
        resetState();
        onClose();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        resetState();
        if (!selectedFile.name.match(/\.(xlsx|xls|csv)$/)) {
            setError("Mohon unggah file dengan format .xlsx, .xls, or .csv");
            return;
        }
        
        setFile(selectedFile);
        setIsLoading(true);
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = event.target?.result;
                const workbook = XLSX.read(data, { type: 'binary', cellDates: true });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json = XLSX.utils.sheet_to_json(worksheet);

                if (json.length === 0) {
                    throw new Error("File kosong atau tidak ada data.");
                }

                // Validate headers
                const headers = Object.keys(json[0] as object);
                const missingHeaders = REQUIRED_HEADERS.filter(h => !headers.includes(h));
                if (missingHeaders.length > 0) {
                    throw new Error(`Header kolom tidak sesuai. Kolom yang hilang: ${missingHeaders.join(', ')}`);
                }
                
                // Map to our type, basic validation
                // FIX: Map bankName and accountNumber from imported file
                const employeeData: Omit<Employee, 'id' | 'avatarUrl'>[] = json.map((row: any) => {
                    if (!row.name || !row.nip) {
                        throw new Error("Setiap baris harus memiliki 'name' dan 'nip'.");
                    }
                    
                    let joinDateStr = new Date().toISOString().split('T')[0];
                    if (row.joinDate) {
                        if (row.joinDate instanceof Date) {
                            joinDateStr = row.joinDate.toISOString().split('T')[0];
                        } else if (typeof row.joinDate === 'string') {
                            joinDateStr = new Date(row.joinDate).toISOString().split('T')[0];
                        }
                    }

                    return {
                        name: String(row.name),
                        nip: String(row.nip),
                        position: String(row.position || ''),
                        unit: String(row.unit || ''),
                        email: String(row.email || ''),
                        whatsappNumber: String(row.whatsappNumber || ''),
                        joinDate: joinDateStr,
                        status: row.status === 'Active' || row.status === 'Inactive' ? row.status : 'Active',
                        bankName: String(row.bankName || ''),
                        accountNumber: String(row.accountNumber || ''),
                    };
                });
                
                setParsedData(employeeData);
            } catch (err: any) {
                setError(`Gagal memproses file: ${err.message}`);
                setParsedData([]);
            } finally {
                setIsLoading(false);
            }
        };

        reader.onerror = () => {
            setError("Gagal membaca file.");
            setIsLoading(false);
        };

        reader.readAsBinaryString(selectedFile);
    };

    const handleImportClick = () => {
        if (parsedData.length > 0) {
            onImport(parsedData);
            handleClose();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Import Pegawai dari Excel">
            <div className="space-y-4">
                <div>
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200">Instruksi Format File</h4>
                    {/* FIX: Update instruction text with new required headers */}
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Pastikan file Excel Anda memiliki kolom dengan header berikut: <code className="text-xs bg-gray-200 dark:bg-gray-700 p-1 rounded">{REQUIRED_HEADERS.join(', ')}</code>.
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Kolom <code className="text-xs bg-gray-200 dark:bg-gray-700 p-1 rounded">status</code> harus berisi 'Active' atau 'Inactive'. Kolom <code className="text-xs bg-gray-200 dark:bg-gray-700 p-1 rounded">joinDate</code> harus dalam format YYYY-MM-DD.
                    </p>
                </div>

                <div>
                    <label htmlFor="file-upload" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Unggah File</label>
                    <input 
                        id="file-upload" 
                        type="file" 
                        onChange={handleFileChange}
                        accept=".xlsx, .xls, .csv"
                        className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                    />
                </div>

                {isLoading && <p className="text-center text-blue-500">Memproses file...</p>}
                {error && <p className="text-center text-red-500">{error}</p>}
                
                {parsedData.length > 0 && (
                    <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200">Pratinjau Data ({parsedData.length} pegawai ditemukan)</h4>
                        <div className="overflow-y-auto max-h-60 mt-2 border dark:border-gray-600 rounded-lg">
                            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0">
                                    <tr>
                                        <th className="px-4 py-2">Nama</th>
                                        <th className="px-4 py-2">NIP</th>
                                        <th className="px-4 py-2">Jabatan</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {parsedData.slice(0, 5).map((emp, index) => ( // Show first 5 as preview
                                        <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                            <td className="px-4 py-2">{emp.name}</td>
                                            <td className="px-4 py-2">{emp.nip}</td>
                                            <td className="px-4 py-2">{emp.position}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                         {parsedData.length > 5 && <p className="text-xs text-center mt-1 text-gray-500">... dan {parsedData.length - 5} baris lainnya.</p>}
                    </div>
                )}

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button type="button" variant="secondary" onClick={handleClose}>
                        Batal
                    </Button>
                    <Button type="button" onClick={handleImportClick} disabled={parsedData.length === 0 || isLoading}>
                        Import {parsedData.length > 0 ? `${parsedData.length} Pegawai` : ''}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default ImportEmployeeModal;