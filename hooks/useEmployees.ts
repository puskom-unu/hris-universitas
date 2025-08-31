import { useState, useEffect } from 'react';
import { Employee, PositionHistory } from '../types';
import {
  fetchEmployees,
  fetchPositionHistory,
  createEmployee as apiCreateEmployee,
  updateEmployee as apiUpdateEmployee,
  deleteEmployee as apiDeleteEmployee,
} from '../services/apiService';

let employeesCache: Employee[] | null = null;
let positionHistoryCache: PositionHistory[] | null = null;

export const useEmployees = () => {
  const [employees, setEmployees] = useState<Employee[]>(employeesCache || []);
  const [positionHistory, setPositionHistory] = useState<PositionHistory[]>(positionHistoryCache || []);

  useEffect(() => {
    if (!employeesCache) {
      fetchEmployees().then(data => {
        employeesCache = data;
        setEmployees(data);
      });
    }
    if (!positionHistoryCache) {
      fetchPositionHistory().then(data => {
        positionHistoryCache = data;
        setPositionHistory(data);
      });
    }
  }, []);

  const addEmployee = async (data: Omit<Employee, 'id' | 'avatarUrl'>) => {
    const res = await apiCreateEmployee(data);
    employeesCache = [res.employee, ...(employeesCache || [])];
    positionHistoryCache = res.positionHistory;
    setEmployees(employeesCache);
    setPositionHistory(positionHistoryCache);
  };

  const updateEmployee = async (employee: Employee) => {
    const res = await apiUpdateEmployee(employee);
    employeesCache = (employeesCache || []).map(emp =>
      emp.id === employee.id ? res.employee : emp
    );
    positionHistoryCache = res.positionHistory;
    setEmployees(employeesCache);
    setPositionHistory(positionHistoryCache);
  };

  const deleteEmployee = async (id: string) => {
    const history = await apiDeleteEmployee(id);
    employeesCache = (employeesCache || []).filter(emp => emp.id !== id);
    positionHistoryCache = history;
    setEmployees(employeesCache);
    setPositionHistory(positionHistoryCache);
  };

  return { employees, positionHistory, addEmployee, updateEmployee, deleteEmployee };
};

export default useEmployees;
