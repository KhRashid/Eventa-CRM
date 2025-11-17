import React from 'react';
import { Car, CarProvider } from '../types';
import { AddIcon, EditIcon, TrashIcon } from '../icons';

interface ProviderCarsListProps {
  provider: CarProvider | null;
  cars: Car[];
  loading: boolean;
  error: string | null;
  permissions: Set<string>;
  onCarCreate: () => void;
  onCarUpdate: (car: Car) => void;
  onCarDelete: (carId: string) => void;
  onCarSelect: (car: Car) => void;
  selectedCarId: string | undefined | null;
}

const CarCard: React.FC<{ car: Car; onUpdate: () => void; onDelete: () => void; onSelect: () => void; selected: boolean; canUpdate: boolean; canDelete: boolean; }> = 
({ car, onUpdate, onDelete, onSelect, selected, canUpdate, canDelete }) => {
    return (
        <button 
            onClick={onSelect}
            className={`w-full bg-gray-900 rounded-lg shadow-md overflow-hidden flex group relative text-left transition-all duration-200 ${selected ? 'ring-2 ring-blue-500' : 'ring-1 ring-gray-700 hover:ring-gray-600'}`}
        >
            <div className="p-4 flex flex-col justify-between flex-1">
                <div>
                    <h3 className="text-lg font-bold text-white">{car.brand} {car.model} <span className="text-gray-400 font-normal">({car.year})</span></h3>
                    <p className="text-sm text-blue-400 capitalize">{car.class}</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-300">
                        <span className="bg-gray-700 px-2 py-1 rounded-full">{car.seats} мест</span>
                        <span className="bg-gray-700 px-2 py-1 rounded-full">{car.color}</span>
                        <span className="bg-gray-700 px-2 py-1 rounded-full">{car.body_type}</span>
                    </div>
                </div>
                 <div className="mt-3">
                    <p className="text-md font-semibold text-green-400">
                        {car.pricing.price?.base || 'N/A'} {car.pricing.currency} / {car.pricing.mode === 'hourly' ? 'час' : 'день'}
                    </p>
                </div>
            </div>
             <div className="absolute top-2 right-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 bg-opacity-70 p-1 rounded-md z-10">
                {canUpdate && <button type="button" onClick={(e) => { e.stopPropagation(); onUpdate(); }} className="p-1 text-blue-400 hover:text-blue-300"><EditIcon /></button>}
                {canDelete && <button type="button" onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1 text-red-500 hover:text-red-400"><TrashIcon /></button>}
            </div>
        </button>
    );
};

const ProviderCarsList: React.FC<ProviderCarsListProps> = ({ provider, cars, loading, error, permissions, onCarCreate, onCarUpdate, onCarDelete, onCarSelect, selectedCarId }) => {

  if (!provider) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 h-full flex items-center justify-center">
        <p className="text-gray-400">Выберите поставщика, чтобы посмотреть его автопарк.</p>
      </div>
    );
  }
  
  const canCreate = permissions.has('cars:create');
  const canUpdate = permissions.has('cars:update');
  const canDelete = permissions.has('cars:delete');

  return (
    <div className="bg-gray-800 rounded-lg shadow overflow-hidden h-full flex flex-col">
       <div className="p-4 border-b border-gray-700 flex justify-between items-center">
            <h3 className="text-lg font-bold">Автопарк ({cars.length})</h3>
            {canCreate && (
                 <button
                    onClick={onCarCreate}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 px-3 rounded-md transition-colors text-sm"
                    >
                    <AddIcon />
                    <span>Добавить авто</span>
                </button>
            )}
       </div>
       <div className="p-4 overflow-y-auto flex-1">
            {loading && <p className="text-center text-gray-400">Загрузка автомобилей...</p>}
            {error && <p className="text-center text-red-500">{error}</p>}
            {!loading && !error && (
                cars.length > 0 ? (
                    <div className="space-y-4">
                        {cars.map(car => <CarCard 
                                            key={car.id} 
                                            car={car}
                                            onSelect={() => onCarSelect(car)}
                                            selected={car.id === selectedCarId}
                                            onUpdate={() => onCarUpdate(car)}
                                            onDelete={() => onCarDelete(car.id)}
                                            canUpdate={canUpdate}
                                            canDelete={canDelete}
                                        />)}
                    </div>
                ) : (
                    <p className="text-gray-500">У этого поставщика нет автомобилей.</p>
                )
            )}
       </div>
    </div>
  );
};

export default ProviderCarsList;