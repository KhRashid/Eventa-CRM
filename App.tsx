import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import DataTable from './components/DataTable';
import DetailsPanel from './components/DetailsPanel';
import MediaGallery from './components/MediaGallery';
import { Venue, UserProfile, Role, Lookup, MenuItem, MenuPackage } from './types';
// FIX: import createData to handle new venue creation.
import { fetchData, getUserProfile, getRoles, getLookups, getMenuItems, getMenuPackages, createData } from './services/firebaseService';
import ArtistsPage from './components/ArtistsPage';
import CarsPage from './components/CarsPage';
import UsersPage from './components/UsersPage';
import RoleManagementPage from './components/RoleManagementPage';
import ProfilePage from './components/ProfilePage';
import LoginPage from './components/LoginPage';
import LookupsPage from './components/LookupsPage';
import MenuBuilderPage from './components/MenuBuilderPage';
import { auth } from './firebaseConfig';
import firebase from "firebase/compat/app";


const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPage, setCurrentPage] = useState('restaurants');
  const [user, setUser] = useState<firebase.User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userPermissions, setUserPermissions] = useState<Set<string>>(new Set());
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [lookups, setLookups] = useState<Lookup[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [menuPackages, setMenuPackages] = useState<MenuPackage[]>([]);


  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
        if (user) {
            setUser(user);
            try {
                const profile = await getUserProfile(user.uid);
                setUserProfile(profile);

                const [roles, lookupsData, items, packages] = await Promise.all([
                  getRoles(),
                  getLookups(),
                  getMenuItems(),
                  getMenuPackages()
                ]);

                setAllRoles(roles);
                setLookups(lookupsData);
                setMenuItems(items);
                setMenuPackages(packages);

                const assignedRoles = roles.filter(role => profile.roleIds?.includes(role.id));
                
                const permissions = new Set<string>();
                assignedRoles.forEach(role => {
                    role.permissions.forEach(p => permissions.add(p));
                });
                setUserPermissions(permissions);

            } catch (e) {
                console.error("Failed to load user data:", e);
                setError("Не удалось загрузить данные пользователя.");
                setUserPermissions(new Set());
            }
        } else {
            setUser(null);
            setUserProfile(null);
            setUserPermissions(new Set());
        }
        setAuthLoading(false);
    });
    return () => unsubscribe();
}, []);


  useEffect(() => {
    if (user && currentPage === 'restaurants' && userPermissions.has('restaurants:read')) {
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
    } else if (user && currentPage === 'restaurants') {
        setLoading(false);
        setError('У вас нет прав для просмотра этого раздела.');
        setVenues([]);
    }
  }, [currentPage, user, userPermissions]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    setSelectedVenue(null);
    setIsEditing(false);
  };

  const handleRowSelect = (venue: Venue) => {
    setSelectedVenue(venue);
    setIsEditing(false); // Exit edit mode when selecting a different row
  };
  
  const handleVenueUpdate = (updatedVenue: Venue) => {
      const updatedVenues = venues.map(v => v.id === updatedVenue.id ? updatedVenue : v);
      setVenues(updatedVenues);
      setSelectedVenue(updatedVenue);
      setIsEditing(false);
  };
  
  // FIX: Changed function signature to match what DataTable expects `() => void`.
  // The function now calls the `createData` service to create a new venue in the backend,
  // then updates the local state to reflect the change.
  const handleVenueCreate = async () => {
    try {
      const newVenue = await createData();
      const updatedVenues = [newVenue, ...venues];
      setVenues(updatedVenues);
      setSelectedVenue(newVenue);
      setIsEditing(true);
    } catch (err) {
      setError('Не удалось создать новый ресторан.');
      console.error(err);
    }
  };

  const handleVenueDelete = (venueId: string) => {
      const updatedVenues = venues.filter(v => v.id !== venueId);
      setVenues(updatedVenues);
      setSelectedVenue(null);
      setIsEditing(false);
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error("Ошибка выхода из системы:", error);
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'restaurants':
        return (
          <>
            <div className="w-2/3 flex flex-col space-y-6">
              <div className="h-3/5">
                <DataTable 
                  venues={venues}
                  loading={loading}
                  error={error}
                  onRowSelect={handleRowSelect} 
                  selectedVenueId={selectedVenue?.id ?? null} 
                  onVenueCreate={handleVenueCreate}
                  permissions={userPermissions}
                />
              </div>
              <div className="h-2/5">
                <MediaGallery venue={selectedVenue} onVenueUpdate={handleVenueUpdate} permissions={userPermissions} />
              </div>
            </div>
            <div className="w-1/3">
               <DetailsPanel 
                  venue={selectedVenue} 
                  onVenueUpdate={handleVenueUpdate}
                  onVenueDelete={handleVenueDelete}
                  isEditing={isEditing}
                  setIsEditing={setIsEditing}
                  permissions={userPermissions}
                  lookups={lookups}
                  allMenuPackages={menuPackages}
                  allMenuItems={menuItems}
                />
            </div>
          </>
        );
      case 'artists':
        return <ArtistsPage />;
      case 'cars':
        return <CarsPage />;
      case 'menu-builder':
        return <MenuBuilderPage 
                  permissions={userPermissions} 
                  menuItems={menuItems} 
                  setMenuItems={setMenuItems} 
                  menuPackages={menuPackages}
                  setMenuPackages={setMenuPackages}
                  lookups={lookups}
                />;
      case 'users':
        return <UsersPage permissions={userPermissions} />;
      case 'roles':
        return <RoleManagementPage permissions={userPermissions} />;
      case 'lookups':
        return <LookupsPage permissions={userPermissions} lookups={lookups} setLookups={setLookups} />;
      case 'profile':
        return <ProfilePage user={user!} userProfile={userProfile!} allRoles={allRoles} />;
      default:
        return <div className="text-center w-full">Выберите раздел</div>;
    }
  }

  if (authLoading) {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-gray-900 text-white">
            <p>Проверка сессии...</p>
        </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }


  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <Sidebar 
        isOpen={isSidebarOpen} 
        toggleSidebar={toggleSidebar} 
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        permissions={userPermissions}
        userName={userProfile?.displayName || ''}
      />
      <main className="flex-1 p-6 flex space-x-6 overflow-hidden">
        {renderPage()}
      </main>
    </div>
  );
};

export default App;
