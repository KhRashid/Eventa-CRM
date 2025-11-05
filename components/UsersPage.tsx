import React, { useState, useEffect, useCallback } from 'react';
import { UserWithRoles, Role } from '../types';
import { getUsersWithRoles, getRoles, updateUserRoles } from '../services/firebaseService';
import { EditIcon } from '../icons';
import AssignRolesModal from './AssignRolesModal';

const UsersPage: React.FC = () => {
    const [users, setUsers] = useState<UserWithRoles[]>([]);
    const [allRoles, setAllRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserWithRoles | null>(null);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const [fetchedUsers, fetchedRoles] = await Promise.all([
                getUsersWithRoles(),
                getRoles()
            ]);
            setUsers(fetchedUsers);
            setAllRoles(fetchedRoles);
        } catch (err) {
            console.error(err);
            setError('Не удалось загрузить данные пользователей.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleEditRoles = (user: UserWithRoles) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleSaveRoles = async (uid: string, roleIds: string[]) => {
        if (!selectedUser) return;
        try {
            await updateUserRoles(uid, roleIds);
            setIsModalOpen(false);
            // Optimistically update UI or reload data
            setUsers(prevUsers => prevUsers.map(u => {
                if (u.uid === uid) {
                    return {
                        ...u,
                        roleIds,
                        roles: allRoles.filter(r => roleIds.includes(r.id))
                    };
                }
                return u;
            }));
        } catch (err) {
            console.error(err);
            setError(`Не удалось обновить роли для ${selectedUser.displayName}.`);
        }
    };

    return (
        <div className="w-full bg-gray-800 rounded-lg p-6 h-full flex flex-col text-white">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-blue-400">Пользователи</h1>
                {/* Add User button can be placed here later */}
            </div>

            {loading && <p className="text-center text-gray-400">Загрузка пользователей...</p>}
            {error && <p className="p-4 text-center text-red-500 bg-red-900 bg-opacity-30 rounded-md">{error}</p>}
            
            {!loading && !error && (
                <div className="flex-1 overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-gray-800 sticky top-0">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Имя</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Роли</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Действия</th>
                            </tr>
                        </thead>
                        <tbody className="bg-gray-900 divide-y divide-gray-700">
                            {users.map((user) => (
                                <tr key={user.uid}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{user.displayName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{user.email}</td>
                                    <td className="px-6 py-4 whitespace-normal text-sm text-gray-300 max-w-sm">
                                        {user.roles.length > 0 ? (
                                            <div className="flex flex-wrap gap-1">
                                                {user.roles.map(role => (
                                                    <span key={role.id} className="px-2 py-1 text-xs font-semibold bg-gray-600 text-gray-200 rounded-full">
                                                        {role.name}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-xs text-gray-500">Роли не назначены</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleEditRoles(user)} className="text-blue-400 hover:text-blue-300">
                                           <span className="flex items-center"><EditIcon /> <span className="ml-1">Изменить роли</span></span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {isModalOpen && selectedUser && (
                <AssignRolesModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveRoles}
                    user={selectedUser}
                    allRoles={allRoles}
                />
            )}
        </div>
    );
};

export default UsersPage;