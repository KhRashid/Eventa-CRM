import React, { useState } from 'react';
import { auth } from '../firebaseConfig';
import { createUserDocument } from '../services/firebaseService';
import { RestaurantIcon } from '../icons';

const LoginPage: React.FC = () => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [phone, setPhone] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAuthAction = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (isSignUp) {
            if (password !== confirmPassword) {
                setError('Пароли не совпадают.');
                setLoading(false);
                return;
            }
            if (!displayName.trim()) {
                setError('Отображаемое имя обязательно для заполнения.');
                setLoading(false);
                return;
            }
             if (!phone.trim()) {
                setError('Контактный телефон обязателен для заполнения.');
                setLoading(false);
                return;
            }
        }

        try {
            if (isSignUp) {
                const userCredential = await auth.createUserWithEmailAndPassword(email, password);
                const user = userCredential.user;
                if (user) {
                    // Update Firebase Auth profile
                    await user.updateProfile({ displayName });
                    // Create user document in Firestore
                    await createUserDocument(user, { displayName, phone });
                }
            } else {
                await auth.signInWithEmailAndPassword(email, password);
            }
            // onAuthStateChanged в App.tsx обработает успешный вход/регистрацию
        } catch (err: any) {
            if (err.code === 'auth/email-already-in-use') {
                setError('Этот email уже зарегистрирован.');
            } else if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
                 setError('Неверный email или пароль.');
            } else if (err.code === 'auth/weak-password') {
                setError('Пароль слишком слабый. Он должен содержать не менее 6 символов.');
            } else {
                 setError(err.message || 'Произошла ошибка');
            }
        } finally {
            setLoading(false);
        }
    };
    
    const toggleAuthMode = () => {
        setIsSignUp(!isSignUp);
        setError('');
        setPassword('');
        setConfirmPassword('');
        setDisplayName('');
        setPhone('');
    }

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

                <form onSubmit={handleAuthAction} className="space-y-4">
                     {isSignUp && (
                        <>
                            <div>
                                <label htmlFor="displayName" className="text-sm font-medium text-gray-400">
                                    Отображаемое имя
                                </label>
                                <input
                                    id="displayName"
                                    name="displayName"
                                    type="text"
                                    required
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Ваше имя"
                                />
                            </div>
                            <div>
                                <label htmlFor="phone" className="text-sm font-medium text-gray-400">
                                    Контактный телефон
                                </label>
                                <input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    required
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="+994 (XX) XXX-XX-XX"
                                />
                            </div>
                        </>
                    )}

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
                    
                    {isSignUp && (
                        <div>
                            <label htmlFor="confirmPassword"className="text-sm font-medium text-gray-400">
                                Подтвердите пароль
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                autoComplete="new-password"
                                required
                                minLength={6}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="••••••••"
                            />
                        </div>
                    )}


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
                        onClick={toggleAuthMode}
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