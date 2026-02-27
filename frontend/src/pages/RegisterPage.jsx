import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        siret: '',
        firstname: '',
        lastname: '',
        email: '',
        password: ''
    });

    const [companyInfo, setCompanyInfo] = useState(null);
    const [loadingSiret, setLoadingSiret] = useState(false);
    const [loadingSubmit, setLoadingSubmit] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (e.target.name === 'siret') {
            setCompanyInfo(null);
            setError('');
            setSuccess('');
        }
    };

    const handleVerifySiret = async () => {
        if (!formData.siret || formData.siret.length < 9) {
            setError("Veuillez entrer un SIRET valide.");
            return;
        }

        setLoadingSiret(true);
        setError('');

        try {
            const info = await authService.verifySiret(formData.siret);
            setCompanyInfo(info);
        } catch (err) {
            setError(err.response?.data?.error || "Erreur lors de la vérification du SIRET.");
            setCompanyInfo(null);
        } finally {
            setLoadingSiret(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!companyInfo) {
            setError("Veuillez d'abord vérifier votre SIRET.");
            return;
        }

        setLoadingSubmit(true);
        setError('');
        setSuccess('');

        try {
            await authService.register({
                ...formData,
                siret: companyInfo.siret
            });
            setSuccess("Inscription réussie ! Vous allez être redirigé...");
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.error || "Une erreur est survenue lors de l'inscription.");
        } finally {
            setLoadingSubmit(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Rejoindre Roissy Share
                </h2>
                <p className="mt-2 text-center text-sm text-gray-500">
                    La plateforme B2B d'économie circulaire
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-sm border border-gray-100 sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit}>

                        {/* SIRET */}
                        <div>
                            <label htmlFor="siret" className="block text-sm font-medium text-gray-900">
                                Numéro SIRET
                            </label>
                            <div className="mt-1 flex rounded-md shadow-sm">
                                <input
                                    type="text"
                                    name="siret"
                                    id="siret"
                                    value={formData.siret}
                                    onChange={handleInputChange}
                                    className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-l-md border border-gray-300 focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                                    placeholder="Ex: 12345678900012"
                                    disabled={loadingSubmit}
                                />
                                <button
                                    type="button"
                                    onClick={handleVerifySiret}
                                    disabled={loadingSiret || loadingSubmit}
                                    className="inline-flex items-center px-4 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                                >
                                    {loadingSiret ? 'Vérification...' : 'Vérifier'}
                                </button>
                            </div>
                        </div>

                        {/* COMPANY INFO (Read-only) */}
                        {companyInfo && (
                            <div className="rounded-md bg-purple-50 p-4 border border-purple-100">
                                <div className="text-sm text-purple-700">
                                    <p className="font-bold">{companyInfo.name}</p>
                                    <p>{companyInfo.address}</p>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-2">
                                        Entreprise Active Validée
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* USER INFO */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="firstname" className="block text-sm font-medium text-gray-900">
                                    Prénom
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="firstname"
                                        name="firstname"
                                        type="text"
                                        required
                                        value={formData.firstname}
                                        onChange={handleInputChange}
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm bg-white"
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="lastname" className="block text-sm font-medium text-gray-900">
                                    Nom
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="lastname"
                                        name="lastname"
                                        type="text"
                                        required
                                        value={formData.lastname}
                                        onChange={handleInputChange}
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm bg-white"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-900">
                                Adresse Email Pro
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm bg-white"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-900">
                                Mot de passe
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm bg-white"
                                />
                            </div>
                        </div>

                        {/* ALERTS */}
                        {error && (
                            <div className="rounded-md bg-red-50 p-4 border border-red-200">
                                <p className="text-sm text-red-500">{error}</p>
                            </div>
                        )}
                        {success && (
                            <div className="rounded-md bg-green-50 p-4 border border-green-200">
                                <p className="text-sm text-green-700">{success}</p>
                            </div>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={loadingSubmit}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors disabled:opacity-50"
                            >
                                {loadingSubmit ? 'Inscription...' : "S'inscrire"}
                            </button>
                        </div>

                        <div className="mt-4 text-center">
                            <p className="text-sm text-gray-600">
                                Déjà inscrit ?{' '}
                                <Link to="/login" className="font-medium text-purple-600 hover:text-purple-500">
                                    Se connecter
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
