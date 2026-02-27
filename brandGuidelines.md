# Directives UI / UX : Roissy Share

## 1. Identité Visuelle & Ton
* **Cible :** Professionnels B2B (logisticiens, chefs d'entreprise, responsables d'associations).
* **Ton :** Sérieux, corporate, épuré, centré sur l'efficacité (aller droit au but).
* **Librairie UI :** Tailwind CSS pur.

## 2. Couleurs (Charte Graphique)
Le thème principal repose sur un contraste fort et élégant entre le Violet (couleur de marque) et le Blanc (pour la clarté et la lecture).
* **Couleur Primaire (Violet) :** * Défaut (Boutons, Liens actifs) : Utilise la classe Tailwind `bg-purple-600` ou `text-purple-600`.
  * Hover (Survol) : `bg-purple-700`.
  * Fond légers (Badges, Alertes) : `bg-purple-50` avec texte `text-purple-700`.
* **Couleur de Fond :**
  * Principal : Blanc pur `bg-white`.
  * Secondaire (Fonds de pages derrière les cartes) : Gris très léger `bg-gray-50` pour faire ressortir les éléments blancs.
* **Texte :**
  * Principal : Gris très foncé `text-gray-900`.
  * Secondaire (Sous-titres, descriptions) : `text-gray-500`.

## 3. Typographie
* **Police unique :** Arial (sans-serif).
* **Configuration Tailwind :** L'application utilise la pile sans-serif par défaut de Tailwind, qu'il faudra configurer pour forcer Arial en priorité si nécessaire (`font-family: Arial, Helvetica, sans-serif;`).

## 4. Composants & Règles de Design (Tailwind)
* **Boutons :** Les boutons d'action principaux doivent être pleins (`bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors`). Les boutons secondaires peuvent être en mode outline (`border border-purple-600 text-purple-600`).
* **Formulaires :** * Les champs (Inputs) doivent avoir un fond blanc, une bordure grise légère (`border-gray-300`), et au focus, une bordure violette (`focus:ring-purple-500 focus:border-purple-500`).
  * Toujours prévoir un espace pour les messages d'erreur en rouge (`text-red-500 text-sm`) sous les champs.
* **Cartes (Cards) :** Les annonces et les blocs du tableau de bord (Dashboard RSE) doivent être dans des conteneurs blancs avec une ombre légère (`bg-white rounded-lg shadow-sm border border-gray-100`).
* **Mise en page :** Utilise massivement Flexbox et CSS Grid via Tailwind. L'interface doit être "Mobile-First" et parfaitement responsive.