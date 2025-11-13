import React, { useState, useEffect, useMemo } from 'react';
import { Repertoire, Song } from '../types';
import { CloseIcon, AddIcon, TrashIcon } from '../icons';

interface RepertoireModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (rep: Omit<Repertoire, 'id'> | Repertoire) => void;
    repertoire: Repertoire | null;
    allSongs: Song[];
}

const RepertoireModal: React.FC<RepertoireModalProps> = ({ isOpen, onClose, onSave, repertoire, allSongs }) => {
    const [name, setName] = useState('');
    const [songIds, setSongIds] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (repertoire) {
            setName(repertoire.name);
            setSongIds(repertoire.songIds);
        } else {
            setName('');
            setSongIds([]);
        }
    }, [repertoire, isOpen]);

    const availableSongs = useMemo(() => {
        return allSongs
            .filter(s => !songIds.includes(s.id))
            .filter(s => 
                s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.original_artist.toLowerCase().includes(searchTerm.toLowerCase())
            );
    }, [allSongs, songIds, searchTerm]);
    
    const repertoireSongs = useMemo(() => {
        const songsMap = new Map(allSongs.map(s => [s.id, s]));
        return songIds.map(id => songsMap.get(id)).filter((s): s is Song => !!s);
    }, [songIds, allSongs]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const repData = { name, songIds };
        if (repertoire) {
            onSave({ ...repertoire, ...repData });
        } else {
            onSave(repData);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl flex flex-col h-[90vh]" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-gray-700">
                    <h2 className="text-xl font-bold text-white">{repertoire ? 'Редактировать репертуар' : 'Создать репертуар'}</h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-700 rounded-full"><CloseIcon /></button>
                </header>
                <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-gray-700">
                         <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Название репертуара</label>
                            <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-gray-700 border-gray-600 rounded-md px-3 py-2 text-white" />
                        </div>
                    </div>
                    <div className="flex-1 flex overflow-hidden">
                        {/* Left Panel - Available Songs */}
                        <div className="w-1/2 border-r border-gray-700 flex flex-col">
                           <div className="p-4 border-b border-gray-700">
                               <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Поиск по фонотеке..." className="w-full bg-gray-900 px-3 py-2 rounded-md" />
                           </div>
                           <div className="flex-1 overflow-y-auto p-4 space-y-2">
                               {availableSongs.map(song => (
                                   <div key={song.id} className="flex justify-between items-center group p-2 hover:bg-gray-700 rounded-md">
                                        <div>
                                            <p>{song.title}</p>
                                            <p className="text-xs text-gray-400">{song.original_artist}</p>
                                        </div>
                                       <button type="button" onClick={() => setSongIds(prev => [...prev, song.id])} className="p-1 text-green-400 opacity-0 group-hover:opacity-100"><AddIcon/></button>
                                   </div>
                               ))}
                           </div>
                        </div>
                        {/* Right Panel - Selected Songs */}
                        <div className="w-1/2 flex flex-col">
                             <div className="p-4 border-b border-gray-700">
                                <h3 className="font-bold text-lg">Состав репертуара ({repertoireSongs.length})</h3>
                           </div>
                           <div className="flex-1 overflow-y-auto p-4 space-y-2">
                               {repertoireSongs.map(song => (
                                   <div key={song.id} className="flex justify-between items-center bg-gray-700 p-2 rounded group">
                                       <div>
                                            <p>{song.title}</p>
                                            <p className="text-xs text-gray-400">{song.original_artist}</p>
                                        </div>
                                       <button type="button" onClick={() => setSongIds(prev => prev.filter(id => id !== song.id))} className="p-1 text-red-500 opacity-0 group-hover:opacity-100"><TrashIcon /></button>
                                   </div>
                               ))}
                           </div>
                        </div>
                    </div>
                    <footer className="p-4 border-t border-gray-700 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-white bg-gray-600 hover:bg-gray-500">Отмена</button>
                        <button type="submit" className="px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700">Сохранить репертуар</button>
                    </footer>
                </form>
            </div>
        </div>
    );
};

export default RepertoireModal;