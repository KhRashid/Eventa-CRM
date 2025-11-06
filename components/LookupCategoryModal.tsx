import React, { useState, useEffect } from 'react';
import { Lookup } from '../types';
import { CloseIcon } from '../icons';

interface LookupCategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: { name: string, key: string }, id?: string) => void;
    existingLookup: Lookup | null;
    allLookups: Lookup[];
}

const LookupCategoryModal: React.FC<LookupCategoryModalProps> = ({ isOpen, onClose, onSave, existingLookup, allLookups }) => {
    const [name, setName] = useState('');
    const [key, setKey] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (existingLookup) {
            setName(existingLookup.name);
            setKey(existingLookup.key);
        } else {
            setName('');
            setKey('');
        }
        setError('');
    }, [existingLookup, isOpen]);

    const slugify = (text: string) => {
      return text
        .toString()
        .toLowerCase()
        .replace(/\s+/g, '_')           // Replace spaces with _
        .replace(/[^\w-]+/g, '')       // Remove all non-word chars
        .replace(/__+/g, '_')          // Replace multiple _ with single _
        .replace(/^-+/, '')             // Trim _ from start of text
        .replace(/-+$/, '');            // Trim _ from end of text
    }

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newName = e.target.value;
        setName(newName);
        if (!existingLookup) { // Only auto-generate key for new categories
            setKey(slugify(newName));
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!name.trim() || !key.trim()) {
            setError('Название и технический ID обязательны для заполнения.');
            return;
        }
        
        const isKeyDuplicate = allLookups.some(l => l.key === key && l.id !== existingLookup?.id);
        if (isKeyDuplicate) {
            setError(`Технический ID "${key}" уже используется. Придумайте другой.`);
            return;
        }

        onSave({ name, key }, existingLookup?.id);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div
                className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-md flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-4 border-b border-gray-700">
                    <h2 className="text-xl font-bold text-white">{existingLookup ? 'Редактировать категорию' : 'Создать категорию'}</h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-700 rounded-full">
                        <CloseIcon />
                    </button>
                </header>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                            Название категории <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={handleNameChange}
                            required
                            className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Например, Тип мероприятия"
                        />
                         <p className="mt-1 text-xs text-gray-500">Как это будет отображаться в интерфейсе.</p>
                    </div>

                    <div>
                        <label htmlFor="key" className="block text-sm font-medium text-gray-300 mb-1">
                            Технический ID <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="key"
                            type="text"
                            value={key}
                            onChange={(e) => setKey(e.target.value)}
                            required
                            disabled={!!existingLookup} // Cannot edit key after creation
                            className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed"
                        />
                         <p className="mt-1 text-xs text-gray-500">
                           Только латинские буквы, цифры и "_". Нельзя изменить после создания.
                         </p>
                    </div>
                     {error && <p className="text-sm text-red-400">{error}</p>}
                </form>

                <footer className="p-4 border-t border-gray-700 flex justify-end space-x-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-white bg-gray-600 hover:bg-gray-500 transition-colors">
                        Отмена
                    </button>
                    <button
                        type="submit"
                        onClick={handleSubmit}
                        className="px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                        Сохранить
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default LookupCategoryModal;
