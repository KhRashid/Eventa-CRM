import React, { useState, useEffect } from 'react';
import { CarProvider } from '../types';
import { EditIcon, TrashIcon, CloseIcon } from '../icons';

interface CarProviderDetailsPanelProps {
  provider: CarProvider | null;
  permissions: Set<string>;
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
  onProviderUpdate: (provider: CarProvider) => void;
  onProviderDelete: (providerId: string) => void;
  carsCount: number;
}

const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4">
    <dt className="text-sm font-medium text-gray-400">{label}</dt>
    <dd className="mt-1 text-sm text-white sm:mt-0 sm:col-span-2">{value}</dd>
  </div>
);

const CarProviderDetailsPanel: React.FC<CarProviderDetailsPanelProps> = ({ provider, permissions, isEditing, setIsEditing, onProviderUpdate, onProviderDelete, carsCount }) => {
    
    if (!provider) {
        return (
          <div className="bg-gray-800 rounded-lg p-6 h-full flex items-center justify-center">
            <p className="text-gray-400">Выберите поставщика для просмотра деталей.</p>
          </div>
        );
    }
    
    const canUpdate = permissions.has('cars:update');
    const canDelete = permissions.has('cars:delete');

    const renderDetails = () => (
        <dl className="divide-y divide-gray-700">
            <DetailItem label="Название" value={provider.name} />
            <DetailItem label="Тип" value={provider.type} />
            <DetailItem label="Контакт" value={provider.contact_person} />
            <DetailItem label="Телефоны" value={provider.phones.join(', ')} />
             <DetailItem 
                label="Мессенджеры" 
                value={
                    !provider.messengers || (Object.keys(provider.messengers).length === 0) ? (
                        <span className="text-gray-500">Нет данных</span>
                    ) : (
                        <div className="flex flex-col space-y-1">
                            {provider.messengers.whatsapp && (
                                <a href={`https://wa.me/${provider.messengers.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                                    WhatsApp: {provider.messengers.whatsapp}
                                </a>
                            )}
                            {provider.messengers.telegram && (
                                <a href={`https://t.me/${provider.messengers.telegram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                                    Telegram: {provider.messengers.telegram}
                                </a>
                            )}
                        </div>
                    )
                } 
            />
            <DetailItem label="Адрес" value={provider.address} />
            <DetailItem label="Город" value={provider.city_code} />
            
             <div className="py-3">
                <dt className="text-sm font-medium text-gray-400 mb-2">Пункты выдачи</dt>
                {provider.pickup_points.length > 0 ? (
                    <div className="pl-4 border-l-2 border-gray-600 space-y-3">
                        {provider.pickup_points.map((point, index) => (
                            <div key={index}>
                                <h4 className="font-bold text-gray-100">{point.label}</h4>
                                <p className="text-xs text-gray-400">{point.address}</p>
                            </div>
                        ))}
                    </div>
                ) : <p className="text-sm text-gray-500 pl-4">Нет данных.</p>}
            </div>
            
            <DetailItem label="Количество авто" value={carsCount} />

            <DetailItem label="Дата создания" value={new Date(provider.created_at).toLocaleString('ru-RU')} />
        </dl>
    );

    const renderEditForm = () => (
        <div>
            <p>Редактирование в разработке.</p>
        </div>
    );

    return (
        <div className="bg-gray-800 rounded-lg h-full flex flex-col overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-700 flex-shrink-0">
                <h2 className="text-2xl font-bold text-blue-400 truncate pr-2">{provider.name}</h2>
                 <div className="flex items-center space-x-2 flex-shrink-0">
                    {isEditing ? (
                        <>
                            <button onClick={() => alert('Save clicked')} className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-md text-sm font-semibold">Сохранить</button>
                            <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-gray-700 rounded-full"><CloseIcon /></button>
                        </>
                    ) : (
                        <>
                            {canUpdate && <button onClick={() => setIsEditing(true)} className="p-2 hover:bg-gray-700 rounded-full"><EditIcon /></button>}
                            {canDelete && <button onClick={() => alert('Delete clicked')} className="p-2 hover:bg-gray-700 rounded-full text-red-500 hover:text-red-400"><TrashIcon /></button>}
                        </>
                    )}
                 </div>
            </div>
    
            <div className="overflow-y-auto p-6 flex-1">
                 {isEditing ? renderEditForm() : renderDetails()}
            </div>
        </div>
    );
};

export default CarProviderDetailsPanel;