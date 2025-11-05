import React, { useState, useEffect } from 'react';
import { Role } from '../types';
import { ALL_PERMISSIONS } from '../constants';
import { CloseIcon } from '../icons';

interface RoleFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (role: Omit<Role, 'id'> | Role) => void;
    role: Role | null;
}

const RoleFormModal: React.FC<RoleFormModalProps> = ({ isOpen, onClose, onSave, role }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [permissions, setPermissions] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (role) {
            setName(role.name);
            setDescription(role.description);
            setPermissions(role.permissions);
        } else {
            setName('');
            setDescription('');
            setPermissions([]);
        }
    }, [role]);
    
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const handlePermissionChange = (permissionId: string, checked: boolean) => {
        setPermissions(prev =>
            checked ? [...prev, permissionId] : prev.filter(p => p !== permissionId)
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        const roleData = { name, description, permissions };
        
        if (role) {
            await onSave({ ...role, ...roleData });
        } else {
            await onSave(roleData);
        }
        setSaving(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div
                className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-4 border-b border-gray-700">
                    <h2 className="text-xl font-bold text-white">{role ? 'Редактировать роль' : 'Создать новую роль'}</h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-700 rounded-full">
                        <CloseIcon />
                    </button>
                </header>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                            Название роли <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
                            Описание
                        </label>
                        <textarea
                            id="description"
                            rows={2}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-gray-200 mb-2">Разрешения</h3>
                        <div className="space-y-4">
                            {Object.entries(ALL_PERMISSIONS).map(([category, perms]) => (
                                <div key={category} className="bg-gray-900 p-4 rounded-md">
                                    <h4 className="font-bold text-blue-400 mb-2 capitalize">{category}</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {perms.map(perm => (
                                            <label key={perm.id} className="flex items-center space-x-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={permissions.includes(perm.id)}
                                                    onChange={(e) => handlePermissionChange(perm.id, e.target.checked)}
                                                    className="h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                                                />
                                                <span className="text-sm text-gray-300">{perm.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </form>

                <footer className="p-4 border-t border-gray-700 flex justify-end space-x-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-white bg-gray-600 hover:bg-gray-500 transition-colors">
                        Отмена
                    </button>
                    <button
                        type="submit"
                        form="role-form" // This is not standard but works in some cases, better to handle via onSubmit
                        onClick={handleSubmit}
                        disabled={saving || !name}
                        className="px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
                    >
                        {saving ? 'Сохранение...' : 'Сохранить'}
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default RoleFormModal;
