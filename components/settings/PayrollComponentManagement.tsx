
import React, { useState, useEffect, useMemo } from 'react';
import { 
    mockPayrollComponents, 
    mockEmployeeSalaryComponents, 
    mockEmployees,
    mockPositions,
    mockUnits
} from '../../data/mockData';
import { PayrollComponent, EmployeeSalaryComponent, Employee } from '../../types';
import Card from '../shared/Card';
import Button from '../shared/Button';
import Modal from '../shared/Modal';
import ConfirmationModal from '../shared/ConfirmationModal';
import Pagination from '../shared/Pagination';


const PayrollComponentManagement: React.FC = () => {
    const [components, setComponents] = useState<PayrollComponent[]>(mockPayrollComponents);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [componentToEdit, setComponentToEdit] = useState<PayrollComponent | null>(null);
    const [componentToDelete, setComponentToDelete] = useState<PayrollComponent | null>(null);
    
    const initialFormState = { name: '', type: 'Earning' as 'Earning' | 'Deduction' };
    const [formData, setFormData] = useState(initialFormState);
    const [errors, setErrors] = useState({ name: '' });

    // State for employee salary component management
    const [employeeSalaryComponents, setEmployeeSalaryComponents] = useState<EmployeeSalaryComponent[]>(mockEmployeeSalaryComponents);
    const [selectedComponentId, setSelectedComponentId] = useState<string>('');
    const [currentSalaries, setCurrentSalaries] = useState<Record<string, number>>({});
    const [activeEmployees] = useState<Employee[]>(() => mockEmployees.filter(e => e.status === 'Active'));
    const [saveStatus, setSaveStatus] = useState('');

    // State for filtering and pagination
    const [positionFilter, setPositionFilter] = useState<string>('All');
    const [unitFilter, setUnitFilter] = useState<string>('All');
    const [nameSearchTerm, setNameSearchTerm] = useState<string>('');
    const [currentPage, setCurrentPage] = useState(1);
    const RECORDS_PER_PAGE = 8;

    // Filtered employees
    const filteredEmployees = useMemo(() => {
        return activeEmployees.filter(employee => {
            const matchesSearch = employee.name.toLowerCase().includes(nameSearchTerm.toLowerCase());
            const matchesPosition = positionFilter === 'All' || employee.position === positionFilter;
            const matchesUnit = unitFilter === 'All' || employee.unit === unitFilter;
            return matchesSearch && matchesPosition && matchesUnit;
        });
    }, [activeEmployees, nameSearchTerm, positionFilter, unitFilter]);

    // Paginated employees
    const totalPages = Math.ceil(filteredEmployees.length / RECORDS_PER_PAGE);
    const paginatedEmployees = useMemo(() => {
        const startIndex = (currentPage - 1) * RECORDS_PER_PAGE;
        return filteredEmployees.slice(startIndex, startIndex + RECORDS_PER_PAGE);
    }, [filteredEmployees, currentPage]);

     // Reset page on filter change
    useEffect(() => {
        setCurrentPage(1);
    }, [nameSearchTerm, positionFilter, unitFilter, selectedComponentId]);


     // Effect to load salaries when a component is selected
    useEffect(() => {
        if (selectedComponentId) {
            const salaries: Record<string, number> = {};
            activeEmployees.forEach(emp => {
                const existing = employeeSalaryComponents.find(
                    sc => sc.employeeId === emp.id && sc.componentId === selectedComponentId
                );
                salaries[emp.id] = existing ? existing.amount : 0;
            });
            setCurrentSalaries(salaries);
            setSaveStatus(''); // Reset save status on component change
        } else {
            setCurrentSalaries({});
        }
    }, [selectedComponentId, activeEmployees, employeeSalaryComponents]);

    const handleSalaryChange = (employeeId: string, amount: string) => {
        const numericAmount = parseInt(amount, 10);
        setCurrentSalaries(prev => ({
            ...prev,
            [employeeId]: isNaN(numericAmount) ? 0 : numericAmount,
        }));
    };

    const handleSaveEmployeeSalaries = () => {
        setSaveStatus('Menyimpan...');
        // In a real app, this would be an API call. Here we simulate it.
        // We create a new array based on the changes.
        const updatedComponents = employeeSalaryComponents.filter(
            sc => sc.componentId !== selectedComponentId
        );

        Object.entries(currentSalaries).forEach(([employeeId, amount]) => {
            // FIX: Explicitly convert amount to a number to satisfy TypeScript's type checker for the comparison.
            if (Number(amount) > 0) {
                updatedComponents.push({
                    employeeId,
                    componentId: selectedComponentId,
                    amount,
                });
            }
        });

        // Update state and mock data source
        setEmployeeSalaryComponents(updatedComponents);
        mockEmployeeSalaryComponents.length = 0; // Clear original array
        mockEmployeeSalaryComponents.push(...updatedComponents); // Push new data

        setTimeout(() => {
            setSaveStatus('Perubahan berhasil disimpan!');
            setTimeout(() => setSaveStatus(''), 2000);
        }, 500);
    };


    const handleOpenModal = (component: PayrollComponent | null) => {
        setComponentToEdit(component);
        setFormData(component ? { name: component.name, type: component.type } : initialFormState);
        setErrors({ name: '' });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setComponentToEdit(null);
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value as any }));
        if(errors.name) setErrors({name: ''});
    };

    const validate = () => {
        if (!formData.name.trim()) {
            setErrors({ name: 'Nama komponen wajib diisi.' });
            return false;
        }
        return true;
    };

    const handleSave = () => {
        if (!validate()) return;
        let updated;
        if (componentToEdit) {
             updated = components.map(c => c.id === componentToEdit.id ? { ...c, ...formData } : c)
        } else {
            const newComponent: PayrollComponent = {
                id: `PC${Date.now()}`,
                ...formData
            };
            updated = [newComponent, ...components];
        }
        setComponents(updated);
        mockPayrollComponents.splice(0, mockPayrollComponents.length, ...updated);
        handleCloseModal();
    };
    
    const handleDelete = () => {
        if (componentToDelete) {
            const updated = components.filter(c => c.id !== componentToDelete.id)
            setComponents(updated);
            mockPayrollComponents.splice(0, mockPayrollComponents.length, ...updated);
            setComponentToDelete(null);
        }
    };
    
    return (
        <>
        <Card>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Kelola Komponen Gaji</h2>
                <Button onClick={() => handleOpenModal(null)} icon={<i className="fas fa-plus"></i>}>Tambah Komponen</Button>
            </div>
             <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">Nama Komponen</th>
                            <th scope="col" className="px-6 py-3">Tipe</th>
                            <th scope="col" className="px-6 py-3">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {components.map((component) => (
                            <tr key={component.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{component.name}</td>
                                <td className="px-6 py-4">
                                     <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                        component.type === 'Earning' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                    }`}>
                                        {component.type === 'Earning' ? 'Pendapatan' : 'Potongan'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex space-x-3">
                                        <button onClick={() => handleOpenModal(component)} className="text-gray-500 hover:text-yellow-600" title="Edit"><i className="fas fa-edit"></i></button>
                                        <button onClick={() => setComponentToDelete(component)} className="text-gray-500 hover:text-red-600" title="Hapus"><i className="fas fa-trash"></i></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={componentToEdit ? 'Edit Komponen Gaji' : 'Tambah Komponen Gaji'}>
                <div className="space-y-4">
                     <div>
                        <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Nama Komponen</label>
                        <input
                            type="text" id="name" name="name" value={formData.name} onChange={handleChange}
                            className={`bg-gray-50 border ${errors.name ? 'border-red-500' : 'border-gray-300'} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
                        />
                        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                    </div>
                    <div>
                        <label htmlFor="type" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Tipe</label>
                        <select
                            id="type" name="type" value={formData.type} onChange={handleChange}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                            <option value="Earning">Pendapatan (Earning)</option>
                            <option value="Deduction">Potongan (Deduction)</option>
                        </select>
                    </div>
                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Button variant="secondary" onClick={handleCloseModal}>Batal</Button>
                        <Button onClick={handleSave}>Simpan</Button>
                    </div>
                </div>
            </Modal>

            {componentToDelete && (
                <ConfirmationModal
                    isOpen={!!componentToDelete}
                    onClose={() => setComponentToDelete(null)}
                    onConfirm={handleDelete}
                    title="Konfirmasi Hapus Komponen Gaji"
                    message={`Apakah Anda yakin ingin menghapus komponen ${componentToDelete.name}?`}
                />
            )}
        </Card>
        
        <Card className="mt-6">
            <h2 className="text-2xl font-bold mb-4">Atur Besaran Komponen Gaji Pegawai</h2>
            <div className="mb-4">
                <label htmlFor="component-select" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Pilih Komponen Gaji</label>
                <select
                    id="component-select"
                    value={selectedComponentId}
                    onChange={(e) => setSelectedComponentId(e.target.value)}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full md:w-1/2 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                    <option value="">-- Pilih Komponen --</option>
                    {components.map(c => (
                        <option key={c.id} value={c.id}>{c.name} ({c.type === 'Earning' ? 'Pendapatan' : 'Potongan'})</option>
                    ))}
                </select>
            </div>

            {selectedComponentId && (
                <div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <div>
                            <label htmlFor="nameSearch" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cari Nama</label>
                            <input type="text" id="nameSearch" value={nameSearchTerm} onChange={e => setNameSearchTerm(e.target.value)} placeholder="Ketik nama pegawai..." className="mt-1 block w-full p-2 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"/>
                        </div>
                        <div>
                            <label htmlFor="positionFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Filter Jabatan</label>
                            <select id="positionFilter" value={positionFilter} onChange={e => setPositionFilter(e.target.value)} className="mt-1 block w-full p-2 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                <option value="All">Semua Jabatan</option>
                                {mockPositions.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="unitFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Filter Unit Kerja</label>
                            <select id="unitFilter" value={unitFilter} onChange={e => setUnitFilter(e.target.value)} className="mt-1 block w-full p-2 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                <option value="All">Semua Unit</option>
                                {mockUnits.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Pegawai</th>
                                    <th scope="col" className="px-6 py-3">Besaran (IDR)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedEmployees.length > 0 ? paginatedEmployees.map((employee) => (
                                    <tr key={employee.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                            <div>{employee.name}</div>
                                            <div className="text-xs text-gray-500">NIP: {employee.nip}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <input
                                                type="number"
                                                value={currentSalaries[employee.id] || ''}
                                                onChange={(e) => handleSalaryChange(employee.id, e.target.value)}
                                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                placeholder="0"
                                            />
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={2} className="text-center py-10 text-gray-500 dark:text-gray-400">
                                            Tidak ada pegawai yang cocok dengan filter.
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
                    <div className="flex justify-end items-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                         {saveStatus && (
                            <p className="text-sm text-green-600 dark:text-green-400 mr-4">
                                {saveStatus}
                            </p>
                        )}
                        <Button onClick={handleSaveEmployeeSalaries} disabled={saveStatus === 'Menyimpan...'}>
                            {saveStatus === 'Menyimpan...' ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </Button>
                    </div>
                </div>
            )}

        </Card>
        </>
    );
};

export default PayrollComponentManagement;