import React, { useState, useEffect } from 'react';
import { User } from 'firebase/compat/app';
import { UserProfile } from '../types';
import { getUserProfile, updateUserProfile } from '../services/firebaseService';

interface ProfilePageProps {
  user: User;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user }) => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            if (user) {
                try {
                    setLoading(true);
                    setError('');
                    const userProfile = await getUserProfile(user.uid);
                    setProfile(userProfile);
                } catch (err) {
                    setError('Не удалось загрузить профиль.');
                    console.error(err);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchProfile();
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (profile) {
            setProfile({ ...profile, [e.target.name]: e.target.value });
        }
    };

    const handleSave = async (e: React.FormEvent) => {
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

    const renderContent = () => {
        if (loading) {
            return <p className="text-gray-400">Загрузка профиля...</p>;
        }
    
        if (error) {
             return <p className="text-red-500">{error}</p>;
        }
    
        if (!profile) {
            return <p className="text-gray-400">Не удалось загрузить данные профиля.</p>
        }
    
        return (
            <div className="max-w-2xl w-full">
                <h1 className="text-3xl font-bold text-blue-400 mb-6 text-center">Профиль пользователя</h1>
                <form onSubmit={handleSave} className="bg-gray-900 p-8 rounded-lg shadow-md space-y-6">
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
            </div>
        );
    }

    return (
        <div className="w-full bg-gray-800 rounded-lg p-6 h-full flex flex-col items-center justify-center text-center">
            {renderContent()}
        </div>
    );
};

export default ProfilePage;
