import React, { useState, useEffect } from 'react';
// FIX: The User type is not a named export from 'firebase/compat/app'.
// Import the default firebase object and use firebase.User, consistent with other files.
import firebase from 'firebase/compat/app';
import { UserProfile, Role } from '../types';
import { updateUserProfile, changeUserPassword } from '../services/firebaseService';

interface ProfilePageProps {
  user: firebase.User;
  userProfile: UserProfile;
  allRoles: Role[];
}

type ActiveTab = 'profile' | 'security';

const ProfilePage: React.FC<ProfilePageProps> = ({ user, userProfile, allRoles }) => {
    const [profile, setProfile] = useState<UserProfile | null>(userProfile);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [activeTab, setActiveTab] = useState<ActiveTab>('profile');

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordSaving, setPasswordSaving] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');


    useEffect(() => {
        setProfile(userProfile);
    }, [userProfile]);
    
    const assignedRoles = allRoles.filter(role => profile?.roleIds?.includes(role.id));

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (profile) {
            setProfile({ ...profile, [e.target.name]: e.target.value });
        }
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile) return;
        
        setSaving(true);
        setError('');
        setSuccessMessage('');
        
        try {
            await updateUserProfile(user.uid, {
                displayName: profile.displayName,
                phone: profile.phone,
            });
            setSuccessMessage('Профиль успешно обновлен!');
            setTimeout(() => setSuccessMessage(''), 3000); // Clear message after 3s
        } catch (err) {
            setError('Не удалось обновить профиль.');
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess('');

        if (newPassword !== confirmPassword) {
            setPasswordError('Новые пароли не совпадают.');
            return;
        }
        if (newPassword.length < 6) {
             setPasswordError('Новый пароль должен содержать не менее 6 символов.');
             return;
        }

        setPasswordSaving(true);
        try {
            await changeUserPassword(currentPassword, newPassword);
            setPasswordSuccess('Пароль успешно изменен!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setTimeout(() => setPasswordSuccess(''), 3000);
        } catch(err: any) {
            setPasswordError(err.message || 'Произошла ошибка при смене пароля.');
        } finally {
            setPasswordSaving(false);
        }
    }
    
    const TabButton: React.FC<{tabName: ActiveTab, label: string}> = ({ tabName, label }) => (
        <button
            onClick={() => setActiveTab(tabName)}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === tabName
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
                }`
            }
        >
            {label}
        </button>
    );

    const renderContent = () => {
        if (!profile) {
            return <p className="text-gray-400">Загрузка профиля...</p>
        }
    
        return (
            <div className="max-w-2xl w-full">
                <h1 className="text-3xl font-bold text-blue-400 text-center mb-8">Профиль</h1>

                 <div className="mb-6 border-b border-gray-700">
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                        <TabButton tabName="profile" label="Основная информация" />
                        <TabButton tabName="security" label="Безопасность" />
                    </nav>
                </div>

                <div className="mt-8">
                  {activeTab === 'profile' && (
                     <form onSubmit={handleSaveProfile} className="bg-gray-900 p-8 rounded-lg shadow-md space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-400">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={profile.email}
                                disabled
                                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-300 cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label htmlFor="displayName" className="block text-sm font-medium text-gray-400">
                                Отображаемое имя
                            </label>
                            <input
                                id="displayName"
                                name="displayName"
                                type="text"
                                value={profile.displayName}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-400">
                                Контактный телефон
                            </label>
                            <input
                                id="phone"
                                name="phone"
                                type="tel"
                                value={profile.phone}
                                onChange={handleChange}
                                placeholder="+994 (XX) XXX-XX-XX"
                                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400">
                                Роли
                            </label>
                            <div className="mt-2 flex flex-wrap gap-2 p-3 bg-gray-700 border border-gray-600 rounded-md min-h-[40px]">
                                {assignedRoles.length > 0 ? (
                                    assignedRoles.map(role => (
                                        <span key={role.id} className="px-3 py-1 text-sm font-semibold bg-gray-600 text-gray-200 rounded-full">
                                            {role.name}
                                        </span>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500">Роли не назначены</p>
                                )}
                            </div>
                            <p className="mt-2 text-xs text-gray-500">Роли назначаются администратором на странице "Users".</p>
                        </div>

                        <div className="h-6">
                            {successMessage && <p className="text-sm text-green-400 text-center">{successMessage}</p>}
                            {error && <p className="text-sm text-red-400 text-center">{error}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
                        >
                            {saving ? 'Сохранение...' : 'Сохранить изменения'}
                        </button>
                    </form>
                  )}
                  {activeTab === 'security' && (
                     <form onSubmit={handlePasswordChange} className="bg-gray-900 p-8 rounded-lg shadow-md space-y-6">
                        <div>
                            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-400">
                                Текущий пароль
                            </label>
                            <input
                                id="currentPassword"
                                name="currentPassword"
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                required
                                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                         <div>
                            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-400">
                                Новый пароль
                            </label>
                            <input
                                id="newPassword"
                                name="newPassword"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                         <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-400">
                                Подтвердите новый пароль
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="h-6">
                            {passwordSuccess && <p className="text-sm text-green-400 text-center">{passwordSuccess}</p>}
                            {passwordError && <p className="text-sm text-red-400 text-center">{passwordError}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={passwordSaving}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
                        >
                            {passwordSaving ? 'Изменение...' : 'Изменить пароль'}
                        </button>
                    </form>
                  )}
                </div>
            </div>
        );
    }

    return (
        <div className="w-full bg-gray-800 rounded-lg p-6 h-full flex flex-col items-center justify-start overflow-y-auto">
            {renderContent()}
        </div>
    );
};

export default ProfilePage;