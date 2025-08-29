
import React, { useState } from 'react';
import { mockPartnerBanks } from '../../data/mockData';
import { PartnerBank } from '../../types';
import Card from '../shared/Card';
import Button from '../shared/Button';
import Modal from '../shared/Modal';
import ConfirmationModal from '../shared/ConfirmationModal';

const PartnerBankManagement: React.FC = () => {
    const [banks, setBanks] = useState<PartnerBank[]>(mockPartnerBanks);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [bankToEdit, setBankToEdit] = useState<PartnerBank | null>(null);
    const [bankToDelete, setBankToDelete] = useState<PartnerBank | null>(null);
    
    const initialFormState = { name: '', code: '' };
    const [formData, setFormData] = useState(initialFormState);
    const [errors, setErrors] = useState({ name: '' });

    const handleOpenModal = (bank: PartnerBank | null) => {
        setBankToEdit(bank);
        setFormData(bank ? { name: bank.name, code: bank.code || '' } : initialFormState);
        setErrors({ name: '' });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setBankToEdit(null);
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if(errors.name) setErrors({name: ''});
    };

    const validate = () => {
        if (!formData.name.trim()) {
            setErrors({ name: 'Nama bank wajib diisi.' });
            return false;
        }
        return true;
    };

    const handleSave = () => {
        if (!validate()) return;

        let updatedBanks;
        if (bankToEdit) {
            updatedBanks = banks.map(b => b.id === bankToEdit.id ? { ...b, ...formData } : b);
        } else {
            const newBank: PartnerBank = {
                id: `BANK${Date.now()}`,
                name: formData.name,
                code: formData.code,
            };
            updatedBanks = [newBank, ...banks];
        }
        setBanks(updatedBanks);
        // Update mock data source
        mockPartnerBanks.length = 0;
        mockPartnerBanks.push(...updatedBanks);
        handleCloseModal();
    };
    
    const handleDelete = () => {
        if (bankToDelete) {
            const updatedBanks = banks.filter(b => b.id !== bankToDelete.id);
            setBanks(updatedBanks);
            // Update mock data source
            mockPartnerBanks.length = 0;
            mockPartnerBanks.push(...updatedBanks);
            setBankToDelete(null);
        }
    };
    
    return (
        <Card>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Kelola Bank Mitra</h2>
                <Button onClick={() => handleOpenModal(null)} icon={<i className="fas fa-plus"></i>}>Tambah Bank</Button>
            </div>
             <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">Nama Bank</th>
                            <th scope="col" className="px-6 py-3">Kode Bank</th>
                            <th scope="col" className="px-6 py-3">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {banks.map((bank) => (
                            <tr key={bank.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{bank.name}</td>
                                <td className="px-6 py-4">{bank.code || '-'}</td>
                                <td className="px-6 py-4">
                                    <div className="flex space-x-3">
                                        <button onClick={() => handleOpenModal(bank)} className="text-gray-500 hover:text-yellow-600" title="Edit"><i className="fas fa-edit"></i></button>
                                        <button onClick={() => setBankToDelete(bank)} className="text-gray-500 hover:text-red-600" title="Hapus"><i className="fas fa-trash"></i></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={bankToEdit ? 'Edit Bank' : 'Tambah Bank Baru'}>
                <div className="space-y-4">
                     <div>
                        <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Nama Bank</label>
                        <input
                            type="text" id="name" name="name" value={formData.name} onChange={handleChange}
                            className={`bg-gray-50 border ${errors.name ? 'border-red-500' : 'border-gray-300'} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
                        />
                        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                    </div>
                    <div>
                        <label htmlFor="code" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Kode Bank (Opsional)</label>
                        <input
                            type="text" id="code" name="code" value={formData.code} onChange={handleChange}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                    </div>
                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Button variant="secondary" onClick={handleCloseModal}>Batal</Button>
                        <Button onClick={handleSave}>Simpan</Button>
                    </div>
                </div>
            </Modal>

            {bankToDelete && (
                <ConfirmationModal
                    isOpen={!!bankToDelete}
                    onClose={() => setBankToDelete(null)}
                    onConfirm={handleDelete}
                    title="Konfirmasi Hapus Bank"
                    message={`Apakah Anda yakin ingin menghapus ${bankToDelete.name}?`}
                />
            )}
        </Card>
    );
};

export default PartnerBankManagement;
