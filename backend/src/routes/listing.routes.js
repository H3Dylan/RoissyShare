const express = require('express');
const { createListing, getMyListings, updateListingStatus, getListingById, getRSEStats, getRSETimeline, deleteListing, updateListing, cancelReservation, acceptReservation, refuseReservation, getMyReservations } = require('../controllers/listing.controller');
const { protect } = require('../middlewares/auth.middleware');
const { uploadListingImages } = require('../middlewares/upload.middleware');

const router = express.Router();

// Annuler la réservation (dé-réserver) d'une annonce
router.patch('/:id/cancel-reservation', protect, cancelReservation);

// Accepter une proposition de réservation
router.patch('/:id/accept-reservation', protect, acceptReservation);

// Refuser une proposition de réservation
router.patch('/:id/refuse-reservation', protect, refuseReservation);

// Voir mes réservations (annonces que j'ai réservées)
router.get('/reservations/me', protect, getMyReservations);

// Créer une annonce (upload jusqu'à 3 images dans le champ 'images')
router.post('/', protect, uploadListingImages.array('images', 3), createListing);

// Voir ses propres annonces
router.get('/me', protect, getMyListings);

// Statistiques RSE
router.get('/stats/rse', protect, getRSEStats);
router.get('/stats/timeline', protect, getRSETimeline);

// Récupérer les détails d'une annonce spécifique
router.get('/:id', protect, getListingById);

// Cacher/Donner/Réserver une annonce
router.patch('/:id/status', protect, updateListingStatus);

// Supprimer une annonce
router.delete('/:id', protect, deleteListing);

// Modifier une annonce
router.put('/:id', protect, updateListing);

module.exports = router;
