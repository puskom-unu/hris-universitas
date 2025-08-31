import { useState, useEffect } from 'react';
import { Employee, PositionHistory } from '../types';
import {
  fetchEmployees,
  fetchPositionHistory,
  createEmployee as apiCreateEmployee,
  updateEmployee as apiUpdateEmployee,
  deleteEmployee as apiDeleteEmployee,
} from '../services/apiService';
import { logError } from '../utils/logging';

let employeesCache: Employee[] | null = null;
let positionHistoryCache: PositionHistory[] | null = null;

export const useEmployees = () => {
  const [employees, setEmployees] = useState<Employee[]>(employeesCache || []);
  const [positionHistory, setPositionHistory] = useState<PositionHistory[]>(positionHistoryCache || []);
  const [loading, setLoading] = useState(!employeesCache || !positionHistoryCache);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!employeesCache || !positionHistoryCache) {
      setLoading(true);
      Promise.all([fetchEmployees(), fetchPositionHistory()])
        .then(([empData, historyData]) => {
          employeesCache = empData;
          positionHistoryCache = historyData;
          setEmployees(empData);
          setPositionHistory(historyData);
          setError(null);
        })
        .catch(err => {
          setError(err);
          logError(err);
        })
        .finally(() => setLoading(false));
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

  return { employees, positionHistory, addEmployee, updateEmployee, deleteEmployee, loading, error };
};

export default useEmployees;
