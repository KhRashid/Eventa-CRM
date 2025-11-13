import React, { useState } from 'react';
import { Lookup, PricingPackage, Repertoire, Singer, Song } from '../types';
import SingersDataTable from './SingersDataTable';
import SingerDetailsPanel from './SingerDetailsPanel';
import SingerMediaGallery from './SingerMediaGallery';
import * as api from '../services/firebaseService';

interface ArtistsPageProps {
    permissions: Set<string>;
    singers: Singer[];
    setSingers: React.Dispatch<React.SetStateAction<Singer[]>>;
    lookups: Lookup[];
    allSongs: Song[];
    allRepertoires: Repertoire[];
}

const ArtistsPage: React.FC<ArtistsPageProps> = ({ permissions, singers, setSingers, lookups, allSongs, allRepertoires }) => {
    const [selectedSinger, setSelectedSinger] = useState<Singer | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [detailsLoading, setDetailsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [pricingPackages, setPricingPackages] = useState<PricingPackage[]>([]);

    const handleRowSelect = async (singer: Singer) => {
        if (selectedSinger?.id === singer.id) return;
        setSelectedSinger(singer);
        setIsEditing(false);
        setDetailsLoading(true);
        setError(null);
        setPricingPackages([]);
        try {
            const packages = await api.getSingerPricingPackages(singer.id);
            setPricingPackages(packages);
        } catch (err) {
            console.error(err);
            setError('Не удалось загрузить детали для артиста.');
        } finally {
            setDetailsLoading(false);
        }
    };

    const handleSingerCreate = async () => {
        try {
            setLoading(true);
            const newSinger = await api.createSinger();
            setSingers(prev => [newSinger, ...prev]);
            setSelectedSinger(newSinger);
            setPricingPackages([]);
            setIsEditing(true);
        } catch (err) {
            setError('Не удалось создать нового артиста.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSingerUpdate = (updatedSinger: Singer) => {
        setSingers(prev => prev.map(s => s.id === updatedSinger.id ? updatedSinger : s));
        setSelectedSinger(updatedSinger);
        setIsEditing(false);
    };

    const handleSingerDelete = (singerId: string) => {
        setSingers(prev => prev.filter(s => s.id !== singerId));
        setSelectedSinger(null);
        setPricingPackages([]);
        setIsEditing(false);
    };

    const handleSavePackage = async (singerId: string, pkg: Omit<PricingPackage, 'id'> | PricingPackage) => {
        if ('id' in pkg) {
            await api.updatePricingPackage(singerId, pkg);
            setPricingPackages(prev => prev.map(p => p.id === pkg.id ? pkg : p));
        } else {
            const newPkg = await api.createPricingPackage(singerId, pkg);
            setPricingPackages(prev => [...prev, newPkg]);
        }
    };

    const handleDeletePackage = async (singerId: string, packageId: string) => {
        await api.deletePricingPackage(singerId, packageId);
        setPricingPackages(prev => prev.filter(p => p.id !== packageId));
    };

    if (!permissions.has('artists:read')) {
        return <div className="p-4 text-center text-red-500 bg-red-900 bg-opacity-30 rounded-md w-full">У вас нет прав для просмотра этого раздела.</div>;
    }

    return (
        <>
            <div className="w-2/3 flex flex-col space-y-6">
              <div className="h-3/5">
                <SingersDataTable 
                  singers={singers}
                  loading={loading}
                  error={error}
                  onRowSelect={handleRowSelect} 
                  selectedSingerId={selectedSinger?.id ?? null} 
                  permissions={permissions}
                  onSingerCreate={handleSingerCreate}
                />
              </div>
              <div className="h-2/5">
                <SingerMediaGallery singer={selectedSinger} permissions={permissions} onSingerUpdate={handleSingerUpdate} />
              </div>
            </div>
            <div className="w-1/3">
               <SingerDetailsPanel 
                  singer={selectedSinger} 
                  permissions={permissions}
                  isEditing={isEditing}
                  setIsEditing={setIsEditing}
                  onSingerUpdate={handleSingerUpdate}
                  onSingerDelete={handleSingerDelete}
                  lookups={lookups}
                  pricingPackages={pricingPackages}
                  onSavePackage={handleSavePackage}
                  onDeletePackage={handleDeletePackage}
                  detailsLoading={detailsLoading}
                  allRepertoires={allRepertoires}
                  allSongs={allSongs}
                />
            </div>
        </>
    );
};

export default ArtistsPage;