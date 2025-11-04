import React, { useState, useEffect } from 'react';
import { Venue } from '../types';
import { EditIcon, CloseIcon, TrashIcon } from '../icons';

interface DetailsPanelProps {
  venue: Venue | null;
  onVenueUpdate: (venue: Venue) => void;
  onVenueDelete: (venueId: string) => void;
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
}

const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4">
    <dt className="text-sm font-medium text-gray-400">{label}</dt>
    <dd className="mt-1 text-sm text-white sm:mt-0 sm:col-span-2">{value}</dd>
  </div>
);

const Tag: React.FC<{ text: string }> = ({ text }) => (
    <span className="inline-block bg-gray-600 rounded-full px-3 py-1 text-xs font-semibold text-gray-200 mr-2 mb-2">
        {text}
    </span>
);

const EditInput: React.FC<{ label: string, value: string | number, name: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, type?: string }> = ({ label, value, name, onChange, type = 'text' }) => (
    <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4">
        <label htmlFor={name} className="block text-sm font-medium text-gray-400 sm:pt-2">{label}</label>
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

const EditCheckbox: React.FC<{ label: string, checked: boolean, name: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ label, checked, name, onChange}) => (
     <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4">
        <dt className="text-sm font-medium text-gray-400">{label}</dt>
        <dd className="mt-1 text-sm text-white sm:mt-0 sm:col-span-2">
            <input type="checkbox" name={name} checked={checked} onChange={onChange} className="h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500" />
        </dd>
    </div>
);


const DetailsPanel: React.FC<DetailsPanelProps> = ({ venue, onVenueUpdate, onVenueDelete, isEditing, setIsEditing }) => {
  const [editedVenue, setEditedVenue] = useState<Venue | null>(venue);

  useEffect(() => {
    setEditedVenue(venue);
  }, [venue]);

  if (!venue) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 h-full flex items-center justify-center">
        <p className="text-gray-400">Выберите элемент из таблицы для просмотра деталей.</p>
      </div>
    );
  }

  const handleEditToggle = () => {
    if (isEditing) {
        setEditedVenue(venue); // Reset changes on cancel
    }
    setIsEditing(!isEditing);
  };
  
  const handleSave = () => {
    if (editedVenue) {
      onVenueUpdate(editedVenue);
    }
  };
  
  const handleDelete = () => {
    onVenueDelete(venue.id);
  }

  // FIX: Improved type safety by removing @ts-ignore and ensuring property access is type-checked.
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editedVenue) return;
    const { name, value, type, checked } = e.target;
    const [section, key] = name.includes('.') ? name.split('.') : [name, ''];

    if (key) { // Nested object
        const sectionKey = section as keyof Venue;
        const sectionObject = editedVenue[sectionKey];
        if (typeof sectionObject === 'object' && sectionObject !== null && !Array.isArray(sectionObject)) {
            setEditedVenue({
                ...editedVenue,
                [sectionKey]: {
                    ...sectionObject,
                    [key]: type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) || 0 : value)
                }
            });
        }
    } else { // Top-level or array
        const topLevelKey = name as keyof Venue;
        if (['cuisine', 'facilities', 'services', 'suitable_for', 'tags'].includes(name)) {
             setEditedVenue({ ...editedVenue, [topLevelKey]: value.split(',').map(s => s.trim()) });
        } else {
             setEditedVenue({
                ...editedVenue,
                [topLevelKey]: type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) || 0 : value)
            });
        }
    }
  };


  return (
    <div className="bg-gray-800 rounded-lg p-6 h-full overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
             <h2 className="text-2xl font-bold text-blue-400 truncate pr-2">{venue.name}</h2>
             <div className="flex items-center space-x-2 flex-shrink-0">
                {isEditing ? (
                    <>
                        <button onClick={handleSave} className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-md text-sm font-semibold">Сохранить</button>
                        <button onClick={handleEditToggle} className="p-2 hover:bg-gray-700 rounded-full"><CloseIcon /></button>
                    </>
                ) : (
                    <>
                        <button onClick={handleEditToggle} className="p-2 hover:bg-gray-700 rounded-full"><EditIcon /></button>
                        <button onClick={handleDelete} className="p-2 hover:bg-gray-700 rounded-full text-red-500 hover:text-red-400"><TrashIcon /></button>
                    </>
                )}
             </div>
        </div>

        {!isEditing ? (
            <dl className="divide-y divide-gray-700">
                <DetailItem label="ID" value={<span className="break-all">{venue.id}</span>} />
                <DetailItem label="Адрес" value={venue.address} />
                <DetailItem label="Район" value={venue.district} />
                <DetailItem label="Вместимость" value={`От ${venue.capacity_min} до ${venue.capacity_max} чел.`} />
                <DetailItem label="Арендная плата" value={`${venue.base_rental_fee_azn} AZN`} />

                <div className="py-3">
                    <dt className="text-sm font-medium text-gray-400 mb-2">Контакты</dt>
                    <dd className="pl-4 border-l-2 border-gray-600">
                        <DetailItem label="Контактное лицо" value={venue.contact.person} />
                        <DetailItem label="Email" value={<a href={`mailto:${venue.contact.email}`} className="text-blue-400 hover:underline">{venue.contact.email}</a>} />
                        <DetailItem label="Телефон" value={<a href={`tel:${venue.contact.phone}`} className="text-blue-400 hover:underline">{venue.contact.phone}</a>} />
                    </dd>
                </div>

                <div className="py-3">
                    <dt className="text-sm font-medium text-gray-400 mb-2">Условия</dt>
                    <dd className="pl-4 border-l-2 border-gray-600">
                        <DetailItem label="Цена на человека" value={`От ${venue.policies.price_per_person_azn_from} до ${venue.policies.price_per_person_azn_to} AZN`} />
                        <DetailItem label="Алкоголь разрешен" value={venue.policies.alcohol_allowed ? 'Да' : 'Нет'} />
                        <DetailItem label="Свой кейтеринг" value={venue.policies.outside_catering_allowed ? 'Да' : 'Нет'} />
                        <DetailItem label="Пробковый сбор" value={`${venue.policies.corkage_fee_azn} AZN`} />
                    </dd>
                </div>
                 <div className="py-3">
                    <dt className="text-sm font-medium text-gray-400 mb-2">Меню</dt>
                    {venue.menu.map(category => (
                        <div key={category.category} className="mb-2 pl-4">
                            <h4 className="font-semibold text-gray-200">{category.category}</h4>
                            <ul className="list-disc list-inside ml-4">
                                {category.items.map(item => (
                                    <li key={item.name} className="text-sm text-gray-300">{item.name} - {item.price_azn} AZN</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
                <div className="py-3">
                    <dt className="text-sm font-medium text-gray-400 mb-2">Кухня</dt>
                    <div>{venue.cuisine.map(c => <Tag key={c} text={c} />)}</div>
                </div>
                <div className="py-3">
                    <dt className="text-sm font-medium text-gray-400 mb-2">Удобства</dt>
                    <div>{venue.facilities.map(f => <Tag key={f} text={f} />)}</div>
                </div>
                <div className="py-3">
                    <dt className="text-sm font-medium text-gray-400 mb-2">Услуги</dt>
                    <div>{venue.services.map(s => <Tag key={s} text={s} />)}</div>
                </div>
                <div className="py-3">
                    <dt className="text-sm font-medium text-gray-400 mb-2">Подходит для</dt>
                    <div>{venue.suitable_for.map(s => <Tag key={s} text={s} />)}</div>
                </div>
                <DetailItem label="Дата создания" value={new Date(venue.created_at).toLocaleString('ru-RU')} />
                <DetailItem label="Последнее обновление" value={new Date(venue.updated_at).toLocaleString('ru-RU')} />
            </dl>
        ) : (
            <div className="divide-y divide-gray-700">
               {editedVenue && (
                 <>
                    <EditInput label="Название" name="name" value={editedVenue.name} onChange={handleChange} />
                    <EditInput label="Адрес" name="address" value={editedVenue.address} onChange={handleChange} />
                    <EditInput label="Район" name="district" value={editedVenue.district} onChange={handleChange} />
                    <EditInput label="Мин. вместимость" name="capacity_min" value={editedVenue.capacity_min} onChange={handleChange} type="number"/>
                    <EditInput label="Макс. вместимость" name="capacity_max" value={editedVenue.capacity_max} onChange={handleChange} type="number"/>
                    <EditInput label="Арендная плата (AZN)" name="base_rental_fee_azn" value={editedVenue.base_rental_fee_azn} onChange={handleChange} type="number"/>

                    <div className="py-3">
                        <dt className="text-sm font-medium text-gray-400 mb-2">Контакты</dt>
                        <div className="pl-4 border-l-2 border-gray-600">
                           <EditInput label="Контактное лицо" name="contact.person" value={editedVenue.contact.person} onChange={handleChange} />
                           <EditInput label="Email" name="contact.email" value={editedVenue.contact.email} onChange={handleChange} type="email" />
                           <EditInput label="Телефон" name="contact.phone" value={editedVenue.contact.phone} onChange={handleChange} type="tel" />
                        </div>
                    </div>
                     <div className="py-3">
                        <dt className="text-sm font-medium text-gray-400 mb-2">Условия</dt>
                        <div className="pl-4 border-l-2 border-gray-600">
                           <EditInput label="Цена от (AZN)" name="policies.price_per_person_azn_from" value={editedVenue.policies.price_per_person_azn_from} onChange={handleChange} type="number"/>
                           <EditInput label="Цена до (AZN)" name="policies.price_per_person_azn_to" value={editedVenue.policies.price_per_person_azn_to} onChange={handleChange} type="number"/>
                           <EditCheckbox label="Алкоголь разрешен" name="policies.alcohol_allowed" checked={editedVenue.policies.alcohol_allowed} onChange={handleChange} />
                           <EditCheckbox label="Свой кейтеринг" name="policies.outside_catering_allowed" checked={editedVenue.policies.outside_catering_allowed} onChange={handleChange} />
                           <EditInput label="Пробковый сбор (AZN)" name="policies.corkage_fee_azn" value={editedVenue.policies.corkage_fee_azn} onChange={handleChange} type="number"/>
                        </div>
                    </div>

                    <EditInput label="Кухня (через запятую)" name="cuisine" value={editedVenue.cuisine.join(', ')} onChange={handleChange} />
                    <EditInput label="Удобства (через запятую)" name="facilities" value={editedVenue.facilities.join(', ')} onChange={handleChange} />
                    <EditInput label="Услуги (через запятую)" name="services" value={editedVenue.services.join(', ')} onChange={handleChange} />
                    <EditInput label="Подходит для (через запятую)" name="suitable_for" value={editedVenue.suitable_for.join(', ')} onChange={handleChange} />
                 </>
               )}
            </div>
        )}
    </div>
  );
};

export default DetailsPanel;