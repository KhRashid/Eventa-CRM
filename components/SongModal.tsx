import React, { useState, useEffect } from 'react';
import { Song } from '../types';
import { CloseIcon } from '../icons';

interface SongModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (song: Omit<Song, 'id'> | Song) => void;
    song: Song | null;
}

const SongModal: React.FC<SongModalProps> = ({ isOpen, onClose, onSave, song }) => {
    const [title, setTitle] = useState('');
    const [originalArtist, setOriginalArtist] = useState('');
    const [language, setLanguage] = useState('az');
    
    const languages = ['az', 'ru', 'en', 'tr', 'other'];

    useEffect(() => {
        if (song) {
            setTitle(song.title);
            setOriginalArtist(song.original_artist);
            setLanguage(song.language);
        } else {
            setTitle('');
            setOriginalArtist('');
            setLanguage('az');
        }
    }, [song, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const songData = { 
            title, 
            original_artist: originalArtist, 
            language,
            genres: song?.genres || [],
            duration_sec: song?.duration_sec || null,
        };
        if (song) {
            onSave({ ...song, ...songData });
        } else {
            onSave(songData);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-gray-700">
                    <h2 className="text-xl font-bold text-white">{song ? 'Редактировать песню' : 'Добавить песню в фонотеку'}</h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-700 rounded-full"><CloseIcon /></button>
                </header>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="song_title" className="block text-sm font-medium text-gray-300 mb-1">Название песни</label>
                            <input id="song_title" type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full bg-gray-700 border-gray-600 rounded-md px-3 py-2 text-white" />
                        </div>
                        <div>
                            <label htmlFor="original_artist" className="block text-sm font-medium text-gray-300 mb-1">Оригинальный исполнитель</label>
                            <input id="original_artist" type="text" value={originalArtist} onChange={e => setOriginalArtist(e.target.value)} required className="w-full bg-gray-700 border-gray-600 rounded-md px-3 py-2 text-white" />
                        </div>
                        <div>
                            <label htmlFor="language" className="block text-sm font-medium text-gray-300 mb-1">Язык исполнения</label>
                             <select id="language" value={language} onChange={e => setLanguage(e.target.value)} required className="w-full bg-gray-700 border-gray-600 rounded-md px-3 py-2 text-white">
                                {languages.map(lang => (
                                    <option key={lang} value={lang}>{lang.toUpperCase()}</option>
                                ))}
                            </select>
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

export default SongModal;