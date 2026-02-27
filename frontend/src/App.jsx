import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import ProtectedRoute from './components/ProtectedRoute';
import { Link } from 'react-router-dom';

// Dashboard temporaire pour tester la route protégée
const DashboardPlaceholder = () => (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center font-sans">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Tableau de Bord</h1>
        <p className="text-lg text-gray-600">Bienvenue sur l'espace B2B ! 🎉</p>
    </div>
);

// Composant NavBar pour naviguer
const Navigation = () => {
    const { isAuthenticated, logout } = React.useContext(AuthContext);

    if (!isAuthenticated) return null;

    return (
        <nav className="bg-white shadow">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <span className="text-purple-600 font-bold text-xl">Roissy Share</span>
                        </div>
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            <Link to="/dashboard" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">Dashboard</Link>
                            <Link to="/profile" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">Mon Profil</Link>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <button onClick={logout} className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">Déconnexion</button>
                    </div>
                </div>
            </div>
        </nav>
    );
};


function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Navigation />
                <Routes>
                    <Route path="/" element={<Navigate to="/login" replace />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />

                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <DashboardPlaceholder />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute>
                                <ProfilePage />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
