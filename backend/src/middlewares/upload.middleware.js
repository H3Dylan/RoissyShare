const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Définition du chemin de stockage des logos
const storagePath = path.join(__dirname, '../../uploads/logos');

// S'assurer que le dossier existe
if (!fs.existsSync(storagePath)) {
    fs.mkdirSync(storagePath, { recursive: true });
}

// Configuration du stockage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, storagePath);
    },
    filename: function (req, file, cb) {
        // Renommer le fichier : id_structure-timestamp.ext
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${req.user.structureId}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

// Filtre pour n'accepter que les images
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error("Le fichier doit être une image (JPEG, PNG)."), false);
    }
};

// Middleware d'upload avec limite de taille à 2Mo
const uploadMiddleware = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 2 * 1024 * 1024 // 2 Mo
    }
});

module.exports = uploadMiddleware;
