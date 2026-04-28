import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Leaf, Package, BarChart2, TrendingUp, Download, Info, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DashboardRSEPage() {
    const [stats, setStats] = useState({ totalWeightSaved: 0, totalCO2Saved: 0, donationsCount: 0 });
    const [timeline, setTimeline] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, timelineRes] = await Promise.all([
                    api.get('/listings/stats/rse'),
                    api.get('/listings/stats/timeline')
                ]);
                setStats(statsRes.data);
                setTimeline(timelineRes.data);
            } catch (err) {
                setError("Erreur lors du chargement des données RSE.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Analyse de votre impact en cours...</div>;

    // Calcul du maximum pour l'échelle du graphique
    const maxCO2 = Math.max(...timeline.map(t => t.co2), 10);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center">
                        Bilan RSE <Leaf className="ml-3 w-8 h-8 text-green-500" />
                    </h1>
                    <p className="mt-2 text-gray-600 max-w-2xl">
                        Suivez en temps réel l'impact environnemental positif de votre entreprise grâce au réemploi de matériel.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button 
                        disabled 
                        className="inline-flex items-center px-5 py-2.5 rounded-xl bg-gray-100 text-gray-400 font-bold text-sm border border-gray-200 cursor-not-allowed group"
                        title="Disponible en version V2"
                    >
                        <Download className="w-4 h-4 mr-2" /> Exporter PDF (V2)
                    </button>
                    <Link to="/my-listings" className="inline-flex items-center px-5 py-2.5 rounded-xl bg-purple-50 text-purple-700 font-bold text-sm border border-purple-100 hover:bg-purple-100 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Retour mes annonces
                    </Link>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8 rounded-r-xl">
                    <div className="flex">
                        <div className="flex-shrink-0"><Info className="h-5 w-5 text-red-400" /></div>
                        <div className="ml-3"><p className="text-sm text-red-700">{error}</p></div>
                    </div>
                </div>
            )}

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl shadow-green-900/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                        <Leaf className="w-24 h-24" />
                    </div>
                    <div className="bg-green-100 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
                        <Leaf className="w-6 h-6 text-green-600" />
                    </div>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">CO2 Économisé</p>
                    <div className="flex items-baseline">
                        <span className="text-5xl font-black text-gray-900">{stats.totalCO2Saved}</span>
                        <span className="ml-2 text-xl font-bold text-green-600">kg CO2e</span>
                    </div>
                    <p className="mt-4 text-sm text-gray-500 flex items-center">
                        <TrendingUp className="w-4 h-4 mr-1 text-green-500" /> Équivalent à ~{Math.round(stats.totalCO2Saved / 2.5)} jours de chauffage
                    </p>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl shadow-blue-900/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                        <Package className="w-24 h-24" />
                    </div>
                    <div className="bg-blue-100 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
                        <Package className="w-6 h-6 text-blue-600" />
                    </div>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Masse Réemployée</p>
                    <div className="flex items-baseline">
                        <span className="text-5xl font-black text-gray-900">{stats.totalWeightSaved}</span>
                        <span className="ml-2 text-xl font-bold text-blue-600">kg</span>
                    </div>
                    <p className="mt-4 text-sm text-gray-500">Matériel sauvé de la déchetterie</p>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl shadow-purple-900/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                        <BarChart2 className="w-24 h-24" />
                    </div>
                    <div className="bg-purple-100 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
                        <BarChart2 className="w-6 h-6 text-purple-600" />
                    </div>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Nombre de Dons</p>
                    <div className="flex items-baseline">
                        <span className="text-5xl font-black text-gray-900">{stats.donationsCount}</span>
                        <span className="ml-2 text-xl font-bold text-purple-600">finalisés</span>
                    </div>
                    <p className="mt-4 text-sm text-gray-500">Transactions à impact positif</p>
                </div>
            </div>

            {/* Evolution Graph Section */}
            <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-200/50 mb-10">
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900">Évolution de l'Impact</h2>
                        <p className="text-gray-500">kg de CO2 évités par mois</p>
                    </div>
                    <div className="hidden sm:flex gap-2">
                        <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold uppercase">Temps Réel</span>
                    </div>
                </div>

                <div className="h-64 flex items-end justify-between gap-2 sm:gap-4 px-2 relative">
                    {stats.totalCO2Saved === 0 && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-[1px] z-10">
                            <Package className="w-12 h-12 text-gray-300 mb-3" />
                            <p className="text-gray-500 font-bold">Aucune donnée pour le moment</p>
                            <p className="text-gray-400 text-xs text-center px-4">Clôturez un don dans "Mes Annonces" pour voir votre impact s'afficher ici !</p>
                        </div>
                    )}
                    {timeline.map((data, idx) => {
                        const heightPercent = (data.co2 / maxCO2) * 100;
                        return (
                            <div key={idx} className="flex-1 h-full flex flex-col justify-end items-center group relative">
                                {/* Tooltip on hover */}
                                <div className="absolute top-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-[10px] py-1 px-2 rounded-lg pointer-events-none z-20">
                                    {data.co2.toFixed(1)} kg
                                </div>
                                
                                {/* Bar */}
                                <div 
                                    className="w-full max-w-[32px] bg-green-500 rounded-t-lg group-hover:bg-green-600 transition-all duration-300 shadow-sm"
                                    style={{ 
                                        height: `${Math.max(heightPercent, 5)}%`,
                                        backgroundColor: '#22c55e' // Couleur green-500 en dur au cas où
                                    }}
                                ></div>
                                <p className="absolute -bottom-8 text-[10px] font-bold text-gray-400 uppercase tracking-tight">{data.month}</p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Footer / Disclaimer */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-8 rounded-3xl text-white flex flex-col md:flex-row items-center justify-between shadow-xl shadow-purple-500/20">
                <div className="mb-6 md:mb-0">
                    <h3 className="text-xl font-bold mb-2">Engagé pour la planète ?</h3>
                    <p className="text-purple-100 text-sm max-w-md">Continuez à donner votre matériel inutilisé pour faire grimper votre score RSE et inspirer d'autres entreprises du territoire.</p>
                </div>
                <Link to="/create-listing" className="bg-white text-purple-600 px-8 py-4 rounded-2xl font-black hover:bg-purple-50 transition-colors shadow-lg">
                    Publier un nouveau don
                </Link>
            </div>

        </div>
    );
}
