import React, { useState, useEffect } from 'react';
import { Repertoire } from '../types';
import { CloseIcon } from '../icons';

interface AssignRepertoiresModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (repertoireIds: string[]) => void;
    allRepertoires: Repertoire[];
    assignedRepertoireIds: string[];
}

const AssignRepertoiresModal: React.FC<AssignRepertoiresModalProps> = ({ isOpen, onClose, onSave, allRepertoires, assignedRepertoireIds }) => {
    const [selectedIds, setSelectedIds] = useState<string[]>(assignedRepertoireIds);

    useEffect(() => {
        setSelectedIds(assignedRepertoireIds);
    }, [assignedRepertoireIds, isOpen]);

    const handleToggle = (repId: string) => {
        setSelectedIds(prev =>
            prev.includes(repId) ? prev.filter(id => id !== repId) : [...prev, repId]
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(selectedIds);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-gray-700">
                    <h2 className="text-xl font-bold text-white">Назначить репертуары</h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-700 rounded-full"><CloseIcon /></button>
                </header>
                <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-6 space-y-3">
                        {allRepertoires.map(rep => (
                            <label key={rep.id} className="flex items-center space-x-3 p-3 bg-gray-900 rounded-md cursor-pointer hover:bg-gray-700">
                                <input
                                    type="checkbox"
                                    checked={selectedIds.includes(rep.id)}
                                    onChange={() => handleToggle(rep.id)}
                                    className="h-5 w-5 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                                />
                                <div>
                                    <span className="font-semibold text-white">{rep.name}</span>
                                    <p className="text-sm text-gray-400">{rep.songIds.length} песен</p>
                                </div>
                            </label>
                        ))}
                    </div>
                    <footer className="p-4 border-t border-gray-700 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-white bg-gray-600 hover:bg-gray-500">Отмена</button>
                        <button type="submit" className="px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700">Сохранить назначения</button>
                    </footer>
                </form>
            </div>
        </div>
    );
};

export default AssignRepertoiresModal;