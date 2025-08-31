import { useState, useEffect } from 'react';
import { LeaveRequest } from '../types';
import {
  fetchLeaveRequests,
  createLeaveRequest as apiCreateLeaveRequest,
  updateLeaveRequest as apiUpdateLeaveRequest,
  deleteLeaveRequest as apiDeleteLeaveRequest,
} from '../services/apiService';

let leaveRequestsCache: LeaveRequest[] | null = null;

export const useLeaveRequests = () => {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(leaveRequestsCache || []);

  useEffect(() => {
    if (!leaveRequestsCache) {
      fetchLeaveRequests().then(data => {
        leaveRequestsCache = data;
        setLeaveRequests(data);
      });
    }
  }, []);

  const addRequest = async (
    data: Omit<LeaveRequest, 'id' | 'status' | 'approver' | 'employeeName'>
  ) => {
    const request = await apiCreateLeaveRequest(data);
    leaveRequestsCache = [request, ...(leaveRequestsCache || [])];
    setLeaveRequests(leaveRequestsCache);
  };

  const updateRequest = async (request: LeaveRequest) => {
    const updated = await apiUpdateLeaveRequest(request);
    leaveRequestsCache = (leaveRequestsCache || []).map(r =>
      r.id === updated.id ? updated : r
    );
    setLeaveRequests(leaveRequestsCache);
  };

  const deleteRequest = async (id: string) => {
    await apiDeleteLeaveRequest(id);
    leaveRequestsCache = (leaveRequestsCache || []).filter(r => r.id !== id);
    setLeaveRequests(leaveRequestsCache);
  };

  return { leaveRequests, addRequest, updateRequest, deleteRequest };
};

export default useLeaveRequests;
