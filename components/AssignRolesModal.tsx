import React, { useState, useEffect } from 'react';
import { Role, UserWithRoles } from '../types';
import { CloseIcon } from '../icons';

interface AssignRolesModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (uid: string, roleIds: string[]) => void;
    user: UserWithRoles;
    allRoles: Role[];
}

const AssignRolesModal: React.FC<AssignRolesModalProps> = ({ isOpen, onClose, onSave, user, allRoles }) => {
    const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (user) {
            setSelectedRoleIds(user.roleIds || []);
        }
    }, [user]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const handleRoleChange = (roleId: string, checked: boolean) => {
        setSelectedRoleIds(prev =>
            checked ? [...prev, roleId] : prev.filter(id => id !== roleId)
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        await onSave(user.uid, selectedRoleIds);
        setSaving(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div
                className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-4 border-b border-gray-700">
                    <div>
                        <h2 className="text-xl font-bold text-white">Назначение ролей</h2>
                        <p className="text-sm text-gray-400">для {user.displayName} ({user.email})</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-700 rounded-full">
                        <CloseIcon />
                    </button>
                </header>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-gray-200 mb-2">Доступные роли</h3>
                    <div className="space-y-2">
                        {allRoles.map(role => (
                            <label key={role.id} className="flex items-center space-x-3 p-3 bg-gray-900 rounded-md cursor-pointer hover:bg-gray-700 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={selectedRoleIds.includes(role.id)}
                                    onChange={(e) => handleRoleChange(role.id, e.target.checked)}
                                    className="h-5 w-5 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                                />
                                <div className="flex-1">
                                    <span className="font-semibold text-white">{role.name}</span>
                                    <p className="text-xs text-gray-400">{role.description}</p>
                                </div>
                            </label>
                        ))}
                    </div>
                </form>

                <footer className="p-4 border-t border-gray-700 flex justify-end space-x-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-white bg-gray-600 hover:bg-gray-500 transition-colors">
                        Отмена
                    </button>
                    <button
                        type="submit"
                        onClick={handleSubmit}
                        disabled={saving}
                        className="px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
                    >
                        {saving ? 'Сохранение...' : 'Сохранить роли'}
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default AssignRolesModal;