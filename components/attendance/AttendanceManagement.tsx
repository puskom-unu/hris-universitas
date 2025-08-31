import React, { useState, useMemo, useEffect } from 'react';
import Card from '../shared/Card';
import Button from '../shared/Button';
import { AttendanceRecord } from '../../types';
import Pagination from '../shared/Pagination';
import { exportToExcel } from '../../services/reportService';
import ImportAttendanceModal from './ImportAttendanceModal';
import { useAttendanceRecords } from '../../hooks/useAttendance';
import { useEmployees } from '../../hooks/useEmployees';

const AttendanceManagement: React.FC = () => {
    const { attendanceRecords, addRecord, loading: attendanceLoading, error: attendanceError } = useAttendanceRecords();
    const { employees, loading: employeesLoading, error: employeesError } = useEmployees();
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    // Default dates are set to October 2023 to ensure sample data is visible
    const [startDate, setStartDate] = useState('2023-10-01');
    const [endDate, setEndDate] = useState('2023-10-31');
    const [statusFilter, setStatusFilter] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const RECORDS_PER_PAGE = 10;

    const filteredAttendance = useMemo(() => {
        if (!startDate || !endDate) return attendanceRecords;

        return attendanceRecords.filter(record => {
            const recordDate = new Date(record.date);
            const start = new Date(startDate);
            const end = new Date(endDate);
            
            // Set time to ensure the whole day is included in the range
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);

            const isDateInRange = recordDate >= start && recordDate <= end;
            const matchesStatus = statusFilter === 'All' || record.status === statusFilter;
            
            return isDateInRange && matchesStatus;
        }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [startDate, endDate, statusFilter, attendanceRecords]);

    useEffect(() => {
        setCurrentPage(1);
    }, [startDate, endDate, statusFilter]);

    const totalPages = Math.ceil(filteredAttendance.length / RECORDS_PER_PAGE);
    const paginatedAttendance = useMemo(() => {
        const startIndex = (currentPage - 1) * RECORDS_PER_PAGE;
        return filteredAttendance.slice(startIndex, startIndex + RECORDS_PER_PAGE);
    }, [filteredAttendance, currentPage]);
    
    const handleExport = () => {
        if (filteredAttendance.length === 0) {
            alert("Tidak ada data untuk diekspor pada rentang tanggal yang dipilih.");
            return;
        }
        const dataToExport = filteredAttendance.map(record => ({
            'ID Pegawai': record.employeeId,
            'Nama Pegawai': record.employeeName,
            'Tanggal': record.date,
            'Jam Masuk': record.clockIn,
            'Jam Keluar': record.clockOut,
            'Shift': record.shift,
            'Status': record.status,
        }));
        exportToExcel(dataToExport, `Laporan_Presensi_${startDate}_ke_${endDate}`, 'Data Presensi');
    };

    const handleImport = async (importedData: Omit<AttendanceRecord, 'id' | 'employeeName'>[]) => {
        for (const record of importedData) {
            const employee = employees.find(e => e.id === record.employeeId);
            await addRecord({
                ...record,
                employeeName: employee?.name || 'Nama Tidak Ditemukan',
            });
        }
        setIsImportModalOpen(false);
    };


    if (attendanceLoading || employeesLoading) {
        return (
            <Card>
                <p>Memuat data...</p>
            </Card>
        );
    }

    if (attendanceError || employeesError) {
        return (
            <Card>
                <p className="text-red-500">Gagal memuat data presensi.</p>
            </Card>
        );
    }

    return (
        <>
        <Card>
            <h2 className="text-2xl font-bold mb-4">Manajemen Presensi</h2>
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            aria-label="Start Date"
                            className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 px-3 py-2 text-sm"
                        />
                         <span className="text-gray-500 dark:text-gray-400">-</span>
                         <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            aria-label="End Date"
                            className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 px-3 py-2 text-sm"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        aria-label="Status Filter"
                        className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 px-3 py-2 text-sm"
                    >
                        <option value="All">Semua Status</option>
                        <option value="On Time">On Time</option>
                        <option value="Late">Late</option>
                        <option value="Absent">Absent</option>
                    </select>
                </div>
                <div className="flex items-center space-x-2">
                    <Button variant="secondary" icon={<i className="fas fa-upload"></i>} onClick={() => setIsImportModalOpen(true)}>Import Excel</Button>
                    <Button icon={<i className="fas fa-download"></i>} onClick={handleExport}>Export Data</Button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">Pegawai</th>
                            <th scope="col" className="px-6 py-3">Tanggal</th>
                            <th scope="col" className="px-6 py-3">Jam Masuk</th>
                            <th scope="col" className="px-6 py-3">Jam Keluar</th>
                            <th scope="col" className="px-6 py-3">Shift</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedAttendance.length > 0 ? (
                            paginatedAttendance.map((record: AttendanceRecord) => (
                                <tr key={record.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{record.employeeName}</td>
                                    <td className="px-6 py-4">{new Date(record.date).toLocaleDateString('id-ID')}</td>
                                    <td className="px-6 py-4">{record.clockIn}</td>
                                    <td className="px-6 py-4">{record.clockOut}</td>
                                    <td className="px-6 py-4">{record.shift}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                            record.status === 'On Time' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                                            record.status === 'Late' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                                            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                        }`}>
                                            {record.status}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                             <tr>
                                <td colSpan={6} className="text-center py-10 text-gray-500 dark:text-gray-400">
                                    Tidak ada data presensi yang sesuai dengan filter.
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
        </Card>
        <ImportAttendanceModal
            isOpen={isImportModalOpen}
            onClose={() => setIsImportModalOpen(false)}
            onImport={handleImport}
        />
        </>
    );
};

export default AttendanceManagement;