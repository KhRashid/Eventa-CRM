import React, { useState, useMemo } from 'react';
import { Song, Repertoire } from '../types';
import { AddIcon, EditIcon, TrashIcon } from '../icons';
import * as api from '../services/firebaseService';
import SongModal from './SongModal';
import RepertoireModal from './RepertoireModal';

interface RepertoireBuilderPageProps {
    permissions: Set<string>;
    songs: Song[];
    setSongs: React.Dispatch<React.SetStateAction<Song[]>>;
    repertoires: Repertoire[];
    setRepertoires: React.Dispatch<React.SetStateAction<Repertoire[]>>;
}

type ActiveTab = 'songs' | 'repertoires';

const RepertoireBuilderPage: React.FC<RepertoireBuilderPageProps> = ({ permissions, songs, setSongs, repertoires, setRepertoires }) => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('songs');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const [isSongModalOpen, setIsSongModalOpen] = useState(false);
    const [currentSong, setCurrentSong] = useState<Song | null>(null);

    const [isRepertoireModalOpen, setIsRepertoireModalOpen] = useState(false);
    const [currentRepertoire, setCurrentRepertoire] = useState<Repertoire | null>(null);

    const canReadCatalog = permissions.has('repertoire-catalog:read');
    const canCreateCatalog = permissions.has('repertoire-catalog:create');
    const canUpdateCatalog = permissions.has('repertoire-catalog:update');
    const canDeleteCatalog = permissions.has('repertoire-catalog:delete');
    
    const canReadRepertoires = permissions.has('repertoires:read');
    const canCreateRepertoires = permissions.has('repertoires:create');
    const canUpdateRepertoires = permissions.has('repertoires:update');
    const canDeleteRepertoires = permissions.has('repertoires:delete');

    // --- Song Handlers ---
    const handleSaveSong = async (songData: Omit<Song, 'id'> | Song) => {
        try {
            setLoading(true);
            if ('id' in songData) {
                await api.updateSong(songData as Song);
                setSongs(prev => prev.map(s => s.id === songData.id ? songData as Song : s));
            } else {
                const newSong = await api.createSong(songData as Omit<Song, 'id'>);
                setSongs(prev => [...prev, newSong]);
            }
            setIsSongModalOpen(false);
        } catch (err) { setError('Failed to save song.'); } finally { setLoading(false); }
    };

    const handleDeleteSong = async (songId: string) => {
        if (window.confirm('Are you sure? This will also remove the song from all repertoires.')) {
            try {
                setLoading(true);
                await api.deleteSong(songId);
                setSongs(prev => prev.filter(s => s.id !== songId));
                setRepertoires(prev => prev.map(r => ({
                    ...r,
                    songIds: r.songIds.filter(id => id !== songId)
                })));
            } catch (err) { setError('Failed to delete song.'); } finally { setLoading(false); }
        }
    };
    
    // --- Repertoire Handlers ---
    const handleSaveRepertoire = async (repData: Omit<Repertoire, 'id'> | Repertoire) => {
        try {
            setLoading(true);
            if ('id' in repData) {
                await api.updateRepertoire(repData as Repertoire);
                setRepertoires(prev => prev.map(r => r.id === repData.id ? repData as Repertoire : r));
            } else {
                const newRep = await api.createRepertoire(repData as Omit<Repertoire, 'id'>);
                setRepertoires(prev => [...prev, newRep]);
            }
            setIsRepertoireModalOpen(false);
        } catch (err) { setError('Failed to save repertoire.'); } finally { setLoading(false); }
    };
    
    const handleDeleteRepertoire = async (repertoireId: string) => {
        if (window.confirm('Are you sure? This will not delete the songs within the repertoire.')) {
            try {
                setLoading(true);
                await api.deleteRepertoire(repertoireId);
                setRepertoires(prev => prev.filter(r => r.id !== repertoireId));
            } catch (err) { setError('Failed to delete repertoire.'); } finally { setLoading(false); }
        }
    };


    const renderSongsContent = () => {
        if (!canReadCatalog) return <p className="text-red-500">У вас нет прав для просмотра фонотеки.</p>;
        return (
            <div>
                 <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Фонотека</h2>
                    {canCreateCatalog && <button onClick={() => { setCurrentSong(null); setIsSongModalOpen(true); }} className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md"><AddIcon /><span>Добавить песню</span></button>}
                </div>
                <ul className="space-y-2">
                    {songs.map(song => (
                        <li key={song.id} className="bg-gray-900 p-3 rounded-md flex justify-between items-center group">
                            <div>
                                <span className="font-semibold">{song.title}</span>
                                <p className="text-xs text-gray-400">{song.original_artist}</p>
                            </div>
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100">
                                {canUpdateCatalog && <button onClick={() => { setCurrentSong(song); setIsSongModalOpen(true); }} className="text-blue-400"><EditIcon /></button>}
                                {canDeleteCatalog && <button onClick={() => handleDeleteSong(song.id)} className="text-red-500"><TrashIcon /></button>}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        );
    };

    const renderRepertoiresContent = () => {
        if (!canReadRepertoires) return <p className="text-red-500">У вас нет прав для просмотра репертуаров.</p>;
        return (
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Репертуары (плейлисты)</h2>
                    {canCreateRepertoires && <button onClick={() => { setCurrentRepertoire(null); setIsRepertoireModalOpen(true); }} className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md"><AddIcon /><span>Создать репертуар</span></button>}
                </div>
                 <div className="space-y-4">
                     {repertoires.map(rep => (
                         <div key={rep.id} className="bg-gray-900 p-4 rounded-md group">
                             <div className="flex justify-between items-center">
                                <h3 className="font-bold text-lg">{rep.name}</h3>
                                 <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100">
                                    {canUpdateRepertoires && <button onClick={() => { setCurrentRepertoire(rep); setIsRepertoireModalOpen(true); }} className="text-blue-400"><EditIcon /></button>}
                                    {canDeleteRepertoires && <button onClick={() => handleDeleteRepertoire(rep.id)} className="text-red-500"><TrashIcon /></button>}
                                </div>
                             </div>
                             <ul className="list-disc list-inside text-sm text-gray-300 mt-2 pl-2 columns-2 md:columns-3">
                                {rep.songIds.map(id => {
                                    const song = songs.find(s => s.id === id);
                                    return song ? <li key={id}>{song.title}</li> : null;
                                })}
                             </ul>
                         </div>
                     ))}
                 </div>
            </div>
        );
    };

    return (
        <div className="w-full h-full flex flex-col text-white">
            <h1 className="text-3xl font-bold text-blue-400 mb-6">Конструктор репертуаров</h1>

            <div className="mb-6 border-b border-gray-700">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <button onClick={() => setActiveTab('songs')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'songs' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:border-gray-500'}`}>Фонотека</button>
                    <button onClick={() => setActiveTab('repertoires')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'repertoires' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:border-gray-500'}`}>Репертуары</button>
                </nav>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2">
                {error && <p className="text-red-500 bg-red-900 bg-opacity-30 p-3 rounded-md mb-4">{error}</p>}
                {loading && <p>Загрузка...</p>}
                {activeTab === 'songs' ? renderSongsContent() : renderRepertoiresContent()}
            </div>
            
            {isSongModalOpen && (
                <SongModal isOpen={isSongModalOpen} onClose={() => setIsSongModalOpen(false)} onSave={handleSaveSong} song={currentSong} />
            )}
            {isRepertoireModalOpen && (
                <RepertoireModal isOpen={isRepertoireModalOpen} onClose={() => setIsRepertoireModalOpen(false)} onSave={handleSaveRepertoire} repertoire={currentRepertoire} allSongs={songs} />
            )}
        </div>
    );
};

export default RepertoireBuilderPage;