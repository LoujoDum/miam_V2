# MIAM_V2 - Meal Planning & Recipe Management API

**Un planificateur de repas et gestionnaire de recettes avec gestion des ingrédients et listes de courses.**

## 📋 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Stack technologique](#stack-technologique)
3. [Installation et configuration](#installation-et-configuration)
4. [Structure du projet](#structure-du-projet)
5. [Lancer le serveur](#lancer-le-serveur)
6. [Architecture API](#architecture-api)
7. [Documentation des routes](#documentation-des-routes)
8. [Exemples d'utilisation](#exemples-dutilisation)
9. [Gestion des erreurs](#gestion-des-erreurs)
10. [Prochaines étapes](#prochaines-étapes)

---

## Vue d'ensemble

MIAM_V2 est une **API REST complète** pour gérer:
- 📖 **Recettes**: créer, lire, modifier, supprimer
- 🥕 **Ingrédients**: catalogue complet avec propriétés
- 🛒 **Sources d'approvisionnement**: où acheter chaque ingrédient
- 📝 **Planification des repas**: lier des ingrédients à des recettes

**État actuel**: 18 routes API fonctionnelles avec CRUD complet.

---

## Stack technologique

| Technologie | Version | Rôle |
|-------------|---------|------|
| **Node.js** | v24.11.0 | Runtime JavaScript serveur |
| **Express.js** | Latest | Framework web/API |
| **PostgreSQL** | 18.1 | Base de données relationnelle |
| **Git** | v2.52.0 | Versioning |
| **Postman** | Latest | Tests API |
| **VS Code** | Latest | Éditeur de code |

---

## Installation et configuration

### Prérequis

- Node.js v24+ installé
- PostgreSQL 18+ installé et actif
- Git installé
- Postman (optionnel, pour tester)

### Étapes d'installation

#### 1. Cloner le projet

```bash
git clone https://github.com/LoujoDum/miam_V2.git
cd miam_V2/backend
```

#### 2. Installer les dépendances

```bash
npm install
```

**Packages installés:**
```json
{
  "express": "^4.18.0",
  "pg": "^8.8.0",
  "dotenv": "^16.0.0",
  "cors": "^2.8.5",
  "nodemon": "^2.0.0"
}
```

#### 3. Configurer les variables d'environnement

Créer un fichier `.env` dans `backend/`:

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=votre_mot_de_passe
DB_NAME=miam_v2

# Server
SERVER_PORT=3000
NODE_ENV=development
```

**⚠️ Important:** Ne jamais commiter `.env` (secrets dedans!)

#### 4. Créer la base de données PostgreSQL

```sql
CREATE DATABASE miam_v2;

-- Puis importer les tables
CREATE TABLE recipes (
  recipe_id SERIAL PRIMARY KEY,
  nom VARCHAR(255) NOT NULL,
  auteur VARCHAR(255),
  details_recette TEXT,
  lien VARCHAR(500),
  tag VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ... (voir le document de progression pour toutes les tables)
```

#### 5. Importer les données initiales

```bash
psql -U postgres -d miam_v2 -f backend/seed.sql
```

---

## Structure du projet

```
miam_V2/
├── backend/
│   ├── db.js                    (connexion PostgreSQL)
│   ├── server.js                (serveur Express + 18 routes)
│   ├── package.json             (dépendances)
│   ├── package-lock.json
│   ├── .env                     (variables d'environnement)
│   ├── seed.js                  (import données - optionnel)
│   └── seed.sql                 (données initiales)
│
├── frontend/                    (À venir - React)
│   └── (structure React future)
│
├── data/
│   ├── Table1-Ingredient.csv         (65 ingrédients)
│   ├── Table2-Ingredient_Source.csv  (65 sources)
│   ├── Table3-Recettes.csv           (7 recettes)
│   └── Table4-Recette_ingredients.csv (52 liaisons)
│
├── docs/                        (documentation)
├── .git/                        (versioning Git)
├── .gitignore
├── README.md                    (ce fichier)
└── LICENSE
```

---

## Lancer le serveur

### Développement (avec auto-reload)

```bash
cd backend
npm run dev
```

**Output attendu:**
```
✅ Server running on http://localhost:3000
```

### Production

```bash
npm start
```

### Vérifier que le serveur fonctionne

```bash
curl http://localhost:3000/api/health
# Réponse: {"status":"Server is running!"}
```

---

## Architecture API

### Principes REST

L'API suit les standards REST avec 4 verbes HTTP:

| Verbe | Action | Code | Exemple |
|-------|--------|------|---------|
| **GET** | Lire | 200 OK | `GET /api/recipes` |
| **POST** | Créer | 201 Created | `POST /api/recipes` |
| **PUT** | Modifier | 200 OK | `PUT /api/recipes/1` |
| **DELETE** | Supprimer | 200 OK | `DELETE /api/recipes/1` |

### Structure des ressources

```
/api/recipes                    ← Collection (toutes les recettes)
/api/recipes/1                  ← Ressource (recette #1)
/api/recipes/1/ingredients      ← Sous-ressource (ingrédients de recette #1)
/api/recipes/1/ingredients/5    ← Sous-ressource spécifique
```

### Codes HTTP utilisés

```
200 OK                  → Requête réussie
201 Created             → Ressource créée avec succès
400 Bad Request         → Erreur côté client (données invalides)
404 Not Found           → Ressource inexistante
500 Server Error        → Erreur serveur
```

---

## Documentation des routes

### 🍽️ RECIPES (18 endpoints au total)

#### GET /api/recipes
Récupère **toutes les recettes**.

```bash
curl -X GET http://localhost:3000/api/recipes
```

**Réponse (200 OK):**
```json
[
  {
    "recipe_id": 1,
    "nom": "Pâtes Carbonara",
    "auteur": "Marco",
    "details_recette": "Recette traditionnelle italienne",
    "lien": "https://example.com/carbonara",
    "tag": "Italien",
    "created_at": "2025-12-27T16:46:31.540Z"
  },
  { ... }
]
```

---

#### GET /api/recipes/:id
Récupère **une recette spécifique** par son ID.

```bash
curl -X GET http://localhost:3000/api/recipes/1
```

**Réponse (200 OK):**
```json
{
  "recipe_id": 1,
  "nom": "Pâtes Carbonara",
  "auteur": "Marco",
  "details_recette": "Recette traditionnelle italienne",
  "lien": "https://example.com/carbonara",
  "tag": "Italien",
  "created_at": "2025-12-27T16:46:31.540Z"
}
```

**Erreur (404 Not Found):**
```json
{ "error": "Recette non trouvée" }
```

---

#### POST /api/recipes
**Crée une nouvelle recette.**

**Body requis:**
```json
{
  "nom": "Ma nouvelle recette",
  "auteur": "Louis",
  "details_recette": "Instructions détaillées",
  "lien": "https://example.com/ma-recette",
  "tag": "Rapide"
}
```

**Champs obligatoires:** `nom`
**Champs optionnels:** auteur, details_recette, lien, tag

```bash
curl -X POST http://localhost:3000/api/recipes \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Pizza Margherita",
    "auteur": "Anna",
    "tag": "Italien"
  }'
```

**Réponse (201 Created):**
```json
{
  "recipe_id": 8,
  "nom": "Pizza Margherita",
  "auteur": "Anna",
  "details_recette": null,
  "lien": null,
  "tag": "Italien",
  "created_at": "2025-12-30T15:30:00.000Z"
}
```

**Erreur (400 Bad Request):**
```json
{ "error": "Le champ \"nom\" est requis" }
```

---

#### PUT /api/recipes/:id
**Modifie une recette existante** (remplace tous les champs).

```bash
curl -X PUT http://localhost:3000/api/recipes/1 \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Pâtes Carbonara Améliorée",
    "auteur": "Marco",
    "details_recette": "Avec sauce homemade",
    "lien": "https://example.com/carbonara",
    "tag": "Classique"
  }'
```

**Réponse (200 OK):**
```json
{
  "recipe_id": 1,
  "nom": "Pâtes Carbonara Améliorée",
  "auteur": "Marco",
  "details_recette": "Avec sauce homemade",
  "lien": "https://example.com/carbonara",
  "tag": "Classique",
  "created_at": "2025-12-27T16:46:31.540Z"
}
```

---

#### DELETE /api/recipes/:id
**Supprime une recette.**

```bash
curl -X DELETE http://localhost:3000/api/recipes/1
```

**Réponse (200 OK):**
```json
{
  "recipe_id": 1,
  "nom": "Pâtes Carbonara",
  "auteur": "Marco",
  "details_recette": "Recette traditionnelle italienne",
  "lien": "https://example.com/carbonara",
  "tag": "Italien",
  "created_at": "2025-12-27T16:46:31.540Z"
}
```

---

### 🥕 INGREDIENTS

#### GET /api/ingredients
```bash
curl -X GET http://localhost:3000/api/ingredients
```
Retourne tous les ingrédients (65+).

#### GET /api/ingredients/:id
```bash
curl -X GET http://localhost:3000/api/ingredients/5
```
Retourne un ingrédient spécifique.

#### POST /api/ingredients
```bash
curl -X POST http://localhost:3000/api/ingredients \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Tomate Cerise",
    "unit_standard": "g",
    "gluten_free": true,
    "fibre": 1.2
  }'
```
**Champ obligatoire:** `nom` (UNIQUE!)

#### PUT /api/ingredients/:id
```bash
curl -X PUT http://localhost:3000/api/ingredients/5 \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Tomate Bio",
    "unit_standard": "kg",
    "gluten_free": true,
    "fibre": 1.5
  }'
```

#### DELETE /api/ingredients/:id
```bash
curl -X DELETE http://localhost:3000/api/ingredients/5
```

---

### 🔗 RECIPE_INGREDIENTS (Liaison)

#### GET /api/recipes/:id/ingredients
Récupère tous les ingrédients d'une recette.

```bash
curl -X GET http://localhost:3000/api/recipes/1/ingredients
```

**Réponse:**
```json
[
  {
    "quantite": "400.00",
    "unit": "g",
    "comment": "Bien cuit",
    "ingredient_id": 3,
    "nom": "Pâtes",
    "unit_standard": "g",
    "gluten_free": false,
    "fibre": "1.40"
  },
  { ... }
]
```

#### POST /api/recipes/:id/ingredients
Ajoute un ingrédient à une recette.

```bash
curl -X POST http://localhost:3000/api/recipes/1/ingredients \
  -H "Content-Type: application/json" \
  -d '{
    "ingredient_id": 5,
    "quantite": 400,
    "unit": "g",
    "comment": "Frais"
  }'
```

**Champ obligatoire:** `ingredient_id`

#### PUT /api/recipes/:id/ingredients/:ingId
Modifie les détails d'un ingrédient dans une recette.

```bash
curl -X PUT http://localhost:3000/api/recipes/1/ingredients/5 \
  -H "Content-Type: application/json" \
  -d '{
    "quantite": 500,
    "unit": "g",
    "comment": "Très frais"
  }'
```

#### DELETE /api/recipes/:id/ingredients/:ingId
Retire un ingrédient d'une recette.

```bash
curl -X DELETE http://localhost:3000/api/recipes/1/ingredients/5
```

---

### 🛒 INGREDIENT_SOURCES (Liaison)

#### GET /api/ingredients/:id/sources
Récupère toutes les sources pour un ingrédient.

```bash
curl -X GET http://localhost:3000/api/ingredients/5/sources
```

**Réponse:**
```json
[
  {
    "ingredient_id": 5,
    "nom": "Pesto",
    "lieu": "Chez Anna",
    "prix": "6.00",
    "quantite_achat": "200g"
  },
  { ... }
]
```

#### POST /api/ingredients/:id/sources
Ajoute une source pour un ingrédient.

```bash
curl -X POST http://localhost:3000/api/ingredients/5/sources \
  -H "Content-Type: application/json" \
  -d '{
    "lieu": "Carrefour City",
    "prix": 3.50,
    "quantite_achat": "250g"
  }'
```

**Champ obligatoire:** `lieu`

#### PUT /api/ingredients/:id/sources/:srcId
Modifie une source.

```bash
curl -X PUT http://localhost:3000/api/ingredients/5/sources/1 \
  -H "Content-Type: application/json" \
  -d '{
    "lieu": "Leclerc",
    "prix": 2.99,
    "quantite_achat": "500g"
  }'
```

#### DELETE /api/ingredients/:id/sources/:srcId
Supprime une source.

```bash
curl -X DELETE http://localhost:3000/api/ingredients/5/sources/1
```

---

## Exemples d'utilisation

### Exemple 1: Créer une recette avec des ingrédients

```bash
# 1. Créer la recette
curl -X POST http://localhost:3000/api/recipes \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Salade César",
    "auteur": "Louis",
    "tag": "Léger"
  }'

# Réponse: recipe_id = 10

# 2. Ajouter des ingrédients
curl -X POST http://localhost:3000/api/recipes/10/ingredients \
  -H "Content-Type: application/json" \
  -d '{
    "ingredient_id": 1,
    "quantite": 200,
    "unit": "g",
    "comment": "Frais"
  }'

# 3. Voir tous les ingrédients
curl -X GET http://localhost:3000/api/recipes/10/ingredients
```

### Exemple 2: Gérer les sources d'approvisionnement

```bash
# 1. Voir où acheter un ingrédient
curl -X GET http://localhost:3000/api/ingredients/5/sources

# 2. Ajouter une nouvelle source
curl -X POST http://localhost:3000/api/ingredients/5/sources \
  -H "Content-Type: application/json" \
  -d '{
    "lieu": "Marché local",
    "prix": 2.50,
    "quantite_achat": "1kg"
  }'

# 3. Modifier une source
curl -X PUT http://localhost:3000/api/ingredients/5/sources/1 \
  -H "Content-Type: application/json" \
  -d '{
    "prix": 2.80
  }'
```

---

## Gestion des erreurs

### Erreur 400: Bad Request

**Cause:** Données invalides ou manquantes

```json
{ "error": "Le champ \"nom\" est requis" }
```

**Solution:** Vérifier le body de la requête

---

### Erreur 404: Not Found

**Cause:** Ressource inexistante

```json
{ "error": "Recette non trouvée" }
```

**Solution:** Vérifier l'ID existe dans la base de données

---

### Erreur 500: Internal Server Error

**Cause:** Erreur serveur ou SQL

```json
{ "error": "la valeur d'une clé dupliquée rompt la contrainte unique" }
```

**Solutions:**
- Vérifier que les données sont uniques (ex: nom d'ingrédient)
- Consulter les logs serveur
- Vérifier la connexion à PostgreSQL

---

### Erreur courante: UNIQUE constraint violation

```json
{ "error": "la valeur d'une clé dupliquée rompt la contrainte unique « ingredients_nom_key »" }
```

**Cause:** Essayer d'insérer un nom d'ingrédient qui existe déjà

**Solution:** Utiliser un nom unique

---

## Prochaines étapes

### Phase 2: Frontend React (2-4 semaines)
- [ ] Créer interface utilisateur avec React
- [ ] Intégrer avec l'API REST
- [ ] Pages: Recettes, Ingrédients, Planification

### Phase 3: Fonctionnalités avancées (2-3 semaines)
- [ ] Planification des repas
- [ ] Génération automatique des listes de courses
- [ ] Filtrage et recherche

### Phase 4: Déploiement (1-2 semaines)
- [ ] Déployer backend sur Heroku/Railway
- [ ] Déployer frontend sur Vercel/Netlify
- [ ] Application desktop Electron (optionnel)

---

## Contributeurs

- **Louis Dumoulin** - Développeur principal

---

## License

MIT - Libre d'utilisation

---

## Support

Pour toute question:
- 📧 Email: [ton email]
- 🔗 GitHub: https://github.com/LoujoDum/miam_V2
- 📋 Issues: https://github.com/LoujoDum/miam_V2/issues

---

**Dernière mise à jour:** 30 Décembre 2025  
**État:** API REST complète (18 routes) ✅
