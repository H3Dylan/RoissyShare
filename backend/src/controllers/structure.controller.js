const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { geocodeAddress } = require('../services/geocode.service');

async function updateProfile(req, res) {
    try {
        // 1. Récupérer l'ID de la structure depuis le token (injecté par auth.middleware)
        const structureId = req.user.structureId;
        const { addressText } = req.body;
        let logoUrl = null;

        // 2. Gestion de l'upload du Logo (Multer)
        if (req.file) {
            // Construction de l'URL publique vers l'image
            logoUrl = `/uploads/logos/${req.file.filename}`;
        }

        // 3. Géocodage de la nouvelle adresse via API BAN (si une adresse a été fournie)
        let geocodedData = null;
        if (addressText && addressText.trim() !== "") {
            geocodedData = await geocodeAddress(addressText);
        }

        // 4. Objet de mise à jour de base
        const updateData = {};
        if (logoUrl) updateData.logoUrl = logoUrl;

        if (geocodedData) {
            updateData.address = geocodedData.formattedAddress;
            updateData.latitude = geocodedData.latitude;
            updateData.longitude = geocodedData.longitude;
        }

        // 5. Mise à jour "classique" (champs texte/float)
        if (Object.keys(updateData).length > 0) {
            await prisma.structure.update({
                where: { id: structureId },
                data: updateData
            });
        }

        // 6. Mise à jour "Géospatiale" (Crucial pour PostGIS : type geometry)
        if (geocodedData) {
            await prisma.$executeRaw`
        UPDATE "Structure" 
        SET location = ST_SetSRID(ST_MakePoint(${geocodedData.longitude}, ${geocodedData.latitude}), 4326) 
        WHERE id = ${structureId};
      `;
        }

        // 7. Renvoyer la structure à jour
        const updatedStructure = await prisma.structure.findUnique({
            where: { id: structureId }
        });

        res.json({
            message: "Profil mis à jour avec succès",
            structure: updatedStructure
        });

    } catch (error) {
        console.error("Erreur lors de la mise à jour du profil :", error);
        res.status(500).json({ error: error.message || "Erreur interne lors de la mise à jour." });
    }
}

module.exports = { updateProfile };
