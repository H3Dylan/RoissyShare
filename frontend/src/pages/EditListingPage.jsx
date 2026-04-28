import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { Save, ArrowLeft } from 'lucide-react';

export default function EditListingPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'FURNITURE',
        weightKg: ''
    });

    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchListing = async () => {
            try {
                const response = await api.get(`/listings/${id}`);
                const { title, description, category, weightKg } = response.data;
                setFormData({ title, description, category, weightKg });
            } catch (err) {
                setError("Impossible de charger les données de l'annonce.");
            } finally {
                setLoading(false);
            }
        };
        fetchListing();
    }, [id]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUpdating(true);
        setError('');

        try {
            await api.put(`/listings/${id}`, {
                ...formData,
                weightKg: parseFloat(formData.weightKg)
            });
            navigate('/my-listings');
        } catch (err) {
            setError(err.response?.data?.error || "Erreur lors de la modification.");
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <div className="text-center p-12 text-gray-500">Chargement...</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-12 font-sans">
            <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
                
                <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 mb-6"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" /> Retour
                </button>

                <div className="bg-white py-8 px-4 shadow-sm border border-gray-100 sm:rounded-lg sm:px-10">
                    <h2 className="text-2xl font-extrabold text-gray-900 mb-6">Modifier l'annonce</h2>
                    
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-sm font-medium text-gray-900">Titre</label>
                            <input
                                name="title"
                                type="text"
                                required
                                value={formData.title}
                                onChange={handleInputChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-900">Catégorie</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                className="mt-1 block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500 sm:text-sm bg-white"
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
                            <input
                                name="weightKg"
                                type="number"
                                min="0.1"
                                step="0.1"
                                required
                                value={formData.weightKg}
                                onChange={handleInputChange}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-900">Description</label>
                            <textarea
                                name="description"
                                rows="4"
                                required
                                value={formData.description}
                                onChange={handleInputChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                            />
                        </div>

                        {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>}

                        <div className="pt-4 border-t border-gray-100">
                            <button
                                type="submit"
                                disabled={updating}
                                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 transition-colors"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                {updating ? 'Enregistrement...' : 'Enregistrer les modifications'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
