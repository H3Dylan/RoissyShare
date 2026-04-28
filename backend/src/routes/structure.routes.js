const express = require('express');
const { updateProfile } = require('../controllers/structure.controller');
const { protect } = require('../middlewares/auth.middleware');
const { uploadLogo } = require('../middlewares/upload.middleware');

const router = express.Router();

// Middleware protect : Seul un utilisateur connecté (avec un JWT valide) peut modifier sa structure
// uploadLogo.single('logo') : Multer va chercher un fichier dans le champ 'logo' du FormData
router.patch('/me', protect, uploadLogo.single('logo'), updateProfile);

module.exports = router;
