import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import CreateListingPage from './pages/CreateListingPage';
import MyListingsPage from './pages/MyListingsPage';
import ListingDetailPage from './pages/ListingDetailPage';
import ProtectedRoute from './components/ProtectedRoute';
import { Link } from 'react-router-dom';
import { Search, MessageSquare } from 'lucide-react';

import SearchPage from './pages/SearchPage';
import MessagesIndexPage from './pages/MessagesIndexPage';
import ConversationPage from './pages/ConversationPage';
import DashboardRSEPage from './pages/DashboardRSEPage';

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
                            <Link to="/search" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                <Search className="w-4 h-4 mr-1" /> Trouver du matériel
                            </Link>
                            <Link to="/messages" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                <MessageSquare className="w-4 h-4 mr-1" /> Messages
                            </Link>
                            <Link to="/my-listings" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">Mes Annonces</Link>
                            <Link to="/dashboard-rse" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">Impact RSE</Link>
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


const RootRedirect = () => {
    const { isAuthenticated } = React.useContext(AuthContext);
    return isAuthenticated ? <Navigate to="/search" replace /> : <Navigate to="/login" replace />;
};


function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Navigation />
                <Routes>
                    <Route path="/" element={<RootRedirect />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />

                    <Route
                        path="/search"
                        element={
                            <ProtectedRoute>
                                <SearchPage />
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
                    <Route
                        path="/my-listings"
                        element={
                            <ProtectedRoute>
                                <MyListingsPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/create-listing"
                        element={
                            <ProtectedRoute>
                                <CreateListingPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/listings/:id"
                        element={
                            <ProtectedRoute>
                                <ListingDetailPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/dashboard-rse"
                        element={
                            <ProtectedRoute>
                                <DashboardRSEPage />
                            </ProtectedRoute>
                        }
                    />

                    {/* ROUTES DE MESSAGERIE */}
                    <Route
                        path="/messages"
                        element={
                            <ProtectedRoute>
                                <MessagesIndexPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/messages/:id"
                        element={
                            <ProtectedRoute>
                                <ConversationPage />
                            </ProtectedRoute>
                        }
                    />

                    {/* Redirection par défaut */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
