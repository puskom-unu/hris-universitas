import React, { useEffect, useState } from 'react';
import Modal from '../shared/Modal';
import Button from '../shared/Button';
import { Employee, Position, Unit } from '../../types';
import { fetchPositions, fetchUnits } from '../../services/apiService';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { employeeSchema, EmployeeFormData } from './schema';

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEmployee: (employee: Omit<Employee, 'id' | 'avatarUrl'>) => void;
}

const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({ isOpen, onClose, onAddEmployee }) => {
    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
        reset,
    } = useForm<EmployeeFormData>({
        resolver: zodResolver(employeeSchema),
        mode: 'onChange',
        defaultValues: {
            name: '',
            nip: '',
            position: '',
            unit: '',
            email: '',
            whatsappNumber: '',
            joinDate: new Date().toISOString().split('T')[0],
            status: 'Active',
            bankName: '',
            accountNumber: '',
        },
    });

    const [positions, setPositions] = useState<Position[]>([]);
    const [units, setUnits] = useState<Unit[]>([]);

    useEffect(() => {
        if (!isOpen) {
            reset();
        }
    }, [isOpen, reset]);

    useEffect(() => {
        fetchPositions().then(setPositions);
        fetchUnits().then(setUnits);
    }, []);

    const onSubmit = (data: EmployeeFormData) => {
        onAddEmployee(data);
    };

    const FormField: React.FC<{ name: keyof EmployeeFormData, label: string, type?: string, children?: React.ReactNode }> = ({ name, label, type = 'text', children }) => (
        <div>
            <label htmlFor={name} className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">{label}</label>
            {children ? (
                children
            ) : (
                <input
                    type={type}
                    id={name}
                    {...register(name)}
                    className={`bg-gray-50 border ${errors[name] ? 'border-red-500' : 'border-gray-300'} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                />
            )}
            {errors[name] && <p className="mt-1 text-xs text-red-600 dark:text-red-500">{errors[name]?.message as string}</p>}
        </div>
    );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tambah Pegawai Baru">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="grid gap-6 mb-6 md:grid-cols-2">
            <FormField name="name" label="Nama Lengkap" />
            <FormField name="nip" label="NIP" />
            <FormField name="position" label="Jabatan">
                 <select
                    id="position"
                    {...register('position')}
                    className={`bg-gray-50 border ${errors.position ? 'border-red-500' : 'border-gray-300'} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                >
                    <option value="">Pilih Jabatan</option>
                    {positions.map(p => (
                        <option key={p.id} value={p.name}>{p.name}</option>
                    ))}
                </select>
            </FormField>
             <FormField name="unit" label="Unit Kerja">
                 <select
                    id="unit"
                    {...register('unit')}
                    className={`bg-gray-50 border ${errors.unit ? 'border-red-500' : 'border-gray-300'} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                >
                    <option value="">Pilih Unit Kerja</option>
                    {units.map(u => (
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
                    {...register('status')}
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
          <Button type="submit" disabled={!isValid}>
            Simpan Pegawai
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddEmployeeModal;