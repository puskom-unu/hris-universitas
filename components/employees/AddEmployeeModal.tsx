import React, { useState, useEffect } from 'react';
import Modal from '../shared/Modal';
import Button from '../shared/Button';
import { Employee } from '../../types';
import { mockPositions, mockUnits } from '../../data/mockData';

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEmployee: (employee: Omit<Employee, 'id' | 'avatarUrl'>) => void;
}

const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({ isOpen, onClose, onAddEmployee }) => {
    const initialState = {
        name: '',
        nip: '',
        position: '',
        unit: '',
        email: '',
        whatsappNumber: '',
        joinDate: new Date().toISOString().split('T')[0],
        status: 'Active' as 'Active' | 'Inactive',
        // FIX: Add missing properties to match Employee type
        bankName: '',
        accountNumber: '',
    };
    
    const [formData, setFormData] = useState(initialState);
    const [errors, setErrors] = useState<Partial<typeof initialState>>({});

    useEffect(() => {
        if (!isOpen) {
            // Reset form when modal is closed
            setFormData(initialState);
            setErrors({});
        }
    }, [isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name as keyof typeof errors]) {
            setErrors(prev => ({...prev, [name]: undefined}));
        }
    };

    const validateForm = () => {
        const newErrors: Partial<typeof initialState> = {};
        if (!formData.name.trim()) newErrors.name = "Nama wajib diisi";
        if (!formData.nip.trim()) newErrors.nip = "NIP wajib diisi";
        if (!formData.position.trim()) newErrors.position = "Jabatan wajib dipilih";
        if (!formData.unit.trim()) newErrors.unit = "Unit wajib dipilih";
        if (!formData.email.trim()) newErrors.email = "Email wajib diisi";
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Format email tidak valid";
        if (!formData.whatsappNumber.trim()) newErrors.whatsappNumber = "Nomor WhatsApp wajib diisi";
        else if (!/^\d+$/.test(formData.whatsappNumber)) newErrors.whatsappNumber = "Format Nomor WhatsApp tidak valid. Harap masukkan angka saja.";
        // FIX: Add validation for new fields
        if (!formData.bankName.trim()) newErrors.bankName = "Nama bank wajib diisi.";
        if (!formData.accountNumber.trim()) newErrors.accountNumber = "Nomor rekening wajib diisi.";
        else if (!/^\d+$/.test(formData.accountNumber)) newErrors.accountNumber = "Nomor rekening hanya boleh berisi angka.";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            onAddEmployee(formData);
        }
    };

    const FormField: React.FC<{ name: keyof typeof initialState, label: string, type?: string, children?: React.ReactNode }> = ({ name, label, type = 'text', children }) => (
        <div>
            <label htmlFor={name} className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">{label}</label>
            {children ? (
                children
            ) : (
                <input
                    type={type}
                    id={name}
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    className={`bg-gray-50 border ${errors[name] ? 'border-red-500' : 'border-gray-300'} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                />
            )}
            {errors[name] && <p className="mt-1 text-xs text-red-600 dark:text-red-500">{errors[name]}</p>}
        </div>
    );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tambah Pegawai Baru">
      <form onSubmit={handleSubmit} noValidate>
        <div className="grid gap-6 mb-6 md:grid-cols-2">
            <FormField name="name" label="Nama Lengkap" />
            <FormField name="nip" label="NIP" />
            <FormField name="position" label="Jabatan">
                 <select
                    id="position"
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    className={`bg-gray-50 border ${errors.position ? 'border-red-500' : 'border-gray-300'} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                >
                    <option value="">Pilih Jabatan</option>
                    {mockPositions.map(p => (
                        <option key={p.id} value={p.name}>{p.name}</option>
                    ))}
                </select>
            </FormField>
             <FormField name="unit" label="Unit Kerja">
                 <select
                    id="unit"
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    className={`bg-gray-50 border ${errors.unit ? 'border-red-500' : 'border-gray-300'} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                >
                    <option value="">Pilih Unit Kerja</option>
                    {mockUnits.map(u => (
                        <option key={u.id} value={u.name}>{u.name}</option>
                    ))}
                </select>
            </FormField>
            <FormField name="email" label="Email" type="email" />
            <FormField name="whatsappNumber" label="Nomor WhatsApp" type="tel" />
            <FormField name="joinDate" label="Tanggal Bergabung" type="date" />
            <FormField name="status" label="Status">
                 <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                >
                    <option value="Active">Aktif</option>
                    <option value="Inactive">Tidak Aktif</option>
                </select>
            </FormField>
            {/* FIX: Add form fields for bank info */}
            <FormField name="bankName" label="Nama Bank" />
            <FormField name="accountNumber" label="Nomor Rekening" />
        </div>
        
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button type="button" variant="secondary" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit">
            Simpan Pegawai
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddEmployeeModal;