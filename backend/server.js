// Importer les packages
const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const pool = require('./db');
require('dotenv').config();

// Créer l'application Express
const app = express();

// Configuration
app.use(cors());
app.use(express.json());

// Servir les images uploadées comme fichiers statiques
// Quand le navigateur demande /uploads/photo.jpg, Express cherche dans backend/uploads/photo.jpg
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configuration de multer pour l'upload de fichiers
const storage = multer.diskStorage({
  // Où stocker les fichiers
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'uploads'));
  },
  // Comment nommer les fichiers (timestamp + nom original pour éviter les doublons)
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + '-' + file.originalname.replace(/\s+/g, '_');
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Max 5MB
  fileFilter: function (req, file, cb) {
    // Accepter seulement les images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Seules les images sont acceptées'));
    }
  }
});

const PORT = process.env.SERVER_PORT || 3000;

// Route test
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running!' });
});

//  ***********************************************************  //
//             Liste des ROUTES 
//  ***********************************************************  //    
//  1  - /recipes (GET)- Liste des recettes avec tous leurs contenues
//  2  - /recipes/:id (GET)- pointe sur une recette en particulier à partir de son id
//  3  - /recipes/:id/ingredients (GET)- Liste des ingrédients pour une recette avec toutes les informations de cette ingrédients
//  4  - /ingredients (GET)- Liste de tous les ingrédients avec tous leurs contenues
//  5  - /ingredients/:id/sources (GET)- Liste des sources (lieux d'achat) pour un ingrédient spécifique
//  6  - /recipes (POST) - Crée une nouvelle recette dans la base de données
//  7  - /recipes/:id (PUT) - Modifie une recette existante (remplace tous les champs)
//  8  - /recipes/:id (DELETE) - Supprime une recette de la base de données
//  9  - /ingredients/:id (GET) - Pointe sur un ingrédient en particulier et retourne l'ensemble des éléments de la table ingédient
//  10 - /ingredients (POST) - Créé un ingrédient dans la table d'ingrédient
//  11 - /recipes/:id/ingredients (POST) - Ajoute un ingrédient à une recette
//  12 - /recipes/:id/ingredients/:ingId (PUT) - Modifie les détails d'un ingrédient dans une recette
//  13 - /recipes/:id/ingredients/:ingId (DELETE)- Retire un ingrédient d'une recette
//  14 - /ingredients/:id (PUT) - Modifie un ingrédient
//  15 - /ingredients/:id (DELETE) - Supprime un ingrédient

//  X - /api/health - Route de test pour vérifier que le serveur est actif

// 1 - Route Recipes
app.get('/api/recipes', async (req, res) => {
  try {
    console.log('Route /api/recipes called');
    const result = await pool.query('SELECT * FROM recipes');
    console.log('Query result:', result.rows);
    res.json(result.rows);
  } catch (err) {
    console.error('Error in /api/recipes:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// 2 - Route Recipe/:id
// route pour trouver les données d'une recette que l'on retrouve par son :id
app.get('/api/recipes/:id', async (req, res) => {
  try {
    // Récupère l'ID de l'URL
    const recipeId = req.params.id;
    
    // Interroge PostgreSQL
    const result = await pool.query(
      'SELECT * FROM recipes WHERE recipe_id = $1',
      [recipeId]
    );
    
    // Vérifie si la recette existe
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Recette non trouvée' });
    } else {
      res.json(result.rows[0]);  // Retourne UNE recette, pas un tableau
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3 - Route Recipe/:id/ingredients
// route pour trouver la liste d'ingredients d'une recette
app.get('/api/recipes/:id/ingredients', async (req, res) => {
  try {
    // Récupère l'ID de l'URL
    const recipeId = req.params.id;
    
    // Interroge PostgreSQL
    const result = await pool.query(
      'SELECT ri.quantite,ri.unit,ri.comment,i.ingredient_id,i.nom,i.unit_standard,i.gluten_free,i.fibre FROM recipe_ingredients ri JOIN ingredients i ON ri.ingredient_id = i.ingredient_id WHERE ri.recipe_id = $1',
      [recipeId]
    );
    
    // Renvoyer la liste si vide pas de problème
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4 - Route Ingredients
app.get('/api/ingredients', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM ingredients');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5 - Route /ingredients/:id/sources
// route pour trouver les information de source de cette ingrédient
app.get('/api/ingredients/:id/sources', async(req,res)=>{
 try {
  // Recupère l'ID de l'URL
  const IngredientId = req.params.id;
  // On interroge SQL avec jointure, trié par priorité
  const result = await pool.query (
    'SELECT isou.source_id, i.ingredient_id, i.nom, isou.lieu, isou.prix, isou.quantite_achat, isou.priorite FROM ingredients i JOIN ingredient_sources isou ON i.ingredient_id = isou.ingredient_id WHERE i.ingredient_id = $1 ORDER BY isou.priorite ASC, isou.source_id ASC',
    [IngredientId]
  );
 res.json(result.rows); // Retourne [] si pas de sources, c'est normal
 } catch(err){
  res.status(500).json({error: err.message})
 }
});

// 6 - Route POST - Créer une nouvelle recette
app.post('/api/recipes', async (req, res) => {
  try {
    // Récupère les données du body
    const { nom, auteur, details_recette, lien, tag, image_url } = req.body;
    
    // Vérifie que "nom" existe
    if (!nom) {
      res.status(400).json({ error: 'Le champ "nom" est requis' });
      return;
    }
    
    // Insère dans PostgreSQL
    const result = await pool.query(
      'INSERT INTO recipes (nom, auteur, details_recette, lien, tag, image_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [nom, auteur, details_recette, lien, tag, image_url || null]
    );
    
    // Retourne la nouvelle recette (201 = créée)
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7 - Route PUT recipe:id - modifier une recette existante
app.put('/api/recipes/:id', async (req, res) => {
  try {
    const recipeId = req.params.id;
    const { nom, auteur, details_recette, lien, tag, image_url } = req.body;
    
    if (!nom) {
      res.status(400).json({ error: 'Le champ "nom" est requis' });
      return;
    }
    
    const result = await pool.query(
   'UPDATE recipes SET nom = $1, auteur = $2, details_recette = $3, lien = $4, tag = $5, image_url = $6 WHERE recipe_id = $7 RETURNING *',
    [nom, auteur, details_recette, lien, tag, image_url || null, recipeId]
    );
    
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Recette non trouvée' });
    } else {
      res.json(result.rows[0]);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8 - Route DELETE Recipe id - Supprime une recette
app.delete('/api/recipes/:id', async (req, res) => {
  try {
    const recipeId = req.params.id;
    
    const result = await pool.query(
      'DELETE FROM recipes WHERE recipe_id = $1 RETURNING *',
      [recipeId]
    );
    
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Recette non trouvée' });
    } else {
      res.json(result.rows[0]);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 9 - ROUTE GET /ingredients/:id
// Pointe sur un ingrédient en particulier et retourne l'ensemble des éléments de la table ingédient
app.get('/api/ingredients/:id', async (req, res) => {
  try {
    // Récupère l'ID de l'URL
    const IngredientId = req.params.id;
    
    // Interroge PostgreSQL
    const result = await pool.query(
      'SELECT * FROM ingredients WHERE ingredient_id = $1',
      [IngredientId]
    );
    
    // Vérifie si l'ingrédient existe
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Ingrédient non trouvée' });
    } else {
      res.json(result.rows[0]);  // Retourne UN ingrédient
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 10 - ROUTE POST /api/ingredients
// Créé un ingrédient dans la table d'ingrédient
app.post('/api/ingredients', async (req, res) => {
  try {
    // Récupère les données du body
    const { nom, unit_standard, gluten_free, fibre} = req.body; // table 3 :Ingredient_id,Gluten Free,Nom,fibre (100g),unit_standard
    
    // Vérifie que "nom" existe
    if (!nom) {
      res.status(400).json({ error: 'Le champ "nom" est requis' });
      return;
    }
    
    // Insère dans PostgreSQL
    const result = await pool.query(
      'INSERT INTO ingredients (nom, unit_standard, gluten_free, fibre) VALUES ($1, $2, $3, $4) RETURNING *',
      [nom, unit_standard, gluten_free, fibre]
    );
    
    // Retourne le nouvel ingredient (201 = créée)
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 11 - POST /api/recipes/:id/ingredients
// Ajoute un ingrédient à une recette
app.post('/api/recipes/:id/ingredients', async (req, res) => {
  try {
    // Récupère l'ID de la recette de l'URL
    const recipeId = req.params.id;
    
    // Récupère les données du body
    const { ingredient_id, unit, quantite, comment } = req.body;
    
    // Vérifie que ingredient_id existe
    if (!ingredient_id) {
      res.status(400).json({ error: 'Le champ "ingredient_id" est requis' });
      return;
    }
    
    // Insère dans PostgreSQL
    const result = await pool.query(
      'INSERT INTO recipe_ingredients (recipe_id, ingredient_id, unit, quantite, comment) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [recipeId, ingredient_id, unit, quantite, comment]
    );
    
    // Retourne le nouveau lien créé (201 = créé)
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 12 - PUT /api/recipes/:id/ingredients/:ingId
// Modifie les détails d'un ingrédient dans une recette
app.put('/api/recipes/:id/ingredients/:ingId', async (req, res) => {
  try {
    // Récupère les paramètres d'URL
    const recipeId = req.params.id;
    const ingId = req.params.ingId;
    
    // Récupère les données du body
    const { quantite, unit, comment } = req.body;
    
    // Exécute l'UPDATE avec 2 conditions
    const result = await pool.query(
      'UPDATE recipe_ingredients SET quantite = $1, unit = $2, comment = $3 WHERE recipe_id = $4 AND ingredient_id = $5 RETURNING *',
      [quantite, unit, comment, recipeId, ingId]
    );
    
    // Vérifie si le lien existe
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Ingrédient non trouvé dans cette recette' });
    } else {
      res.json(result.rows[0]);  // 200 OK par défaut
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 13 - Route DELETE /api/recipes/:id/ingredients/:ingId
// Retire un ingrédient d'une recette
app.delete('/api/recipes/:id/ingredients/:ingId', async (req, res) => {
  try {
    // Récupère LES DEUX paramètres d'URL
    const recipeId = req.params.id;       // Premier paramètre
    const ingId = req.params.ingId;       // Deuxième paramètre
    
    // Utilise les deux dans la requête SQL
    const result = await pool.query(
      'DELETE FROM recipe_ingredients WHERE recipe_id = $1 AND ingredient_id = $2 RETURNING *',
      [recipeId, ingId]
    );
    
    // Vérifie si le lien existe
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Ingrédient non trouvé dans cette recette' });
    } else {
      res.json(result.rows[0]);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 14 - PUT /api/ingredients/:id
// Modifie un ingrédient
app.put('/api/ingredients/:id', async (req, res) => {
  try {
    const ingredientId = req.params.id;
    const { nom, unit_standard, gluten_free, fibre } = req.body;
    
    if (!nom) {
      res.status(400).json({ error: 'Le champ "nom" est requis' });
      return;
    }
    
    const result = await pool.query(
      'UPDATE ingredients SET nom = $1, unit_standard = $2, gluten_free = $3, fibre = $4 WHERE ingredient_id = $5 RETURNING *',
      [nom, unit_standard, gluten_free, fibre, ingredientId]
    );
    
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Ingrédient non trouvé' });
    } else {
      res.json(result.rows[0]);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 15 - DELETE /api/ingredients/:id
// Supprime un ingrédient
app.delete('/api/ingredients/:id', async (req, res) => {
  try {
    const ingredientId = req.params.id;
    
    const result = await pool.query(
      'DELETE FROM ingredients WHERE ingredient_id = $1 RETURNING *',
      [ingredientId]
    );
    
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Ingrédient non trouvé' });
    } else {
      res.json(result.rows[0]);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 16 - POST /ingredients/:id/sources 
// Créer les informations de sources pour un ingrédient
app.post('/api/ingredients/:id/sources', async (req, res) => {
  try {
    // Récupère l'ID de l'ingrédient de l'URL
    const ingredientId = req.params.id;
    
    // Récupère les données du body
    const { lieu, prix, quantite_achat, priorite } = req.body;  // ← Ajout priorite
    
    // Vérifie que "lieu" existe
    if (!lieu) {
      res.status(400).json({ error: 'Le champ "lieu" est requis' });
      return;
    }
    
    // Insère dans PostgreSQL
    const result = await pool.query(
      'INSERT INTO ingredient_sources (ingredient_id, lieu, prix, quantite_achat, priorite) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [ingredientId, lieu, prix, quantite_achat, priorite || 1]
    );
    
    // Retourne la nouvelle source créée (201 = créé)
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 17 - PUT /ingredients/:id/sources/:srcId 
// Modifier les informations d'une source pour un ingrédient
//PUT /api/ingredients/:id/sources/:srcId
app.put('/api/ingredients/:id/sources/:srcId', async (req, res) => {
  try {
    // Récupère les paramètres d'URL
    const ingredientId = req.params.id;
    const sourceId = req.params.srcId;
    
    // Récupère les données du body
    const {lieu, prix, quantite_achat, priorite } = req.body;
    
    // Exécute l'UPDATE avec 2 conditions
    const result = await pool.query(
      'UPDATE ingredient_sources SET lieu = $1, prix = $2, quantite_achat = $3, priorite = $4 WHERE ingredient_id = $5 AND source_id = $6 RETURNING *',
      [lieu, prix, quantite_achat, priorite || 1, ingredientId, sourceId]
    );
    
    // Vérifie si le lien existe
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Source non trouvée pour cet ingrédient' });
    } else {
      res.json(result.rows[0]);  // 200 OK par défaut
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 18 - DELETE /ingredients/:id/sources 
// Supprimer les informations d'une sources pour un ingrédient
app.delete('/api/ingredients/:id/sources/:srcId', async (req, res) => {
  try {
    // Récupère les paramètres d'URL
    const ingredientId = req.params.id;
    const sourceId = req.params.srcId;
    
    // Exécute le DELETE avec 2 conditions
    const result = await pool.query(
      'DELETE FROM ingredient_sources WHERE ingredient_id = $1 AND source_id = $2 RETURNING *',
      [ingredientId, sourceId]
    );
    
    // Vérifie si la source existe
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Source non trouvée pour cet ingrédient' });
    } else {
      res.json(result.rows[0]);  // Confirmation (ce qu'on a supprimé)
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// 19 - GET /api/sources 
// retourne toutes les sources en liste plate. Utile pour avoir une vue complète des données.
app.get('/api/sources', async (req, res) => {
  try {
    console.log('Route /api/sources called');
    const result = await pool.query('SELECT i.ingredient_id, i.nom, isou.lieu, isou.prix, isou.quantite_achat FROM ingredients i JOIN ingredient_sources isou ON i.ingredient_id = isou.ingredient_id');
    console.log('Query result:', result.rows);
    res.json(result.rows);
  } catch (err) {
    console.error('Error in /api/sources:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// 20 - GET /api/sources/by-ingredient
// Retourne toutes les sources groupées par ingrédient
app.get('/api/sources/by-ingredient', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT i.ingredient_id, i.nom, 
       array_agg(isou.lieu) as lieux
       FROM ingredients i 
       JOIN ingredient_sources isou ON i.ingredient_id = isou.ingredient_id 
       GROUP BY i.ingredient_id, i.nom 
       ORDER BY i.nom`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 21 - GET /api/stores
// Retourne tous les lieux uniques (pour les cases à cocher)
app.get('/api/stores', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT DISTINCT lieu FROM ingredient_sources ORDER BY lieu'
    );
    res.json(result.rows.map(r => r.lieu));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// UPLOAD D'IMAGES
// ============================================

// 25 - POST /api/upload
// Upload une image et retourne l'URL locale
// upload.single('image') = multer attend UN fichier dans le champ 'image' du formulaire
app.post('/api/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier envoyé' });
    }
    // Retourne l'URL relative pour accéder à l'image
    const imageUrl = `/uploads/${req.file.filename}`;
    res.status(201).json({ image_url: imageUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// MEAL PLAN
// ============================================

// 22 - GET /api/meal-plan?week=YYYY-MM-DD
// Récupère le plan de la semaine (avec les noms des recettes)
// Le paramètre ?week= est la date du lundi de la semaine
app.get('/api/meal-plan', async (req, res) => {
  try {
    const weekStart = req.query.week;
    if (!weekStart) {
      return res.status(400).json({ error: 'Le paramètre "week" est requis (format: YYYY-MM-DD)' });
    }

    const result = await pool.query(
      `SELECT mp.id, mp.week_start, mp.day_of_week, mp.meal_type, mp.recipe_id,
              r.nom as recipe_name, r.tag
       FROM meal_plan mp
       LEFT JOIN recipes r ON mp.recipe_id = r.recipe_id
       WHERE mp.week_start = $1
       ORDER BY mp.day_of_week, mp.meal_type`,
      [weekStart]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 23 - POST /api/meal-plan
// Ajoute un repas au planning
app.post('/api/meal-plan', async (req, res) => {
  try {
    const { week_start, day_of_week, meal_type, recipe_id } = req.body;

    if (week_start === undefined || day_of_week === undefined || !meal_type) {
      return res.status(400).json({ error: 'week_start, day_of_week et meal_type sont requis' });
    }

    // Supprime l'ancien repas pour ce créneau s'il existe (remplace)
    await pool.query(
      'DELETE FROM meal_plan WHERE week_start = $1 AND day_of_week = $2 AND meal_type = $3',
      [week_start, day_of_week, meal_type]
    );

    // Si recipe_id est null, on vide juste le créneau
    if (!recipe_id) {
      return res.json({ message: 'Créneau vidé' });
    }

    const result = await pool.query(
      'INSERT INTO meal_plan (week_start, day_of_week, meal_type, recipe_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [week_start, day_of_week, meal_type, recipe_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 24 - DELETE /api/meal-plan/:id
// Supprime un repas du planning
app.delete('/api/meal-plan/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const result = await pool.query(
      'DELETE FROM meal_plan WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Entrée non trouvée' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// GROCERY LIST
// ============================================

// 26 - GET /api/grocery-list?week=YYYY-MM-DD
// Génère la liste de courses à partir du planning de la semaine
// Regroupe par ingrédient, additionne les quantités, et associe les magasins
app.get('/api/grocery-list', async (req, res) => {
  try {
    const weekStart = req.query.week;
    if (!weekStart) {
      return res.status(400).json({ error: 'Le paramètre "week" est requis' });
    }

    // Étape 1: Récupérer tous les ingrédients nécessaires pour la semaine
    // On JOIN: meal_plan -> recipe_ingredients -> ingredients
    // On GROUP BY ingrédient pour additionner les quantités
    const ingredientsResult = await pool.query(
      `SELECT 
        i.ingredient_id,
        i.nom,
        i.unit_standard,
        ri.unit,
        SUM(ri.quantite) as total_quantite,
        COUNT(mp.id) as nb_recettes
      FROM meal_plan mp
      JOIN recipe_ingredients ri ON mp.recipe_id = ri.recipe_id
      JOIN ingredients i ON ri.ingredient_id = i.ingredient_id
      WHERE mp.week_start = $1
      GROUP BY i.ingredient_id, i.nom, i.unit_standard, ri.unit
      ORDER BY i.nom`,
      [weekStart]
    );

    // Étape 2: Pour chaque ingrédient, récupérer SEULEMENT la source prioritaire
    // ORDER BY priorite ASC = le plus petit chiffre en premier (1 = premier choix)
    // DISTINCT ON (ingredient_id) = ne garder que la première ligne par ingrédient
    const sourcesResult = await pool.query(
      `SELECT DISTINCT ON (ingredient_id) 
        ingredient_id, lieu, prix, quantite_achat, priorite
       FROM ingredient_sources
       ORDER BY ingredient_id, priorite ASC, source_id ASC`
    );

    // Créer un map: un seul magasin par ingrédient (le prioritaire)
    const sourcesMap = {};
    for (const source of sourcesResult.rows) {
      sourcesMap[source.ingredient_id] = source;
    }

    // Combiner ingrédients + source prioritaire
    const groceryList = ingredientsResult.rows.map(ing => ({
      ...ing,
      source: sourcesMap[ing.ingredient_id] || null
    }));

    res.json(groceryList);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
