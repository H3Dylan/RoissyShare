# Contexte du Projet & Spécifications Techniques : Roissy Share

## 1. Présentation du Projet
Roissy Share est une plateforme B2B hyper-locale d'économie circulaire pour la zone aéroportuaire de Roissy Pays de France. Elle connecte les donneurs B2B (plateformes logistiques) avec des preneurs locaux (PME, ESS) pour échanger du matériel professionnel fonctionnel.
**Objectifs de succès :** 30+ entreprises, 100+ annonces, 10T sauvées en 3 mois.

## 2. Stack Technique
* **Front-End :** React pur (initié avec Vite.js).
* **Back-End :** Node.js avec le framework Express.js.
* **Base de données :** PostgreSQL avec l'extension spatiale PostGIS.
* **ORM :** Prisma.
* **Styling :** Tailwind CSS.

## 3. Fonctionnalités Clés (Epics)
L'application est divisée en plusieurs grands blocs fonctionnels :
* **Comptes & Auth :** Inscription avec validation SIRET via l'API INSEE, connexion sécurisée par JWT.
* **Profils :** Complétion du profil B2B avec géocodage de l'adresse (conversion en lat/lng) et upload de logo.
* **Annonces (Listings) :** Publication, upload d'images, gestion du statut (disponible, réservé, donné).
* **Recherche Géospatiale :** Moteur de recherche filtrant les annonces par rayon géographique autour du preneur.
* **Messagerie :** Système de contact interne entre donneur et preneur.
* **Impact RSE :** Calcul et affichage des tonnes sauvées et du CO2 évité via un dashboard.

## 4. Règles de Code & Garde-fous (Instructions pour l'IA)
* **Architecture :** Sépare clairement les responsabilités côté Back-End (Routes, Controllers, Services).
* **Base de données (Prisma + PostGIS) :** Prisma ne supporte pas nativement toutes les fonctions géométriques de PostGIS. Pour les requêtes spatiales complexes (comme la recherche par rayon `ST_DWithin`), utilise impérativement `prisma.$queryRaw`.
* **Sécurité :** Ne stocke jamais de mots de passe en clair (utilise bcrypt/argon2). Protège les routes de l'API avec un middleware de vérification JWT.
* **Typage / Propreté :** Écris un code modulaire, factorise la logique métier dans des services réutilisables, et gère les erreurs API proprement (try/catch avec codes HTTP standard).