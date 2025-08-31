import { z } from 'zod';
import type { IRequest } from 'itty-router';
import { mockEmployees } from '../../../data/mockData';
import { json } from '../utils';

const employeeSchema = z.object({
  name: z.string(),
  nip: z.string(),
  position: z.string(),
  unit: z.string(),
  email: z.string().email(),
  whatsappNumber: z.string(),
  status: z.string(),
  avatarUrl: z.string().optional(),
  joinDate: z.string(),
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
});

export const getEmployees = () => json(mockEmployees);

export const createEmployee = async (request: IRequest) => {
  const data = employeeSchema.parse(await request.json());
  const newEmployee = { id: `E${Date.now()}`, ...data };
  mockEmployees.push(newEmployee);
  return json(newEmployee, { status: 201 });
};

export const updateEmployee = async (request: IRequest) => {
  const id = request.params?.id;
  const index = mockEmployees.findIndex((e) => e.id === id);
  if (index === -1) {
    return json({ message: 'Pegawai tidak ditemukan.' }, { status: 404 });
  }
  const data = employeeSchema.partial().parse(await request.json());
  mockEmployees[index] = { ...mockEmployees[index], ...data };
  return json(mockEmployees[index]);
};

export const deleteEmployee = (request: IRequest) => {
  const id = request.params?.id;
  const index = mockEmployees.findIndex((e) => e.id === id);
  if (index === -1) {
    return json({ message: 'Pegawai tidak ditemukan.' }, { status: 404 });
  }
  mockEmployees.splice(index, 1);
  return json({ message: 'Pegawai berhasil dihapus.' });
};
