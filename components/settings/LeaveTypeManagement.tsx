
import React, { useState } from 'react';
import { mockLeaveTypes } from '../../data/mockData';
import { LeaveType } from '../../types';
import Card from '../shared/Card';
import Button from '../shared/Button';
import Modal from '../shared/Modal';
import ConfirmationModal from '../shared/ConfirmationModal';

const LeaveTypeManagement: React.FC = () => {
    const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>(mockLeaveTypes);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [typeToEdit, setTypeToEdit] = useState<LeaveType | null>(null);
    const [typeToDelete, setTypeToDelete] = useState<LeaveType | null>(null);
    
    const initialFormState = { name: '', defaultDays: 0 };
    const [formData, setFormData] = useState(initialFormState);
    const [errors, setErrors] = useState({ name: '', defaultDays: '' });

    const handleOpenModal = (leaveType: LeaveType | null) => {
        setTypeToEdit(leaveType);
        setFormData(leaveType ? { name: leaveType.name, defaultDays: leaveType.defaultDays } : initialFormState);
        setErrors({ name: '', defaultDays: '' });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setTypeToEdit(null);
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseInt(value, 10) || 0 : value }));
        if(errors.name || errors.defaultDays) setErrors({name: '', defaultDays: ''});
    };

    const validate = () => {
        const newErrors = { name: '', defaultDays: '' };
        if (!formData.name.trim()) newErrors.name = 'Nama jenis cuti wajib diisi.';
        if (formData.defaultDays <= 0) newErrors.defaultDays = 'Jumlah hari harus lebih dari 0.';
        setErrors(newErrors);
        return !newErrors.name && !newErrors.defaultDays;
    };

    const handleSave = () => {
        if (!validate()) return;

        if (typeToEdit) {
            setLeaveTypes(leaveTypes.map(lt => lt.id === typeToEdit.id ? { ...lt, ...formData } : lt));
        } else {
            const newLeaveType: LeaveType = {
                id: `LT${Date.now()}`,
                ...formData
            };
            setLeaveTypes([newLeaveType, ...leaveTypes]);
        }
        handleCloseModal();
    };
    
    const handleDelete = () => {
        if (typeToDelete) {
            setLeaveTypes(leaveTypes.filter(lt => lt.id !== typeToDelete.id));
            setTypeToDelete(null);
        }
    };
    
    return (
        <Card>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Kelola Jenis Cuti & Izin</h2>
                <Button onClick={() => handleOpenModal(null)} icon={<i className="fas fa-plus"></i>}>Tambah Jenis Cuti</Button>
            </div>
             <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">Nama Jenis Cuti</th>
                            <th scope="col" className="px-6 py-3">Jumlah Hari (Default)</th>
                            <th scope="col" className="px-6 py-3">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leaveTypes.map((leaveType) => (
                            <tr key={leaveType.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{leaveType.name}</td>
                                <td className="px-6 py-4">{leaveType.defaultDays} Hari</td>
                                <td className="px-6 py-4">
                                    <div className="flex space-x-3">
                                        <button onClick={() => handleOpenModal(leaveType)} className="text-gray-500 hover:text-yellow-600" title="Edit"><i className="fas fa-edit"></i></button>
                                        <button onClick={() => setTypeToDelete(leaveType)} className="text-gray-500 hover:text-red-600" title="Hapus"><i className="fas fa-trash"></i></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={typeToEdit ? 'Edit Jenis Cuti' : 'Tambah Jenis Cuti Baru'}>
                <div className="space-y-4">
                     <div>
                        <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Nama Jenis Cuti</label>
                        <input
                            type="text" id="name" name="name" value={formData.name} onChange={handleChange}
                            className={`bg-gray-50 border ${errors.name ? 'border-red-500' : 'border-gray-300'} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
                        />
                        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                    </div>
                    <div>
                        <label htmlFor="defaultDays" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Jumlah Hari</label>
                         <input
                            type="number" id="defaultDays" name="defaultDays" value={formData.defaultDays} onChange={handleChange}
                            className={`bg-gray-50 border ${errors.defaultDays ? 'border-red-500' : 'border-gray-300'} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
                        />
                        {errors.defaultDays && <p className="mt-1 text-xs text-red-500">{errors.defaultDays}</p>}
                    </div>
                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Button variant="secondary" onClick={handleCloseModal}>Batal</Button>
                        <Button onClick={handleSave}>Simpan</Button>
                    </div>
                </div>
            </Modal>

            {typeToDelete && (
                <ConfirmationModal
                    isOpen={!!typeToDelete}
                    onClose={() => setTypeToDelete(null)}
                    onConfirm={handleDelete}
                    title="Konfirmasi Hapus Jenis Cuti"
                    message={`Apakah Anda yakin ingin menghapus ${typeToDelete.name}?`}
                />
            )}
        </Card>
    );
};

export default LeaveTypeManagement;
