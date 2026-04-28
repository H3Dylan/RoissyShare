import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Package, MoreVertical, Edit2, Repeat, CheckCircle, Leaf, BarChart2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MyListingsPage() {
    const [listings, setListings] = useState([]);
    const [rseStats, setRseStats] = useState({ totalWeightSaved: 0, totalCO2Saved: 0, donationsCount: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchMyListings = async () => {
        try {
            const [listingsRes, statsRes] = await Promise.all([
                api.get('/listings/me'),
                api.get('/listings/stats/rse')
            ]);
            setListings(listingsRes.data);
            setRseStats(statsRes.data);
        } catch (err) {
            console.error("Erreur détaillée:", err);
            setError(err.response?.data?.error || err.message || "Erreur lors du chargement des données.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyListings();
    }, []);

    const handleStatusChange = async (id, newStatus) => {
        try {
            const res = await api.patch(`/listings/${id}/status`, { status: newStatus });
            
            if (res.data.impactGenerated) {
                alert("🎉 Félicitations ! Votre don a été clôturé et l'impact CO2 a été comptabilisé pour votre RSE !");
            }

            // On rafraichit la liste
            fetchMyListings();
        } catch (err) {
            alert("Impossible de mettre à jour le statut.");
        }
    };

    // Helper pour générer le badge visuel selon le statut
    const getStatusBadge = (status) => {
        const config = {
            'AVAILABLE': { label: 'Disponible', class: 'bg-green-100 text-green-800 border-green-200' },
            'RESERVED': { label: 'Réservé', class: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
            'GIVEN': { label: 'Don terminé', class: 'bg-gray-100 text-gray-600 border-gray-200' }
        };
        const c = config[status] || config['AVAILABLE'];
        return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${c.class}`}>{c.label}</span>;
    };

    if (loading) return <div className="text-center p-12 text-gray-500">Chargement...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900">Mes Annonces</h1>
                    <p className="mt-2 text-sm text-gray-600">Gérez le statut de vos annonces de réemploi pour le bilan RSE.</p>
                </div>
                <Link
                    to="/create-listing"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700"
                >
                    + Nouvelle Annonce
                </Link>
            </div>

            {/* Tableau de bord RSE */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200 shadow-sm flex items-center">
                    <div className="bg-green-500 p-3 rounded-lg mr-4">
                        <Leaf className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <p className="text-sm text-green-700 font-medium uppercase tracking-wider">CO2 économisé</p>
                        <p className="text-2xl font-bold text-green-900">{rseStats.totalCO2Saved} kg</p>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 shadow-sm flex items-center">
                    <div className="bg-blue-500 p-3 rounded-lg mr-4">
                        <Package className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <p className="text-sm text-blue-700 font-medium uppercase tracking-wider">Poids réemployé</p>
                        <p className="text-2xl font-bold text-blue-900">{rseStats.totalWeightSaved} kg</p>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200 shadow-sm flex items-center">
                    <div className="bg-purple-500 p-3 rounded-lg mr-4">
                        <BarChart2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <p className="text-sm text-purple-700 font-medium uppercase tracking-wider">Dons réalisés</p>
                        <p className="text-2xl font-bold text-purple-900">{rseStats.donationsCount}</p>
                    </div>
                </div>
            </div>

            {error && <div className="p-4 mb-6 bg-red-50 text-red-600 rounded-md border border-red-100">{error}</div>}

            {listings.length === 0 ? (
                <div className="text-center bg-white border border-gray-200 rounded-lg p-12">
                    <Package className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune annonce</h3>
                    <p className="mt-1 text-sm text-gray-500">Vous n'avez pas encore publié de matériel.</p>
                    <div className="mt-6">
                        <Link to="/create-listing" className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700">
                            Créer ma première annonce
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {listings.map((listing) => (
                        <div key={listing.id} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">

                            {/* Image Placeholder ou Vraie image (la 1ère) */}
                            <div className="aspect-video w-full bg-gray-100 border-b border-gray-200 relative">
                                {listing.images && listing.images.length > 0 ? (
                                    <img src={`http://localhost:3000${listing.images[0]}`} alt={listing.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <Package className="w-8 h-8" />
                                    </div>
                                )}
                                <div className="absolute top-2 right-2">
                                    {getStatusBadge(listing.status)}
                                </div>
                            </div>

                            <div className="p-4 flex-1 flex flex-col">
                                <h3 className="text-lg font-bold text-gray-900 truncate">{listing.title}</h3>
                                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{listing.description}</p>

                                <div className="mt-auto pt-4 flex flex-col gap-2 border-t border-gray-100 mt-4">
                                    <div className="flex items-center justify-between text-sm text-gray-500">
                                        <span>{new Date(listing.createdAt).toLocaleDateString('fr-FR')}</span>
                                        <span className="font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded">{listing.weightKg} Kg</span>
                                    </div>
                                    <Link to={`/listings/${listing.id}`} className="text-center w-full mt-2 text-sm text-purple-600 hover:text-purple-800 transition-colors font-medium">
                                        Voir l'annonce &rarr;
                                    </Link>
                                </div>
                            </div>

                            {/* Actions Rapides */}
                            <div className="bg-gray-50 border-t border-gray-200 px-4 py-3 flex gap-2">
                                {listing.status === 'AVAILABLE' && (
                                    <button
                                        onClick={() => handleStatusChange(listing.id, 'RESERVED')}
                                        className="flex-1 inline-flex justify-center items-center px-3 py-1.5 border border-yellow-300 shadow-sm text-xs font-medium rounded text-yellow-700 bg-yellow-50 hover:bg-yellow-100 transition-colors"
                                    >
                                        Marquer Réservé
                                    </button>
                                )}
                                {(listing.status === 'AVAILABLE' || listing.status === 'RESERVED') && (
                                    <button
                                        onClick={() => handleStatusChange(listing.id, 'GIVEN')}
                                        className="flex-1 inline-flex justify-center items-center px-3 py-1.5 border border-transparent shadow-sm text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 transition-colors"
                                    >
                                        <CheckCircle className="w-3 h-3 mr-1" /> Terminer (Donné)
                                    </button>
                                )}
                                {listing.status === 'GIVEN' && (
                                    <button
                                        onClick={() => handleStatusChange(listing.id, 'AVAILABLE')}
                                        className="w-full inline-flex justify-center items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                                    >
                                        <Repeat className="w-3 h-3 mr-1" /> Remettre disponible
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
