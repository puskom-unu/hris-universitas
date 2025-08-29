
import React, { useState, useMemo } from 'react';
import Card from '../shared/Card';
import Button from '../shared/Button';
import { mockAttendance } from '../../data/mockData';
import { AttendanceRecord } from '../../types';
import { exportToExcel } from '../../services/reportService';
import Pagination from '../shared/Pagination';

const AttendanceSummaryReport: React.FC = () => {
    const today = new Date().toISOString().split('T')[0];
    const [startDate, setStartDate] = useState('2023-10-01'); // Default to show mock data
    const [endDate, setEndDate] = useState('2023-10-31');
    const [currentPage, setCurrentPage] = useState(1);
    const RECORDS_PER_PAGE = 15;

    const filteredRecords = useMemo(() => {
        if (!startDate || !endDate) return [];
        return mockAttendance.filter(record => {
            const recordDate = new Date(record.date);
            const start = new Date(startDate);
            const end = new Date(endDate);
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
            return recordDate >= start && recordDate <= end;
        }).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [startDate, endDate]);

    const summaryStats = useMemo(() => {
        return filteredRecords.reduce((acc, record) => {
            if (record.status === 'On Time') acc.onTime++;
            else if (record.status === 'Late') acc.late++;
            else if (record.status === 'Absent') acc.absent++;
            return acc;
        }, { onTime: 0, late: 0, absent: 0 });
    }, [filteredRecords]);
    
    const totalPages = Math.ceil(filteredRecords.length / RECORDS_PER_PAGE);
    const paginatedRecords = useMemo(() => {
        const startIndex = (currentPage - 1) * RECORDS_PER_PAGE;
        return filteredRecords.slice(startIndex, startIndex + RECORDS_PER_PAGE);
    }, [filteredRecords, currentPage]);


    const handleExport = () => {
        const dataToExport = filteredRecords.map(r => ({
            'Nama Pegawai': r.employeeName,
            'Tanggal': r.date,
            'Jam Masuk': r.clockIn,
            'Jam Keluar': r.clockOut,
            'Shift': r.shift,
            'Status': r.status,
        }));
        exportToExcel(dataToExport, `Laporan_Presensi_${startDate}_to_${endDate}`, 'Rekap Presensi');
    };

    return (
        <Card>
            <h2 className="text-2xl font-bold mb-4">Laporan Rekap Presensi</h2>
            <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">Tanggal:</label>
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm" />
                    <span>-</span>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm" />
                </div>
                <Button onClick={handleExport} icon={<i className="fas fa-file-excel"></i>} variant="secondary">Export ke Excel</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-center">
                <div className="p-4 bg-green-100 dark:bg-green-900/50 rounded-lg">
                    <p className="text-2xl font-bold text-green-700 dark:text-green-300">{summaryStats.onTime}</p>
                    <p className="text-sm font-medium text-green-600 dark:text-green-400">Tepat Waktu</p>
                </div>
                 <div className="p-4 bg-yellow-100 dark:bg-yellow-900/50 rounded-lg">
                    <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{summaryStats.late}</p>
                    <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Terlambat</p>
                </div>
                 <div className="p-4 bg-red-100 dark:bg-red-900/50 rounded-lg">
                    <p className="text-2xl font-bold text-red-700 dark:text-red-300">{summaryStats.absent}</p>
                    <p className="text-sm font-medium text-red-600 dark:text-red-400">Absen</p>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th className="px-6 py-3">Pegawai</th>
                            <th className="px-6 py-3">Tanggal</th>
                            <th className="px-6 py-3">Jam Masuk</th>
                            <th className="px-6 py-3">Jam Keluar</th>
                            <th className="px-6 py-3">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedRecords.map((record: AttendanceRecord) => (
                             <tr key={record.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{record.employeeName}</td>
                                <td className="px-6 py-4">{new Date(record.date).toLocaleDateString('id-ID')}</td>
                                <td className="px-6 py-4">{record.clockIn}</td>
                                <td className="px-6 py-4">{record.clockOut}</td>
                                <td className="px-6 py-4">
                                     <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                        record.status === 'On Time' ? 'bg-green-100 text-green-800' :
                                        record.status === 'Late' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-red-100 text-red-800'
                                    }`}>
                                        {record.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                         {filteredRecords.length === 0 && (
                            <tr><td colSpan={5} className="text-center py-8 text-gray-500">Tidak ada data untuk rentang tanggal yang dipilih.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
             <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </Card>
    );
};

export default AttendanceSummaryReport;
