import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Search, MapPin, Package, Filter, SearchX } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SearchPage() {
    const { user } = useContext(AuthContext);
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // State pour les filtres de recherche
    const [category, setCategory] = useState('');
    const [radiusKm, setRadiusKm] = useState('50'); // Par défaut : 50km

    const fetchGlobalListings = async () => {
        setLoading(true);
        try {
            // Construction des query parameters
            const params = new URLSearchParams();
            if (category) params.append('category', category);
            if (radiusKm) params.append('radiusKm', radiusKm);

            // Appel vers la nouvelle route /api/search avec les query params
            const response = await api.get(`/search?${params.toString()}`);
            setListings(response.data);
            setError('');
        } catch (err) {
            setError(err.response?.data?.error || "Erreur lors de la récupération des annonces.");
        } finally {
            setLoading(false);
        }
    };

    // Charger les annonces au montage et quand les filtres changent
    useEffect(() => {
        fetchGlobalListings();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [category, radiusKm]);


    // Validation si l'utilisateur n'a pas renseigné son adresse
    if (!user?.structure?.latitude || !user?.structure?.longitude) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
                <div className="bg-white p-8 rounded-lg shadow-sm border border-orange-200 max-w-md text-center">
                    <MapPin className="mx-auto h-12 w-12 text-orange-400 mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Adresse manquante</h2>
                    <p className="text-gray-600 mb-6">
                        Pour utiliser le moteur de recherche et voir les dons autour de vous, veuillez d'abord renseigner l'adresse de votre entrepôt dans votre profil.
                    </p>
                    <a href="/profile" className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700">
                        Compléter mon profil
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* EN-TÊTE ET FILTRES */}
            <div className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <h1 className="text-2xl font-bold text-gray-900">Rechercher du Matériel</h1>

                    <div className="mt-4 flex flex-col sm:flex-row gap-4">

                        {/* Filtre Catégorie */}
                        <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-700 mb-1">Catégorie</label>
                            <div className="relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Filter className="h-4 w-4 text-gray-400" />
                                </div>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="focus:ring-purple-500 focus:border-purple-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 px-3 border bg-white"
                                >
                                    <option value="">Toutes les catégories</option>
                                    <option value="FURNITURE">Mobiliers et Bureaux</option>
                                    <option value="IT_EQUIPMENT">Matériel Informatique</option>
                                    <option value="PACKAGING">Emballages et Palettes</option>
                                    <option value="UNIFORMS">Tenues et Uniformes</option>
                                    <option value="OTHER">Autre Matériel</option>
                                </select>
                            </div>
                        </div>

                        {/* Filtre Rayon Kilométrique (PostGIS) */}
                        <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-700 mb-1">Distance maximale (Autour de moi)</label>
                            <div className="relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <MapPin className="h-4 w-4 text-purple-500" />
                                </div>
                                <select
                                    value={radiusKm}
                                    onChange={(e) => setRadiusKm(e.target.value)}
                                    className="focus:ring-purple-500 focus:border-purple-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 px-3 border bg-white text-purple-700 font-medium"
                                >
                                    <option value="10">Dans un rayon de 10 km</option>
                                    <option value="25">Dans un rayon de 25 km</option>
                                    <option value="50">Dans un rayon de 50 km</option>
                                    <option value="100">Dans un rayon de 100 km</option>
                                    <option value="">France Entière (Aucune limite)</option>
                                </select>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* RÉSULTATS DE RECHERCHE */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {error && <div className="p-4 mb-6 bg-red-50 text-red-600 rounded-md border border-red-100">{error}</div>}

                {loading ? (
                    <div className="text-center py-12 text-gray-500 font-medium">Recherche géolocalisée en cours...</div>
                ) : listings.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-lg border border-gray-200 border-dashed">
                        <SearchX className="mx-auto h-16 w-16 text-gray-300" />
                        <h3 className="mt-4 text-lg font-medium text-gray-900">Aucun matériel trouvé dans ce rayon</h3>
                        <p className="mt-2 text-sm text-gray-500">Essayez d'élargir votre zone de recherche (en Km) ou de sélectionner une autre catégorie pour voir plus de résultats.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {listings.map((listing) => (
                            <div key={listing.id} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow relative">

                                {/* Badge Distance */}
                                {listing.structure.distanceKm && (
                                    <div className="absolute top-2 left-2 z-10 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-md shadow-sm border border-gray-100 flex items-center text-xs font-bold text-gray-700">
                                        <MapPin className="w-3 h-3 text-purple-600 mr-1" />
                                        {listing.structure.distanceKm} km
                                    </div>
                                )}

                                {/* Image */}
                                <div className="aspect-video w-full bg-gray-100 border-b border-gray-200 relative">
                                    {listing.images && listing.images.length > 0 ? (
                                        <img src={`http://localhost:3000${listing.images[0]}`} alt={listing.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            <Package className="w-8 h-8" />
                                        </div>
                                    )}
                                </div>

                                {/* Détails */}
                                <div className="p-4 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{listing.title}</h3>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{listing.description}</p>

                                    <div className="mt-auto pt-4 flex flex-col gap-2">
                                        {/* Info Donneuse */}
                                        <div className="flex items-center text-xs text-gray-500 bg-gray-50 p-2 rounded border border-gray-100">
                                            <span className="font-semibold text-gray-700 mr-1">Donné par :</span>
                                            <span className="truncate">{listing.structure.name}</span>
                                        </div>

                                        <div className="flex items-center justify-between text-sm font-medium">
                                            <span className="text-purple-600 bg-purple-50 px-2 py-0.5 rounded">{listing.weightKg} Kg</span>
                                            <Link to={`/listings/${listing.id}`} className="text-purple-600 hover:text-purple-800 transition-colors">
                                                Voir l'annonce &rarr;
                                            </Link>
                                        </div>
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
