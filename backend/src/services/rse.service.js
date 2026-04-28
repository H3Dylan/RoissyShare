// Service de calcul de l'impact environnemental (RSE)

/**
 * Facteurs d'émission simplifiés (en kg CO2e évités par kg de matériel réemployé).
 * Sources indicatives (ADEME / Base Empreinte).
 */
const EMISSION_FACTORS = {
    IT_EQUIPMENT: 25.0,  // Équipement informatique : Très lourd en CO2 à la fabrication
    UNIFORMS: 15.0,      // Uniformes / Textile : Fort impact de l'industrie textile
    FURNITURE: 2.5,      // Mobilier : Impact modéré (bois, métal)
    PACKAGING: 1.5,      // Emballages (Carton, plastique)
    OTHER: 1.0           // Par défaut
};

/**
 * Calcule l'impact environnemental d'un don.
 * @param {string} category - Catégorie de l'annonce (ex: 'FURNITURE')
 * @param {number} weightKg - Poids total en kilogrammes
 * @returns {number} - Kilos de CO2e économisés
 */
function calculateCO2Saved(category, weightKg) {
    const factor = EMISSION_FACTORS[category] || EMISSION_FACTORS['OTHER'];
    const co2Saved = factor * weightKg;
    // On arrondit à 2 décimales pour la base de données
    return Math.round(co2Saved * 100) / 100;
}

module.exports = {
    calculateCO2Saved
};
