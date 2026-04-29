const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 1. Démarrer ou récupérer une conversation existante avec une entreprise
async function startOrGetConversation(req, res) {
    try {
        const myUserId = req.user.id;
        const { listingId } = req.body;
        console.log(`[startOrGetConversation] Début de requête. userId: ${myUserId}, listingId: ${listingId}`);

        if (!listingId) {
            return res.status(400).json({ error: "L'ID de l'annonce est requis." });
        }

        // On cherche le propriétaire (donneur) de cette annonce pour savoir à qui on veut parler
        const listing = await prisma.listing.findUnique({
            where: { id: listingId },
            include: { structure: true }
        });

        if (!listing) return res.status(404).json({ error: "Annonce introuvable." });

        const donorUser = await prisma.user.findFirst({
            where: { structureId: listing.structureId },
            orderBy: { role: 'asc' }
        });

        if (!donorUser) return res.status(404).json({ error: "Donneur introuvable." });

        if (donorUser.id === myUserId) {
            return res.status(400).json({ error: "Vous ne pouvez pas vous contacter vous-même." });
        }

        // Si l'annonce est disponible, on propose une réservation à l'annonceur
        if (listing.status === 'AVAILABLE') {
            await prisma.listing.update({
                where: { id: listingId },
                data: { reservedById: myUserId }
            });
        }

        // Vérifier si une conversation existe DÉJÀ entre nous deux, indépendamment de l'annonce visée
        let conversation = await prisma.conversation.findFirst({
            where: {
                OR: [
                    { participant1Id: myUserId, participant2Id: donorUser.id },
                    { participant1Id: donorUser.id, participant2Id: myUserId }
                ]
            },
            include: {
                participant1: { include: { structure: true } },
                participant2: { include: { structure: true } }
            }
        });

        if (conversation) {
            console.log(`[startOrGetConversation] Conversation existante retournée (${conversation.id}).`);
            return res.json(conversation);
        }

        console.log(`[startOrGetConversation] Création d'une nouvelle conversation entre ${myUserId} et ${donorUser.id}.`);
        // Si aucune conversation n'existe entre nous, on l'ouvre ! On trie les IDs pour avoir un ordre déterministe par sécurité (@@unique)
        conversation = await prisma.conversation.create({
            data: {
                participant1Id: myUserId < donorUser.id ? myUserId : donorUser.id,
                participant2Id: myUserId < donorUser.id ? donorUser.id : myUserId
            },
            include: {
                participant1: { include: { structure: true } },
                participant2: { include: { structure: true } }
            }
        });

        res.status(201).json(conversation);

    } catch (error) {
        console.error("Erreur startOrGetConversation:", error);
        res.status(500).json({ error: "Erreur serveur." });
    }
}

// 2. Envoyer un message dans un canal
async function sendMessage(req, res) {
    try {
        const senderId = req.user.id;
        const { id: conversationId } = req.params;
        const { content, listingId } = req.body; // L'annonce liée au message devient optionnelle

        if (!content) return res.status(400).json({ error: "Contenu requis." });

        // On vérifie que la conversation existe
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId }
        });

        if (!conversation) return res.status(404).json({ error: "Conversation introuvable." });

        // Sécurité : On doit être participant 1 ou 2
        if (conversation.participant1Id !== senderId && conversation.participant2Id !== senderId) {
            return res.status(403).json({ error: "Accès refusé. Vous n'êtes pas participant." });
        }

        // Le receveur est fatalement l'autre personne
        const receiverId = conversation.participant1Id === senderId ? conversation.participant2Id : conversation.participant1Id;

        const newMessage = await prisma.message.create({
            data: {
                content,
                conversationId,
                senderId,
                receiverId,
                listingId: listingId || null // Joindre l'annonce si mentionnée en paramètre
            }
        });

        // Toujours actualiser la date de la conversation pour qu'elle remonte en tête de liste
        await prisma.conversation.update({
            where: { id: conversationId },
            data: { updatedAt: new Date() }
        });

        res.status(201).json(newMessage);

    } catch (error) {
        console.error("Erreur sendMessage:", error);
        res.status(500).json({ error: "Erreur serveur." });
    }
}

// 3. Récupérer l'historique des messages d'une conversation
async function getConversationMessages(req, res) {
    try {
        const myUserId = req.user.id;
        const { id: conversationId } = req.params;

        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
            include: {
                participant1: { select: { id: true, firstname: true, lastname: true, structure: { select: { name: true, logoUrl: true } } } },
                participant2: { select: { id: true, firstname: true, lastname: true, structure: { select: { name: true, logoUrl: true } } } },
                messages: {
                    orderBy: { createdAt: 'asc' }, // Du plus ancien au plus récent
                    include: {
                        listing: { select: { id: true, title: true, images: true } }
                    }
                }
            }
        });

        if (!conversation) return res.status(404).json({ error: "Conversation introuvable." });

        // Sécurité: Suis-je un participant ?
        if (conversation.participant1Id !== myUserId && conversation.participant2Id !== myUserId) {
            return res.status(403).json({ error: "Accès refusé. Historique privé." });
        }

        res.json(conversation);

    } catch (error) {
        console.error("Erreur getConversationMessages:", error);
        res.status(500).json({ error: "Erreur serveur." });
    }
}

// 4. Récupérer toutes mes conversations (Boîte de réception)
async function getMyConversations(req, res) {
    try {
        const myUserId = req.user.id;

        // Je cherche toutes les conversations où je suis p1 ou p2
        const conversations = await prisma.conversation.findMany({
            where: {
                OR: [
                    { participant1Id: myUserId },
                    { participant2Id: myUserId }
                ]
            },
            include: {
                participant1: { select: { id: true, firstname: true, structure: { select: { name: true, logoUrl: true } } } },
                participant2: { select: { id: true, firstname: true, structure: { select: { name: true, logoUrl: true } } } },
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1, // Prendre juste le dernier message pour l'aperçu
                }
            },
            orderBy: {
                updatedAt: 'desc'
            }
        });

        res.json(conversations);

    } catch (error) {
        console.error("Erreur getMyConversations:", error);
        res.status(500).json({ error: "Erreur serveur." });
    }
}

module.exports = {
    startOrGetConversation,
    sendMessage,
    getConversationMessages,
    getMyConversations
};
