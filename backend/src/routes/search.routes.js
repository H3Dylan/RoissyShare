const express = require('express');
const { searchNearbyListings } = require('../controllers/search.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

// Rechercher des annonces à proximité (GET /api/search?radius=20)
router.get('/', protect, searchNearbyListings);

module.exports = router;
