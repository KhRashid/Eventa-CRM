import React, { useState, useEffect } from 'react';
import { PricingPackage } from '../types';
import { CloseIcon } from '../icons';

interface PricingPackageModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (pkg: Omit<PricingPackage, 'id'> | PricingPackage) => void;
    pkg: PricingPackage | null;
}

const PricingPackageModal: React.FC<PricingPackageModalProps> = ({ isOpen, onClose, onSave, pkg }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState(0);
    const [currency, setCurrency] = useState('AZN');
    const [durationMin, setDurationMin] = useState(0);
    const [isActive, setIsActive] = useState(true);

    useEffect(() => {
        if (pkg) {
            setTitle(pkg.title);
            setDescription(pkg.description);
            setPrice(pkg.price);
            setCurrency(pkg.currency);
            setDurationMin(pkg.duration_min);
            setIsActive(pkg.is_active);
        } else {
            setTitle('');
            setDescription('');
            setPrice(0);
            setCurrency('AZN');
            setDurationMin(0);
            setIsActive(true);
        }
    }, [pkg, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const pkgData = { title, description, price, currency, duration_min: durationMin, is_active: isActive };
        if (pkg) {
            onSave({ ...pkg, ...pkgData });
        } else {
            onSave(pkgData);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-gray-700">
                    <h2 className="text-xl font-bold text-white">{pkg ? 'Редактировать пакет' : 'Создать тарифный пакет'}</h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-700 rounded-full"><CloseIcon /></button>
                </header>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">Название</label>
                            <input id="title" type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full bg-gray-700 border-gray-600 rounded-md px-3 py-2 text-white" />
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">Описание</label>
                            <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full bg-gray-700 border-gray-600 rounded-md px-3 py-2 text-white" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="price" className="block text-sm font-medium text-gray-300 mb-1">Цена</label>
                                <input id="price" type="number" value={price} onChange={e => setPrice(Number(e.target.value))} required className="w-full bg-gray-700 border-gray-600 rounded-md px-3 py-2 text-white" />
                            </div>
                            <div>
                                <label htmlFor="currency" className="block text-sm font-medium text-gray-300 mb-1">Валюта</label>
                                <input id="currency" type="text" value={currency} onChange={e => setCurrency(e.target.value)} required className="w-full bg-gray-700 border-gray-600 rounded-md px-3 py-2 text-white" />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="duration_min" className="block text-sm font-medium text-gray-300 mb-1">Длительность (мин)</label>
                            <input id="duration_min" type="number" value={durationMin} onChange={e => setDurationMin(Number(e.target.value))} required className="w-full bg-gray-700 border-gray-600 rounded-md px-3 py-2 text-white" />
                        </div>
                         <div className="flex items-center">
                            <input id="is_active" type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500" />
                            <label htmlFor="is_active" className="ml-2 block text-sm text-gray-300">Пакет активен</label>
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

export default PricingPackageModal;