import React, { useState } from 'react';
import { auth } from '../firebaseConfig';
import { RestaurantIcon } from '../icons';

const LoginPage: React.FC = () => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAuthAction = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isSignUp) {
                await auth.createUserWithEmailAndPassword(email, password);
            } else {
                await auth.signInWithEmailAndPassword(email, password);
            }
            // onAuthStateChanged в App.tsx обработает успешный вход
        } catch (err: any) {
            setError(err.message || 'Произошла ошибка');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col justify-center items-center p-4">
            <div className="max-w-md w-full mx-auto bg-gray-800 rounded-2xl shadow-xl p-8 space-y-6">
                <div className="flex flex-col items-center space-y-2">
                    <div className="p-3 bg-blue-600 rounded-full">
                        <RestaurantIcon />
                    </div>
                    <h1 className="text-3xl font-bold text-white text-center">
                        Eventa CRM
                    </h1>
                    <h2 className="text-xl font-semibold text-gray-300 text-center">
                        {isSignUp ? 'Регистрация' : 'Вход в систему'}
                    </h2>
                </div>

                <form onSubmit={handleAuthAction} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="text-sm font-medium text-gray-400">
                            Email
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div>
                        <label htmlFor="password"className="text-sm font-medium text-gray-400">
                            Пароль
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete={isSignUp ? "new-password" : "current-password"}
                            required
                            minLength={6}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="••••••••"
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-red-400 text-center bg-red-900 bg-opacity-30 p-2 rounded-md">
                            {error}
                        </p>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? 'Обработка...' : (isSignUp ? 'Зарегистрироваться' : 'Войти')}
                        </button>
                    </div>
                </form>

                <p className="text-center text-sm text-gray-400">
                    {isSignUp ? 'Уже есть аккаунт?' : 'Нет аккаунта?'}
                    <button
                        onClick={() => {
                            setIsSignUp(!isSignUp);
                            setError('');
                        }}
                        className="ml-1 font-medium text-blue-400 hover:text-blue-300"
                    >
                        {isSignUp ? 'Войти' : 'Создать'}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;