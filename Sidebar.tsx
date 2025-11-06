import React, { useState } from 'react';
import { HomeIcon, RestaurantIcon, ArtistIcon, CarIcon, UsersIcon, SettingsIcon, LogoutIcon, MenuIcon, ProfileIcon, RoleManagementIcon, ChevronDownIcon, ChevronLeftIcon } from './icons';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  permissions: Set<string>;
  userName: string;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar, currentPage, onNavigate, onLogout, permissions, userName }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const menuItems = [
    { icon: <HomeIcon />, name: 'Home', id: 'home' },
    { icon: <RestaurantIcon />, name: 'Restaurants', id: 'restaurants' },
    { icon: <ArtistIcon />, name: 'Artist', id: 'artists' },
    { icon: <CarIcon />, name: 'Cars', id: 'cars' },
  ];
  
  const settingsSubMenuItems = [
      { icon: <RoleManagementIcon />, name: 'Role Management', id: 'roles', permission: 'roles:read' },
      { icon: <UsersIcon />, name: 'Users', id: 'users', permission: 'users:read' },
      // TODO: Replace with a proper icon
      { icon: <SettingsIcon />, name: 'Lookups', id: 'lookups', permission: 'lookups:read' },
  ]

  const bottomItems = [
    { icon: <ProfileIcon />, name: 'Profile', id: 'profile' },
    { icon: <LogoutIcon />, name: 'Logout', id: 'logout' },
  ];
  
  const handleNavigationClick = (pageId: string) => {
      onNavigate(pageId);
  };
  
  const isSettingsActive = currentPage === 'users' || currentPage === 'roles' || currentPage === 'lookups';
  const canViewSettings = permissions.has('users:read') || permissions.has('roles:read') || permissions.has('lookups:read');

  return (
    <div className={`bg-black h-full text-white flex flex-col transition-all duration-300 ease-in-out ${isOpen ? 'w-64' : 'w-20'}`}>
      <div className={`flex items-center h-20 border-b border-gray-800 px-4 transition-all duration-300 ${isOpen ? 'justify-between' : 'justify-center'}`}>
        {isOpen && (
            <h2 className="text-lg font-bold text-white truncate" title={userName}>
                {userName}
            </h2>
        )}
        <button onClick={toggleSidebar} className="p-2 rounded-lg hover:bg-gray-800 focus:outline-none">
            {isOpen ? <ChevronLeftIcon /> : <MenuIcon />}
        </button>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
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
        
        {/* Settings Dropdown */}
        {canViewSettings && (
            <div>
                <button
                    type="button"
                    onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors duration-200 text-left ${
                        isSettingsActive ? 'bg-blue-600' : 'hover:bg-gray-800'
                    }`}
                >
                    <div className="flex items-center">
                        <div className="flex-shrink-0 w-6 h-6"><SettingsIcon /></div>
                        <span className={`ml-4 font-semibold transition-opacity duration-300 ${!isOpen && 'opacity-0 hidden'}`}>Settings</span>
                    </div>
                    {isOpen && (
                        <span className={`transition-transform duration-300 ${isSettingsOpen ? 'rotate-180' : ''}`}>
                            <ChevronDownIcon />
                        </span>
                    )}
                </button>
                {isSettingsOpen && isOpen && (
                    <div className="mt-2 pl-8 space-y-2">
                         {settingsSubMenuItems.map((item) => (
                            permissions.has(item.permission) && (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => handleNavigationClick(item.id)}
                                    className={`w-full flex items-center p-2 rounded-lg transition-colors duration-200 text-left text-sm ${
                                        currentPage === item.id ? 'bg-blue-600' : 'hover:bg-gray-800'
                                    }`}
                                >
                                    <div className="flex-shrink-0 w-5 h-5">{item.icon}</div>
                                    <span className="ml-3 font-medium">{item.name}</span>
                                </button>
                            )
                         ))}
                    </div>
                )}
            </div>
        )}
      </nav>

      <div className="px-4 py-6 border-t border-gray-800 space-y-4">
        {bottomItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => (item.id === 'logout' ? onLogout() : handleNavigationClick(item.id))}
            className={`w-full flex items-center p-3 rounded-lg transition-colors duration-200 text-left ${
                (currentPage === item.id && item.id !== 'logout') ? 'bg-blue-600' : 'hover:bg-gray-800'
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