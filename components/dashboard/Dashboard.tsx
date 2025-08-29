import React, { useState, useMemo } from 'react';
import StatCard from './StatCard';
import Card from '../shared/Card';
import { mockEmployees, mockAttendance, mockLeaveRequests } from '../../data/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { AttendanceRecord } from '../../types';

const Dashboard: React.FC = () => {
    const totalEmployees = mockEmployees.length;
    const onLeave = mockLeaveRequests.filter(req => req.status === 'Approved' && new Date(req.startDate) <= new Date() && new Date(req.endDate) >= new Date()).length;
    const todayString = new Date().toISOString().split('T')[0];
    const lateToday = mockAttendance.filter(att => att.date === todayString && att.status === 'Late').length;

    const barChartData = [
        { name: 'Fakultas Teknik', count: mockEmployees.filter(e => e.unit === 'Fakultas Teknik').length },
        { name: 'Fakultas Ekonomi', count: mockEmployees.filter(e => e.unit === 'Fakultas Ekonomi').length },
        { name: 'Biro Administrasi', count: mockEmployees.filter(e => e.unit.includes('Biro')).length },
        { name: 'UPT', count: mockEmployees.filter(e => e.unit.includes('UPT')).length },
    ];

    const [period, setPeriod] = useState<'thisMonth' | 'last30Days'>('thisMonth');
    
    const attendanceChartData = useMemo(() => {
        const now = new Date();
        let filteredData: AttendanceRecord[] = [];

        if (period === 'thisMonth') {
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            filteredData = mockAttendance.filter(record => {
                const recordDate = new Date(record.date);
                return recordDate >= startOfMonth && recordDate <= now;
            });
        } else { // last30Days
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(now.getDate() - 30);
            filteredData = mockAttendance.filter(record => {
                const recordDate = new Date(record.date);
                return recordDate >= thirtyDaysAgo && recordDate <= now;
            });
        }
        
        const groupedByDate = filteredData.reduce((acc, record) => {
            if (!acc[record.date]) {
                acc[record.date] = { 'On Time': 0, 'Late': 0, 'Absent': 0 };
            }
            acc[record.date][record.status]++;
            return acc;
        }, {} as Record<string, Record<'On Time' | 'Late' | 'Absent', number>>);

        const sortedData = Object.entries(groupedByDate).sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime());
        
        return sortedData.map(([date, counts]) => ({
            date: new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
            'Tepat Waktu': counts['On Time'],
            'Terlambat': counts['Late'],
            'Absen': counts['Absent'],
        }));

    }, [period]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Pegawai" value={totalEmployees.toString()} icon="fa-users" color="bg-blue-500" />
        <StatCard title="Pegawai Cuti" value={onLeave.toString()} icon="fa-user-clock" color="bg-yellow-500" />
        <StatCard title="Terlambat Hari Ini" value={lateToday.toString()} icon="fa-exclamation-triangle" color="bg-red-500" />
        <StatCard title="Permintaan Cuti" value={mockLeaveRequests.filter(r => r.status === 'Pending').length.toString()} icon="fa-inbox" color="bg-green-500" />
      </div>

      <Card>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
              <h3 className="text-lg font-semibold">Tren Kehadiran</h3>
              <div className="flex space-x-2">
                  <button 
                      onClick={() => setPeriod('thisMonth')}
                      className={`px-3 py-1 text-sm rounded-md transition-colors ${period === 'thisMonth' ? 'bg-blue-600 text-white shadow' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                  >
                      Bulan Ini
                  </button>
                  <button 
                      onClick={() => setPeriod('last30Days')}
                      className={`px-3 py-1 text-sm rounded-md transition-colors ${period === 'last30Days' ? 'bg-blue-600 text-white shadow' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                  >
                      30 Hari Terakhir
                  </button>
              </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
              <LineChart data={attendanceChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(5px)',
                        border: '1px solid #ccc',
                        borderRadius: '0.5rem'
                    }} 
                  />
                  <Legend />
                  <Line type="monotone" dataKey="Tepat Waktu" stroke="#10B981" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="Terlambat" stroke="#F59E0B" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="Absen" stroke="#EF4444" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
              </LineChart>
          </ResponsiveContainer>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4">Distribusi Pegawai per Unit</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#3B82F6" name="Jumlah Pegawai" />
                </BarChart>
            </ResponsiveContainer>
        </Card>

        <Card>
            <h3 className="text-lg font-semibold mb-4">Permintaan Cuti Terbaru</h3>
            <ul className="space-y-3">
                {mockLeaveRequests.slice(0, 4).map(req => (
                    <li key={req.id} className="flex items-center space-x-3">
                        <img src={mockEmployees.find(e => e.id === req.employeeId)?.avatarUrl} className="w-10 h-10 rounded-full" alt={req.employeeName}/>
                        <div>
                            <p className="font-semibold text-sm">{req.employeeName}</p>
                            <p className="text-xs text-gray-500">{req.leaveType}</p>
                        </div>
                        <span className={`ml-auto text-xs font-bold px-2 py-1 rounded-full ${req.status === 'Pending' ? 'bg-yellow-200 text-yellow-800' : 'bg-green-200 text-green-800'}`}>
                            {req.status}
                        </span>
                    </li>
                ))}
            </ul>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;