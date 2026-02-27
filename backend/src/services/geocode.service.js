const axios = require('axios');

/**
 * Service pour appeler la Base Adresse Nationale (BAN)
 * Convertit une adresse texte en coordonnées (latitude, longitude)
 */
async function geocodeAddress(addressText) {
    try {
        // L'API BAN attend l'adresse encodée pour l'URL
        const encodedAddress = encodeURIComponent(addressText);
        const url = `https://api-adresse.data.gouv.fr/search/?q=${encodedAddress}&limit=1`;

        const response = await axios.get(url);

        if (response.data && response.data.features && response.data.features.length > 0) {
            const bestResult = response.data.features[0];

            // L'API BAN renvoie la géométrie au format GeoJSON: [longitude, latitude]
            const [longitude, latitude] = bestResult.geometry.coordinates;

            return {
                latitude,
                longitude,
                formattedAddress: bestResult.properties.label,
                context: bestResult.properties.context, // Info souvent utile (département, région)
            };
        } else {
            throw new Error("Adresse introuvable par l'API BAN");
        }
    } catch (error) {
        console.error("Erreur de géocodage :", error.message);
        throw new Error("Impossible de géocoder cette adresse.");
    }
}

module.exports = { geocodeAddress };
