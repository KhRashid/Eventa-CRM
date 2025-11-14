import React, { useState } from 'react';
import { CarProvider, Car } from '../types';
import * as api from '../services/firebaseService';
import CarProvidersDataTable from './CarProvidersDataTable';
import CarProviderDetailsPanel from './CarProviderDetailsPanel';
import ProviderCarsList from './ProviderCarsList';

interface CarsPageProps {
    permissions: Set<string>;
    carProviders: CarProvider[];
    setCarProviders: React.Dispatch<React.SetStateAction<CarProvider[]>>;
}

const CarsPage: React.FC<CarsPageProps> = ({ permissions, carProviders, setCarProviders }) => {
    const [selectedProvider, setSelectedProvider] = useState<CarProvider | null>(null);
    const [providerCars, setProviderCars] = useState<Car[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [carsLoading, setCarsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    const handleRowSelect = async (provider: CarProvider) => {
        if (selectedProvider?.id === provider.id) return;

        setSelectedProvider(provider);
        setIsEditing(false);
        setCarsLoading(true);
        setError(null);
        setProviderCars([]);

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
            setIsEditing(true);
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
        setIsEditing(false);
    };

    const handleProviderDelete = (providerId: string) => {
        setCarProviders(prev => prev.filter(p => p.id !== providerId));
        setSelectedProvider(null);
        setProviderCars([]);
        setIsEditing(false);
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
                />
              </div>
            </div>
            <div className="w-1/3">
               <CarProviderDetailsPanel
                  provider={selectedProvider}
                  permissions={permissions}
                  isEditing={isEditing}
                  setIsEditing={setIsEditing}
                  onProviderUpdate={handleProviderUpdate}
                  onProviderDelete={handleProviderDelete}
                  carsCount={providerCars.length}
                />
            </div>
        </>
    );
};

export default CarsPage;