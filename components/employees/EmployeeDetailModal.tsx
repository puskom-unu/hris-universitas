import React from 'react';
import Modal from '../shared/Modal';
import { Employee, PositionHistory } from '../../types';
import Button from '../shared/Button';

interface EmployeeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee;
  positionHistory: PositionHistory[];
}

const DetailRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div className="grid grid-cols-3 gap-4 py-2">
        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</dt>
        <dd className="text-sm text-gray-900 dark:text-white col-span-2">{value}</dd>
    </div>
);


const EmployeeDetailModal: React.FC<EmployeeDetailModalProps> = ({ isOpen, onClose, employee, positionHistory }) => {
  if (!isOpen) return null;

  const employeeHistory = positionHistory
    .filter(h => h.employeeId === employee.id)
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detail Pegawai">
        <div className="space-y-6">
            <div className="flex flex-col items-center sm:flex-row sm:items-start sm:space-x-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <img className="w-24 h-24 rounded-full mb-4 sm:mb-0" src={employee.avatarUrl} alt={`${employee.name} avatar`} />
                <div className="text-center sm:text-left">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{employee.name}</h3>
                    <p className="text-md text-blue-600 dark:text-blue-400">{employee.position}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{employee.unit}</p>
                </div>
            </div>

            <div>
                <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-2 border-b pb-2">Informasi Dasar & Kontak</h4>
                <dl className="divide-y divide-gray-200 dark:divide-gray-600">
                    <DetailRow label="NIP" value={employee.nip} />
                    <DetailRow label="Email" value={employee.email} />
                    <DetailRow label="WhatsApp" value={
                        <a href={`https://wa.me/${employee.whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {employee.whatsappNumber} <i className="fas fa-external-link-alt fa-xs ml-1"></i>
                        </a>
                    } />
                    <DetailRow label="Tanggal Bergabung" value={formatDate(employee.joinDate)} />
                    <DetailRow label="Info Bank" value={`${employee.bankName} - ${employee.accountNumber}`} />
                    <div className="grid grid-cols-3 gap-4 py-2 items-center">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</dt>
                        <dd className="col-span-2">
                             <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                                employee.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                            }`}>
                                {employee.status}
                            </span>
                        </dd>
                    </div>
                </dl>
            </div>

            <div>
                <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-2 border-b pb-2">Riwayat Jabatan</h4>
                {employeeHistory.length > 0 ? (
                    <div className="overflow-x-auto max-h-60">
                        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0">
                                <tr>
                                    <th scope="col" className="px-4 py-2">Jabatan</th>
                                    <th scope="col" className="px-4 py-2">Unit Kerja</th>
                                    <th scope="col" className="px-4 py-2">Mulai</th>
                                    <th scope="col" className="px-4 py-2">Selesai</th>
                                </tr>
                            </thead>
                            <tbody>
                                {employeeHistory.map(item => (
                                    <tr key={item.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                        <td className="px-4 py-2 font-medium text-gray-900 dark:text-white">{item.position}</td>
                                        <td className="px-4 py-2">{item.unit}</td>
                                        <td className="px-4 py-2">{formatDate(item.startDate)}</td>
                                        <td className="px-4 py-2">{item.endDate ? formatDate(item.endDate) : <span className="font-semibold text-green-600 dark:text-green-400">Sekarang</span>}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">Tidak ada riwayat jabatan yang tercatat.</p>
                )}
            </div>

             <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button variant="secondary" onClick={onClose}>
                    Tutup
                </Button>
            </div>
        </div>
    </Modal>
  );
};

export default EmployeeDetailModal;