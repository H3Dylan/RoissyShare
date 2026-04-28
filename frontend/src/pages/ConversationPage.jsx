import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { ArrowLeft, Send, Package, AlertCircle } from 'lucide-react';

export default function ConversationPage() {
    const { id } = useParams();
    const { user } = useContext(AuthContext);

    const [conversation, setConversation] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');

    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const listingIdQuery = searchParams.get('listingId');
    const [contextListing, setContextListing] = useState(null);

    const messagesEndRef = useRef(null);

    // Auto-scroll vers le dernier message
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Récupérer l'historique de la conversation
    const fetchConversation = async () => {
        try {
            const response = await api.get(`/conversations/${id}/messages`);
            setConversation(response.data);
            setTimeout(scrollToBottom, 50); // Petit délai pour laisser le render se faire
        } catch (err) {
            setError(err.response?.data?.error || "Erreur de chargement du chat.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConversation();

        // Optionnel : si on arrive avec un ?listingId, charger l'aperçu de cette annonce
        // pour pouvoir afficher l'encart au dessus du champ de texte.
        if (listingIdQuery) {
            api.get(`/listings/${listingIdQuery}`).then(res => {
                setContextListing(res.data);
            }).catch(err => console.error("Impossible de charger le contexte", err));
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, listingIdQuery]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        setSending(true);
        try {
            await api.post(`/conversations/${id}/messages`, {
                content: newMessage,
                listingId: contextListing ? contextListing.id : null // On attache l'annonce
            });

            setNewMessage('');
            // Facultatif: Vider l'URL pour ne pas rattacher l'annonce sur TOUS les prochains messages
            if (contextListing) {
                // window.history.replaceState(null, '', `/messages/${id}`); // Pour nettoyer l'URL
                // setContextListing(null); // On le garde au cas où ils parlent de la même chose
            }
            fetchConversation();
        } catch (err) {
            alert(err.response?.data?.error || "Erreur d'envoi");
        } finally {
            setSending(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">Connexion sécurisée en cours...</div>;

    if (error || !conversation) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
                <AlertCircle className="w-12 h-12 text-red-400 mb-2" />
                <p className="text-gray-700">{error}</p>
                <Link to="/messages" className="mt-4 text-purple-600 hover:underline">Retour à la boîte de réception</Link>
            </div>
        );
    }

    // Déduire le nom de l'interlocuteur
    const interlocutor = conversation.participant1Id === user.id ? conversation.participant2 : conversation.participant1;

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">

            {/* Header de la discussion */}
            <div className="bg-white border-b border-gray-200 shadow-sm z-10 sticky top-0">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center">
                        <Link to="/messages" className="mr-4 text-gray-500 hover:text-gray-700 transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>

                        <div className="flex flex-col">
                            <h2 className="text-lg font-bold text-gray-900 leading-tight flex items-center gap-2">
                                {interlocutor?.structure?.name || "Entreprise Inconnue"}
                                {interlocutor?.structure?.logoUrl && <img src={`http://localhost:3000${interlocutor.structure.logoUrl}`} alt="logo" className="w-5 h-5 rounded-full" />}
                            </h2>
                            <span className="text-xs text-gray-500 flex items-center">
                                Contact : {interlocutor?.firstname} {interlocutor?.lastname}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Zone des messages */}
            <div className="flex-1 overflow-y-auto bg-[#e5ded8] bg-opacity-30">
                <div className="max-w-3xl mx-auto px-4 py-6 flex flex-col space-y-4">

                    {conversation.messages.length === 0 && (
                        <div className="text-center mb-6 mt-8">
                            <p className="text-xs text-gray-500 bg-white/60 font-medium inline-block px-4 py-2 rounded-full border border-gray-200 shadow-sm">
                                Début de votre conversation avec {interlocutor?.structure?.name}.
                            </p>
                        </div>
                    )}

                    {conversation.messages.map((msg) => {
                        const isMine = msg.senderId === user.id;
                        return (
                            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-2 shadow-sm ${isMine
                                    ? 'bg-purple-600 text-white rounded-br-sm'
                                    : 'bg-white text-gray-900 border border-gray-100 rounded-bl-sm'
                                    }`}>
                                    {/* Encart dynamique si le message contient une annonce */}
                                    {msg.listing && (
                                        <Link to={`/listings/${msg.listing.id}`} className={`block mb-2 mt-1 -mx-2 px-2 py-2 rounded-lg transition-colors border ${isMine ? 'bg-purple-700/50 border-purple-500 hover:bg-purple-700/80' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}>
                                            <div className="flex items-center gap-3">
                                                {msg.listing.images && msg.listing.images.length > 0 ? (
                                                    <img src={`http://localhost:3000${msg.listing.images[0]}`} alt={msg.listing.title} className="w-10 h-10 rounded border border-gray-200 object-cover flex-shrink-0" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center flex-shrink-0">
                                                        <Package className="w-5 h-5 text-gray-400" />
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-[9px] font-bold uppercase tracking-wider mb-0.5 ${isMine ? 'text-purple-200' : 'text-gray-500'}`}>Annonce au moment du message</p>
                                                    <p className={`text-xs font-bold truncate leading-tight ${isMine ? 'text-white' : 'text-gray-900'}`}>{msg.listing.title}</p>
                                                </div>
                                            </div>
                                        </Link>
                                    )}

                                    {!isMine && (
                                        <p className="text-xs font-bold text-purple-700 mb-0.5">
                                            {interlocutor?.firstname || 'Contact'}
                                        </p>
                                    )}
                                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                    <p className={`text-[10px] text-right mt-1 ${isMine ? 'text-purple-200' : 'text-gray-400'}`}>
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Barre de saisie */}
            <div className="bg-white border-t border-gray-200 p-4">
                <div className="max-w-3xl mx-auto">
                    {/* Indicateur de contexte visuel d'annonce sélectionnée */}
                    {contextListing && (
                        <div className="mb-3 px-3 py-2 bg-purple-50 rounded-lg flex items-center gap-2 border border-purple-100 shadow-sm relative overflow-hidden group">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500"></div>
                            <Package className="w-4 h-4 text-purple-600" />
                            <span className="text-xs text-purple-800 font-medium">En lien avec l'annonce :</span>
                            <span className="text-xs text-purple-900 font-bold truncate flex-1">{contextListing.title}</span>
                            <button onClick={(e) => { e.preventDefault(); setContextListing(null); }} className="text-purple-400 hover:text-purple-700 p-1 opacity-50 hover:opacity-100" title="Détacher l'annonce du message">✕</button>
                        </div>
                    )}
                    <form onSubmit={handleSendMessage} className="flex relative">
                        <textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Écrivez votre message ici..."
                            className="flex-1 block w-full rounded-full bg-gray-100 border-transparent focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500 resize-none px-6 py-3 pr-16 text-sm"
                            rows="1"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage(e);
                                }
                            }}
                        />
                        <button
                            type="submit"
                            disabled={!newMessage.trim() || sending}
                            className={`absolute right-2 top-1.5 p-2 rounded-full flex items-center justify-center transition-colors ${!newMessage.trim() || sending
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-purple-600 text-white hover:bg-purple-700 shadow-sm'
                                }`}
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </form>
                    <p className="text-center text-xs text-gray-400 mt-2">
                        Les messages sont confidentiels et réservés au réemploi professionnel.
                    </p>
                </div>
            </div>

        </div>
    );
}
