
import React, { useState, useMemo } from 'react';
import Card from '../shared/Card';
import Button from '../shared/Button';
import Pagination from '../shared/Pagination';
import { mockEmployees, mockPositions, mockUnits } from '../../data/mockData';
import { Employee } from '../../types';
import { exportToExcel } from '../../services/reportService';

const EmployeeListReport: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [positionFilter, setPositionFilter] = useState('All');
    const [unitFilter, setUnitFilter] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const RECORDS_PER_PAGE = 10;

    const filteredEmployees = useMemo(() => {
        return mockEmployees.filter(employee => {
            const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  employee.nip.includes(searchTerm);
            const matchesStatus = statusFilter === 'All' || employee.status === statusFilter;
            const matchesPosition = positionFilter === 'All' || employee.position === positionFilter;
            const matchesUnit = unitFilter === 'All' || employee.unit === unitFilter;
            return matchesSearch && matchesStatus && matchesPosition && matchesUnit;
        });
    }, [searchTerm, statusFilter, positionFilter, unitFilter]);

    const totalPages = Math.ceil(filteredEmployees.length / RECORDS_PER_PAGE);
    const paginatedEmployees = useMemo(() => {
        const startIndex = (currentPage - 1) * RECORDS_PER_PAGE;
        return filteredEmployees.slice(startIndex, startIndex + RECORDS_PER_PAGE);
    }, [filteredEmployees, currentPage]);

    const handleExport = () => {
        const dataToExport = filteredEmployees.map(e => ({
            'Nama Pegawai': e.name,
            'NIP': e.nip,
            'Jabatan': e.position,
            'Unit Kerja': e.unit,
            'Email': e.email,
            'No. WhatsApp': e.whatsappNumber,
            'Tanggal Bergabung': e.joinDate,
            'Status': e.status,
            'Bank': e.bankName,
            'No. Rekening': e.accountNumber,
        }));
        exportToExcel(dataToExport, 'Laporan_Data_Pegawai', 'Data Pegawai');
    };

    return (
        <Card>
            <h2 className="text-2xl font-bold mb-4">Laporan Data Pegawai</h2>
            <div className="p-4 mb-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <input
                        type="text"
                        placeholder="Cari Nama/NIP..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm"
                    />
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm">
                        <option value="All">Semua Status</option>
                        <option value="Active">Aktif</option>
                        <option value="Inactive">Tidak Aktif</option>
                    </select>
                    <select value={positionFilter} onChange={e => setPositionFilter(e.target.value)} className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm">
                        <option value="All">Semua Jabatan</option>
                        {mockPositions.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                    </select>
                     <select value={unitFilter} onChange={e => setUnitFilter(e.target.value)} className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm">
                        <option value="All">Semua Unit</option>
                        {mockUnits.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                    </select>
                </div>
            </div>
            <div className="flex justify-end mb-4">
                <Button onClick={handleExport} icon={<i className="fas fa-file-excel"></i>} variant="secondary">Export ke Excel</Button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th className="px-6 py-3">Nama / NIP</th>
                            <th className="px-6 py-3">Jabatan / Unit</th>
                            <th className="px-6 py-3">Tanggal Bergabung</th>
                            <th className="px-6 py-3">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedEmployees.map((employee: Employee) => (
                             <tr key={employee.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-900 dark:text-white">{employee.name}</div>
                                    <div className="text-xs text-gray-500">{employee.nip}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-medium">{employee.position}</div>
                                    <div className="text-xs text-gray-500">{employee.unit}</div>
                                </td>
                                <td className="px-6 py-4">{new Date(employee.joinDate).toLocaleDateString('id-ID')}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${ employee.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800' }`}>{employee.status}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </Card>
    );
};

export default EmployeeListReport;
