
import React, { useState } from 'react';
import { mockUnits } from '../../data/mockData';
import { Unit } from '../../types';
import Card from '../shared/Card';
import Button from '../shared/Button';
import Modal from '../shared/Modal';
import ConfirmationModal from '../shared/ConfirmationModal';

const UnitManagement: React.FC = () => {
    const [units, setUnits] = useState<Unit[]>(mockUnits);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [unitToEdit, setUnitToEdit] = useState<Unit | null>(null);
    const [unitToDelete, setUnitToDelete] = useState<Unit | null>(null);
    
    const initialFormState = { name: '', category: 'Fakultas' };
    const [formData, setFormData] = useState(initialFormState);
    const [errors, setErrors] = useState({ name: '', category: '' });

    const handleOpenModal = (unit: Unit | null) => {
        setUnitToEdit(unit);
        setFormData(unit ? { name: unit.name, category: unit.category } : initialFormState);
        setErrors({ name: '', category: '' });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setUnitToEdit(null);
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if(errors.name || errors.category) setErrors({name: '', category: ''});
    };

    const validate = () => {
        const newErrors = { name: '', category: '' };
        if (!formData.name.trim()) newErrors.name = 'Nama unit wajib diisi.';
        if (!formData.category.trim()) newErrors.category = 'Kategori wajib dipilih.';
        setErrors(newErrors);
        return !newErrors.name && !newErrors.category;
    };

    const handleSave = () => {
        if (!validate()) return;

        if (unitToEdit) {
            setUnits(units.map(u => u.id === unitToEdit.id ? { ...u, ...formData } : u));
        } else {
            const newUnit: Unit = {
                id: `U${Date.now()}`,
                ...formData
            };
            setUnits([newUnit, ...units]);
        }
        handleCloseModal();
    };
    
    const handleDelete = () => {
        if (unitToDelete) {
            setUnits(units.filter(u => u.id !== unitToDelete.id));
            setUnitToDelete(null);
        }
    };
    
    return (
        <Card>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Kelola Unit Kerja</h2>
                <Button onClick={() => handleOpenModal(null)} icon={<i className="fas fa-plus"></i>}>Tambah Unit</Button>
            </div>
             <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">Nama Unit Kerja</th>
                            <th scope="col" className="px-6 py-3">Kategori</th>
                            <th scope="col" className="px-6 py-3">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {units.map((unit) => (
                            <tr key={unit.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{unit.name}</td>
                                <td className="px-6 py-4">{unit.category}</td>
                                <td className="px-6 py-4">
                                    <div className="flex space-x-3">
                                        <button onClick={() => handleOpenModal(unit)} className="text-gray-500 hover:text-yellow-600" title="Edit"><i className="fas fa-edit"></i></button>
                                        <button onClick={() => setUnitToDelete(unit)} className="text-gray-500 hover:text-red-600" title="Hapus"><i className="fas fa-trash"></i></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={unitToEdit ? 'Edit Unit Kerja' : 'Tambah Unit Kerja Baru'}>
                <div className="space-y-4">
                     <div>
                        <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Nama Unit</label>
                        <input
                            type="text" id="name" name="name" value={formData.name} onChange={handleChange}
                            className={`bg-gray-50 border ${errors.name ? 'border-red-500' : 'border-gray-300'} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
                        />
                        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                    </div>
                    <div>
                        <label htmlFor="category" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Kategori</label>
                        <select
                            id="category" name="category" value={formData.category} onChange={handleChange}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                            <option>Fakultas</option>
                            <option>Biro</option>
                            <option>Lembaga</option>
                            <option>UPT</option>
                        </select>
                        {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category}</p>}
                    </div>
                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Button variant="secondary" onClick={handleCloseModal}>Batal</Button>
                        <Button onClick={handleSave}>Simpan</Button>
                    </div>
                </div>
            </Modal>

            {unitToDelete && (
                <ConfirmationModal
                    isOpen={!!unitToDelete}
                    onClose={() => setUnitToDelete(null)}
                    onConfirm={handleDelete}
                    title="Konfirmasi Hapus Unit Kerja"
                    message={`Apakah Anda yakin ingin menghapus unit ${unitToDelete.name}?`}
                />
            )}
        </Card>
    );
};

export default UnitManagement;
