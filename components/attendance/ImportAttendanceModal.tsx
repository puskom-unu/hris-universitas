import React, { useState } from 'react';
import Modal from '../shared/Modal';
import Button from '../shared/Button';
import { AttendanceRecord } from '../../types';

// Declare XLSX from the script tag
declare var XLSX: any;

interface ImportAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (records: Omit<AttendanceRecord, 'id' | 'employeeName'>[]) => void;
}

const REQUIRED_HEADERS = ['employeeId', 'date', 'clockIn', 'clockOut', 'status', 'shift'];

const ImportAttendanceModal: React.FC<ImportAttendanceModalProps> = ({ isOpen, onClose, onImport }) => {
    const [file, setFile] = useState<File | null>(null);
    const [parsedData, setParsedData] = useState<Omit<AttendanceRecord, 'id' | 'employeeName'>[]>([]);
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

                const headers = Object.keys(json[0] as object);
                const missingHeaders = REQUIRED_HEADERS.filter(h => !headers.includes(h));
                if (missingHeaders.length > 0) {
                    throw new Error(`Header kolom tidak sesuai. Kolom yang hilang: ${missingHeaders.join(', ')}`);
                }
                
                const attendanceData: Omit<AttendanceRecord, 'id' | 'employeeName'>[] = json.map((row: any) => {
                    if (!row.employeeId || !row.date) {
                        throw new Error("Setiap baris harus memiliki 'employeeId' dan 'date'.");
                    }

                    let dateStr = new Date().toISOString().split('T')[0];
                    if (row.date) {
                        if (row.date instanceof Date) {
                            dateStr = row.date.toISOString().split('T')[0];
                        } else if (typeof row.date === 'string') {
                            dateStr = new Date(row.date).toISOString().split('T')[0];
                        }
                    }
                    
                    const status = ['On Time', 'Late', 'Absent'].includes(row.status) ? row.status : 'Absent';

                    return {
                        employeeId: String(row.employeeId),
                        date: dateStr,
                        clockIn: String(row.clockIn || 'N/A'),
                        clockOut: String(row.clockOut || 'N/A'),
                        status: status,
                        shift: String(row.shift || 'Regular'),
                    };
                });
                
                setParsedData(attendanceData);
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
        <Modal isOpen={isOpen} onClose={handleClose} title="Import Data Presensi dari Excel">
            <div className="space-y-4">
                <div>
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200">Instruksi Format File</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Pastikan file Excel Anda memiliki kolom dengan header berikut: <code className="text-xs bg-gray-200 dark:bg-gray-700 p-1 rounded">{REQUIRED_HEADERS.join(', ')}</code>.
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Kolom <code className="text-xs bg-gray-200 dark:bg-gray-700 p-1 rounded">status</code> harus berisi 'On Time', 'Late', atau 'Absent'. Kolom <code className="text-xs bg-gray-200 dark:bg-gray-700 p-1 rounded">date</code> harus dalam format YYYY-MM-DD.
                    </p>
                </div>

                <div>
                    <label htmlFor="attendance-file-upload" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Unggah File</label>
                    <input 
                        id="attendance-file-upload" 
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
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200">Pratinjau Data ({parsedData.length} baris ditemukan)</h4>
                        <div className="overflow-y-auto max-h-60 mt-2 border dark:border-gray-600 rounded-lg">
                            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0">
                                    <tr>
                                        <th className="px-4 py-2">ID Pegawai</th>
                                        <th className="px-4 py-2">Tanggal</th>
                                        <th className="px-4 py-2">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {parsedData.slice(0, 5).map((record, index) => (
                                        <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                            <td className="px-4 py-2">{record.employeeId}</td>
                                            <td className="px-4 py-2">{record.date}</td>
                                            <td className="px-4 py-2">{record.status}</td>
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
                        Import {parsedData.length > 0 ? `${parsedData.length} Data` : ''}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default ImportAttendanceModal;
