import React, { useState, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { UploadCloud } from 'lucide-react';

export default function ProfilePage() {
    const { user, updateUser } = useContext(AuthContext);

    // On initialise avec les données existantes de la structure
    const [address, setAddress] = useState(user?.structure?.address || '');

    // Si un logo url existe, on construit l'URL complète avec le nom d'hôte du backend (port 3000)
    const initialLogoUrl = user?.structure?.logoUrl
        ? `http://localhost:3000${user.structure.logoUrl}`
        : null;

    const [logoPreview, setLogoPreview] = useState(initialLogoUrl);
    const [logoFile, setLogoFile] = useState(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const fileInputRef = useRef(null);

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                setError('Veuillez sélectionner une image valide (JPG ou PNG).');
                return;
            }
            if (file.size > 2 * 1024 * 1024) {
                setError('L\'image ne doit pas dépasser 2 Mo.');
                return;
            }
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
            setError('');
        }
    };

    const clearLogo = () => {
        setLogoFile(null);
        setLogoPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        // L'upload nécessite d'utiliser FormData (multipart/form-data)
        const formData = new FormData();
        if (address) formData.append('addressText', address);
        if (logoFile) formData.append('logo', logoFile);

        try {
            // Configuration explicite pour multipart (bien que Axios l'infère souvent tout seul avec FormData)
            const response = await api.patch('/structures/me', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            // Mise à jour locale du Contexte utilisateur avec la nouvelle structure
            if (response.data.structure) {
                updateUser({ ...user, structure: response.data.structure });
            }

            setSuccess('Profil mis à jour avec succès !');
        } catch (err) {
            setError(err.response?.data?.error || "Erreur lors de la mise à jour du profil.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-3xl w-full mx-auto space-y-8">
                <div>
                    <h2 className="text-3xl font-extrabold text-gray-900">Compléter le Profil B2B</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Mettez à jour le logo de votre structure et l'adresse de votre entrepôt pour permettre la géolocalisation de vos annonces.
                    </p>
                </div>

                <div className="bg-white py-8 px-6 shadow-sm border border-gray-100 sm:rounded-lg">
                    <form className="space-y-6" onSubmit={handleSubmit}>

                        {/* INFORMATION LECTURE SEULE */}
                        <div className="rounded-md bg-purple-50 p-4 border border-purple-100 mb-6">
                            <div className="text-sm text-purple-700">
                                <p className="font-bold">Structure rattachée ({user?.role})</p>
                                <p>Email pro : {user?.email}</p>
                            </div>
                        </div>

                        {/* ADRESSE GÉOCODÉE */}
                        <div>
                            <label htmlFor="address" className="block text-sm font-medium text-gray-900">
                                Adresse exacte de l'entrepôt / bureaux
                            </label>
                            <p className="text-xs text-gray-500 mb-2">Cette adresse sera utilisée pour calculer la distance des dons avec les autres entreprises.</p>
                            <input
                                id="address"
                                name="address"
                                type="text"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="Ex: 45 Rue de Paris, 93290 Tremblay-en-France"
                                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm bg-white"
                            />
                        </div>

                        {/* UPLOAD LOGO */}
                        <div>
                            <label className="block text-sm font-medium text-gray-900">Logo de l'entreprise</label>
                            <div className="mt-2 flex items-center space-x-6">

                                <div className="h-24 w-24 rounded-md overflow-hidden bg-gray-100 border border-gray-300 flex-shrink-0 flex items-center justify-center">
                                    {logoPreview ? (
                                        <img src={logoPreview} alt="Logo preview" className="h-full w-full object-cover" />
                                    ) : (
                                        <span className="text-gray-400 text-xs">Aucun logo</span>
                                    )}
                                </div>

                                <div className="flex-1">
                                    <input
                                        type="file"
                                        id="logoUpload"
                                        ref={fileInputRef}
                                        onChange={handleLogoChange}
                                        accept="image/png, image/jpeg"
                                        className="hidden"
                                    />
                                    <div className="flex space-x-3">
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current.click()}
                                            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
                                        >
                                            <UploadCloud className="w-4 h-4 mr-2 text-gray-500" />
                                            Choisir une image
                                        </button>
                                        {logoFile && (
                                            <button
                                                type="button"
                                                onClick={clearLogo}
                                                className="inline-flex items-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                                            >
                                                Retirer
                                            </button>
                                        )}
                                    </div>
                                    <p className="mt-2 text-xs text-gray-500">PNG, JPG, max 2Mo.</p>
                                </div>
                            </div>
                        </div>

                        {/* MESSAGES */}
                        {error && (
                            <div className="rounded-md bg-red-50 p-4 border border-red-100">
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}
                        {success && (
                            <div className="rounded-md bg-green-50 p-4 border border-green-100">
                                <p className="text-sm text-green-700">{success}</p>
                            </div>
                        )}

                        {/* SOUMETTRE */}
                        <div className="pt-4 border-t border-gray-100">
                            <button
                                type="submit"
                                disabled={loading || (!address && !logoFile)}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Enregistrement en cours...' : 'Mettre à jour mon profil'}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
}
