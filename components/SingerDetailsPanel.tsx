import React, { useState, useEffect } from 'react';
import { Singer, Lookup, PricingPackage, RepertoireSong } from '../types';
import { EditIcon, TrashIcon, CloseIcon, AddIcon } from '../icons';
import { updateSinger, deleteSinger } from '../services/firebaseService';
import MultiSelectDropdown from './MultiSelectDropdown';
import PricingPackageModal from './PricingPackageModal';
import RepertoireSongModal from './RepertoireSongModal';

interface SingerDetailsPanelProps {
  singer: Singer | null;
  permissions: Set<string>;
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
  onSingerUpdate: (singer: Singer) => void;
  onSingerDelete: (singerId: string) => void;
  lookups: Lookup[];
  pricingPackages: PricingPackage[];
  repertoire: RepertoireSong[];
  onSavePackage: (singerId: string, pkg: Omit<PricingPackage, 'id'> | PricingPackage) => void;
  onDeletePackage: (singerId: string, packageId: string) => void;
  onSaveSong: (singerId: string, song: Omit<RepertoireSong, 'id'> | RepertoireSong) => void;
  onDeleteSong: (singerId: string, songId: string) => void;
  detailsLoading: boolean;
}

const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4">
    <dt className="text-sm font-medium text-gray-400">{label}</dt>
    <dd className="mt-1 text-sm text-white sm:mt-0 sm:col-span-2">{value}</dd>
  </div>
);

const EditInput: React.FC<{ label: string, value: string | number, name: string, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void, type?: string }> = ({ label, value, name, onChange, type = 'text' }) => (
    <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4 items-center">
        <label htmlFor={name} className="block text-sm font-medium text-gray-400">{label}</label>
        <div className="mt-1 sm:mt-0 sm:col-span-2">
            <input 
                type={type} 
                name={name} 
                id={name}
                value={value}
                onChange={onChange}
                className="block w-full shadow-sm sm:text-sm bg-gray-700 border-gray-600 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
            />
        </div>
    </div>
);

const EditSelect: React.FC<{ label: string, value: string, name: string, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void, children: React.ReactNode }> = ({ label, value, name, onChange, children }) => (
    <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4 items-center">
        <label htmlFor={name} className="block text-sm font-medium text-gray-400">{label}</label>
        <div className="mt-1 sm:mt-0 sm:col-span-2">
            <select
                name={name}
                id={name}
                value={value}
                onChange={onChange}
                className="block w-full shadow-sm sm:text-sm bg-gray-700 border-gray-600 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
            >
                {children}
            </select>
        </div>
    </div>
);


const Tag: React.FC<{ text: string }> = ({ text }) => (
    <span className="inline-block bg-gray-600 rounded-full px-3 py-1 text-xs font-semibold text-gray-200 mr-2 mb-2">
        {text}
    </span>
);

const statusStyles: { [key: string]: string } = {
    published: 'bg-green-500 text-green-900',
    draft: 'bg-yellow-500 text-yellow-900',
    paused: 'bg-gray-500 text-gray-900',
}

const SingerDetailsPanel: React.FC<SingerDetailsPanelProps> = (props) => {
    const { singer, permissions, isEditing, setIsEditing, onSingerUpdate, onSingerDelete, lookups, pricingPackages, repertoire, onSavePackage, onDeletePackage, onSaveSong, onDeleteSong, detailsLoading } = props;
    const [editedSinger, setEditedSinger] = useState<Singer | null>(singer);

    const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
    const [editingPackage, setEditingPackage] = useState<PricingPackage | null>(null);
    const [isSongModalOpen, setIsSongModalOpen] = useState(false);
    const [editingSong, setEditingSong] = useState<RepertoireSong | null>(null);

    useEffect(() => {
        setEditedSinger(singer);
    }, [singer]);

    if (!singer) {
        return (
          <div className="bg-gray-800 rounded-lg p-6 h-full flex items-center justify-center">
            <p className="text-gray-400">Выберите певца из таблицы для просмотра деталей.</p>
          </div>
        );
    }
    
    const canUpdate = permissions.has('artists:update');
    const canDelete = permissions.has('artists:delete');

    const handleEditToggle = () => {
        if (isEditing) {
            setEditedSinger(singer); // Reset changes on cancel
        }
        setIsEditing(!isEditing);
    };

    const handleSave = async () => {
        if (editedSinger) {
            try {
                const updated = await updateSinger(editedSinger);
                onSingerUpdate(updated);
            } catch (error) {
                console.error("Failed to save singer", error);
            }
        }
    };
    
    const handleDelete = async () => {
        if (window.confirm('Вы уверены, что хотите удалить этого артиста?')) {
            try {
                await deleteSinger(singer.id);
                onSingerDelete(singer.id);
            } catch (error) {
                console.error("Failed to delete singer", error);
            }
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        if (!editedSinger) return;
        const { name, value } = e.target;
        setEditedSinger({ ...editedSinger, [name]: value });
    };

    const handleMultiSelectChange = (fieldName: keyof Singer, selectedValues: string[]) => {
      if (!editedSinger) return;
      setEditedSinger({ ...editedSinger, [fieldName]: selectedValues });
    };

    const renderDetails = () => {
        if (detailsLoading) {
            return <div className="p-4 text-center text-gray-400">Загрузка деталей...</div>;
        }

        const renderSubSection = (title: string, items: any[], renderItem: (item: any) => React.ReactNode) => (
            <div className="py-3">
                <dt className="text-sm font-medium text-gray-400 mb-2">{title}</dt>
                {items.length > 0 ? (
                    <div className="pl-4 border-l-2 border-gray-600 space-y-3">
                        {items.map(renderItem)}
                    </div>
                ) : <p className="text-sm text-gray-500 pl-4">Нет данных.</p>}
            </div>
        );
        
        return (
             <dl className="divide-y divide-gray-700">
                <DetailItem label="Полное имя" value={singer.name} />
                <DetailItem label="Псевдонимы" value={singer.aliases?.join(', ') || 'Нет'} />
                <DetailItem label="Пол/Тип" value={singer.gender} />
                <DetailItem label="Город" value={singer.city} />
                <DetailItem label="Регионы выезда" value={singer.regions_covered?.join(', ') || 'Не указаны'} />
                <DetailItem label="Телефоны" value={singer.phones?.join(', ') || 'Нет'} />
                <DetailItem label="Жанры" value={(singer.genres || []).map(val => <Tag key={val} text={val} />)} />
                <DetailItem label="Теги" value={(singer.tags || []).map(val => <Tag key={val} text={val} />)} />
                <DetailItem label="Языки" value={(singer.languages || []).map(val => <Tag key={val} text={val} />)} />
                
                {renderSubSection("Тарифные пакеты", pricingPackages, (pkg: PricingPackage) => (
                    <div key={pkg.id}>
                        <h4 className="font-bold text-gray-100">{pkg.title} - <span className="text-blue-400">{pkg.price} {pkg.currency}</span></h4>
                        <p className="text-xs text-gray-400">{pkg.description}</p>
                    </div>
                ))}

                {renderSubSection("Репертуар", repertoire, (song: RepertoireSong) => (
                     <div key={song.id}>
                        <h4 className="font-semibold text-gray-200">"{song.title}"</h4>
                        <p className="text-xs text-gray-500">Оригинал: {song.original_artist}</p>
                    </div>
                ))}

                <DetailItem label="Дата создания" value={new Date(singer.created_at).toLocaleString('ru-RU')} />
            </dl>
        );
    }
    
    const renderEditForm = () => {
        if (!editedSinger) return null;
        
        const renderEditableSubSection = (title: string, items: any[], onAdd: () => void, onEdit: (item: any) => void, onDelete: (id: string) => void, renderItem: (item: any) => React.ReactNode) => (
             <div className="py-3">
                <div className="flex justify-between items-center mb-2">
                    <dt className="text-sm font-medium text-gray-400">{title}</dt>
                    <button type="button" onClick={onAdd} className="p-1 hover:bg-gray-700 rounded-full"><AddIcon /></button>
                </div>
                 <div className="pl-4 border-l-2 border-gray-600 space-y-2">
                    {items.map((item) => (
                         <div key={item.id} className="bg-gray-900 p-2 rounded-md flex justify-between items-center group">
                            {renderItem(item)}
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100">
                                <button type="button" onClick={() => onEdit(item)} className="text-blue-400"><EditIcon /></button>
                                <button type="button" onClick={() => onDelete(item.id)} className="text-red-500"><TrashIcon /></button>
                            </div>
                         </div>
                    ))}
                    {items.length === 0 && <p className="text-sm text-gray-500">Нет данных. Нажмите "+", чтобы добавить.</p>}
                 </div>
             </div>
        );

        return (
             <div className="divide-y divide-gray-700">
                <EditInput label="Полное имя" name="name" value={editedSinger.name} onChange={handleChange} />
                <EditInput label="Псевдонимы" name="aliases" value={editedSinger.aliases?.join(', ') || ''} onChange={(e) => setEditedSinger({...editedSinger, aliases: e.target.value.split(',').map(s => s.trim())})} />
                <EditSelect label="Пол/Тип" name="gender" value={editedSinger.gender} onChange={handleChange}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="duo">Duo</option>
                    <option value="group">Group</option>
                </EditSelect>
                <EditSelect label="Статус" name="status" value={editedSinger.status} onChange={handleChange}>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="paused">Paused</option>
                </EditSelect>
                <EditInput label="Город" name="city" value={editedSinger.city} onChange={handleChange} />
                <EditInput label="Телефоны" name="phones" value={editedSinger.phones?.join(', ') || ''} onChange={(e) => setEditedSinger({...editedSinger, phones: e.target.value.split(',').map(s => s.trim())})} />
                
                {['genres', 'tags', 'languages'].map(field => {
                    const lookup = lookups.find(l => l.key === `singer_${field}`);
                    return lookup ? (
                        <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4" key={lookup.id}>
                            <label className="block text-sm font-medium text-gray-400 sm:pt-2">{lookup.name}</label>
                            <div className="mt-1 sm:mt-0 sm:col-span-2">
                                <MultiSelectDropdown
                                    options={lookup.values}
                                    selected={(editedSinger as any)[field] || []}
                                    onChange={(selected) => handleMultiSelectChange(field as keyof Singer, selected)}
                                    placeholder={`Выберите ${lookup.name.toLowerCase()}...`}
                                />
                            </div>
                        </div>
                    ) : null
                })}

                {renderEditableSubSection("Тарифные пакеты", pricingPackages, 
                    () => { setEditingPackage(null); setIsPackageModalOpen(true); },
                    (pkg) => { setEditingPackage(pkg); setIsPackageModalOpen(true); },
                    (id) => onDeletePackage(singer.id, id),
                    (pkg: PricingPackage) => <span>{pkg.title} - {pkg.price} {pkg.currency}</span>
                )}

                {renderEditableSubSection("Репертуар", repertoire,
                    () => { setEditingSong(null); setIsSongModalOpen(true); },
                    (song) => { setEditingSong(song); setIsSongModalOpen(true); },
                    (id) => onDeleteSong(singer.id, id),
                    (song: RepertoireSong) => <span>"{song.title}" ({song.original_artist})</span>
                )}
             </div>
        );
    }

  return (
    <div className="bg-gray-800 rounded-lg h-full flex flex-col overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-700 flex-shrink-0">
            <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold text-blue-400 truncate pr-2">{singer.name}</h2>
                 {!isEditing && <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${statusStyles[singer.status] || 'bg-gray-500'}`}>{singer.status}</span>}
            </div>
             <div className="flex items-center space-x-2 flex-shrink-0">
                {isEditing ? (
                    <>
                        <button onClick={handleSave} className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-md text-sm font-semibold">Сохранить</button>
                        <button onClick={handleEditToggle} className="p-2 hover:bg-gray-700 rounded-full"><CloseIcon /></button>
                    </>
                ) : (
                    <>
                        {canUpdate && <button onClick={handleEditToggle} className="p-2 hover:bg-gray-700 rounded-full"><EditIcon /></button>}
                        {canDelete && <button onClick={handleDelete} className="p-2 hover:bg-gray-700 rounded-full text-red-500 hover:text-red-400"><TrashIcon /></button>}
                    </>
                )}
             </div>
        </div>

        <div className="overflow-y-auto p-6 flex-1">
             {isEditing ? renderEditForm() : renderDetails()}
        </div>

        {isPackageModalOpen && (
            <PricingPackageModal
                isOpen={isPackageModalOpen}
                onClose={() => setIsPackageModalOpen(false)}
                onSave={(pkg) => {
                    onSavePackage(singer.id, pkg);
                    setIsPackageModalOpen(false);
                }}
                pkg={editingPackage}
            />
        )}
        {isSongModalOpen && (
            <RepertoireSongModal
                isOpen={isSongModalOpen}
                onClose={() => setIsSongModalOpen(false)}
                onSave={(song) => {
                    onSaveSong(singer.id, song);
                    setIsSongModalOpen(false);
                }}
                song={editingSong}
            />
        )}
    </div>
  );
};

export default SingerDetailsPanel;