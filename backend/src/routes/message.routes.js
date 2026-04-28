const express = require('express');
const {
    startOrGetConversation,
    sendMessage,
    getConversationMessages,
    getMyConversations
} = require('../controllers/message.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

// Récupérer la boîte de réception (Toutes ses conversations)
router.get('/', protect, getMyConversations);

// Initier une conversation (ou récupérer si elle existe) via un listingId { listingId: '...' }
router.post('/', protect, startOrGetConversation);

// Récupérer l'historique de chat d'une conversation spécifique
router.get('/:id/messages', protect, getConversationMessages);

// Envoyer un nouveau message dans une conversation spécifique { content: '...', receiverId: '...' }
router.post('/:id/messages', protect, sendMessage);

module.exports = router;
