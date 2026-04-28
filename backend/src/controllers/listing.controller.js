const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { calculateCO2Saved } = require('../services/rse.service');

// Créer une nouvelle annonce (Listing)
async function createListing(req, res) {
    try {
        const structureId = req.user.structureId;
        const { title, description, category, weightKg } = req.body;

        if (!title || !description || !category || !weightKg) {
            return res.status(400).json({ error: "Tous les champs sont requis." });
        }

        // Récupérer les URLs des images uploadées
        const imageUrls = req.files ? req.files.map(file => `/uploads/listings/${file.filename}`) : [];

        const newListing = await prisma.listing.create({
            data: {
                title,
                description,
                category,
                weightKg: parseFloat(weightKg),
                images: imageUrls,
                status: 'AVAILABLE',
                structureId: structureId
            }
        });

        res.status(201).json({
            message: "Annonce publiée avec succès",
            listing: newListing
        });
    } catch (error) {
        console.error("Erreur lors de la création de l'annonce :", error);
        res.status(500).json({ error: "Erreur serveur lors de la publication." });
    }
}

// Récupérer les annonces de la structure connectée
async function getMyListings(req, res) {
    try {
        const structureId = req.user.structureId;

        const listings = await prisma.listing.findMany({
            where: { structureId: structureId },
            orderBy: { createdAt: 'desc' }
        });

        res.json(listings);
    } catch (error) {
        console.error("Erreur lors de la récupération des annonces :", error);
        res.status(500).json({ error: "Erreur serveur lors de la récupération des annonces." });
    }
}

// Mettre à jour le statut d'une annonce
async function updateListingStatus(req, res) {
    try {
        const structureId = req.user.structureId;
        const { id } = req.params;
        const { status } = req.body;

        // Vérifier si le statut est valide
        const validStatuses = ['AVAILABLE', 'RESERVED', 'GIVEN'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: "Statut invalide." });
        }

        // Vérifier que l'annonce appartient bien à l'utilisateur
        const listing = await prisma.listing.findUnique({
            where: { id: id }
        });

        if (!listing) {
            return res.status(404).json({ error: "Annonce introuvable." });
        }

        if (listing.structureId !== structureId) {
            return res.status(403).json({ error: "Vous n'êtes pas autorisé à modifier cette annonce." });
        }

        // Mise à jour du statut
        const updatedListing = await prisma.listing.update({
            where: { id: id },
            data: { status: status }
        });

        // -------------------------------------------------------------
        // Epic 8 : Moteur de Calcul RSE (Création d'Impact)
        // -------------------------------------------------------------
        let impactGenerated = false;
        if (status === 'GIVEN') {
            try {
                // Le moteur de calcul RSE
                const co2 = calculateCO2Saved(listing.category, listing.weightKg);

                // On tente de créer la transaction. Si elle existe déjà, l'unique constraint sur [listingId] va throw.
                await prisma.transaction.create({
                    data: {
                        listingId: listing.id,
                        donorId: listing.structureId,
                        // receiverId est optionnel pour l'instant (MVP)
                        weightSavedKg: listing.weightKg,
                        co2SavedKg: co2
                    }
                });
                impactGenerated = true;
                console.log(`[RSE] Impact généré: ${co2}kg CO2e pour l'annonce ${listing.id}`);
            } catch (err) {
                // Si l'erreur est Prisma P2002 (Unique constraint failed), on l'ignore (Idempotence)
                if (err.code === 'P2002') {
                    console.log(`[RSE] L'impact pour l'annonce ${listing.id} a déjà été calculé (Idempotence).`);
                } else {
                    console.error("[RSE] Erreur lors de la création de l'impact :", err);
                }
            }
        }

        res.json({
            message: "Statut mis à jour",
            listing: updatedListing,
            impactGenerated
        });

    } catch (error) {
        console.error("Erreur lors de la mise à jour du statut :", error);
        res.status(500).json({ error: "Erreur serveur." });
    }
}

// Récupérer les détails d'une annonce spécifique par son ID
async function getListingById(req, res) {
    try {
        const { id } = req.params;

        const listing = await prisma.listing.findUnique({
            where: { id: id },
            include: {
                structure: {
                    select: {
                        id: true,
                        name: true,
                        address: true,
                        description: true,
                        logoUrl: true
                    }
                }
            }
        });

        if (!listing) {
            return res.status(404).json({ error: "Annonce introuvable." });
        }

        res.json(listing);

    } catch (error) {
        console.error("Erreur lors de la récupération de l'annonce :", error);
        res.status(500).json({ error: "Erreur serveur." });
    }
}

// Récupérer les statistiques RSE de la structure
async function getRSEStats(req, res) {
    try {
        const structureId = req.user.structureId;

        const stats = await prisma.transaction.aggregate({
            where: { donorId: structureId },
            _sum: {
                weightSavedKg: true,
                co2SavedKg: true
            },
            _count: {
                id: true
            }
        });

        res.json({
            totalWeightSaved: stats._sum.weightSavedKg || 0,
            totalCO2Saved: stats._sum.co2SavedKg || 0,
            donationsCount: stats._count.id || 0
        });

    } catch (error) {
        console.error("Erreur lors de la récupération des stats RSE :", error);
        res.status(500).json({ error: "Erreur serveur lors de la récupération des statistiques." });
    }
}

// Récupérer l'historique mensuel (6 derniers mois)
async function getRSETimeline(req, res) {
    try {
        const structureId = req.user.structureId;
        
        // On récupère toutes les transactions de la structure
        const transactions = await prisma.transaction.findMany({
            where: { donorId: structureId },
            select: {
                co2SavedKg: true,
                completedAt: true
            },
            orderBy: { completedAt: 'asc' }
        });

        // Groupement par mois (6 derniers mois)
        const monthlyData = {};
        const months = [];
        
        // Initialiser les 6 derniers mois
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setDate(1); // FIX: Éviter les débordements (ex: 31 mars -> fév)
            d.setMonth(d.getMonth() - i);
            const year = d.getFullYear();
            const month = d.getMonth(); // 0-11
            const key = `${year}-${month}`; // Clé stable
            const label = d.toLocaleString('default', { month: 'short' }).toUpperCase().replace('.', '');
            
            monthlyData[key] = { label, co2: 0 };
            months.push(key);
        }

        transactions.forEach(t => {
            const d = new Date(t.completedAt);
            const key = `${d.getFullYear()}-${d.getMonth()}`;
            if (monthlyData[key]) {
                monthlyData[key].co2 += t.co2SavedKg;
            }
        });

        const timeline = months.map(key => ({
            month: monthlyData[key].label,
            co2: monthlyData[key].co2
        }));

        res.json(timeline);

    } catch (error) {
        console.error("Erreur timeline RSE:", error);
        res.status(500).json({ error: "Erreur serveur." });
    }
}

// Supprimer une annonce
async function deleteListing(req, res) {
    try {
        const { id } = req.params;
        const structureId = req.user.structureId;

        const listing = await prisma.listing.findUnique({
            where: { id }
        });

        if (!listing) return res.status(404).json({ error: "Annonce non trouvée." });
        if (listing.ownerId !== structureId) return res.status(403).json({ error: "Non autorisé." });

        await prisma.listing.delete({ where: { id } });
        res.json({ message: "Annonce supprimée." });
    } catch (error) {
        console.error("Erreur suppression:", error);
        res.status(500).json({ error: "Erreur serveur." });
    }
}

module.exports = {
    createListing,
    getMyListings,
    updateListingStatus,
    getListingById,
    getRSEStats,
    getRSETimeline,
    deleteListing
};
