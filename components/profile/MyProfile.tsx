
import React, { useMemo } from 'react';
import Card from '../shared/Card';
import { User, Employee, PositionHistory } from '../../types';
import { mockEmployees, mockPositionHistory } from '../../data/mockData';

interface MyProfileProps {
    user: User;
}

const DetailRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div className="grid grid-cols-3 gap-4 py-2 border-b border-gray-200 dark:border-gray-600 last:border-none">
        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</dt>
        <dd className="text-sm text-gray-900 dark:text-white col-span-2">{value || '-'}</dd>
    </div>
);

const MyProfile: React.FC<MyProfileProps> = ({ user }) => {
    const employeeData: Employee | undefined = useMemo(() => {
        return mockEmployees.find(e => e.email.toLowerCase() === user.email.toLowerCase());
    }, [user.email]);

    const positionHistory: PositionHistory[] = useMemo(() => {
        if (!employeeData) return [];
        return mockPositionHistory
            .filter(h => h.employeeId === employeeData.id)
            .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    }, [employeeData]);

    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    if (!employeeData) {
        return <Card><h2 className="text-2xl font-bold mb-4">Profil Saya</h2><p>Data pegawai tidak dapat ditemukan.</p></Card>;
    }

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Profil Saya</h2>

            {/* Biodata Card */}
            <Card>
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6">
                    <img className="w-24 h-24 rounded-full mb-4 sm:mb-0 self-center sm:self-start" src={employeeData.avatarUrl} alt={`${employeeData.name} avatar`} />
                    <div className="flex-grow">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{employeeData.name}</h3>
                        <p className="text-md text-blue-600 dark:text-blue-400">{employeeData.position}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{employeeData.unit}</p>
                    </div>
                </div>
                <div className="mt-6">
                    <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-2">Informasi Rinci</h4>
                    <dl>
                        <DetailRow label="NIP" value={employeeData.nip} />
                        <DetailRow label="Email" value={employeeData.email} />
                        <DetailRow label="No. WhatsApp" value={employeeData.whatsappNumber} />
                        <DetailRow label="Tanggal Bergabung" value={formatDate(employeeData.joinDate)} />
                        <DetailRow label="Bank" value={employeeData.bankName} />
                        <DetailRow label="No. Rekening" value={employeeData.accountNumber} />
                        <DetailRow label="Status" value={
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${employeeData.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{employeeData.status}</span>
                        } />
                    </dl>
                </div>
            </Card>

            {/* Position History Card */}
            <Card>
                <h3 className="text-xl font-bold mb-4">Riwayat Jabatan</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">Jabatan</th>
                                <th scope="col" className="px-6 py-3">Unit Kerja</th>
                                <th scope="col" className="px-6 py-3">Tanggal Mulai</th>
                                <th scope="col" className="px-6 py-3">Tanggal Selesai</th>
                            </tr>
                        </thead>
                        <tbody>
                            {positionHistory.map(item => (
                                <tr key={item.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{item.position}</td>
                                    <td className="px-6 py-4">{item.unit}</td>
                                    <td className="px-6 py-4">{formatDate(item.startDate)}</td>
                                    <td className="px-6 py-4">{item.endDate ? formatDate(item.endDate) : <span className="font-semibold text-green-600">Sekarang</span>}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {positionHistory.length === 0 && <p className="text-center text-gray-500 py-6">Tidak ada riwayat jabatan.</p>}
                </div>
            </Card>
        </div>
    );
};

export default MyProfile;