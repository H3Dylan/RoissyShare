import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Package, MapPin, Calendar, ArrowRight, XCircle } from 'lucide-react';

export default function MyReservationsPage() {
    const { user } = useContext(AuthContext);
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchReservations = async () => {
            try {
                const response = await api.get('/listings/reservations/me');
                setReservations(response.data);
            } catch (err) {
                setError("Erreur lors du chargement de vos réservations.");
            } finally {
                setLoading(false);
            }
        };

        fetchReservations();
    }, []);

    const handleCancelMyReservation = async (listingId) => {
        if (!window.confirm("Voulez-vous annuler votre proposition de réservation ?")) {
            return;
        }

        try {
            await api.patch(`/listings/${listingId}/cancel-reservation`);
            // Rafraîchir la liste
            const response = await api.get('/listings/reservations/me');
            setReservations(response.data);
        } catch (err) {
            alert("Impossible d'annuler la réservation.");
        }
    };

    const getStatusBadge = (status, reservedById) => {
        if (status === 'RESERVED' && reservedById === user?.id) {
            return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-green-100 text-green-800 border border-green-200">Réservée (acceptée)</span>;
        }
        if (reservedById === user?.id) {
            return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-yellow-100 text-yellow-800 border border-yellow-200">En attente</span>;
        }
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-gray-100 text-gray-800 border border-gray-200">{status}</span>;
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Chargement de vos réservations...</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-8 font-sans">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Mes Réservations</h1>
                    <p className="mt-2 text-gray-600">Suivez les annonces que vous avez réservées.</p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                        {error}
                    </div>
                )}

                {reservations.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune réservation</h3>
                        <p className="text-gray-500 mb-6">Vous n'avez pas encore réservé d'annonces.</p>
                        <Link to="/search" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700">
                            <ArrowRight className="w-5 h-5 mr-2" />
                            Trouver du matériel
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {reservations.map((listing) => (
                            <div key={listing.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                                <div className="aspect-video bg-gray-100 relative">
                                    {listing.images && listing.images.length > 0 ? (
                                        <img src={`http://localhost:3000${listing.images[0]}`} alt={listing.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            <Package className="w-12 h-12" />
                                        </div>
                                    )}
                                    <div className="absolute top-3 right-3">
                                        {getStatusBadge(listing.status, listing.reservedById)}
                                    </div>
                                </div>
                                <div className="p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="px-2 py-1 rounded-md bg-purple-50 text-purple-700 text-xs font-medium">
                                            {listing.category}
                                        </span>
                                        <span className="text-sm font-semibold text-gray-700">
                                            {listing.weightKg} Kg
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">{listing.title}</h3>
                                    <div className="flex items-center text-sm text-gray-500 mb-2">
                                        <MapPin className="w-4 h-4 mr-1" />
                                        {listing.structure?.address}
                                    </div>
                                    <div className="flex items-center text-sm text-gray-500 mb-4">
                                        <Calendar className="w-4 h-4 mr-1" />
                                        Proposé le {new Date(listing.updatedAt).toLocaleDateString()}
                                    </div>
                                    
                                    <div className="flex gap-2">
                                        <Link
                                            to={`/listing/${listing.id}`}
                                            className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-purple-300 text-sm font-medium rounded-md text-purple-700 bg-white hover:bg-purple-50"
                                        >
                                            Voir
                                        </Link>
                                        {listing.status === 'AVAILABLE' && (
                                            <button
                                                onClick={() => handleCancelMyReservation(listing.id)}
                                                className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                                            >
                                                <XCircle className="w-4 h-4 mr-1" />
                                                Annuler
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}