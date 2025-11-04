import React from 'react';
import { HomeIcon, RestaurantIcon, ArtistIcon, CarIcon, UsersIcon, SettingsIcon, LogoutIcon, MenuIcon } from './icons';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  currentPage: string;
  onNavigate: (page: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar, currentPage, onNavigate }) => {
  const menuItems = [
    { icon: <HomeIcon />, name: 'Home', id: 'home' },
    { icon: <RestaurantIcon />, name: 'Restaurants', id: 'restaurants' },
    { icon: <ArtistIcon />, name: 'Artist', id: 'artists' },
    { icon: <CarIcon />, name: 'Cars', id: 'cars' },
    { icon: <UsersIcon />, name: 'Users', id: 'users' },
  ];

  const bottomItems = [
    { icon: <SettingsIcon />, name: 'Settings', id: 'settings' },
    { icon: <LogoutIcon />, name: 'Logout', id: 'logout' },
  ];
  
  const handleNavigationClick = (pageId: string) => {
    // Enable navigation only for existing pages
    if (['restaurants', 'artists', 'cars'].includes(pageId)) {
      onNavigate(pageId);
    } else {
      // Optionally, you can add a notification for non-implemented pages
      console.log(`Page "${pageId}" is not implemented yet.`);
    }
  };

  return (
    <div className={`bg-black h-full text-white flex flex-col transition-all duration-300 ease-in-out ${isOpen ? 'w-64' : 'w-20'}`}>
      <div className="flex items-center justify-center h-20 border-b border-gray-800">
        <button onClick={toggleSidebar} className="p-2 rounded-lg hover:bg-gray-800 focus:outline-none">
          <div className={`transition-transform duration-300 ease-in-out ${!isOpen ? 'rotate-90' : ''}`}>
            <MenuIcon />
          </div>
        </button>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-4">
        {menuItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => handleNavigationClick(item.id)}
            className={`w-full flex items-center p-3 rounded-lg transition-colors duration-200 text-left ${
                currentPage === item.id ? 'bg-blue-600' : 'hover:bg-gray-800'
            }`}
          >
            <div className="flex-shrink-0 w-6 h-6">{item.icon}</div>
            <span className={`ml-4 font-semibold transition-opacity duration-300 ${!isOpen && 'opacity-0 hidden'}`}>{item.name}</span>
          </button>
        ))}
      </nav>

      <div className="px-4 py-6 border-t border-gray-800 space-y-4">
        {bottomItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => handleNavigationClick(item.id)}
            className={`w-full flex items-center p-3 rounded-lg transition-colors duration-200 text-left ${
                currentPage === item.id ? 'bg-blue-600' : 'hover:bg-gray-800'
            }`}
          >
            <div className="flex-shrink-0 w-6 h-6">{item.icon}</div>
            <span className={`ml-4 font-semibold transition-opacity duration-300 ${!isOpen && 'opacity-0 hidden'}`}>{item.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;