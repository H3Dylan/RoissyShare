const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Rechercher des annonces disponibles autour de sa propre entreprise (PostGIS)
async function searchNearbyListings(req, res) {
    try {
        const myStructureId = req.user.structureId;
        const { radiusKm, category } = req.query; // Rayon en kilomètres et catégorie

        // Étape 1 : Récupérer les coordonnées de "ma" structure
        const myStructure = await prisma.structure.findUnique({
            where: { id: myStructureId },
            select: { latitude: true, longitude: true }
        });

        if (!myStructure || !myStructure.latitude || !myStructure.longitude) {
            return res.status(400).json({
                error: "Vous devez renseigner l'adresse de votre entreprise dans votre profil pour utiliser la recherche géographique."
            });
        }

        // Étape 2 : Si aucun radius n'est fourni, on met une limite par défaut élevée (ex: 100km)
        // Ou bien on retourne juste une erreur demandant un rayon. Faisons avec 100km par défaut.
        const radiusVal = radiusKm && !isNaN(parseFloat(radiusKm)) ? parseFloat(radiusKm) : 100;
        const distanceMeters = radiusVal * 1000;

        // Configuration du filtre de catégorie optionnel
        const categoryFilterSQL = category ? `AND l.category = '${category}'` : '';

        // Étape 3 : Requête SQL Native PostGIS avec $queryRaw
        // On récupère uniquement AVAILABLE, différent de notre propre structure
        const rawListings = await prisma.$queryRawUnsafe(`
            SELECT 
                l.*, 
                s.name as "structureName", 
                s.address as "structureAddress",
                ST_DistanceSphere(
                    ST_SetSRID(ST_MakePoint(${myStructure.longitude}, ${myStructure.latitude}), 4326),
                    s.location
                ) as "distanceMeters"
            FROM "Listing" l
            JOIN "Structure" s ON l."structureId" = s.id
            WHERE l.status = 'AVAILABLE'
            AND l."structureId" != '${myStructureId}'
            AND s.location IS NOT NULL
            ${categoryFilterSQL}
            AND ST_DWithin(
                s.location::geography,
                ST_SetSRID(ST_MakePoint(${myStructure.longitude}, ${myStructure.latitude}), 4326)::geography,
                ${distanceMeters}
            )
            ORDER BY "distanceMeters" ASC;
        `);

        // Formatage du résultat pour le FrontEnd
        const formattedListings = rawListings.map(item => ({
            id: item.id,
            title: item.title,
            description: item.description,
            images: item.images, // Array Postgres
            status: item.status,
            category: item.category,
            weightKg: item.weightKg,
            createdAt: item.createdAt,
            structure: {
                name: item.structureName,
                address: item.structureAddress,
                distanceKm: (item.distanceMeters / 1000).toFixed(1)
            }
        }));

        res.json(formattedListings);

    } catch (error) {
        console.error("Erreur lors de la recherche PostGIS :", error);
        res.status(500).json({ error: "Erreur serveur lors de la recherche géospatiale." });
    }
}

module.exports = {
    searchNearbyListings
};
