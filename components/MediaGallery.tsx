import React, { useState, useEffect, useRef } from 'react';
import { Venue } from '../types';
import { CloseIcon, ChevronLeftIcon, ChevronRightIcon, AddIcon, TrashIcon } from '../icons';
import { uploadFileToStorage } from '../services/firebaseService';

interface MediaGalleryProps {
  venue: Venue | null;
  onVenueUpdate: (venue: Venue) => void;
  permissions: Set<string>;
}

const MediaGallery: React.FC<MediaGalleryProps> = ({ venue, onVenueUpdate, permissions }) => {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const photos = venue?.media?.photos ?? [];
  const videos = venue?.media?.videos ?? [];
  
  const canUpdate = permissions.has('restaurants:update');

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>, fileType: 'photo' | 'video') => {
    const file = event.target.files?.[0];
    if (!file || !venue) return;

    setIsUploading(true);
    try {
        const downloadURL = await uploadFileToStorage(file);
        
        let updatedVenue: Venue;
        if (fileType === 'photo') {
            updatedVenue = {
                ...venue,
                media: {
                    ...venue.media,
                    photos: [...venue.media.photos, downloadURL],
                },
            };
        } else {
            updatedVenue = {
                ...venue,
                media: {
                    ...venue.media,
                    videos: [...venue.media.videos, downloadURL],
                },
            };
        }
        await onVenueUpdate(updatedVenue);
    } catch (error) {
        console.error(`Failed to upload ${fileType}:`, error);
        alert(`Не удалось загрузить ${fileType === 'photo' ? 'фото' : 'видео'}.`);
    } finally {
        setIsUploading(false);
        // Reset file input
        if (event.target) {
            event.target.value = '';
        }
    }
  };

  const handleDeletePhoto = (indexToDelete: number) => {
    if (venue && window.confirm("Вы уверены, что хотите удалить это фото?")) {
        const updatedPhotos = venue.media.photos.filter((_, index) => index !== indexToDelete);
        const updatedVenue = { ...venue, media: { ...venue.media, photos: updatedPhotos } };
        onVenueUpdate(updatedVenue);
    }
  };

  const handleDeleteVideo = (indexToDelete: number) => {
    if (venue && window.confirm("Вы уверены, что хотите удалить это видео?")) {
        const updatedVideos = venue.media.videos.filter((_, index) => index !== indexToDelete);
        const updatedVenue = { ...venue, media: { ...venue.media, videos: updatedVideos } };
        onVenueUpdate(updatedVenue);
    }
  };


  const openViewer = (index: number) => {
    setCurrentPhotoIndex(index);
    setIsViewerOpen(true);
  };

  const closeViewer = () => {
    setIsViewerOpen(false);
  };

  const goToPrevious = () => {
    setCurrentPhotoIndex(prevIndex => (prevIndex === 0 ? photos.length - 1 : prevIndex - 1));
  };

  const goToNext = () => {
    setCurrentPhotoIndex(prevIndex => (prevIndex === photos.length - 1 ? 0 : prevIndex + 1));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (!isViewerOpen) return;
        if (e.key === 'ArrowRight') goToNext();
        if (e.key === 'ArrowLeft') goToPrevious();
        if (e.key === 'Escape') closeViewer();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isViewerOpen, photos.length]);


  if (!venue) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 h-full flex items-center justify-center">
        <p className="text-gray-400">Выберите ресторан, чтобы посмотреть медиа.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg shadow overflow-hidden h-full flex flex-col">
       {canUpdate && (
         <>
           <input type="file" ref={photoInputRef} onChange={(e) => handleFileSelect(e, 'photo')} accept="image/*" style={{ display: 'none' }} />
           <input type="file" ref={videoInputRef} onChange={(e) => handleFileSelect(e, 'video')} accept="video/*" style={{ display: 'none' }} />
         </>
       )}

      <div className="p-4 border-b border-gray-700 flex justify-between items-center">
        <h3 className="text-lg font-bold">Медиа</h3>
        {canUpdate && (
            <div className="flex space-x-2">
                <button 
                    onClick={() => photoInputRef.current?.click()} 
                    disabled={isUploading}
                    className="flex items-center space-x-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs font-semibold transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
                >
                    {isUploading ? <span>Загрузка...</span> : <><AddIcon /><span>Фото</span></>}
                </button>
                <button 
                    onClick={() => videoInputRef.current?.click()} 
                    disabled={isUploading}
                    className="flex items-center space-x-1 px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-xs font-semibold transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
                >
                    {isUploading ? <span>Загрузка...</span> : <><AddIcon /><span>Видео</span></>}
                </button>
            </div>
        )}
      </div>

      <div className="p-4 overflow-y-auto flex-1">
        {(photos.length === 0 && videos.length === 0) && (
            <p className="text-gray-500">Медиафайлы отсутствуют.</p>
        )}
        {photos.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2 text-gray-300">Фото</h4>
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
              {photos.map((photo, index) => (
                <div key={index} className="relative group">
                    <img
                      src={photo}
                      alt={`Фото ${index + 1}`}
                      className="w-full h-24 object-cover rounded-md cursor-pointer group-hover:opacity-75 transition-opacity"
                      onClick={() => openViewer(index)}
                      loading="lazy"
                    />
                    {canUpdate && (
                        <button onClick={() => handleDeletePhoto(index)} className="absolute top-1 right-1 bg-black bg-opacity-60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600">
                            <TrashIcon />
                        </button>
                    )}
                </div>
              ))}
            </div>
          </div>
        )}
        {videos.length > 0 && (
            <div className="mt-4">
                <h4 className="font-semibold mb-2 text-gray-300">Видео</h4>
                <ul className="text-sm space-y-2">
                    {videos.map((video, index) => (
                        <li key={index} className="flex items-center justify-between group">
                            <a href={video} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline truncate pr-2">
                                Видео {index + 1}
                            </a>
                            {canUpdate && (
                                <button onClick={() => handleDeleteVideo(index)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <TrashIcon/>
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        )}
      </div>

      {isViewerOpen && photos.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center z-50 p-4 transition-opacity duration-300">
          <button onClick={closeViewer} className="absolute top-4 right-4 text-white hover:text-gray-300 z-50 p-2 bg-black bg-opacity-50 rounded-full">
            <CloseIcon />
          </button>
          
          <div className="relative w-full h-4/5 flex items-center justify-center">
             <button onClick={goToPrevious} className="absolute left-4 p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-75 z-50 transition-transform hover:scale-110">
                <ChevronLeftIcon />
             </button>
             <img src={photos[currentPhotoIndex]} alt={`Фото ${currentPhotoIndex + 1}`} className="max-h-full max-w-full object-contain rounded-lg shadow-2xl" />
             <button onClick={goToNext} className="absolute right-4 p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-75 z-50 transition-transform hover:scale-110">
                <ChevronRightIcon />
             </button>
          </div>

          <div className="w-full h-1/5 max-w-4xl mt-4 flex items-center justify-center overflow-x-auto space-x-2 p-2">
             {photos.map((photo, index) => (
                <img
                  key={index}
                  src={photo}
                  alt={`Миниатюра ${index + 1}`}
                  className={`h-16 w-auto object-cover rounded-md cursor-pointer transition-all duration-200 flex-shrink-0 ${
                    index === currentPhotoIndex ? 'border-2 border-blue-500 opacity-100 scale-105' : 'opacity-60 hover:opacity-100'
                  }`}
                  onClick={() => setCurrentPhotoIndex(index)}
                />
             ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaGallery;