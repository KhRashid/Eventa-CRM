import React, { useState, useEffect } from 'react';
import { Lookup } from '../types';
import { LOOKUP_CONFIG } from '../constants';
import { updateLookup } from '../services/firebaseService';
import { AddIcon, EditIcon, TrashIcon, CloseIcon, HomeIcon, RestaurantIcon } from '../icons';

interface LookupsPageProps {
    permissions: Set<string>;
    lookups: Lookup[];
    setLookups: React.Dispatch<React.SetStateAction<Lookup[]>>;
}

const LookupsPage: React.FC<LookupsPageProps> = ({ permissions, lookups, setLookups }) => {
    const [selectedLookupId, setSelectedLookupId] = useState<string>('cuisine');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [newValue, setNewValue] = useState('');
    const [editingValue, setEditingValue] = useState<{ index: number; text: string } | null>(null);

    const canRead = permissions.has('lookups:read');
    const canUpdate = permissions.has('lookups:update');

    const selectedLookup = lookups.find(l => l.id === selectedLookupId);

    const handleAddValue = async () => {
        if (!newValue.trim() || !selectedLookup || !canUpdate) return;
        
        const newValues = [...(selectedLookup.values || []), newValue.trim()];
        if (selectedLookup.values.includes(newValue.trim())) {
             alert('Это значение уже существует.');
             return;
        }

        try {
            setLoading(true);
            await updateLookup(selectedLookup.id, newValues);
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
        if (!editingValue || !selectedLookup || !canUpdate) return;
        
        const updatedValues = [...(selectedLookup.values || [])];
        updatedValues[editingValue.index] = editingValue.text.trim();
        
        try {
            setLoading(true);
            await updateLookup(selectedLookup.id, updatedValues);
            setLookups(prev => prev.map(l => l.id === selectedLookup.id ? { ...l, values: updatedValues } : l));
            setEditingValue(null);
        } catch (err) {
            console.error(err);
            setError('Не удалось обновить значение.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteValue = async (indexToDelete: number) => {
        if (!selectedLookup || !canUpdate) return;
        if (!window.confirm('Вы уверены, что хотите удалить это значение?')) return;
        
        const newValues = selectedLookup.values.filter((_, index) => index !== indexToDelete);

        try {
            setLoading(true);
            await updateLookup(selectedLookup.id, newValues);
            setLookups(prev => prev.map(l => l.id === selectedLookup.id ? { ...l, values: newValues } : l));
        } catch (err) {
            console.error(err);
            setError('Не удалось удалить значение.');
        } finally {
            setLoading(false);
        }
    };

    if (!canRead) {
        return <div className="p-4 text-center text-red-500 bg-red-900 bg-opacity-30 rounded-md w-full">У вас нет прав для просмотра этого раздела.</div>;
    }

    return (
        <div className="w-full h-full flex gap-6 text-white">
            {/* Left Panel: Lookup Types */}
            <div className="w-1/4 bg-gray-800 rounded-lg p-4 flex flex-col">
                <h2 className="text-xl font-bold mb-4">Справочники</h2>
                <nav className="flex flex-col gap-2">
                    {Object.entries(LOOKUP_CONFIG).map(([id, config]) => (
                        <button
                            key={id}
                            onClick={() => setSelectedLookupId(id)}
                            className={`p-3 rounded-md text-left transition-colors ${
                                selectedLookupId === id ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
                            }`}
                        >
                            {config.name}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Right Panel: Values */}
            <div className="w-3/4 bg-gray-800 rounded-lg p-6 flex flex-col">
                <h1 className="text-3xl font-bold text-blue-400 mb-6">
                    {LOOKUP_CONFIG[selectedLookupId]?.name || 'Справочник'}
                </h1>

                {error && <p className="mb-4 text-center text-red-500 bg-red-900 bg-opacity-30 rounded-md p-2">{error}</p>}
                
                {canUpdate && (
                     <div className="flex gap-2 mb-4">
                        <input
                            type="text"
                            value={newValue}
                            onChange={(e) => setNewValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddValue()}
                            placeholder="Добавить новое значение..."
                            className="flex-grow bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            onClick={handleAddValue}
                            disabled={loading || !newValue.trim()}
                            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-colors disabled:bg-gray-500"
                        >
                            <AddIcon />
                            <span>Добавить</span>
                        </button>
                    </div>
                )}
               
                <div className="flex-1 overflow-y-auto pr-2">
                    <ul className="space-y-2">
                        {selectedLookup?.values.sort().map((value, index) => (
                            <li
                                key={index}
                                className="bg-gray-900 p-3 rounded-md flex justify-between items-center group"
                            >
                                {editingValue?.index === index ? (
                                    <input
                                        type="text"
                                        value={editingValue.text}
                                        onChange={(e) => setEditingValue({ ...editingValue, text: e.target.value })}
                                        onKeyDown={(e) => { if (e.key === 'Enter') handleUpdateValue() }}
                                        autoFocus
                                        className="bg-gray-700 px-2 py-1 rounded"
                                    />
                                ) : (
                                    <span>{value}</span>
                                )}

                                <div className="flex items-center gap-2">
                                     {editingValue?.index === index ? (
                                        <>
                                            <button onClick={handleUpdateValue} className="text-green-400 hover:text-green-300">Сохранить</button>
                                            <button onClick={() => setEditingValue(null)} className="text-gray-400 hover:text-gray-200">Отмена</button>
                                        </>
                                    ) : (
                                       canUpdate && (
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                                <button onClick={() => setEditingValue({ index, text: value })} className="text-blue-400 hover:text-blue-300">
                                                    <EditIcon />
                                                </button>
                                                <button onClick={() => handleDeleteValue(index)} className="text-red-500 hover:text-red-400">
                                                    <TrashIcon />
                                                </button>
                                            </div>
                                       )
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default LookupsPage;