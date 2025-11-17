import React, { useState, useMemo } from 'react';
import { Lookup, MenuItem, MenuPackage } from '../types';
import { AddIcon, EditIcon, TrashIcon, SearchIcon } from '../icons';
import * as api from '../services/firebaseService';
import MenuItemModal from './MenuItemModal';
import MenuPackageModal from './MenuPackageModal';

interface MenuBuilderPageProps {
    permissions: Set<string>;
    menuItems: MenuItem[];
    setMenuItems: React.Dispatch<React.SetStateAction<MenuItem[]>>;
    menuPackages: MenuPackage[];
    setMenuPackages: React.Dispatch<React.SetStateAction<MenuPackage[]>>;
    lookups: Lookup[];
}

type ActiveTab = 'items' | 'packages';

const MenuBuilderPage: React.FC<MenuBuilderPageProps> = ({ permissions, menuItems, setMenuItems, menuPackages, setMenuPackages, lookups }) => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('items');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Items state
    const [isItemModalOpen, setIsItemModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<MenuItem | null>(null);

    // Packages state
    const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
    const [currentPackage, setCurrentPackage] = useState<MenuPackage | null>(null);

    const canReadCatalog = permissions.has('menu-catalog:read');
    const canCreateCatalog = permissions.has('menu-catalog:create');
    const canUpdateCatalog = permissions.has('menu-catalog:update');
    const canDeleteCatalog = permissions.has('menu-catalog:delete');
    
    const canReadPackages = permissions.has('menu-packages:read');
    const canCreatePackages = permissions.has('menu-packages:create');
    const canUpdatePackages = permissions.has('menu-packages:update');
    const canDeletePackages = permissions.has('menu-packages:delete');

    const groupedMenuItems = useMemo(() => {
        return menuItems.reduce((acc, item) => {
            const category = item.category || 'Uncategorized';
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(item);
            return acc;
        }, {} as Record<string, MenuItem[]>);
    }, [menuItems]);
    
    // --- Item Handlers ---
    const handleSaveItem = async (itemData: Omit<MenuItem, 'id'> | MenuItem) => {
        try {
            setLoading(true);
            if ('id' in itemData) {
                await api.updateMenuItem(itemData as MenuItem);
                setMenuItems(prev => prev.map(i => i.id === itemData.id ? itemData as MenuItem : i));
            } else {
                const newItem = await api.createMenuItem(itemData as Omit<MenuItem, 'id'>);
                setMenuItems(prev => [...prev, newItem]);
            }
            setIsItemModalOpen(false);
        } catch (err) { setError('Failed to save menu item.'); } finally { setLoading(false); }
    };

    const handleDeleteItem = async (itemId: string) => {
        if (window.confirm('Are you sure? This will also remove the item from all packages.')) {
            try {
                setLoading(true);
                await api.deleteMenuItem(itemId);
                setMenuItems(prev => prev.filter(i => i.id !== itemId));
                // Also update packages in the state
                setMenuPackages(prev => prev.map(p => ({
                    ...p,
                    itemIds: p.itemIds.filter(id => id !== itemId)
                })));
            } catch (err) { setError('Failed to delete menu item.'); } finally { setLoading(false); }
        }
    };

    // --- Package Handlers ---
    const handleSavePackage = async (pkgData: Omit<MenuPackage, 'id'> | MenuPackage) => {
        try {
            setLoading(true);
            if ('id' in pkgData) {
                await api.updateMenuPackage(pkgData as MenuPackage);
                setMenuPackages(prev => prev.map(p => p.id === pkgData.id ? pkgData as MenuPackage : p));
            } else {
                const newPkg = await api.createMenuPackage(pkgData as Omit<MenuPackage, 'id'>);
                setMenuPackages(prev => [...prev, newPkg]);
            }
            setIsPackageModalOpen(false);
        } catch (err) { setError('Failed to save menu package.'); } finally { setLoading(false); }
    };
    
    const handleDeletePackage = async (packageId: string) => {
        if (window.confirm('Are you sure? This will not delete the items within the package.')) {
            try {
                setLoading(true);
                await api.deleteMenuPackage(packageId);
                setMenuPackages(prev => prev.filter(p => p.id !== packageId));
            } catch (err) { setError('Failed to delete menu package.'); } finally { setLoading(false); }
        }
    };


    const renderItemsContent = () => {
        if (!canReadCatalog) return <p className="text-red-500">You do not have permission to view the menu catalog.</p>;
        return (
            <div>
                 <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Каталог блюд</h2>
                    {canCreateCatalog && <button onClick={() => { setCurrentItem(null); setIsItemModalOpen(true); }} className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md"><AddIcon /><span>Добавить</span></button>}
                </div>
                <div className="space-y-6">
                    {/* FIX: Explicitly type `items` as `MenuItem[]` to fix type inference issue. */}
                    {Object.entries(groupedMenuItems).sort(([catA], [catB]) => catA.localeCompare(catB)).map(([category, items]: [string, MenuItem[]]) => (
                        <div key={category}>
                            <h3 className="text-xl font-semibold text-blue-400 border-b border-gray-700 pb-2 mb-3">{category}</h3>
                            <ul className="space-y-2">
                                {items.map(item => (
                                    <li key={item.id} className="bg-gray-900 p-3 rounded-md flex justify-between items-center group">
                                        <div>
                                            <span className="font-semibold">{item.name}</span>
                                            <p className="text-xs text-gray-400">{item.portion_size}</p>
                                        </div>
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100">
                                            {canUpdateCatalog && <button onClick={() => { setCurrentItem(item); setIsItemModalOpen(true); }} className="text-blue-400"><EditIcon /></button>}
                                            {canDeleteCatalog && <button onClick={() => handleDeleteItem(item.id)} className="text-red-500"><TrashIcon /></button>}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderPackagesContent = () => {
        if (!canReadPackages) return <p className="text-red-500">You do not have permission to view menu packages.</p>;
        return (
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Пакеты меню</h2>
                    {canCreatePackages && <button onClick={() => { setCurrentPackage(null); setIsPackageModalOpen(true); }} className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md"><AddIcon /><span>Создать пакет</span></button>}
                </div>
                 <div className="space-y-4">
                     {menuPackages.map((pkg: MenuPackage) => (
                         <div key={pkg.id} className="bg-gray-900 p-4 rounded-md group">
                             <div className="flex justify-between items-center">
                                 <div>
                                     <h3 className="font-bold text-lg">{pkg.name}</h3>
                                     <p className="text-blue-400 font-semibold">{pkg.price_azn} AZN/чел.</p>
                                 </div>
                                 <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100">
                                    {canUpdatePackages && <button onClick={() => { setCurrentPackage(pkg); setIsPackageModalOpen(true); }} className="text-blue-400"><EditIcon /></button>}
                                    {canDeletePackages && <button onClick={() => handleDeletePackage(pkg.id)} className="text-red-500"><TrashIcon /></button>}
                                </div>
                             </div>
                             <ul className="list-disc list-inside text-sm text-gray-300 mt-2 pl-2 columns-2 md:columns-3">
                                {(pkg.itemIds || []).map(id => {
                                    const item = menuItems.find(i => i.id === id);
                                    return item ? <li key={id}>{item.name}</li> : null;
                                })}
                             </ul>
                         </div>
                     ))}
                 </div>
            </div>
        );
    };

    return (
        <div className="w-full h-full flex flex-col text-white">
            <h1 className="text-3xl font-bold text-blue-400 mb-6">Конструктор меню</h1>

            <div className="mb-6 border-b border-gray-700">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <button onClick={() => setActiveTab('items')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'items' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:border-gray-500'}`}>Каталог блюд</button>
                    <button onClick={() => setActiveTab('packages')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'packages' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:border-gray-500'}`}>Пакеты меню</button>
                </nav>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2">
                {error && <p className="text-red-500 bg-red-900 bg-opacity-30 p-3 rounded-md mb-4">{error}</p>}
                {loading && <p>Loading...</p>}
                {activeTab === 'items' ? renderItemsContent() : renderPackagesContent()}
            </div>
            
            {isItemModalOpen && (
                <MenuItemModal isOpen={isItemModalOpen} onClose={() => setIsItemModalOpen(false)} onSave={handleSaveItem} item={currentItem} lookups={lookups} />
            )}
            {isPackageModalOpen && (
                <MenuPackageModal isOpen={isPackageModalOpen} onClose={() => setIsPackageModalOpen(false)} onSave={handleSavePackage} pkg={currentPackage} allItems={menuItems} />
            )}
        </div>
    );
};

export default MenuBuilderPage;