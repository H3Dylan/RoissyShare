# 🌿 Roissy Share

Roissy Share est une plateforme B2B d'économie circulaire dédiée au territoire de Roissy. Elle permet aux entreprises locales de donner, réserver et réemployer du matériel professionnel (mobilier, informatique, fournitures) afin de réduire leur empreinte carbone.

## 🚀 Installation Rapide

### 1. Prérequis
- **Node.js** (v16+)
- **Docker Desktop** (pour la base de données PostgreSQL)

### 2. Clonage et Dépendances
```bash
git clone https://github.com/H3Dylan/RoissyShare.git
cd RoissyShare

# Installer les dépendances Backend
cd backend
npm install

# Installer les dépendances Frontend
cd ../frontend
npm install
```

### 3. Lancer la base de données
Nous utilisons **Docker Compose** pour simplifier le lancement de la base de données (PostgreSQL + PostGIS).

```bash
docker-compose up -d
```

### 4. Configuration de l'environnement
Créez un fichier `.env` dans le dossier `backend/` :

```env
PORT=3000
DATABASE_URL="postgresql://postgres:password@localhost:5432/roissyshare?schema=public"
JWT_SECRET="roissyshare-dev-secret-key"
```

### 5. Initialiser la base (Prisma)
Une fois le container lancé :
```bash
cd backend
npx prisma db push
```

### 6. Lancement de l'application
Ouvrez deux terminaux :

**Terminal 1 (Backend) :**
```bash
cd backend
npm run start
```

**Terminal 2 (Frontend) :**
```bash
cd frontend
npm run dev
```

## 📊 Fonctionnalités Clés
- **Recherche Géo-localisée** : Trouvez du matériel autour de votre entreprise.
- **Messagerie B2B** : Échangez directement entre structures.
- **Moteur RSE** : Calcul automatique du CO2 économisé et du poids réemployé.
- **Dashboard Impact** : Visualisez l'évolution mensuelle de votre bilan environnemental.

## 👥 L'Équipe
Ce projet a été développé en collaboration par :
- **Jovick** (@JovickT) - Recherche & Filtres
- **Matteo** (@H3Matteo) - Création d'annonces & Moteur RSE
- **Dylan** (@H3Dylan) - UI/UX & Dashboard Impact
- **Hadil** (@hadilouakk) - Messagerie B2B & Profils

---
*Projet réalisé dans le cadre de l'initiative territoire durable - Roissy Pays de France.*
