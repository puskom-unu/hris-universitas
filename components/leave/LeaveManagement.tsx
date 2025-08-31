

import React, { useState, useMemo, useEffect } from 'react';
import Card from '../shared/Card';
import Button from '../shared/Button';
import { mockWahaSettings } from '../../data/mockData';
import { LeaveRequest, LeaveStatus } from '../../types';
import Pagination from '../shared/Pagination';
import ConfirmationModal from '../shared/ConfirmationModal';
import { sendWhatsappMessage } from '../../services/notificationService';
import AddLeaveRequestModal from './AddLeaveRequestModal';
import LeaveRequestDetailModal from './LeaveRequestDetailModal';
import { ROLES } from '../../config/roles';
import { useAuth } from '../../context/AuthContext';
import { useLeaveRequests } from '../../hooks/useLeaveRequests';
import { useEmployees } from '../../hooks/useEmployees';

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

const LeaveManagement: React.FC = () => {
    const { user } = useAuth();
    const { leaveRequests, addRequest, updateRequest } = useLeaveRequests();
    const { employees } = useEmployees();
    if (!user) return null;
    const isEmployeeView = user.role === ROLES.PEGAWAI;
    const currentEmployee = useMemo(() => employees.find(e => e.email === user.email), [user.email, employees]);

    const requestsForView = useMemo(() => {
        if (isEmployeeView && currentEmployee) {
            return leaveRequests.filter(req => req.employeeId === currentEmployee.id);
        }
        return leaveRequests;
    }, [leaveRequests, isEmployeeView, currentEmployee]);

    const [currentPage, setCurrentPage] = useState(1);
    const [actionToConfirm, setActionToConfirm] = useState<{ request: LeaveRequest, newStatus: LeaveStatus } | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [requestToView, setRequestToView] = useState<LeaveRequest | null>(null);
    
    const leavePeriods = useMemo(() => {
        const periods = new Set(
            requestsForView.map(req => {
                const date = new Date(req.startDate);
                return new Intl.DateTimeFormat('id-ID', { year: 'numeric', month: 'long' }).format(date);
            })
        );
        return ['All', ...Array.from(periods)];
    }, [requestsForView]);

    const [periodFilter, setPeriodFilter] = useState('All');

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, periodFilter]);

    const filteredRequests = useMemo(() => {
        return requestsForView.filter(request => {
            const matchesSearch = isEmployeeView || request.employeeName.toLowerCase().includes(searchTerm.toLowerCase());
            
            const requestDate = new Date(request.startDate);
            const requestPeriod = new Intl.DateTimeFormat('id-ID', { year: 'numeric', month: 'long' }).format(requestDate);
            const matchesPeriod = periodFilter === 'All' || requestPeriod === periodFilter;

            return matchesSearch && matchesPeriod;
        }).sort((a,b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    }, [searchTerm, periodFilter, requestsForView, isEmployeeView]);


    const RECORDS_PER_PAGE = 10;
    
    const triggerNotification = (request: LeaveRequest, newStatus: LeaveStatus) => {
        const isApproval = newStatus === LeaveStatus.APPROVED;
        const triggerEnabled = isApproval ? mockWahaSettings.triggers.leaveApproved : mockWahaSettings.triggers.leaveRejected;

        if (!mockWahaSettings.enabled || !triggerEnabled) {
            console.log(`[Leave] WhatsApp notification for ${newStatus} is disabled.`);
            return;
        }

        const employee = employees.find(e => e.id === request.employeeId);
        if (!employee || !employee.whatsappNumber) {
            console.error(`[Leave] Employee or WhatsApp number not found for ID: ${request.employeeId}`);
            return;
        }

        const statusText = isApproval ? 'disetujui' : 'ditolak';
        const message = `Yth. ${employee.name}, permintaan cuti Anda (${request.leaveType}) untuk tanggal ${request.startDate} s/d ${request.endDate} telah ${statusText}.`;

        sendWhatsappMessage(employee.whatsappNumber, message, mockWahaSettings)
            .then(result => {
                console.log(`[Leave] Notification sent successfully for leave ${request.id}. Message ID: ${result.messageId}`);
            })
            .catch(error => {
                console.error(`[Leave] Failed to send notification for leave ${request.id}:`, error);
            });
    };

    const handleConfirmAction = () => {
        if (actionToConfirm) {
             const updatedRequest = { ...actionToConfirm.request, status: actionToConfirm.newStatus, approver: user.name };

            updateRequest(updatedRequest);
            triggerNotification(actionToConfirm.request, actionToConfirm.newStatus);
            setActionToConfirm(null);
        }
    };

    const handleAddLeaveRequest = (data: Omit<LeaveRequest, 'id' | 'status' | 'approver' | 'employeeName'>) => {
        addRequest(data);
        setIsAddModalOpen(false);
    };
    
    const handleViewRequest = (request: LeaveRequest) => {
        setRequestToView(request);
    };
    
    const handleCloseDetailModal = () => {
        setRequestToView(null);
    };

    const totalPages = Math.ceil(filteredRequests.length / RECORDS_PER_PAGE);
    const paginatedRequests = useMemo(() => {
        const startIndex = (currentPage - 1) * RECORDS_PER_PAGE;
        return filteredRequests.slice(startIndex, startIndex + RECORDS_PER_PAGE);
    }, [filteredRequests, currentPage]);

    return (
        <Card>
            <h2 className="text-2xl font-bold mb-4">Pengelolaan Cuti & Izin</h2>
            <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                    {!isEmployeeView && (
                        <div className="relative flex-grow">
                             <input
                                type="text"
                                placeholder="Cari nama pegawai..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                <i className="fas fa-search text-gray-400"></i>
                            </span>
                        </div>
                    )}
                    <select
                        value={periodFilter}
                        onChange={e => setPeriodFilter(e.target.value)}
                        className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 px-4 py-2 flex-grow"
                    >
                       {leavePeriods.map(period => (
                           <option key={period} value={period}>{period === 'All' ? 'Semua Periode' : period}</option>
                       ))}
                    </select>
                </div>
                <div className="w-full md:w-auto flex-shrink-0">
                    <Button icon={<i className="fas fa-plus"></i>} onClick={() => setIsAddModalOpen(true)} className="w-full">
                        Ajukan Cuti / Izin
                    </Button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            {!isEmployeeView && <th scope="col" className="px-6 py-3">Pegawai</th>}
                            <th scope="col" className="px-6 py-3">Jenis Cuti</th>
                            <th scope="col" className="px-6 py-3">Tanggal</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedRequests.map((request: LeaveRequest) => (
                            <tr key={request.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                {!isEmployeeView && <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{request.employeeName}</td>}
                                <td className="px-6 py-4">
                                    {request.leaveType}
                                    {(request.documentName || request.documentUrl) && (
                                        <span className="ml-2 text-gray-400" title={request.documentName}>
                                            <i className="fas fa-paperclip"></i>
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4">{request.startDate} - {request.endDate}</td>
                                <td className="px-6 py-4"><StatusBadge status={request.status} /></td>
                                <td className="px-6 py-4">
                                    <Button variant="secondary" onClick={() => handleViewRequest(request)}>
                                        Lihat Detail
                                    </Button>
                                </td>
                            </tr>
                        ))}
                         {filteredRequests.length === 0 && (
                            <tr>
                                <td colSpan={isEmployeeView ? 4 : 5} className="text-center py-10 text-gray-500">
                                    Tidak ada data cuti yang cocok dengan filter.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
             <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />

            {actionToConfirm && (
                <ConfirmationModal
                    isOpen={!!actionToConfirm}
                    onClose={() => setActionToConfirm(null)}
                    onConfirm={handleConfirmAction}
                    title={actionToConfirm.newStatus === LeaveStatus.APPROVED ? 'Setujui Permintaan Cuti?' : 'Tolak Permintaan Cuti?'}
                    message={`Apakah Anda yakin ingin ${actionToConfirm.newStatus === LeaveStatus.APPROVED ? 'menyetujui' : 'menolak'} permintaan cuti dari ${actionToConfirm.request.employeeName}? Notifikasi WhatsApp akan dikirim ke pegawai.`}
                    confirmVariant={actionToConfirm.newStatus === LeaveStatus.APPROVED ? 'primary' : 'danger'}
                    confirmText={actionToConfirm.newStatus === LeaveStatus.APPROVED ? 'Ya, Setujui' : 'Ya, Tolak'}
                />
            )}
            
            <LeaveRequestDetailModal
                isOpen={!!requestToView}
                onClose={handleCloseDetailModal}
                request={requestToView}
                onApprove={(req) => setActionToConfirm({ request: req, newStatus: LeaveStatus.APPROVED })}
                onReject={(req) => setActionToConfirm({ request: req, newStatus: LeaveStatus.REJECTED })}
            />

            <AddLeaveRequestModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAddRequest={handleAddLeaveRequest}
                employee={isEmployeeView ? currentEmployee : null}
            />
        </Card>
    );
};

export default LeaveManagement;
