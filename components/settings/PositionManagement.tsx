
import React, { useState } from 'react';
import { mockPositions } from '../../data/mockData';
import { Position } from '../../types';
import Card from '../shared/Card';
import Button from '../shared/Button';
import Modal from '../shared/Modal';
import ConfirmationModal from '../shared/ConfirmationModal';

const PositionManagement: React.FC = () => {
    const [positions, setPositions] = useState<Position[]>(mockPositions);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [positionToEdit, setPositionToEdit] = useState<Position | null>(null);
    const [positionToDelete, setPositionToDelete] = useState<Position | null>(null);
    
    const initialFormState = { name: '', description: '' };
    const [formData, setFormData] = useState(initialFormState);
    const [errors, setErrors] = useState({ name: '' });

    const handleOpenModal = (position: Position | null) => {
        setPositionToEdit(position);
        setFormData(position ? { name: position.name, description: position.description } : initialFormState);
        setErrors({ name: '' });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setPositionToEdit(null);
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if(errors.name) setErrors({name: ''});
    };

    const validate = () => {
        if (!formData.name.trim()) {
            setErrors({ name: 'Nama jabatan wajib diisi.' });
            return false;
        }
        return true;
    };

    const handleSave = () => {
        if (!validate()) return;

        if (positionToEdit) {
            setPositions(positions.map(p => p.id === positionToEdit.id ? { ...p, ...formData } : p));
        } else {
            const newPosition: Position = {
                id: `P${Date.now()}`,
                ...formData
            };
            setPositions([newPosition, ...positions]);
        }
        handleCloseModal();
    };
    
    const handleDelete = () => {
        if (positionToDelete) {
            setPositions(positions.filter(p => p.id !== positionToDelete.id));
            setPositionToDelete(null);
        }
    };
    
    return (
        <Card>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Kelola Jabatan</h2>
                <Button onClick={() => handleOpenModal(null)} icon={<i className="fas fa-plus"></i>}>Tambah Jabatan</Button>
            </div>
             <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">Nama Jabatan</th>
                            <th scope="col" className="px-6 py-3">Deskripsi</th>
                            <th scope="col" className="px-6 py-3">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {positions.map((position) => (
                            <tr key={position.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{position.name}</td>
                                <td className="px-6 py-4">{position.description}</td>
                                <td className="px-6 py-4">
                                    <div className="flex space-x-3">
                                        <button onClick={() => handleOpenModal(position)} className="text-gray-500 hover:text-yellow-600" title="Edit"><i className="fas fa-edit"></i></button>
                                        <button onClick={() => setPositionToDelete(position)} className="text-gray-500 hover:text-red-600" title="Hapus"><i className="fas fa-trash"></i></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={positionToEdit ? 'Edit Jabatan' : 'Tambah Jabatan Baru'}>
                <div className="space-y-4">
                     <div>
                        <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Nama Jabatan</label>
                        <input
                            type="text" id="name" name="name" value={formData.name} onChange={handleChange}
                            className={`bg-gray-50 border ${errors.name ? 'border-red-500' : 'border-gray-300'} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
                        />
                        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                    </div>
                    <div>
                        <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Deskripsi</label>
                        <textarea
                            id="description" name="description" value={formData.description} onChange={handleChange} rows={3}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        ></textarea>
                    </div>
                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Button variant="secondary" onClick={handleCloseModal}>Batal</Button>
                        <Button onClick={handleSave}>Simpan</Button>
                    </div>
                </div>
            </Modal>

            {positionToDelete && (
                <ConfirmationModal
                    isOpen={!!positionToDelete}
                    onClose={() => setPositionToDelete(null)}
                    onConfirm={handleDelete}
                    title="Konfirmasi Hapus Jabatan"
                    message={`Apakah Anda yakin ingin menghapus jabatan ${positionToDelete.name}?`}
                />
            )}
        </Card>
    );
};

export default PositionManagement;
