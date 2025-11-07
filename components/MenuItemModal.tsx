import React, { useState, useEffect } from 'react';
import { Lookup, MenuItem } from '../types';
import { CloseIcon } from '../icons';

interface MenuItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (item: Omit<MenuItem, 'id'> | MenuItem) => void;
    item: MenuItem | null;
    lookups: Lookup[];
}

const MenuItemModal: React.FC<MenuItemModalProps> = ({ isOpen, onClose, onSave, item, lookups }) => {
    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [portionSize, setPortionSize] = useState('');
    const [photoUrl, setPhotoUrl] = useState('');

    const categoryLookup = lookups.find(l => l.key === 'menu_item_categories');
    let categoryOptions = categoryLookup?.values.sort() || [];

    // Handle case where an existing item's category is no longer in the lookups
    // to avoid it being unselected.
    if (item && item.category && !categoryOptions.includes(item.category)) {
        categoryOptions = [item.category, ...categoryOptions];
    }

    useEffect(() => {
        if (item) {
            setName(item.name);
            setCategory(item.category);
            setDescription(item.description || '');
            setPortionSize(item.portion_size || '');
            setPhotoUrl(item.photoUrl || '');
        } else {
            setName('');
            setCategory('');
            setDescription('');
            setPortionSize('');
            setPhotoUrl('');
        }
    }, [item, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const itemData = { 
            name, 
            category,
            description,
            portion_size: portionSize,
            photoUrl,
        };
        if (item) {
            onSave({ ...item, ...itemData });
        } else {
            onSave(itemData);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-gray-700">
                    <h2 className="text-xl font-bold text-white">{item ? 'Редактировать позицию' : 'Создать позицию'}</h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-700 rounded-full"><CloseIcon /></button>
                </header>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Название</label>
                            <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-gray-700 border-gray-600 rounded-md px-3 py-2 text-white" />
                        </div>
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-1">Категория</label>
                            <select
                                id="category"
                                value={category}
                                onChange={e => setCategory(e.target.value)}
                                required
                                className="w-full bg-gray-700 border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="" disabled>Выберите категорию...</option>
                                {categoryOptions.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                            <p className="mt-1 text-xs text-gray-500">
                                Категории управляются в разделе <code className="bg-gray-900 px-1 rounded">Settings &gt; Lookups</code>.
                            </p>
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">Описание</label>
                            <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full bg-gray-700 border-gray-600 rounded-md px-3 py-2 text-white" />
                        </div>
                        <div>
                            <label htmlFor="portion_size" className="block text-sm font-medium text-gray-300 mb-1">Размер порции / Выход</label>
                            <input id="portion_size" type="text" value={portionSize} onChange={e => setPortionSize(e.target.value)} placeholder="например, 250 г" className="w-full bg-gray-700 border-gray-600 rounded-md px-3 py-2 text-white" />
                        </div>
                        <div>
                            <label htmlFor="photoUrl" className="block text-sm font-medium text-gray-300 mb-1">URL Фотографии</label>
                            <input id="photoUrl" type="text" value={photoUrl} onChange={e => setPhotoUrl(e.target.value)} placeholder="https://example.com/photo.jpg" className="w-full bg-gray-700 border-gray-600 rounded-md px-3 py-2 text-white" />
                        </div>
                    </div>
                    <footer className="p-4 border-t border-gray-700 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-white bg-gray-600 hover:bg-gray-500">Отмена</button>
                        <button type="submit" className="px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700">Сохранить</button>
                    </footer>
                </form>
            </div>
        </div>
    );
};

export default MenuItemModal;