const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Fonction utilitaire pour créer la configuration de stockage
const createStorage = (folderName) => {
    const storagePath = path.join(__dirname, `../../uploads/${folderName}`);

    // S'assurer que le dossier existe
    if (!fs.existsSync(storagePath)) {
        fs.mkdirSync(storagePath, { recursive: true });
    }

    return multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, storagePath);
        },
        filename: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            // On préfixe par l'id de structure pour la sécurité et le suivi
            cb(null, `${req.user.structureId}-${uniqueSuffix}${path.extname(file.originalname)}`);
        }
    });
};

// Filtre pour n'accepter que les images
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error("Le fichier doit être une image (JPEG, PNG)."), false);
    }
};

// Middleware pour l'upload de Logo (1 image, max 2Mo)
const uploadLogo = multer({
    storage: createStorage('logos'),
    fileFilter: fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 } // 2 Mo
});

// Middleware pour l'upload d'images d'Annonces (Plusieurs images, max 5Mo par image)
const uploadListingImages = multer({
    storage: createStorage('listings'),
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5 Mo max par image
});

module.exports = {
    uploadLogo,
    uploadListingImages
};
