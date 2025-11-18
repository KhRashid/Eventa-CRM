import React, { useState } from 'react';
import { CarProvider, Car, Lookup } from '../types';
import * as api from '../services/firebaseService';
import CarProvidersDataTable from './CarProvidersDataTable';
import CarProviderDetailsPanel from './CarProviderDetailsPanel';
import ProviderCarsList from './ProviderCarsList';
import CarFormModal from './CarFormModal';
import CarMediaGallery from './CarMediaGallery';

interface CarsPageProps {
    permissions: Set<string>;
    carProviders: CarProvider[];
    setCarProviders: React.Dispatch<React.SetStateAction<CarProvider[]>>;
    lookups: Lookup[];
}

const CarsPage: React.FC<CarsPageProps> = ({ permissions, carProviders, setCarProviders, lookups }) => {
    const [selectedProvider, setSelectedProvider] = useState<CarProvider | null>(null);
    const [providerCars, setProviderCars] = useState<Car[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [carsLoading, setCarsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isEditingProvider, setIsEditingProvider] = useState(false);

    // State for Car Modal
    const [isCarModalOpen, setIsCarModalOpen] = useState(false);
    const [editingCar, setEditingCar] = useState<Car | null>(null);
    const [selectedCar, setSelectedCar] = useState<Car | null>(null);


    const handleRowSelect = async (provider: CarProvider) => {
        if (selectedProvider?.id === provider.id) return;

        setSelectedProvider(provider);
        setIsEditingProvider(false);
        setError(null);
        setProviderCars([]);
        setSelectedCar(null);
        setCarsLoading(true);
        try {
            const cars = await api.getProviderCars(provider.id);
            setProviderCars(cars);
        } catch (err) {
            console.error(err);
            setError('Не удалось загрузить список автомобилей для этого поставщика.');
        } finally {
            setCarsLoading(false);
        }
    };

    const handleProviderCreate = async () => {
        try {
            setLoading(true);
            const newProvider = await api.createCarProvider();
            setCarProviders(prev => [newProvider, ...prev]);
            setSelectedProvider(newProvider);
            setProviderCars([]);
            setSelectedCar(null);
            setIsEditingProvider(true);
        } catch (err) {
            setError('Не удалось создать нового поставщика.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    
    const handleProviderUpdate = (updatedProvider: CarProvider) => {
        setCarProviders(prev => prev.map(p => p.id === updatedProvider.id ? updatedProvider : p));
        setSelectedProvider(updatedProvider);
        setIsEditingProvider(false);
    };

    const handleProviderDelete = (providerId: string) => {
        setCarProviders(prev => prev.filter(p => p.id !== providerId));
        setSelectedProvider(null);
        setProviderCars([]);
        setSelectedCar(null);
        setIsEditingProvider(false);
    };

    // --- Car CRUD Handlers ---
    const handleCarCreate = () => {
        setEditingCar(null);
        setIsCarModalOpen(true);
    };
    
    const handleCarUpdate = (car: Car) => {
        setEditingCar(car);
        setIsCarModalOpen(true);
    };

    const handleCarDelete = async (carId: string) => {
        if (window.confirm('Вы уверены, что хотите удалить этот автомобиль?')) {
            try {
                await api.deleteCar(carId);
                setProviderCars(prev => prev.filter(c => c.id !== carId));
                if (selectedCar?.id === carId) {
                    setSelectedCar(null);
                }
            } catch (err) {
                console.error(err);
                setError('Не удалось удалить автомобиль.');
            }
        }
    };

    const handleSaveCar = async (carData: Omit<Car, 'id'> | Car) => {
        if (!selectedProvider) return;
        try {
            if ('id' in carData && carData.id) {
                const updatedCar = await api.updateCar(carData);
                setProviderCars(prev => prev.map(c => c.id === updatedCar.id ? updatedCar : c));
                if (selectedCar?.id === updatedCar.id) {
                    setSelectedCar(updatedCar);
                }
            } else {
                const { id, ...dataForCreation } = carData as Car;
                const newCar = await api.createCar(selectedProvider.id, selectedProvider.name, dataForCreation);
                setProviderCars(prev => [newCar, ...prev]);
            }
            setIsCarModalOpen(false);
            setEditingCar(null);
        } catch (err) {
            console.error(err);
            setError('Не удалось сохранить автомобиль.');
        }
    };

    const handleCarUpdateFromGallery = (updatedCar: Car) => {
        setProviderCars(prev => prev.map(c => c.id === updatedCar.id ? updatedCar : c));
        setSelectedCar(updatedCar);
    };


    if (!permissions.has('cars:read')) {
        return <div className="p-4 text-center text-red-500 bg-red-900 bg-opacity-30 rounded-md w-full">У вас нет прав для просмотра этого раздела.</div>;
    }

    return (
        <>
            <div className="w-2/3 flex flex-col space-y-6">
              <div className="h-3/5">
                <CarProvidersDataTable
                  providers={carProviders}
                  loading={loading}
                  error={error}
                  onRowSelect={handleRowSelect} 
                  selectedProviderId={selectedProvider?.id ?? null} 
                  permissions={permissions}
                  onProviderCreate={handleProviderCreate}
                />
              </div>
              <div className="h-2/5">
                <ProviderCarsList
                    provider={selectedProvider}
                    cars={providerCars}
                    loading={carsLoading}
                    error={error}
                    permissions={permissions}
                    onCarCreate={handleCarCreate}
                    onCarUpdate={handleCarUpdate}
                    onCarDelete={handleCarDelete}
                    onCarSelect={setSelectedCar}
                    selectedCarId={selectedCar?.id}
                />
              </div>
            </div>
            <div className="w-1/3 flex flex-col space-y-6">
                <div className="h-3/5">
                   <CarProviderDetailsPanel
                      provider={selectedProvider}
                      permissions={permissions}
                      isEditing={isEditingProvider}
                      setIsEditing={setIsEditingProvider}
                      onProviderUpdate={handleProviderUpdate}
                      onProviderDelete={handleProviderDelete}
                      carsCount={providerCars.length}
                      lookups={lookups}
                    />
                </div>
                 <div className="h-2/5">
                    <CarMediaGallery
                        selectedCar={selectedCar}
                        onCarUpdate={handleCarUpdateFromGallery}
                        permissions={permissions}
                    />
                </div>
            </div>

            {isCarModalOpen && selectedProvider && (
                <CarFormModal
                    isOpen={isCarModalOpen}
                    onClose={() => setIsCarModalOpen(false)}
                    onSave={handleSaveCar}
                    car={editingCar}
                    providerId={selectedProvider.id}
                    providerName={selectedProvider.name}
                    lookups={lookups}
                />
            )}
        </>
    );
};

export default CarsPage;