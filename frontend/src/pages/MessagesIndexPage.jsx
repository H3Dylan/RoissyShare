import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { MessageSquare, Clock, Package } from 'lucide-react';

export default function MessagesIndexPage() {
    const { user } = useContext(AuthContext);
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const response = await api.get('/conversations');
                setConversations(response.data);
            } catch (err) {
                setError("Impossible de charger vos conversations.");
            } finally {
                setLoading(false);
            }
        };

        fetchConversations();
    }, []);

    if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">Chargement de la messagerie...</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-8 font-sans">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

                <h1 className="text-2xl font-bold text-gray-900 flex items-center mb-6">
                    <MessageSquare className="w-6 h-6 mr-2 text-purple-600" />
                    Boîte de Réception
                </h1>

                {error && <div className="mb-4 text-red-600 bg-red-50 p-4 rounded-md">{error}</div>}

                {conversations.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center flex flex-col items-center">
                        <MessageSquare className="w-16 h-16 text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">Aucun message pour le moment</h3>
                        <p className="mt-2 text-gray-500 max-w-sm mx-auto">
                            Recherchez du matériel ou publiez une annonce pour commencer à échanger avec d'autres professionnels de Roissy.
                        </p>
                        <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/search" className="text-purple-600 bg-purple-50 px-4 py-2 rounded-md font-medium hover:bg-purple-100 transition-colors">Trouver du matériel</Link>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <ul className="divide-y divide-gray-200">
                            {conversations.map((conv) => {
                                // Identifier l'interlocuteur
                                const interlocutor = conv.participant1Id === user.id ? conv.participant2 : conv.participant1;
                                const lastMessage = conv.messages[0];
                                const isUnreadOrMine = lastMessage && lastMessage.senderId === user.id;

                                return (
                                    <li key={conv.id}>
                                        <Link to={`/messages/${conv.id}`} className="block hover:bg-gray-50 transition-colors">
                                            <div className="p-4 sm:px-6 flex items-center">

                                                {/* Logo de l'entreprise interlocutrice */}
                                                <div className="flex-shrink-0 mr-4">
                                                    {interlocutor?.structure?.logoUrl ? (
                                                        <img src={`http://localhost:3000${interlocutor.structure.logoUrl}`} alt="Logo" className="w-12 h-12 rounded-full object-cover border border-gray-200 bg-white" />
                                                    ) : (
                                                        <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center border border-purple-200 text-purple-700 font-bold text-lg">
                                                            {interlocutor?.structure?.name?.charAt(0) || 'B'}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <p className="text-sm font-bold text-gray-900 truncate">
                                                            {interlocutor?.structure?.name || "Entreprise Inconnue"}
                                                        </p>
                                                        <div className="flex items-center text-xs text-gray-500">
                                                            <Clock className="w-3 h-3 mr-1" />
                                                            {new Date(conv.updatedAt).toLocaleDateString()}
                                                        </div>
                                                    </div>

                                                    <p className={`text-sm truncate ${isUnreadOrMine ? 'text-gray-500' : 'text-gray-900 font-semibold'} `}>
                                                        {lastMessage ? (
                                                            lastMessage.senderId === user.id ? `Vous: ${lastMessage.content}` : lastMessage.content
                                                        ) : (
                                                            <span className="italic text-gray-400">Nouvelle conversation (Aucun message)</span>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}
