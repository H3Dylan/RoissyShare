const axios = require('axios');

/**
 * Service pour interroger l'API publique de la base SIRENE.
 */
async function getCompanyInfoBySiret(siret) {
    try {
        // API publique sans authentification
        const response = await axios.get(`https://recherche-entreprises.api.gouv.fr/search?q=${siret}`);

        if (!response.data || !response.data.results || response.data.results.length === 0) {
            throw new Error("SIRET non trouvé");
        }

        const company = response.data.results[0];
        const matchingEtablissement = company.matching_etablissements.find(e => e.siret === siret) || company.matching_etablissements[0];

        // Vérifier si l'entreprise est active ('A' pour Actif, 'C' pour Cessée)
        const etatAdministratif = matchingEtablissement.etat_administratif || company.etat_administratif;
        if (etatAdministratif === 'C') {
            throw new Error("Cette entreprise est déclarée comme fermée (cessée).");
        }

        return {
            siret: matchingEtablissement.siret,
            name: company.nom_complet,
            address: matchingEtablissement.adresse,
            latitude: matchingEtablissement.latitude ? parseFloat(matchingEtablissement.latitude) : null,
            longitude: matchingEtablissement.longitude ? parseFloat(matchingEtablissement.longitude) : null,
            isActive: etatAdministratif === 'A'
        };
    } catch (error) {
        if (error.response?.status === 404) {
            throw new Error("SIRET non trouvé");
        }
        throw new Error(error.message || "Erreur lors de la vérification du SIRET");
    }
}

module.exports = {
    getCompanyInfoBySiret
};
