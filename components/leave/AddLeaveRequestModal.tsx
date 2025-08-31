

import React, { useState, useEffect, useMemo, useRef } from 'react';
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

interface AddLeaveRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddRequest: (data: Omit<LeaveRequest, 'id' | 'status' | 'approver' | 'employeeName'>) => void;
  employee?: Employee | null; // Optional prop for pre-filling
}

const AddLeaveRequestModal: React.FC<AddLeaveRequestModalProps> = ({ isOpen, onClose, onAddRequest, employee }) => {
    const initialState = {
        employeeId: '',
        leaveType: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        reason: '',
        document: null as File | null,
    };
    
    const [formData, setFormData] = useState(initialState);
    const [errors, setErrors] = useState<Partial<Omit<typeof initialState, 'document'>>>({});
    const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');
    const [isEmployeeDropdownOpen, setEmployeeDropdownOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
    const [r2Enabled, setR2Enabled] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const { employees } = useEmployees();
    const { leaveRequests } = useLeaveRequests();

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
            setFormData(initialState);
            setErrors({});
            setEmployeeSearchTerm('');
            setEmployeeDropdownOpen(false);
            setIsUploading(false);
        } else if (employee) {
            setFormData(prev => ({ ...prev, employeeId: employee.id }));
            setEmployeeSearchTerm(`${employee.name} (${employee.nip})`);
        }
    }, [isOpen, employee]);

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


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        if (name === 'document') {
             const files = (e.target as HTMLInputElement).files;
             setFormData(prev => ({...prev, document: files ? files[0] : null }));
        } else {
             setFormData(prev => ({ ...prev, [name]: value }));
             if (errors[name as keyof typeof errors]) {
                 setErrors(prev => ({...prev, [name]: undefined}));
             }
        }
        
        if (name === 'startDate' && value > formData.endDate) {
            setFormData(prev => ({...prev, endDate: value}));
        }
    };
    
    const handleEmployeeSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmployeeSearchTerm(e.target.value);
        if (formData.employeeId) {
             setFormData(prev => ({...prev, employeeId: ''})); // Clear selection if user types again
        }
        setEmployeeDropdownOpen(true);
         if (errors.employeeId) {
            setErrors(prev => ({...prev, employeeId: undefined}));
        }
    };
    
    const handleEmployeeSelect = (selectedEmployee: Employee) => {
        setFormData(prev => ({...prev, employeeId: selectedEmployee.id}));
        setEmployeeSearchTerm(`${selectedEmployee.name} (${selectedEmployee.nip})`);
        setEmployeeDropdownOpen(false);
    };


    const validateForm = () => {
        const newErrors: Partial<Omit<typeof initialState, 'document'>> = {};
        if (!formData.employeeId) newErrors.employeeId = "Pegawai wajib dipilih dari daftar pencarian";
        if (!formData.leaveType) newErrors.leaveType = "Jenis cuti wajib dipilih";
        if (!formData.startDate) newErrors.startDate = "Tanggal mulai wajib diisi";
        if (!formData.endDate) newErrors.endDate = "Tanggal selesai wajib diisi";
        if (formData.endDate < formData.startDate) {
            newErrors.endDate = "Tanggal selesai tidak boleh sebelum tanggal mulai";
        }
        if (!formData.reason.trim()) newErrors.reason = "Alasan wajib diisi";
        
        // Check for overlapping leave requests only if dates are valid so far
        if (formData.employeeId && formData.startDate && formData.endDate && !newErrors.endDate) {
            const newStartDate = new Date(formData.startDate);
            const newEndDate = new Date(formData.endDate);

            const hasOverlap = leaveRequests.some(req => {
                // Check only for the selected employee and non-rejected requests
                if (req.employeeId === formData.employeeId && req.status !== LeaveStatus.REJECTED) {
                    const existingStartDate = new Date(req.startDate);
                    const existingEndDate = new Date(req.endDate);

                    // Overlap condition: (StartA <= EndB) and (EndA >= StartB)
                    return newStartDate <= existingEndDate && newEndDate >= existingStartDate;
                }
                return false;
            });

            if (hasOverlap) {
                newErrors.startDate = "Tanggal yang dipilih tumpang tindih dengan pengajuan cuti yang sudah ada.";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        const { document, ...requestData } = formData;
        let documentUrl: string | undefined = undefined;

        if (document && r2Enabled) {
            setIsUploading(true);
            try {
                // Step 1: Get a pre-signed URL from our backend
                const presignResult = await generatePresignedUrl(document.name, document.type);
                if (!presignResult.success || !presignResult.uploadUrl || !presignResult.finalUrl) {
                    throw new Error(presignResult.message || 'Gagal mendapatkan URL untuk unggah file.');
                }

                // Step 2: Upload the file directly to R2 using the pre-signed URL
                const uploadResult = await uploadFileWithPresignedUrl(presignResult.uploadUrl, document);
                if (!uploadResult.success) {
                    throw new Error(uploadResult.message || 'Gagal mengunggah file ke penyimpanan.');
                }

                documentUrl = presignResult.finalUrl; // Store the final, public URL

            } catch (error: any) {
                alert(`Terjadi kesalahan saat mengunggah file: ${error.message}`);
                setIsUploading(false);
                return; // Stop submission on failure
            } finally {
                setIsUploading(false);
            }
        }
        
        onAddRequest({
            ...requestData,
            documentName: document?.name,
            documentUrl: documentUrl,
        });
    };

    const FormField: React.FC<{ name: keyof typeof initialState, label: string, children: React.ReactNode }> = ({ name, label, children }) => (
        <div>
            <label htmlFor={name} className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">{label}</label>
            {children}
            {errors[name as keyof typeof errors] && <p className="mt-1 text-xs text-red-600 dark:text-red-500">{errors[name as keyof typeof errors]}</p>}
        </div>
    );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Formulir Pengajuan Cuti / Izin">
      <form onSubmit={handleSubmit} noValidate>
        <div className="space-y-4">
            <FormField name="employeeId" label="Pegawai">
                <div className="relative" ref={searchRef}>
                     <input
                        type="text"
                        id="employeeId"
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
                </div>
            </FormField>

            <FormField name="leaveType" label="Jenis Cuti / Izin">
                <select
                    id="leaveType"
                    name="leaveType"
                    value={formData.leaveType}
                    onChange={handleChange}
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
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleChange}
                        className={`bg-gray-50 border ${errors.startDate ? 'border-red-500' : 'border-gray-300'} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600`}
                    />
                </FormField>
                <FormField name="endDate" label="Tanggal Selesai">
                    <input
                        type="date"
                        id="endDate"
                        name="endDate"
                        value={formData.endDate}
                        min={formData.startDate}
                        onChange={handleChange}
                        className={`bg-gray-50 border ${errors.endDate ? 'border-red-500' : 'border-gray-300'} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600`}
                    />
                </FormField>
            </div>
            
            <FormField name="reason" label="Alasan">
                <textarea
                    id="reason"
                    name="reason"
                    rows={3}
                    value={formData.reason}
                    onChange={handleChange}
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
                            <input id="document" name="document" type="file" className="sr-only" onChange={handleChange} />
                        </label>
                        <p className="pl-1">atau seret dan lepas</p>
                        </div>
                        {formData.document ? (
                             <p className="text-sm text-green-600 dark:text-green-400 font-semibold">{formData.document.name}</p>
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
          <Button type="submit" disabled={isUploading}>
            {isUploading ? 'Mengunggah...' : 'Ajukan'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddLeaveRequestModal;
