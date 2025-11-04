import React, { useState, useMemo } from 'react';
import { SearchIcon, AddIcon, ArrowUpIcon, ArrowDownIcon } from '../icons';
import { Venue } from '../types';

interface DataTableProps {
  venues: Venue[];
  loading: boolean;
  error: string | null;
  onRowSelect: (venue: Venue) => void;
  selectedVenueId: string | null;
  onVenueCreate: () => void;
}

type SortableKeys = keyof Pick<Venue, 'id' | 'name' | 'created_at'>;

const DataTable: React.FC<DataTableProps> = ({ venues, loading, error, onRowSelect, selectedVenueId, onVenueCreate }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortConfig, setSortConfig] = useState<{ key: SortableKeys; direction: 'ascending' | 'descending' } | null>(null);

  const handleRowClick = (venue: Venue) => {
    onRowSelect(venue);
  };
  
  const requestSort = (key: SortableKeys) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
        direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedAndFilteredData = useMemo(() => {
    let filteredItems = venues.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortConfig !== null) {
        filteredItems.sort((a, b) => {
            const key = sortConfig.key;
            let comparison = 0;

            if (key === 'created_at') {
                comparison = new Date(a[key]).getTime() - new Date(b[key]).getTime();
            } else {
                comparison = a[key].localeCompare(b[key], 'ru', { sensitivity: 'base' });
            }

            return sortConfig.direction === 'ascending' ? comparison : -comparison;
        });
    }

    return filteredItems;
  }, [venues, searchTerm, sortConfig]);


  if (loading) {
    return <div className="text-center p-10 bg-gray-800 rounded-lg shadow h-full flex items-center justify-center">Загрузка данных...</div>;
  }

  if (error) {
    return <div className="text-center p-10 text-red-500 bg-gray-800 rounded-lg shadow h-full flex items-center justify-center">{error}</div>;
  }

  const SortIndicator: React.FC<{ columnKey: SortableKeys }> = ({ columnKey }) => {
    if (!sortConfig || sortConfig.key !== columnKey) return null;
    return sortConfig.direction === 'ascending' ? <ArrowUpIcon /> : <ArrowDownIcon />;
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow overflow-hidden h-full flex flex-col">
      <div className="p-4 border-b border-gray-700 flex justify-between items-center gap-4">
        <h2 className="text-xl font-bold">Рестораны</h2>
        <div className="relative flex-grow">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <SearchIcon />
          </span>
          <input
            type="text"
            placeholder="Поиск по имени..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            aria-label="Поиск по имени"
          />
        </div>
         <button 
            onClick={onVenueCreate} 
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-semibold transition-colors flex-shrink-0"
         >
            <AddIcon />
            <span>Добавить ресторан</span>
        </button>
      </div>
      <div className="overflow-y-auto flex-1">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-700 sticky top-0 z-10">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer select-none" onClick={() => requestSort('id')}>
                <div className="flex items-center">ID <SortIndicator columnKey="id" /></div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer select-none" onClick={() => requestSort('name')}>
                <div className="flex items-center">Имя <SortIndicator columnKey="name" /></div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer select-none" onClick={() => requestSort('created_at')}>
                <div className="flex items-center">Дата создания <SortIndicator columnKey="created_at" /></div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {sortedAndFilteredData.length > 0 ? (
              sortedAndFilteredData.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => handleRowClick(item)}
                  className={`transition-colors duration-150 cursor-pointer ${
                    selectedVenueId === item.id ? 'bg-blue-600' : 'hover:bg-gray-700'
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white truncate max-w-xs">{item.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{item.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{new Date(item.created_at).toLocaleString('ru-RU')}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="text-center py-10 text-gray-500">
                  Нет данных для отображения.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
