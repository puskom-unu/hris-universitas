
import React, { useMemo } from 'react';
import StatCard from './StatCard';
import Card from '../shared/Card';
import { mockAttendance, mockEmployees, mockLeaveRequests, mockLeaveTypes } from '../../data/mockData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { LeaveStatus } from '../../types';
import { useAuth } from '../../context/AuthContext';

const EmployeeDashboard: React.FC = () => {
    const { user } = useAuth();
    if (!user) return null;
    const employee = useMemo(() => mockEmployees.find(e => e.email === user.email), [user.email]);

    const stats = useMemo(() => {
        if (!employee) return { leaveBalance: 0, lateThisMonth: 0, absentThisMonth: 0 };
        
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const annualLeaveType = mockLeaveTypes.find(lt => lt.name.toLowerCase().includes('tahunan'));
        const annualLeaveAllowance = annualLeaveType?.defaultDays || 12;

        const approvedLeaveDays = mockLeaveRequests
            .filter(req => req.employeeId === employee.id && req.status === LeaveStatus.APPROVED && req.leaveType === annualLeaveType?.name)
            .reduce((total, req) => {
                const start = new Date(req.startDate);
                const end = new Date(req.endDate);
                const diffTime = Math.abs(end.getTime() - start.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                return total + diffDays;
            }, 0);
        
        const monthlyAttendance = mockAttendance.filter(att => {
            const attDate = new Date(att.date);
            return att.employeeId === employee.id && attDate >= startOfMonth && attDate <= now;
        });

        const lateThisMonth = monthlyAttendance.filter(att => att.status === 'Late').length;
        const absentThisMonth = monthlyAttendance.filter(att => att.status === 'Absent').length;

        return {
            leaveBalance: annualLeaveAllowance - approvedLeaveDays,
            lateThisMonth,
            absentThisMonth,
        };
    }, [employee]);
    
    const attendanceChartData = useMemo(() => {
        if (!employee) return [];
        
        const now = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);

        const recentAttendance = mockAttendance.filter(record => {
            const recordDate = new Date(record.date);
            return record.employeeId === employee.id && recordDate >= thirtyDaysAgo && recordDate <= now;
        });

        // Create a map of dates for the last 30 days
        const dateMap: { [key: string]: { date: string, status: string } } = {};
        for (let i = 0; i < 30; i++) {
            const date = new Date();
            date.setDate(now.getDate() - i);
            const dateString = date.toISOString().split('T')[0];
            dateMap[dateString] = {
                date: date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
                status: 'Tidak Ada Data', // Default status
            };
        }

        // Populate with actual data
        recentAttendance.forEach(record => {
            const dateString = new Date(record.date).toISOString().split('T')[0];
            if (dateMap[dateString]) {
                dateMap[dateString].status = record.status;
            }
        });
        
        // Convert map to sorted array
        return Object.values(dateMap).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(d => {
            let value = 0;
            if (d.status === 'On Time') value = 3;
            if (d.status === 'Late') value = 2;
            if (d.status === 'Absent') value = 1;
            return { date: d.date, value: value, status: d.status };
        });

    }, [employee]);

    const recentLeaveRequests = useMemo(() => {
        if (!employee) return [];
        return mockLeaveRequests
            .filter(req => req.employeeId === employee.id)
            .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
            .slice(0, 5);
    }, [employee]);

    if (!employee) {
        return <Card>Data pegawai tidak ditemukan.</Card>;
    }

  return (
    <div className="space-y-6">
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Sisa Cuti Tahunan" value={`${stats.leaveBalance} Hari`} icon="fa-plane-departure" color="bg-blue-500" />
        <StatCard title="Terlambat Bulan Ini" value={`${stats.lateThisMonth} Kali`} icon="fa-clock" color="bg-yellow-500" />
        <StatCard title="Absen Bulan Ini" value={`${stats.absentThisMonth} Kali`} icon="fa-calendar-times" color="bg-red-500" />
      </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4">Tren Kehadiran Pribadi (30 Hari Terakhir)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={attendanceChartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis 
                    ticks={[1, 2, 3]} 
                    tickFormatter={(value) => ['Absen', 'Terlambat', 'Tepat Waktu'][value - 1]}
                    domain={[0.5, 3.5]}
                    allowDecimals={false}
                   />
                  <Tooltip formatter={(value, name, props) => [props.payload.status, 'Status']} />
                  <Legend />
                  <Line type="step" dataKey="value" name="Status Kehadiran" stroke="#3B82F6" strokeWidth={2} activeDot={{ r: 8 }} />
              </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card>
            <h3 className="text-lg font-semibold mb-4">Pengajuan Cuti Terbaru</h3>
            <ul className="space-y-4">
                {recentLeaveRequests.length > 0 ? recentLeaveRequests.map(req => (
                    <li key={req.id} className="flex justify-between items-center">
                        <div>
                            <p className="font-semibold text-sm">{req.leaveType}</p>
                            <p className="text-xs text-gray-500">{req.startDate} - {req.endDate}</p>
                        </div>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                            req.status === LeaveStatus.PENDING ? 'bg-yellow-200 text-yellow-800' :
                            req.status === LeaveStatus.APPROVED ? 'bg-green-200 text-green-800' :
                            'bg-red-200 text-red-800'}`}>
                            {req.status}
                        </span>
                    </li>
                )) : <p className="text-sm text-center text-gray-500 py-8">Belum ada pengajuan cuti.</p>}
            </ul>
        </Card>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
