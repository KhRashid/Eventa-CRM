import React, { useState, useMemo } from 'react';
import { SearchIcon, AddIcon, ArrowUpIcon, ArrowDownIcon, CloseIcon } from '../icons';
import { Venue } from '../types';

interface DataTableProps {
  venues: Venue[];
  loading: boolean;
  error: string | null;
  onRowSelect: (venue: Venue) => void;
  selectedVenueId: string | null;
  onVenueCreate: () => void;
  permissions: Set<string>;
}

type SortableKeys = keyof Pick<Venue, 'id' | 'name' | 'created_at'>;

const DataTable: React.FC<DataTableProps> = ({ venues, loading, error, onRowSelect, selectedVenueId, onVenueCreate, permissions }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: SortableKeys; direction: 'ascending' | 'descending' } | null>({ key: 'created_at', direction: 'descending' });

  const sortedAndFilteredVenues = useMemo(() => {
    let sortableItems = [...venues];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    if (searchTerm) {
      return sortableItems.filter(venue =>
        venue.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return sortableItems;
  }, [venues, sortConfig, searchTerm]);

  const requestSort = (key: SortableKeys) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: SortableKeys) => {
    if (!sortConfig || sortConfig.key !== key) {
      return null;
    }
    return sortConfig.direction === 'ascending' ? <ArrowUpIcon /> : <ArrowDownIcon />;
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow h-full flex flex-col">
      <div className="p-4 border-b border-gray-700 flex justify-between items-center">
        <h2 className="text-xl font-bold">Рестораны</h2>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Поиск по названию..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-700 text-white rounded-md pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon />
            </div>
             {searchTerm && (
                <button
                    onClick={() => setSearchTerm('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                    <CloseIcon className="h-4 w-4 text-gray-400" />
                </button>
            )}
          </div>
          {permissions.has('restaurants:create') && (
            <button
              onClick={onVenueCreate}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-colors"
            >
              <AddIcon />
              <span>Добавить</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading && <p className="p-4 text-center text-gray-400">Загрузка...</p>}
        {error && <p className="p-4 text-center text-red-500">{error}</p>}
        {!loading && !error && (
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-800 sticky top-0">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('name')}
                >
                  <div className="flex items-center">
                    Название {getSortIcon('name')}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('created_at')}
                >
                  <div className="flex items-center">
                    Дата создания {getSortIcon('created_at')}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-900 divide-y divide-gray-700">
              {sortedAndFilteredVenues.map((venue) => (
                <tr
                  key={venue.id}
                  onClick={() => onRowSelect(venue)}
                  className={`cursor-pointer transition-colors ${
                    selectedVenueId === venue.id
                      ? 'bg-blue-900 bg-opacity-50'
                      : 'hover:bg-gray-700'
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{venue.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {new Date(venue.created_at).toLocaleString('ru-RU')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default DataTable;