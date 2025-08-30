

import React from 'react';
import Modal from '../shared/Modal';
import Button from '../shared/Button';
import { LeaveRequest, LeaveStatus, User } from '../../types';
import { mockEmployees } from '../../data/mockData';
import { ROLES } from '../../config/roles';

interface LeaveRequestDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: LeaveRequest | null;
  user: User;
  onApprove: (request: LeaveRequest) => void;
  onReject: (request: LeaveRequest) => void;
}

const DetailRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</dt>
        <dd className="text-sm text-gray-900 dark:text-white col-span-2">{value}</dd>
    </div>
);

const StatusBadge: React.FC<{ status: LeaveStatus }> = ({ status }) => {
    const statusClasses = {
        [LeaveStatus.PENDING]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        [LeaveStatus.APPROVED]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        [LeaveStatus.REJECTED]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    };
    return (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status]}`}>
            {status}
        </span>
    );
};

const LeaveRequestDetailModal: React.FC<LeaveRequestDetailModalProps> = ({ isOpen, onClose, request, user, onApprove, onReject }) => {
  if (!isOpen || !request) return null;

  const employee = mockEmployees.find(e => e.id === request.employeeId);
  const canTakeAction = user.role !== ROLES.PEGAWAI;

  const handleApprove = () => {
    onApprove(request);
    onClose();
  };

  const handleReject = () => {
    onReject(request);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detail Pengajuan Cuti / Izin">
        <div className="space-y-6">
            <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                {employee && <img className="w-16 h-16 rounded-full" src={employee.avatarUrl} alt={employee.name} />}
                <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{request.employeeName}</h3>
                    {employee && <p className="text-sm text-gray-500 dark:text-gray-400">NIP: {employee.nip}</p>}
                </div>
            </div>
            
            <dl>
                <DetailRow label="Jenis Pengajuan" value={request.leaveType} />
                <DetailRow label="Tanggal" value={`${request.startDate} - ${request.endDate}`} />
                <DetailRow label="Alasan" value={<p className="whitespace-pre-wrap">{request.reason}</p>} />
                <DetailRow label="Status" value={<StatusBadge status={request.status} />} />
                <DetailRow label="Diapprove oleh" value={request.approver || '-'} />
                <DetailRow 
                    label="Dokumen Pendukung" 
                    value={
                        request.documentUrl ? (
                             <a 
                                href={request.documentUrl}
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-blue-600 hover:underline"
                            >
                                {request.documentName || 'Lihat Dokumen'} <i className="fas fa-external-link-alt fa-xs ml-1"></i>
                            </a>
                        ) : request.documentName ? (
                           <span className="text-gray-700 dark:text-gray-300">{request.documentName} (Tidak diunggah)</span>
                        ) : (
                            '-'
                        )
                    } 
                />
            </dl>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                {request.status === LeaveStatus.PENDING && canTakeAction ? (
                    <>
                        <Button variant="danger" onClick={handleReject}>
                            Tolak
                        </Button>
                        <Button variant="primary" onClick={handleApprove}>
                            Setujui
                        </Button>
                    </>
                ) : (
                    <Button variant="secondary" onClick={onClose}>
                        Tutup
                    </Button>
                )}
            </div>
        </div>
    </Modal>
  );
};

export default LeaveRequestDetailModal;
