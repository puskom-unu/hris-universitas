

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Modal from '../shared/Modal';
import Button from '../shared/Button';
import { LeaveRequest, Employee, LeaveStatus, LeaveType } from '../../types';
import {
  generatePresignedUrl,
  uploadFileWithPresignedUrl,
  fetchLeaveTypes,
  getR2Settings,
} from '../../services/apiService';
import { useEmployees } from '../../hooks/useEmployees';
import { useLeaveRequests } from '../../hooks/useLeaveRequests';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { leaveRequestSchema, LeaveRequestFormData } from './schema';

interface AddLeaveRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddRequest: (data: Omit<LeaveRequest, 'id' | 'status' | 'approver' | 'employeeName'>) => void;
  employee?: Employee | null; // Optional prop for pre-filling
}

const AddLeaveRequestModal: React.FC<AddLeaveRequestModalProps> = ({ isOpen, onClose, onAddRequest, employee }) => {
    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
        reset,
        setValue,
        watch,
        setError,
    } = useForm<LeaveRequestFormData>({
        resolver: zodResolver(leaveRequestSchema),
        mode: 'onChange',
        defaultValues: {
            employeeId: '',
            leaveType: '',
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date().toISOString().split('T')[0],
            reason: '',
            document: undefined,
        },
    });

    const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');
    const [isEmployeeDropdownOpen, setEmployeeDropdownOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
    const [r2Enabled, setR2Enabled] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const { employees, loading: employeesLoading, error: employeesError } = useEmployees();
    const { leaveRequests, loading: leaveLoading, error: leaveError } = useLeaveRequests();

    if (employeesLoading || leaveLoading) {
        return (
            <Modal isOpen={isOpen} onClose={onClose} title="Formulir Pengajuan Cuti / Izin">
                <p>Memuat data...</p>
            </Modal>
        );
    }

    if (employeesError || leaveError) {
        return (
            <Modal isOpen={isOpen} onClose={onClose} title="Formulir Pengajuan Cuti / Izin">
                <p className="text-red-500">Gagal memuat data.</p>
            </Modal>
        );
    }

    const activeEmployees = useMemo(() => employees.filter(e => e.status === 'Active'), [employees]);

    const filteredEmployees = useMemo(() => {
        if (!employeeSearchTerm || employee) return []; // Don't filter if an employee is already set
        return activeEmployees.filter(emp =>
            emp.name.toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
            emp.nip.includes(employeeSearchTerm)
        );
    }, [employeeSearchTerm, activeEmployees, employee]);

    useEffect(() => {
        if (!isOpen) {
            reset();
            setEmployeeSearchTerm('');
            setEmployeeDropdownOpen(false);
            setIsUploading(false);
        } else if (employee) {
            setValue('employeeId', employee.id);
            setEmployeeSearchTerm(`${employee.name} (${employee.nip})`);
        }
    }, [isOpen, employee, reset, setValue]);

    useEffect(() => {
        fetchLeaveTypes().then(setLeaveTypes);
        getR2Settings().then(s => setR2Enabled(s.enabled)).catch(() => setR2Enabled(false));
    }, []);

    // Click outside handler for employee search
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setEmployeeDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [searchRef]);


    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value, files } = e.target as any;
        if (name === 'document') {
            setValue('document', files ? files[0] : undefined);
        } else {
            setValue(name as keyof LeaveRequestFormData, value, { shouldValidate: true });
            if (name === 'startDate' && value > watch('endDate')) {
                setValue('endDate', value, { shouldValidate: true });
            }
        }
    };
    
    const handleEmployeeSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmployeeSearchTerm(e.target.value);
        setValue('employeeId', '', { shouldValidate: true });
        setEmployeeDropdownOpen(true);
    };
    
    const handleEmployeeSelect = (selectedEmployee: Employee) => {
        setValue('employeeId', selectedEmployee.id, { shouldValidate: true });
        setEmployeeSearchTerm(`${selectedEmployee.name} (${selectedEmployee.nip})`);
        setEmployeeDropdownOpen(false);
    };


    const onSubmit = async (data: LeaveRequestFormData) => {
        // Overlap check
        const newStartDate = new Date(data.startDate);
        const newEndDate = new Date(data.endDate);
        const hasOverlap = leaveRequests.some(req => {
            if (req.employeeId === data.employeeId && req.status !== LeaveStatus.REJECTED) {
                const existingStartDate = new Date(req.startDate);
                const existingEndDate = new Date(req.endDate);
                return newStartDate <= existingEndDate && newEndDate >= existingStartDate;
            }
            return false;
        });
        if (hasOverlap) {
            setError('startDate', {
                type: 'manual',
                message: 'Tanggal yang dipilih tumpang tindih dengan pengajuan cuti yang sudah ada.',
            });
            return;
        }

        const file = data.document as File | undefined;
        let documentUrl: string | undefined = undefined;

        if (file && r2Enabled) {
            setIsUploading(true);
            try {
                const presignResult = await generatePresignedUrl(file.name, file.type);
                if (!presignResult.success || !presignResult.uploadUrl || !presignResult.finalUrl) {
                    throw new Error(presignResult.message || 'Gagal mendapatkan URL untuk unggah file.');
                }

                const uploadResult = await uploadFileWithPresignedUrl(presignResult.uploadUrl, file);
                if (!uploadResult.success) {
                    throw new Error(uploadResult.message || 'Gagal mengunggah file ke penyimpanan.');
                }

                documentUrl = presignResult.finalUrl;
            } catch (error: any) {
                alert(`Terjadi kesalahan saat mengunggah file: ${error.message}`);
                setIsUploading(false);
                return;
            } finally {
                setIsUploading(false);
            }
        }

        onAddRequest({
            employeeId: data.employeeId,
            leaveType: data.leaveType,
            startDate: data.startDate,
            endDate: data.endDate,
            reason: data.reason,
            documentName: file?.name,
            documentUrl,
        });
    };

    const FormField: React.FC<{ name: keyof LeaveRequestFormData, label: string, children: React.ReactNode }> = ({ name, label, children }) => (
        <div>
            <label htmlFor={name} className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">{label}</label>
            {children}
            {errors[name] && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-500">{errors[name]?.message as string}</p>
            )}
        </div>
    );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Formulir Pengajuan Cuti / Izin">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="space-y-4">
            <FormField name="employeeId" label="Pegawai">
                <div className="relative" ref={searchRef}>
                    <input
                        type="text"
                        id="employee-search"
                        value={employeeSearchTerm}
                        onChange={handleEmployeeSearchChange}
                        onFocus={() => setEmployeeDropdownOpen(true)}
                        placeholder="-- Cari Nama atau NIP Pegawai --"
                        autoComplete="off"
                        disabled={!!employee}
                        className={`bg-gray-50 border ${errors.employeeId ? 'border-red-500' : 'border-gray-300'} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 disabled:cursor-not-allowed disabled:bg-gray-200 dark:disabled:bg-gray-600`}
                    />
                    {isEmployeeDropdownOpen && !employee && filteredEmployees.length > 0 && (
                        <ul className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                            {filteredEmployees.map(emp => (
                                <li
                                    key={emp.id}
                                    onClick={() => handleEmployeeSelect(emp)}
                                    className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    <p className="font-semibold text-sm">{emp.name}</p>
                                    <p className="text-xs text-gray-500">{emp.nip}</p>
                                </li>
                            ))}
                        </ul>
                    )}
                    <input type="hidden" {...register('employeeId')} />
                </div>
            </FormField>

            <FormField name="leaveType" label="Jenis Cuti / Izin">
                <select
                    id="leaveType"
                    {...register('leaveType', { onChange: handleChange })}
                    className={`bg-gray-50 border ${errors.leaveType ? 'border-red-500' : 'border-gray-300'} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600`}
                >
                    <option value="">-- Pilih Jenis Cuti --</option>
                    {leaveTypes.map(lt => (
                        <option key={lt.id} value={lt.name}>{lt.name}</option>
                    ))}
                </select>
            </FormField>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <FormField name="startDate" label="Tanggal Mulai">
                    <input
                        type="date"
                        id="startDate"
                        {...register('startDate', { onChange: handleChange })}
                        className={`bg-gray-50 border ${errors.startDate ? 'border-red-500' : 'border-gray-300'} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600`}
                    />
                </FormField>
                <FormField name="endDate" label="Tanggal Selesai">
                    <input
                        type="date"
                        id="endDate"
                        min={watch('startDate')}
                        {...register('endDate', { onChange: handleChange })}
                        className={`bg-gray-50 border ${errors.endDate ? 'border-red-500' : 'border-gray-300'} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600`}
                    />
                </FormField>
            </div>

            <FormField name="reason" label="Alasan">
                <textarea
                    id="reason"
                    rows={3}
                    {...register('reason', { onChange: handleChange })}
                    className={`bg-gray-50 border ${errors.reason ? 'border-red-500' : 'border-gray-300'} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600`}
                    placeholder="Tuliskan alasan pengajuan cuti di sini..."
                ></textarea>
            </FormField>

            <FormField name="document" label="Dokumen Pendukung (Opsional)">
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md">
                   <div className="space-y-1 text-center">
                       <i className="fas fa-file-upload mx-auto h-12 w-12 text-gray-400"></i>
                       <div className="flex text-sm text-gray-600 dark:text-gray-400">
                       <label htmlFor="document" className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                           <span>Unggah file</span>
                            <input id="document" type="file" className="sr-only" {...register('document', { onChange: handleChange })} />
                       </label>
                       <p className="pl-1">atau seret dan lepas</p>
                       </div>
                        {watch('document') ? (
                             <p className="text-sm text-green-600 dark:text-green-400 font-semibold">{(watch('document') as File).name}</p>
                        ) : (
                             <p className="text-xs text-gray-500 dark:text-gray-500">PDF, PNG, JPG, DOCX (MAX. 2MB)</p>
                        )}
                   </div>
                </div>
            </FormField>
        </div>

        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
          <Button type="button" variant="secondary" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" disabled={isUploading || !isValid}>
            {isUploading ? 'Mengunggah...' : 'Ajukan'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddLeaveRequestModal;
