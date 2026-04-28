import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { UploadCloud, X } from 'lucide-react';

export default function CreateListingPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'FURNITURE',
        weightKg: ''
    });

    // On conserve ici un tableau de fichiers images (max 3)
    const [images, setImages] = useState([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);

        // Validation : Max 3 images au total
        if (images.length + files.length > 3) {
            setError("Vous ne pouvez télécharger que 3 images maximum.");
            return;
        }

        const validFiles = files.filter(file => {
            if (!file.type.startsWith('image/')) {
                setError("Seules les images (PNG, JPG) sont acceptées.");
                return false;
            }
            if (file.size > 5 * 1024 * 1024) {
                setError("La taille maximale par image est de 5Mo.");
                return false;
            }
            return true;
        });

        // On crée un tableau d'objets contenant le fichier et son URL de prévisualisation
        const newImages = validFiles.map(file => ({
            file,
            preview: URL.createObjectURL(file)
        }));

        setImages([...images, ...newImages]);
        setError('');
    };

    const removeImage = (indexToRemove) => {
        setImages(images.filter((_, index) => index !== indexToRemove));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const data = new FormData();
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('category', formData.category);
        data.append('weightKg', formData.weightKg);

        images.forEach(img => {
            data.append('images', img.file);
        });

        try {
            await api.post('/listings', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            // Redirection vers le dashboard des annonces
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || "Erreur lors de la publication de l'annonce.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col py-12 sm:px-6 lg:px-8 font-sans">
            <div className="sm:mx-auto sm:w-full sm:max-w-xl">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Publier une Annonce
                </h2>
                <p className="mt-2 text-center text-sm text-gray-500">
                    Proposez du matériel professionnel à l'économie circulaire de Roissy.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
                <div className="bg-white py-8 px-4 shadow-sm border border-gray-100 sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit}>

                        <div>
                            <label className="block text-sm font-medium text-gray-900">Titre de l'annonce</label>
                            <input
                                name="title"
                                type="text"
                                required
                                value={formData.title}
                                onChange={handleInputChange}
                                placeholder="Ex: 50 Palettes Europe type EPAL en bon état"
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-900">Catégorie</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                className="mt-1 block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm bg-white"
                            >
                                <option value="FURNITURE">Mobiliers et Bureaux</option>
                                <option value="IT_EQUIPMENT">Matériel Informatique</option>
                                <option value="PACKAGING">Emballages et Palettes</option>
                                <option value="UNIFORMS">Tenues et Uniformes</option>
                                <option value="OTHER">Autre Matériel</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-900">Poids total estimé (Kg)</label>
                            <p className="text-xs text-gray-500 mb-1">C'est grâce à cette valeur que nous calculerons l'impact RSE.</p>
                            <input
                                name="weightKg"
                                type="number"
                                min="0.1"
                                step="0.1"
                                required
                                value={formData.weightKg}
                                onChange={handleInputChange}
                                placeholder="Ex: 15.5"
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-900">Description détaillée</label>
                            <textarea
                                name="description"
                                rows="4"
                                required
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Décrivez l'état, les dimensions et les modalités de récupération."
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                            />
                        </div>

                        {/* ZONE UPLOAD MULTIPLE IMAGES */}
                        <div>
                            <label className="block text-sm font-medium text-gray-900">Photos ({images.length}/3)</label>
                            <p className="text-xs text-gray-500 mb-2">Des photos nettes augmentent les chances de réemploi.</p>

                            <div className="flex flex-wrap gap-4 mt-2">
                                {/* Aperçu des images sélectionnées */}
                                {images.map((img, idx) => (
                                    <div key={idx} className="relative w-24 h-24 rounded-md border border-gray-200 overflow-hidden shadow-sm group">
                                        <img src={img.preview} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(idx)}
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}

                                {/* Bouton Ajouter une image (disparaît si 3 images) */}
                                {images.length < 3 && (
                                    <label className="w-24 h-24 flex flex-col items-center justify-center rounded-md border-2 border-dashed border-gray-300 hover:border-purple-500 hover:bg-purple-50 cursor-pointer transition-colors text-gray-400 hover:text-purple-600">
                                        <UploadCloud className="w-6 h-6 mb-1" />
                                        <span className="text-xs font-medium">Ajouter</span>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/png, image/jpeg"
                                            multiple
                                            onChange={handleImageChange}
                                        />
                                    </label>
                                )}
                            </div>
                        </div>

                        {/* ERREURS */}
                        {error && (
                            <div className="rounded-md bg-red-50 p-4 border border-red-100">
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}

                        <div className="pt-4 border-t border-gray-100">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Publication en cours...' : 'Publier l\'annonce'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
