import React from 'react';

const ProfilePage: React.FC = () => {
  return (
    <div className="w-full bg-gray-800 rounded-lg p-6 h-full flex flex-col items-center justify-center text-center">
      <h1 className="text-3xl font-bold text-blue-400 mb-4">Профиль</h1>
      <p className="text-gray-400">Здесь пользователь сможет изменить свой пароль. Функционал находится в разработке.</p>
    </div>
  );
};

export default ProfilePage;
