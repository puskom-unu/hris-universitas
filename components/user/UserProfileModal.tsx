
import React, { useState, useEffect } from 'react';
import Modal from '../shared/Modal';
import Button from '../shared/Button';
import { User } from '../../types';
import { mockUsers } from '../../data/mockData';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onUpdateUser: (updatedUser: User) => void;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose, user, onUpdateUser }) => {
    const [activeTab, setActiveTab] = useState('profile');
    const [profileData, setProfileData] = useState({ name: '', email: '', whatsappNumber: '' });
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [profileErrors, setProfileErrors] = useState({ name: '', email: '', whatsappNumber: '' });
    const [passwordErrors, setPasswordErrors] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

    useEffect(() => {
        if (user) {
            setProfileData({ name: user.name, email: user.email, whatsappNumber: user.whatsappNumber || '' });
        }
        // Reset state on close
        if (!isOpen) {
            setActiveTab('profile');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setProfileErrors({ name: '', email: '', whatsappNumber: '' });
            setPasswordErrors({ currentPassword: '', newPassword: '', confirmPassword: '' });
        }
    }, [user, isOpen]);

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: value }));
        setProfileErrors(prev => ({ ...prev, [name]: ''}));
    };
    
    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
        setPasswordErrors(prev => ({ ...prev, [name]: ''}));
    };

    const validateProfile = () => {
        const errors = { name: '', email: '', whatsappNumber: '' };
        if (!profileData.name.trim()) errors.name = 'Nama wajib diisi.';
        if (!profileData.email.trim()) errors.email = 'Email wajib diisi.';
        else if (!/\S+@\S+\.\S+/.test(profileData.email)) errors.email = 'Format email tidak valid.';
        if (!profileData.whatsappNumber.trim()) errors.whatsappNumber = 'Nomor WhatsApp wajib diisi.';
        else if (!/^\d+$/.test(profileData.whatsappNumber)) errors.whatsappNumber = "Hanya boleh berisi angka.";
        setProfileErrors(errors);
        return !errors.name && !errors.email && !errors.whatsappNumber;
    };

    const handleProfileSave = () => {
        if (validateProfile()) {
            onUpdateUser({ ...user, ...profileData });
            onClose();
        }
    };
    
    const validatePassword = () => {
        const errors = { currentPassword: '', newPassword: '', confirmPassword: '' };
        const userInData = mockUsers.find(u => u.email === user.email);

        if (!passwordData.currentPassword) {
            errors.currentPassword = 'Kata sandi saat ini wajib diisi.';
        } else if (userInData?.password !== passwordData.currentPassword) {
            errors.currentPassword = 'Kata sandi saat ini salah.';
        }
        
        if (!passwordData.newPassword) {
            errors.newPassword = 'Kata sandi baru wajib diisi.';
        } else if (passwordData.newPassword.length < 6) {
            errors.newPassword = 'Kata sandi baru minimal 6 karakter.';
        }
        
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            errors.confirmPassword = 'Konfirmasi kata sandi tidak cocok.';
        }
        
        setPasswordErrors(errors);
        return !errors.currentPassword && !errors.newPassword && !errors.confirmPassword;
    };

    const handlePasswordSave = () => {
        if (validatePassword()) {
            const userIndex = mockUsers.findIndex(u => u.email === user.email);
            if (userIndex > -1) {
                mockUsers[userIndex].password = passwordData.newPassword;
                alert('Kata sandi berhasil diubah!');
                onClose();
            } else {
                alert('Gagal mengubah kata sandi: pengguna tidak ditemukan.');
            }
        }
    };


    const handleUpdateAvatar = () => {
        const newAvatarUrl = `https://picsum.photos/seed/${Date.now()}/100/100`;
        onUpdateUser({ ...user, avatarUrl: newAvatarUrl });
    };

    const TabButton: React.FC<{tabName: string, label: string}> = ({ tabName, label }) => (
         <button
            onClick={() => setActiveTab(tabName)}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
                activeTab === tabName
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
        >
            {label}
        </button>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Profil">
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
                <TabButton tabName="profile" label="Profil & Akun"/>
                <TabButton tabName="password" label="Ubah Kata Sandi"/>
            </div>

            {activeTab === 'profile' && (
                <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                        <img src={user.avatarUrl} alt="User Avatar" className="w-20 h-20 rounded-full" />
                        <div>
                            <Button variant="secondary" onClick={handleUpdateAvatar}>Ganti Foto</Button>
                            <p className="text-xs text-gray-500 mt-2">JPG, GIF atau PNG. Ukuran maks. 800K</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Nama Lengkap</label>
                            <input type="text" id="name" name="name" value={profileData.name} onChange={handleProfileChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"/>
                            {profileErrors.name && <p className="text-xs text-red-500 mt-1">{profileErrors.name}</p>}
                        </div>
                         <div>
                            <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Alamat Email</label>
                            <input type="email" id="email" name="email" value={profileData.email} onChange={handleProfileChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"/>
                             {profileErrors.email && <p className="text-xs text-red-500 mt-1">{profileErrors.email}</p>}
                        </div>
                        <div>
                            <label htmlFor="whatsappNumber" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Nomor WhatsApp</label>
                            <input type="text" id="whatsappNumber" name="whatsappNumber" value={profileData.whatsappNumber} onChange={handleProfileChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"/>
                            {profileErrors.whatsappNumber && <p className="text-xs text-red-500 mt-1">{profileErrors.whatsappNumber}</p>}
                        </div>
                         <div>
                            <label htmlFor="role" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Peran (Role)</label>
                            <input type="text" id="role" name="role" value={user.role} disabled className="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-300 cursor-not-allowed"/>
                        </div>
                    </div>
                     <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Button variant="secondary" onClick={onClose}>Batal</Button>
                        <Button onClick={handleProfileSave}>Simpan Perubahan</Button>
                    </div>
                </div>
            )}
            
            {activeTab === 'password' && (
                <div className="space-y-4">
                    <div>
                        <label htmlFor="currentPassword" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Kata Sandi Saat Ini</label>
                        <input type="password" id="currentPassword" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"/>
                        {passwordErrors.currentPassword && <p className="text-xs text-red-500 mt-1">{passwordErrors.currentPassword}</p>}
                    </div>
                    <div>
                        <label htmlFor="newPassword" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Kata Sandi Baru</label>
                        <input type="password" id="newPassword" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"/>
                        {passwordErrors.newPassword && <p className="text-xs text-red-500 mt-1">{passwordErrors.newPassword}</p>}
                    </div>
                    <div>
                        <label htmlFor="confirmPassword" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Konfirmasi Kata Sandi Baru</label>
                        <input type="password" id="confirmPassword" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"/>
                        {passwordErrors.confirmPassword && <p className="text-xs text-red-500 mt-1">{passwordErrors.confirmPassword}</p>}
                    </div>
                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Button variant="secondary" onClick={onClose}>Batal</Button>
                        <Button onClick={handlePasswordSave}>Ubah Kata Sandi</Button>
                    </div>
                </div>
            )}
        </Modal>
    );
};

export default UserProfileModal;