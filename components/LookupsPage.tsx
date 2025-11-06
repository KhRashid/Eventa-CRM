import React, { useState, useEffect } from 'react';
import { Lookup } from '../types';
import { updateLookupValues, createLookup, deleteLookup, updateLookupName, seedInitialLookups } from '../services/firebaseService';
import { AddIcon, EditIcon, TrashIcon } from '../icons';
import LookupCategoryModal from './LookupCategoryModal';

interface LookupsPageProps {
    permissions: Set<string>;
    lookups: Lookup[];
    setLookups: React.Dispatch<React.SetStateAction<Lookup[]>>;
}

const LookupsPage: React.FC<LookupsPageProps> = ({ permissions, lookups, setLookups }) => {
    const [selectedLookup, setSelectedLookup] = useState<Lookup | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [newValue, setNewValue] = useState('');
    const [editingValue, setEditingValue] = useState<{ index: number; text: string } | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLookup, setEditingLookup] = useState<Lookup | null>(null);
    const [isSeeding, setIsSeeding] = useState(false);


    const canRead = permissions.has('lookups:read');
    const canUpdateValues = permissions.has('lookups:update');
    const canCreateCategory = permissions.has('lookups:create');
    const canDeleteCategory = permissions.has('lookups:delete');

    useEffect(() => {
        if (!selectedLookup && lookups.length > 0) {
            setSelectedLookup(lookups[0]);
        } else if (selectedLookup) {
            const updated = lookups.find(l => l.id === selectedLookup.id);
            setSelectedLookup(updated || null);
        } else if (lookups.length === 0) {
            setSelectedLookup(null);
        }
    }, [lookups, selectedLookup]);
    

    const handleAddValue = async () => {
        if (!newValue.trim() || !selectedLookup || !canUpdateValues) return;

        const currentValues = selectedLookup.values || [];
        const trimmedNewValue = newValue.trim();

        if (currentValues.map(v => v.toLowerCase()).includes(trimmedNewValue.toLowerCase())) {
            alert('Это значение уже существует.');
            return;
        }

        const newValues = [...currentValues, trimmedNewValue].sort((a, b) => a.localeCompare(b));

        try {
            setLoading(true);
            await updateLookupValues(selectedLookup.id, newValues);
            setLookups(prev => prev.map(l => l.id === selectedLookup.id ? { ...l, values: newValues } : l));
            setNewValue('');
        } catch (err) {
            console.error(err);
            setError('Не удалось добавить значение.');
        } finally {
            setLoading(false);
        }
    };
    
    const handleUpdateValue = async () => {
        if (!editingValue || !selectedLookup || !canUpdateValues) return;
        
        const updatedValues = [...selectedLookup.values];
        updatedValues[editingValue.index] = editingValue.text.trim();
        const sortedValues = updatedValues.sort((a, b) => a.localeCompare(b));
        
        try {
            setLoading(true);
            await updateLookupValues(selectedLookup.id, sortedValues);
            setLookups(prev => prev.map(l => l.id === selectedLookup.id ? { ...l, values: sortedValues } : l));
            setEditingValue(null);
        } catch (err) {
            console.error(err);
            setError('Не удалось обновить значение.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteValue = async (indexToDelete: number) => {
        if (!selectedLookup || !canUpdateValues) return;
        if (!window.confirm('Вы уверены, что хотите удалить это значение?')) return;
        
        const newValues = selectedLookup.values.filter((_, index) => index !== indexToDelete);

        try {
            setLoading(true);
            await updateLookupValues(selectedLookup.id, newValues);
            setLookups(prev => prev.map(l => l.id === selectedLookup.id ? { ...l, values: newValues } : l));
        } catch (err) {
            console.error(err);
            setError('Не удалось удалить значение.');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveCategory = async (lookupData: { name: string, key: string }, id?: string) => {
        try {
            if (id) { // Editing
                await updateLookupName(id, lookupData.name);
                setLookups(prev => prev.map(l => l.id === id ? {...l, name: lookupData.name} : l));
            } else { // Creating
                const newLookup = await createLookup(lookupData.name, lookupData.key);
                setLookups(prev => [...prev, newLookup].sort((a, b) => a.name.localeCompare(b.name)));
                setSelectedLookup(newLookup);
            }
            setIsModalOpen(false);
            setEditingLookup(null);
        } catch(err: any) {
            setError(err.message || 'Не удалось сохранить категорию.');
        }
    };

    const handleDeleteCategory = async (lookup: Lookup) => {
        if (!canDeleteCategory) return;
        if (window.confirm(`Вы уверены, что хотите удалить категорию "${lookup.name}"? Это действие нельзя отменить.`)) {
             try {
                await deleteLookup(lookup.id);
                setLookups(prev => prev.filter(l => l.id !== lookup.id));
                if (selectedLookup?.id === lookup.id) {
                    setSelectedLookup(lookups.length > 1 ? lookups.find(l => l.id !== lookup.id)! : null);
                }
            } catch(err) {
                setError('Не удалось удалить категорию.');
            }
        }
    };
    
    const handleSeed = async () => {
        if (!window.confirm("Это создаст стандартный набор категорий (Кухня, Удобства и т.д.), если они еще не существуют. Продолжить?")) return;
        
        setIsSeeding(true);
        setError(null);
        try {
            const seededLookups = await seedInitialLookups();
            // Merge results, preventing duplicates
            const existingKeys = new Set(lookups.map(l => l.key));
            const newLookups = seededLookups.filter(sl => !existingKeys.has(sl.key));
            setLookups(prev => [...prev, ...newLookups].sort((a, b) => a.name.localeCompare(b.name)));
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Не удалось создать категории. Проверьте права доступа в Firestore.');
        } finally {
            setIsSeeding(false);
        }
    };

    if (!canRead) {
        return <div className="p-4 text-center text-red-500 bg-red-900 bg-opacity-30 rounded-md w-full">У вас нет прав для просмотра этого раздела.</div>;
    }

    return (
        <div className="w-full h-full flex gap-6 text-white">
            <div className="w-1/3 bg-gray-800 rounded-lg p-4 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Категории</h2>
                    {canCreateCategory && (
                        <button onClick={() => { setEditingLookup(null); setIsModalOpen(true); }} className="p-2 hover:bg-gray-700 rounded-full">
                            <AddIcon />
                        </button>
                    )}
                </div>
                <nav className="flex flex-col gap-2 overflow-y-auto">
                    {lookups.map((lookup) => (
                        <div key={lookup.id}
                            onClick={() => setSelectedLookup(lookup)}
                            className={`p-3 rounded-md transition-colors group flex justify-between items-center cursor-pointer ${
                                selectedLookup?.id === lookup.id ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
                            }`}
                        >
                            <span>{lookup.name}</span>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                {canCreateCategory && ( // Assuming create permission allows editing name
                                    <button onClick={(e) => { e.stopPropagation(); setEditingLookup(lookup); setIsModalOpen(true);}} className="p-1 hover:bg-gray-500 rounded"><EditIcon /></button>
                                )}
                                {canDeleteCategory && (
                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteCategory(lookup); }} className="p-1 hover:bg-red-500 rounded"><TrashIcon /></button>
                                )}
                            </div>
                        </div>
                    ))}
                    
                    {lookups.length === 0 && canCreateCategory && (
                         <div className="text-center text-gray-500 p-4 border-2 border-dashed border-gray-700 rounded-lg space-y-4">
                            <p>Категории не найдены.</p>
                            <button 
                                onClick={() => { setEditingLookup(null); setIsModalOpen(true); }}
                                className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-colors"
                            >
                                <AddIcon />
                                <span>Создать новую категорию</span>
                            </button>
                            <button 
                                onClick={handleSeed}
                                disabled={isSeeding}
                                className="w-full flex items-center justify-center space-x-2 bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 px-4 rounded-md transition-colors disabled:opacity-50"
                            >
                                {isSeeding ? "Создание..." : "Восстановить по умолчанию"}
                            </button>
                        </div>
                    )}
                </nav>
            </div>

            <div className="w-2/3 bg-gray-800 rounded-lg p-6 flex flex-col">
                {selectedLookup ? (
                    <>
                        <h1 className="text-3xl font-bold text-blue-400 mb-6">{selectedLookup.name}</h1>
                        {error && <p className="mb-4 text-center text-red-500 bg-red-900 bg-opacity-30 rounded-md p-2">{error}</p>}
                        
                        {canUpdateValues && (
                             <div className="flex gap-2 mb-4">
                                <input type="text" value={newValue} onChange={(e) => setNewValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddValue()} placeholder="Добавить новое значение..." className="flex-grow bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                <button onClick={handleAddValue} disabled={loading || !newValue.trim()} className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-colors disabled:bg-gray-500">
                                    <AddIcon />
                                    <span>Добавить</span>
                                </button>
                            </div>
                        )}
                       
                        <div className="flex-1 overflow-y-auto pr-2">
                            <ul className="space-y-2">
                                {(selectedLookup.values || []).map((value, index) => (
                                    <li key={index} className="bg-gray-900 p-3 rounded-md flex justify-between items-center group">
                                        {editingValue?.index === index ? (
                                            <input type="text" value={editingValue.text} onChange={(e) => setEditingValue({ ...editingValue, text: e.target.value })} onKeyDown={(e) => { if (e.key === 'Enter') handleUpdateValue() }} autoFocus onBlur={handleUpdateValue} className="bg-gray-700 px-2 py-1 rounded w-full"/>
                                        ) : (
                                            <span>{value}</span>
                                        )}
                                        {canUpdateValues && (
                                             <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => setEditingValue({ index, text: value })} className="text-blue-400 hover:text-blue-300"><EditIcon /></button>
                                                <button onClick={() => handleDeleteValue(index)} className="text-red-500 hover:text-red-400"><TrashIcon /></button>
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </>
                ) : (
                     <div className="flex flex-col items-center justify-center h-full text-center">
                        <h2 className="text-xl text-gray-400">Выберите категорию</h2>
                        <p className="text-gray-500">...или создайте новую, чтобы начать.</p>
                     </div>
                )}
            </div>

            {isModalOpen && (
                <LookupCategoryModal 
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveCategory}
                    existingLookup={editingLookup}
                    allLookups={lookups}
                />
            )}
        </div>
    );
};

export default LookupsPage;