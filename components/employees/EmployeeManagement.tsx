import React, { useState, useMemo, useEffect } from 'react';
import Card from '../shared/Card';
import Button from '../shared/Button';
import { mockEmployees, mockPositionHistory } from '../../data/mockData';
import { Employee, PositionHistory } from '../../types';
import Pagination from '../shared/Pagination';
import AddEmployeeModal from './AddEmployeeModal';
import ImportEmployeeModal from './ImportEmployeeModal';
import EmployeeDetailModal from './EmployeeDetailModal';
import EditEmployeeModal from './EditEmployeeModal';
import ConfirmationModal from '../shared/ConfirmationModal';

const EmployeeManagement: React.FC = () => {
    const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
    const [positionHistory, setPositionHistory] = useState<PositionHistory[]>(mockPositionHistory);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);
    const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const RECORDS_PER_PAGE = 10;

    const handleAddEmployee = (employeeData: Omit<Employee, 'id' | 'avatarUrl'>) => {
        const newId = `E${(employees.length + 1).toString().padStart(3, '0')}`;
        const newEmployee: Employee = {
            id: newId,
            ...employeeData,
            avatarUrl: `https://picsum.photos/seed/${newId}/100/100`,
        };
        setEmployees(prevEmployees => [newEmployee, ...prevEmployees]);

        const newPositionHistoryRecord: PositionHistory = {
            id: `PH-${Date.now()}`,
            employeeId: newId,
            position: newEmployee.position,
            unit: newEmployee.unit,
            startDate: newEmployee.joinDate,
            endDate: null,
        };
        const updatedHistory = [newPositionHistoryRecord, ...positionHistory];
        setPositionHistory(updatedHistory);
        mockPositionHistory.splice(0, mockPositionHistory.length, ...updatedHistory);

        setIsAddModalOpen(false);
    };

    const handleUpdateEmployee = (updatedEmployee: Employee) => {
        const originalEmployee = employees.find(emp => emp.id === updatedEmployee.id);
        if (!originalEmployee) return;

        setEmployees(prev => 
            prev.map(emp => emp.id === updatedEmployee.id ? updatedEmployee : emp)
        );

        if (originalEmployee.position !== updatedEmployee.position || originalEmployee.unit !== updatedEmployee.unit) {
            const today = new Date().toISOString().split('T')[0];
            let updatedHistory = [...positionHistory];

            const currentPositionIndex = updatedHistory.findIndex(
                h => h.employeeId === updatedEmployee.id && h.endDate === null
            );

            if (currentPositionIndex !== -1) {
                updatedHistory[currentPositionIndex] = {
                    ...updatedHistory[currentPositionIndex],
                    endDate: today,
                };
            }
            
            const newPositionHistoryRecord: PositionHistory = {
                id: `PH-${Date.now()}`,
                employeeId: updatedEmployee.id,
                position: updatedEmployee.position,
                unit: updatedEmployee.unit,
                startDate: today,
                endDate: null,
            };
            updatedHistory.unshift(newPositionHistoryRecord);

            setPositionHistory(updatedHistory);
            mockPositionHistory.splice(0, mockPositionHistory.length, ...updatedHistory);
        }

        setEmployeeToEdit(null);
    };

    const handleImportEmployees = (newEmployeesData: Omit<Employee, 'id' | 'avatarUrl'>[]) => {
        const newEmployees: Employee[] = newEmployeesData.map((emp, index) => {
            const newId = `E-import-${Date.now()}-${index}`;
            return {
                ...emp,
                id: newId,
                avatarUrl: `https://picsum.photos/seed/${newId}/100/100`,
            };
        });
        setEmployees(prev => [...newEmployees, ...prev]);
        setIsImportModalOpen(false);
    };

    const handleDeleteEmployee = () => {
        if (employeeToDelete) {
            setEmployees(prev => prev.filter(emp => emp.id !== employeeToDelete.id));

            const updatedHistory = positionHistory.filter(h => h.employeeId !== employeeToDelete.id);
            setPositionHistory(updatedHistory);
            mockPositionHistory.splice(0, mockPositionHistory.length, ...updatedHistory);

            setEmployeeToDelete(null);
        }
    };

    const filteredEmployees = useMemo(() => {
        return employees.filter(employee => {
            const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  employee.nip.includes(searchTerm) ||
                                  employee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  employee.whatsappNumber.includes(searchTerm);
            const matchesStatus = statusFilter === 'All' || employee.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [searchTerm, statusFilter, employees]);
    
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter]);

    const totalPages = Math.ceil(filteredEmployees.length / RECORDS_PER_PAGE);
    const paginatedEmployees = useMemo(() => {
        const startIndex = (currentPage - 1) * RECORDS_PER_PAGE;
        return filteredEmployees.slice(startIndex, startIndex + RECORDS_PER_PAGE);
    }, [filteredEmployees, currentPage]);


    return (
        <Card>
            <h2 className="text-2xl font-bold mb-4">Pengelolaan Pegawai</h2>
            <div className="flex flex-col md:flex-row justify-between items-center mb-4 space-y-2 md:space-y-0">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Cari pegawai (nama, NIP, WA)..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full md:w-80 bg-gray-100 dark:bg-gray-700 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <i className="fas fa-search text-gray-400"></i>
                    </span>
                </div>
                <div className="flex items-center space-x-2">
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        className="bg-gray-100 dark:bg-gray-700 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 px-4 py-2"
                    >
                        <option value="All">Semua Status</option>
                        <option value="Active">Aktif</option>
                        <option value="Inactive">Tidak Aktif</option>
                    </select>
                    <Button variant="secondary" icon={<i className="fas fa-upload"></i>} onClick={() => setIsImportModalOpen(true)}>Import Excel</Button>
                    <Button icon={<i className="fas fa-plus"></i>} onClick={() => setIsAddModalOpen(true)}>Tambah Pegawai</Button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">Pegawai</th>
                            <th scope="col" className="px-6 py-3">Unit / Jabatan</th>
                            <th scope="col" className="px-6 py-3">Kontak</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedEmployees.map((employee: Employee) => (
                            <tr key={employee.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                    <div className="flex items-center space-x-3">
                                        <img className="w-10 h-10 rounded-full" src={employee.avatarUrl} alt={`${employee.name} avatar`} />
                                        <div>
                                            <div>{employee.name}</div>
                                            <div className="text-xs text-gray-500">NIP: {employee.nip}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div>{employee.position}</div>
                                    <div className="text-xs text-gray-500">{employee.unit}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div>{employee.email}</div>
                                    <div className="text-xs text-gray-500"><i className="fab fa-whatsapp text-green-500 mr-1"></i>{employee.whatsappNumber}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                        employee.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                    }`}>
                                        {employee.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex space-x-3">
                                        <button onClick={() => setSelectedEmployee(employee)} className="text-gray-500 hover:text-blue-600" title="Lihat Detail"><i className="fas fa-eye"></i></button>
                                        <button onClick={() => setEmployeeToEdit(employee)} className="text-gray-500 hover:text-yellow-600" title="Edit"><i className="fas fa-edit"></i></button>
                                        <button onClick={() => setEmployeeToDelete(employee)} className="text-gray-500 hover:text-red-600" title="Hapus"><i className="fas fa-trash"></i></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />

            <AddEmployeeModal 
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAddEmployee={handleAddEmployee}
            />

            <ImportEmployeeModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onImport={handleImportEmployees}
            />

            <EditEmployeeModal 
                isOpen={!!employeeToEdit}
                onClose={() => setEmployeeToEdit(null)}
                onUpdateEmployee={handleUpdateEmployee}
                employee={employeeToEdit}
            />

            {selectedEmployee && (
                 <EmployeeDetailModal
                    isOpen={!!selectedEmployee}
                    onClose={() => setSelectedEmployee(null)}
                    employee={selectedEmployee}
                    positionHistory={positionHistory}
                />
            )}

            {employeeToDelete && (
                <ConfirmationModal
                    isOpen={!!employeeToDelete}
                    onClose={() => setEmployeeToDelete(null)}
                    onConfirm={handleDeleteEmployee}
                    title="Konfirmasi Hapus Pegawai"
                    message={`Apakah Anda yakin ingin menghapus data ${employeeToDelete.name}? Tindakan ini tidak dapat diurungkan.`}
                />
            )}
        </Card>
    );
};

export default EmployeeManagement;