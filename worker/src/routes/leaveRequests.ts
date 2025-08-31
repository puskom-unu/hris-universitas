import { z } from 'zod';
import type { IRequest } from 'itty-router';
import { LeaveStatus } from '../../../types';
import { mockLeaveRequests } from '../../../data/mockData';
import { json } from '../utils';

const leaveRequestSchema = z.object({
  employeeId: z.string(),
  employeeName: z.string(),
  leaveType: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  reason: z.string(),
  documentName: z.string().optional(),
});

const statusSchema = z.object({
  status: z.nativeEnum(LeaveStatus),
});

export const getLeaveRequests = () => json(mockLeaveRequests);

export const createLeaveRequest = async (request: IRequest) => {
  const data = leaveRequestSchema.parse(await request.json());
  const newRequest = {
    id: `L${Date.now()}`,
    status: LeaveStatus.PENDING,
    ...data,
  };
  mockLeaveRequests.push(newRequest);
  return json(newRequest, { status: 201 });
};

export const updateLeaveStatus = async (request: IRequest) => {
  const id = request.params?.id;
  const index = mockLeaveRequests.findIndex((r) => r.id === id);
  if (index === -1) {
    return json({ message: 'Permohonan tidak ditemukan.' }, { status: 404 });
  }
  const data = statusSchema.parse(await request.json());
  mockLeaveRequests[index].status = data.status;
  return json(mockLeaveRequests[index]);
};
