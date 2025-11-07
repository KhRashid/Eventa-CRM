export const ALL_PERMISSIONS = {
  restaurants: [
    { id: 'restaurants:read', label: 'Просмотр ресторанов' },
    { id: 'restaurants:create', label: 'Создание ресторанов' },
    { id: 'restaurants:update', label: 'Редактирование ресторанов' },
    { id: 'restaurants:delete', label: 'Удаление ресторанов' },
    { id: 'restaurants:assign-packages', label: 'Назначение пакетов меню' },
  ],
  'menu-catalog': [
    { id: 'menu-catalog:read', label: 'Просмотр каталога меню' },
    { id: 'menu-catalog:create', label: 'Создание блюд в каталоге' },
    { id: 'menu-catalog:update', label: 'Редактирование блюд' },
    { id: 'menu-catalog:delete', label: 'Удаление блюд' },
  ],
  'menu-packages': [
    { id: 'menu-packages:read', label: 'Просмотр пакетов меню' },
    { id: 'menu-packages:create', label: 'Создание пакетов меню' },
    { id: 'menu-packages:update', label: 'Редактирование пакетов' },
    { id: 'menu-packages:delete', label: 'Удаление пакетов' },
  ],
  artists: [
    { id: 'artists:read', label: 'Просмотр артистов' },
    { id: 'artists:create', label: 'Создание артистов' },
    { id: 'artists:update', label: 'Редактирование артистов' },
    { id: 'artists:delete', label: 'Удаление артистов' },
  ],
  cars: [
    { id: 'cars:read', label: 'Просмотр автомобилей' },
    { id: 'cars:create', label: 'Создание автомобилей' },
    { id: 'cars:update', label: 'Редактирование автомобилей' },
    { id: 'cars:delete', label: 'Удаление автомобилей' },
  ],
  users: [
    { id: 'users:read', label: 'Просмотр пользователей' },
    { id: 'users:create', label: 'Создание пользователей' },
    { id: 'users:update', label: 'Редактирование пользователей' },
    { id: 'users:delete', label: 'Удаление пользователей' },
    { id: 'users:assign-roles', label: 'Назначение ролей пользователям' },
  ],
  roles: [
    { id: 'roles:read', label: 'Просмотр ролей' },
    { id: 'roles:create', label: 'Создание ролей' },
    { id: 'roles:update', label: 'Редактирование ролей' },
    { id: 'roles:delete', label: 'Удаление ролей' },
  ],
  lookups: [
    { id: 'lookups:read', label: 'Просмотр справочников' },
    { id: 'lookups:update', label: 'Редактирование значений' },
    { id: 'lookups:create', label: 'Создание категорий' },
    { id: 'lookups:delete', label: 'Удаление категорий' },
  ],
};

const allPermissionIds = Object.values(ALL_PERMISSIONS).flat().map(p => p.id);

export const INITIAL_ROLES = [
    {
        name: 'Администратор',
        description: 'Полный доступ ко всем функциям системы.',
        permissions: allPermissionIds,
    },
    {
        name: 'Менеджер контента',
        description: 'Может управлять ресторанами, артистами и автомобилями.',
        permissions: [
            ...ALL_PERMISSIONS.restaurants.map(p => p.id),
            ...ALL_PERMISSIONS.artists.map(p => p.id),
            ...ALL_PERMISSIONS.cars.map(p => p.id),
            'menu-catalog:read',
            'menu-packages:read',
        ],
    },
    {
        name: 'Пользователь (только чтение)',
        description: 'Может только просматривать информацию без права редактирования.',
        permissions: [
            'restaurants:read',
            'artists:read',
            'cars:read',
            'menu-catalog:read',
            'menu-packages:read',
        ]
    }
];