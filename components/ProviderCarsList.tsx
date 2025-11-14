import React from 'react';
import { Car, CarProvider } from '../types';

interface ProviderCarsListProps {
  provider: CarProvider | null;
  cars: Car[];
  loading: boolean;
  error: string | null;
  permissions: Set<string>;
}

const CarCard: React.FC<{ car: Car }> = ({ car }) => {
    const mainPhoto = car.media.photos[0] || 'https://via.placeholder.com/300x200?text=No+Image';

    return (
        <div className="bg-gray-900 rounded-lg shadow-md overflow-hidden flex flex-col md:flex-row">
            <img src={mainPhoto} alt={`${car.brand} ${car.model}`} className="w-full md:w-48 h-32 md:h-auto object-cover" />
            <div className="p-4 flex flex-col justify-between">
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
        </div>
    );
};

const ProviderCarsList: React.FC<ProviderCarsListProps> = ({ provider, cars, loading, error, permissions }) => {

  if (!provider) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 h-full flex items-center justify-center">
        <p className="text-gray-400">Выберите поставщика, чтобы посмотреть его автопарк.</p>
      </div>
    );
  }
  
  const canUpdate = permissions.has('cars:update');

  return (
    <div className="bg-gray-800 rounded-lg shadow overflow-hidden h-full flex flex-col">
       <div className="p-4 border-b border-gray-700 flex justify-between items-center">
            <h3 className="text-lg font-bold">Автопарк ({cars.length})</h3>
            {/* Future Add Car Button */}
       </div>
       <div className="p-4 overflow-y-auto flex-1">
            {loading && <p className="text-center text-gray-400">Загрузка автомобилей...</p>}
            {error && <p className="text-center text-red-500">{error}</p>}
            {!loading && !error && (
                cars.length > 0 ? (
                    <div className="space-y-4">
                        {cars.map(car => <CarCard key={car.id} car={car} />)}
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
