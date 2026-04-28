import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { MapPin, Package, ArrowLeft, Mail, Calendar, Weight, CheckCircle, Repeat, Trash2 } from 'lucide-react';

export default function ListingDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [contacting, setContacting] = useState(false);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        const fetchListing = async () => {
            try {
                const response = await api.get(`/listings/${id}`);
                setListing(response.data);
            } catch (err) {
                setError(err.response?.data?.error || "Erreur lors du chargement de l'annonce.");
            } finally {
                setLoading(false);
            }
        };

        fetchListing();
    }, [id]);

    const handleContact = async () => {
        try {
            setContacting(true);
            const response = await api.post('/conversations', { listingId: id });
            navigate(`/messages/${response.data.id}?listingId=${id}`);
        } catch (err) {
            alert(err.response?.data?.error || "Erreur lors de la création de la conversation.");
            setContacting(false);
        }
    };

    const handleStatusChange = async (newStatus) => {
        try {
            setUpdating(true);
            const res = await api.patch(`/listings/${id}/status`, { status: newStatus });
            
            if (res.data.impactGenerated) {
                alert("🎉 Félicitations ! Votre don a été clôturé et l'impact CO2 a été comptabilisé !");
            }

            // Rafraîchir les données de l'annonce
            const response = await api.get(`/listings/${id}`);
            setListing(response.data);
        } catch (err) {
            alert("Impossible de mettre à jour le statut.");
        } finally {
            setUpdating(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer définitivement cette annonce ?")) {
            return;
        }

        try {
            setUpdating(true);
            await api.delete(`/listings/${id}`);
            navigate('/my-listings');
        } catch (err) {
            alert("Erreur lors de la suppression.");
            setUpdating(false);
        }
    };

    const isOwner = user && listing && user.structureId === listing.structureId;

    if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Chargement de l'annonce...</div>;

    if (error || !listing) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <p className="text-red-500 mb-4">{error || "Annonce introuvable."}</p>
                <button onClick={() => navigate(-1)} className="text-purple-600 hover:underline">Retour</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 font-sans">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Bouton Retour */}
                <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 mb-6"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" /> Retour aux résultats
                </button>

                <div className="bg-white shadow-sm overflow-hidden sm:rounded-lg border border-gray-200">

                    {/* Galerie d'images (Simplifiée pour afficher la 1ère image en géant) */}
                    <div className="w-full aspect-video bg-gray-100 border-b border-gray-200 relative">
                        {listing.images && listing.images.length > 0 ? (
                            <img src={`http://localhost:3000${listing.images[0]}`} alt={listing.title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <Package className="w-16 h-16" />
                            </div>
                        )}
                        <div className="absolute top-4 right-4">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-green-100 text-green-800 border border-green-200 shadow-sm">
                                {listing.status === 'AVAILABLE' ? 'Disponible' : listing.status}
                            </span>
                        </div>
                    </div>

                    {/* Contenu de l'annonce */}
                    <div className="px-4 py-6 sm:px-6">
                        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{listing.title}</h1>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6 border-b border-gray-100 pb-6">
                            <div className="flex items-center">
                                <span className="px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 font-medium border border-purple-100">{listing.category}</span>
                            </div>
                            <div className="flex items-center font-semibold text-gray-700">
                                <Weight className="w-4 h-4 mr-1" /> {listing.weightKg} Kg
                            </div>
                            <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" /> Publié le {new Date(listing.createdAt).toLocaleDateString()}
                            </div>
                        </div>

                        <div className="prose max-w-none text-gray-700 mb-8 whitespace-pre-wrap">
                            <h3 className="text-lg font-bold text-gray-900 mb-3">Description</h3>
                            {listing.description}
                        </div>

                        {/* Encadré d'information sur le donneur ou Actions Propriétaire */}
                        <div className="mt-8 bg-gray-50 rounded-lg p-6 border border-gray-200">
                            {isOwner ? (
                                <>
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">Gestion de votre annonce</h3>
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        {(listing.status === 'AVAILABLE' || listing.status === 'RESERVED') && (
                                            <button
                                                onClick={() => handleStatusChange('GIVEN')}
                                                disabled={updating}
                                                className="flex-1 inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 disabled:bg-green-400"
                                            >
                                                <CheckCircle className="w-5 h-5 mr-2" />
                                                Clôturer le don
                                            </button>
                                        )}
                                        {listing.status === 'GIVEN' && (
                                            <button
                                                onClick={() => handleStatusChange('AVAILABLE')}
                                                disabled={updating}
                                                className="flex-1 inline-flex justify-center items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100"
                                            >
                                                <Repeat className="w-5 h-5 mr-2" />
                                                Remettre en ligne
                                            </button>
                                        )}
                                        {listing.status === 'AVAILABLE' && (
                                            <button
                                                onClick={() => handleStatusChange('RESERVED')}
                                                disabled={updating}
                                                className="flex-1 inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-300"
                                            >
                                                Marquer réservé
                                            </button>
                                        )}
                                        <button
                                            onClick={handleDelete}
                                            disabled={updating}
                                            className="inline-flex justify-center items-center px-6 py-3 border border-red-300 text-base font-medium rounded-md text-red-700 bg-white hover:bg-red-50 disabled:bg-gray-100"
                                        >
                                            <Trash2 className="w-5 h-5 mr-2" />
                                            Supprimer
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-4">
                                        En tant que propriétaire, vous pouvez gérer le cycle de vie de cette annonce pour vos bilans RSE.
                                    </p>
                                </>
                            ) : (
                                <>
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">À propos du Donneur</h3>
                                    <div className="flex items-start">
                                        {listing.structure.logoUrl ? (
                                            <img src={`http://localhost:3000${listing.structure.logoUrl}`} alt="Logo" className="w-16 h-16 rounded-md object-contain bg-white border border-gray-200 mr-4" />
                                        ) : (
                                            <div className="w-16 h-16 rounded-md bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-xl mr-4 border border-purple-200">
                                                {listing.structure.name.charAt(0)}
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <h4 className="text-lg font-bold text-gray-900">{listing.structure.name}</h4>
                                            <p className="text-sm text-gray-600 mt-1 flex items-start">
                                                <MapPin className="w-4 h-4 mr-1 mt-0.5 text-gray-400 flex-shrink-0" />
                                                {listing.structure.address}
                                            </p>
                                            {listing.structure.description && (
                                                <p className="text-sm text-gray-500 mt-2 line-clamp-2">{listing.structure.description}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-6">
                                        <button
                                            onClick={handleContact}
                                            disabled={contacting || listing.status === 'GIVEN'}
                                            className={`w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white ${listing.status === 'GIVEN' ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500'} disabled:bg-purple-400`}
                                        >
                                            <Mail className="w-5 h-5 mr-2" />
                                            {listing.status === 'GIVEN' ? 'Annonce terminée' : contacting ? 'Connexion en cours...' : 'Contacter pour réserver'}
                                        </button>
                                        <p className="text-xs text-center sm:text-left text-gray-500 mt-3">
                                            En contactant le donneur, vous vous engagez à venir récupérer le matériel par vos propres moyens.
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
