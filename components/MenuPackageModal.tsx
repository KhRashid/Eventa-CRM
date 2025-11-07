import React, { useState, useEffect, useMemo } from 'react';
import { MenuPackage, MenuItem } from '../types';
import { CloseIcon, AddIcon, TrashIcon } from '../icons';

interface MenuPackageModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (pkg: Omit<MenuPackage, 'id'> | MenuPackage) => void;
    pkg: MenuPackage | null;
    allItems: MenuItem[];
}

const MenuPackageModal: React.FC<MenuPackageModalProps> = ({ isOpen, onClose, onSave, pkg, allItems }) => {
    const [name, setName] = useState('');
    const [price, setPrice] = useState(0);
    const [itemIds, setItemIds] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (pkg) {
            setName(pkg.name);
            setPrice(pkg.price_azn);
            setItemIds(pkg.itemIds);
        } else {
            setName('');
            setPrice(0);
            setItemIds([]);
        }
    }, [pkg, isOpen]);

    const groupedAvailableItems = useMemo(() => {
        const available = allItems
            .filter(i => !itemIds.includes(i.id))
            .filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()));
        
        return available.reduce((acc, item) => {
            const category = item.category || 'Uncategorized';
            if (!acc[category]) acc[category] = [];
            acc[category].push(item);
            return acc;
        }, {} as Record<string, MenuItem[]>);
    }, [allItems, itemIds, searchTerm]);
    
    const packageItems = useMemo(() => {
        const itemsMap = new Map(allItems.map(i => [i.id, i]));
        return itemIds.map(id => itemsMap.get(id)).filter((i): i is MenuItem => !!i);
    }, [itemIds, allItems]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const pkgData = { name, price_azn: price, itemIds };
        if (pkg) {
            onSave({ ...pkg, ...pkgData });
        } else {
            onSave(pkgData);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl flex flex-col h-[90vh]" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-gray-700">
                    <h2 className="text-xl font-bold text-white">{pkg ? 'Редактировать пакет' : 'Создать пакет'}</h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-700 rounded-full"><CloseIcon /></button>
                </header>
                <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
                    <div className="p-4 space-y-4 border-b border-gray-700">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Название пакета</label>
                                <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-gray-700 border-gray-600 rounded-md px-3 py-2 text-white" />
                            </div>
                            <div>
                                <label htmlFor="price" className="block text-sm font-medium text-gray-300 mb-1">Цена на человека (AZN)</label>
                                <input id="price" type="number" value={price} onChange={e => setPrice(Number(e.target.value))} required className="w-full bg-gray-700 border-gray-600 rounded-md px-3 py-2 text-white" />
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 flex overflow-hidden">
                        {/* Left Panel - Available Items */}
                        <div className="w-1/2 border-r border-gray-700 flex flex-col">
                           <div className="p-4 border-b border-gray-700">
                               <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Поиск по каталогу..." className="w-full bg-gray-900 px-3 py-2 rounded-md" />
                           </div>
                           <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {Object.entries(groupedAvailableItems).map(([category, items]) => (
                                    <div key={category}>
                                        <h4 className="font-bold text-blue-400 mb-2">{category}</h4>
                                        <ul className="space-y-1">
                                            {items.map(item => (
                                                <li key={item.id} className="flex justify-between items-center group">
                                                    <span>{item.name}</span>
                                                    <button type="button" onClick={() => setItemIds(prev => [...prev, item.id])} className="p-1 text-green-400 opacity-0 group-hover:opacity-100"><AddIcon/></button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                           </div>
                        </div>
                        {/* Right Panel - Selected Items */}
                        <div className="w-1/2 flex flex-col">
                             <div className="p-4 border-b border-gray-700">
                                <h3 className="font-bold text-lg">Состав пакета ({packageItems.length})</h3>
                           </div>
                           <div className="flex-1 overflow-y-auto p-4 space-y-2">
                               {packageItems.map(item => (
                                   <div key={item.id} className="flex justify-between items-center bg-gray-700 p-2 rounded group">
                                       <span>{item.name} <span className="text-xs text-gray-400">({item.category})</span></span>
                                       <button type="button" onClick={() => setItemIds(prev => prev.filter(id => id !== item.id))} className="p-1 text-red-500 opacity-0 group-hover:opacity-100"><TrashIcon /></button>
                                   </div>
                               ))}
                           </div>
                        </div>
                    </div>
                    <footer className="p-4 border-t border-gray-700 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-white bg-gray-600 hover:bg-gray-500">Отмена</button>
                        <button type="submit" className="px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700">Сохранить пакет</button>
                    </footer>
                </form>
            </div>
        </div>
    );
};

export default MenuPackageModal;