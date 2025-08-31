import { useState, useEffect } from 'react';
import { AttendanceRecord } from '../types';
import {
  fetchAttendanceRecords,
  createAttendanceRecord as apiCreateAttendanceRecord,
  updateAttendanceRecord as apiUpdateAttendanceRecord,
  deleteAttendanceRecord as apiDeleteAttendanceRecord,
} from '../services/apiService';
import { logError } from '../utils/logging';

let attendanceCache: AttendanceRecord[] | null = null;

export const useAttendanceRecords = () => {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(attendanceCache || []);
  const [loading, setLoading] = useState(!attendanceCache);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!attendanceCache) {
      setLoading(true);
      fetchAttendanceRecords()
        .then(data => {
          attendanceCache = data;
          setAttendanceRecords(data);
          setError(null);
        })
        .catch(err => {
          setError(err);
          logError(err);
        })
        .finally(() => setLoading(false));
    }
  }, []);

  const addRecord = async (data: Omit<AttendanceRecord, 'id'>) => {
    const record = await apiCreateAttendanceRecord(data);
    attendanceCache = [record, ...(attendanceCache || [])];
    setAttendanceRecords(attendanceCache);
  };

  const updateRecord = async (record: AttendanceRecord) => {
    const updated = await apiUpdateAttendanceRecord(record);
    attendanceCache = (attendanceCache || []).map(r => (r.id === record.id ? updated : r));
    setAttendanceRecords(attendanceCache);
  };

  const deleteRecord = async (id: string) => {
    await apiDeleteAttendanceRecord(id);
    attendanceCache = (attendanceCache || []).filter(r => r.id !== id);
    setAttendanceRecords(attendanceCache);
  };

  return { attendanceRecords, addRecord, updateRecord, deleteRecord, loading, error };
};

export default useAttendanceRecords;
