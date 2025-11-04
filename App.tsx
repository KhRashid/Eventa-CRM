import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import DataTable from './components/DataTable';
import DetailsPanel from './components/DetailsPanel';
import MediaGallery from './components/MediaGallery';
import { Venue } from './types';
import { fetchData, updateData, createData, deleteData } from './services/firebaseService';
import ArtistsPage from './components/ArtistsPage';
import CarsPage from './components/CarsPage';

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPage, setCurrentPage] = useState('restaurants');

  useEffect(() => {
    if (currentPage === 'restaurants') {
      const getData = async () => {
        try {
          setLoading(true);
          const result = await fetchData();
          setVenues(result);
          setError(null);
        } catch (err) {
          setError('Не удалось загрузить данные.');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };

      getData();
    }
  }, [currentPage]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  const handleRowSelect = (venue: Venue) => {
    setSelectedVenue(venue);
    setIsEditing(false); // Exit edit mode when selecting a different row
  };

  const handleVenueUpdate = async (updatedVenue: Venue) => {
    try {
      const result = await updateData(updatedVenue);
      const updatedVenues = venues.map(v => v.id === result.id ? result : v);
      setVenues(updatedVenues);
      setSelectedVenue(result);
      setIsEditing(false); // Exit edit mode after saving
    } catch (error) {
      console.error("Failed to update venue:", error);
    }
  };

  const handleVenueCreate = async () => {
    try {
        const newVenue = await createData();
        const updatedVenues = [newVenue, ...venues];
        setVenues(updatedVenues);
        setSelectedVenue(newVenue);
        setIsEditing(true); // Enter edit mode for the new venue
    } catch (error) {
        console.error("Failed to create venue:", error);
    }
  };

  const handleVenueDelete = async (venueId: string) => {
    if (window.confirm("Вы уверены, что хотите удалить эту запись?")) {
        try {
            await deleteData(venueId);
            const updatedVenues = venues.filter(v => v.id !== venueId);
            setVenues(updatedVenues);
            setSelectedVenue(null);
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to delete venue:", error);
        }
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <Sidebar 
        isOpen={isSidebarOpen} 
        toggleSidebar={toggleSidebar} 
        currentPage={currentPage}
        onNavigate={handleNavigate}
      />
      <main className="flex-1 p-6 flex space-x-6 overflow-hidden">
        {currentPage === 'restaurants' && (
          <>
            <div className="w-2/3 flex flex-col space-y-6">
              <div className="h-3/5"> {/* 60% height */}
                <DataTable 
                  venues={venues}
                  loading={loading}
                  error={error}
                  onRowSelect={handleRowSelect} 
                  selectedVenueId={selectedVenue?.id ?? null} 
                  onVenueCreate={handleVenueCreate}
                />
              </div>
              <div className="h-2/5"> {/* 40% height */}
                <MediaGallery venue={selectedVenue} onVenueUpdate={handleVenueUpdate} />
              </div>
            </div>
            <div className="w-1/3">
               <DetailsPanel 
                  venue={selectedVenue} 
                  onVenueUpdate={handleVenueUpdate}
                  onVenueDelete={handleVenueDelete}
                  isEditing={isEditing}
                  setIsEditing={setIsEditing}
                />
            </div>
          </>
        )}
        {currentPage === 'artists' && <ArtistsPage />}
        {currentPage === 'cars' && <CarsPage />}
      </main>
    </div>
  );
};

export default App;