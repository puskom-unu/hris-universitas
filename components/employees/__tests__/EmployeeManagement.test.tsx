import { render, screen } from '@testing-library/react';
import { describe, it, vi, expect } from 'vitest';
import EmployeeManagement from '../EmployeeManagement';

vi.mock('../../../hooks/useEmployees', () => ({
  useEmployees: () => ({
    employees: [
      {
        id: 'E001',
        name: 'John Doe',
        nip: '123',
        position: 'Manager',
        unit: 'HR',
        email: 'john@example.com',
        whatsappNumber: '0812345678',
        status: 'Active',
        joinDate: '2020-01-01',
        avatarUrl: '',
      },
    ],
    positionHistory: [],
    addEmployee: vi.fn(),
    updateEmployee: vi.fn(),
    deleteEmployee: vi.fn(),
    loading: false,
    error: null,
  }),
}));

describe('EmployeeManagement', () => {
  it('displays employee data', () => {
    render(<EmployeeManagement />);
    expect(screen.getByText('Pengelolaan Pegawai')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });
});
