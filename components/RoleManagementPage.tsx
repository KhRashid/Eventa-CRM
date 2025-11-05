import React, { useState, useEffect, useCallback } from 'react';
import { Role } from '../types';
import { getRoles, createRole, updateRole, deleteRole, seedInitialRoles } from '../services/firebaseService';
import { AddIcon, EditIcon, TrashIcon } from '../icons';
import RoleFormModal from './RoleFormModal';

interface RoleManagementPageProps {
    permissions: Set<string>;
}

const RoleManagementPage: React.FC<RoleManagementPageProps> = ({ permissions }) => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentRole, setCurrentRole] = useState<Role | null>(null);

    const canCreate = permissions.has('roles:create');
    const canUpdate = permissions.has('roles:update');
    const canDelete = permissions.has('roles:delete');

    const loadRoles = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            let fetchedRoles = await getRoles();
            if (fetchedRoles.length === 0) {
                // Seeding should ideally be a backend process or done once
                // For this CRM, we assume an admin will set up roles.
                // If no roles, an admin can create them.
            }
            setRoles(fetchedRoles);
        } catch (err) {
            console.error(err);
            setError('Не удалось загрузить роли.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (permissions.has('roles:read')) {
            loadRoles();
        } else {
            setError('У вас нет прав для просмотра этого раздела.');
            setLoading(false);
        }
    }, [loadRoles, permissions]);

    const handleCreate = () => {
        setCurrentRole(null);
        setIsModalOpen(true);
    };

    const handleEdit = (role: Role) => {
        setCurrentRole(role);
        setIsModalOpen(true);
    };

    const handleDelete = async (roleId: string) => {
        if (window.confirm('Вы уверены, что хотите удалить эту роль? Это действие нельзя отменить.')) {
            try {
                await deleteRole(roleId);
                setRoles(roles.filter(r => r.id !== roleId));
            } catch (err) {
                console.error(err);
                setError('Не удалось удалить роль.');
            }
        }
    };

    const handleSave = async (roleData: Omit<Role, 'id'> | Role) => {
        try {
            if ('id' in roleData) {
                // Update existing role
                await updateRole(roleData as Role);
            } else {
                // Create new role
                await createRole(roleData as Omit<Role, 'id'>);
            }
            setIsModalOpen(false);
            loadRoles(); // Refresh the list
        } catch (err) {
            console.error(err);
            setError('Не удалось сохранить роль.');
        }
    };

    return (
        <div className="w-full bg-gray-800 rounded-lg p-6 h-full flex flex-col text-white">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-blue-400">Управление ролями</h1>
                {canCreate && (
                    <button
                        onClick={handleCreate}
                        className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-colors"
                    >
                        <AddIcon />
                        <span>Создать роль</span>
                    </button>
                )}
            </div>

            {loading && <p className="text-center text-gray-400">Загрузка ролей...</p>}
            {error && <p className="p-4 text-center text-red-500 bg-red-900 bg-opacity-30 rounded-md">{error}</p>}
            
            {!loading && !error && (
                <div className="flex-1 overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-gray-800 sticky top-0">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Название роли</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Описание</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Действия</th>
                            </tr>
                        </thead>
                        <tbody className="bg-gray-900 divide-y divide-gray-700">
                            {roles.map((role) => (
                                <tr key={role.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{role.name}</td>
                                    <td className="px-6 py-4 whitespace-normal text-sm text-gray-300 max-w-md">{role.description}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {canUpdate && (
                                            <button onClick={() => handleEdit(role)} className="text-blue-400 hover:text-blue-300 mr-4">
                                                <EditIcon />
                                            </button>
                                        )}
                                        {canDelete && (
                                            <button onClick={() => handleDelete(role.id)} className="text-red-500 hover:text-red-400">
                                                <TrashIcon />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {isModalOpen && (
                <RoleFormModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                    role={currentRole}
                />
            )}
        </div>
    );
};

export default RoleManagementPage;