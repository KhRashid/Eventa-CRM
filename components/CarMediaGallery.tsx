import React, { useState, useRef } from 'react';
import { Car } from '../types';
import { AddIcon, TrashIcon } from '../icons';
import * as api from '../services/firebaseService';

interface CarMediaGalleryProps {
  selectedCar: Car | null;
  providerId: string | undefined;
  onCarUpdate: (updatedCar: Car) => void;
  permissions: Set<string>;
}

const CarMediaGallery: React.FC<CarMediaGalleryProps> = ({ selectedCar, providerId, onCarUpdate, permissions }) => {
  const [isUploading, setIsUploading] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  
  const canUpdate = permissions.has('cars:update');

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedCar || !providerId) return;

    setIsUploading(true);
    try {
      const downloadURL = await api.uploadCarPhoto(providerId, selectedCar.id, file);
      const updatedPhotos = [...(selectedCar.media?.photos || []), downloadURL];
      const updatedCar: Car = { ...selectedCar, media: { ...selectedCar.media, photos: updatedPhotos } };
      
      await api.updateCar(providerId, updatedCar);
      onCarUpdate(updatedCar);
    } catch (error) {
      console.error("Failed to upload photo:", error);
      alert("Не удалось загрузить фото.");
    } finally {
      setIsUploading(false);
      if (event.target) event.target.value = '';
    }
  };

  const handleDeletePhoto = async (indexToDelete: number) => {
    if (!selectedCar || !providerId || !window.confirm("Вы уверены, что хотите удалить это фото?")) return;
    
    try {
        const updatedPhotos = selectedCar.media.photos.filter((_, index) => index !== indexToDelete);
        const updatedCar = { ...selectedCar, media: { ...selectedCar.media, photos: updatedPhotos } };
        await api.updateCar(providerId, updatedCar);
        onCarUpdate(updatedCar);
    } catch (error) {
        console.error("Failed to delete photo:", error);
        alert("Не удалось удалить фото.");
    }
  };

  if (!selectedCar) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 h-full flex items-center justify-center">
        <p className="text-gray-400">Выберите автомобиль, чтобы посмотреть его фото.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg shadow overflow-hidden h-full flex flex-col">
       <input type="file" ref={photoInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" />
       
       <div className="p-4 border-b border-gray-700 flex justify-between items-center">
            <h3 className="text-lg font-bold truncate pr-2">Фото: {selectedCar.brand} {selectedCar.model}</h3>
            {canUpdate && (
                 <button
                    onClick={() => photoInputRef.current?.click()}
                    disabled={isUploading}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 px-3 rounded-md transition-colors text-sm disabled:bg-gray-500"
                    >
                    <AddIcon />
                    <span>Добавить</span>
                </button>
            )}
       </div>
       <div className="p-4 overflow-y-auto flex-1">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {(selectedCar.media?.photos || []).map((photo, index) => (
                    <div key={photo} className="relative group aspect-w-1 aspect-h-1">
                        <img src={photo} alt={`Car photo ${index + 1}`} className="w-full h-full object-cover rounded-md" />
                        {canUpdate && (
                             <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-md">
                                <button
                                    type="button"
                                    onClick={() => handleDeletePhoto(index)}
                                    className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 focus:outline-none"
                                >
                                    <TrashIcon />
                                </button>
                            </div>
                        )}
                    </div>
                ))}
                 {isUploading && (
                    <div className="w-full h-full bg-gray-700 rounded-md flex items-center justify-center aspect-w-1 aspect-h-1 min-h-[100px]">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    </div>
                )}
            </div>
             {(!selectedCar.media?.photos || selectedCar.media.photos.length === 0) && !isUploading && (
                <p className="text-gray-500 text-center py-4">Фотографий нет.</p>
            )}
       </div>
    </div>
  );
};

export default CarMediaGallery;