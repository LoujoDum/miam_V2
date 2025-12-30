// Importer les packages
const express = require('express');
const cors = require('cors');
const pool = require('./db');
require('dotenv').config();

// Créer l'application Express
const app = express();

// Configuration
app.use(cors());
app.use(express.json());

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
    
    // Vérifie si la liste d'ingredients existe
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Liste ingredients non trouvée' });
    } else {
      res.json(result.rows);  // Retourne UNE liste d'ingredients
    }
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
  // On interroge SQL en faisant une jointure entre la table ingredients i et ingredient_sources is
  const result = await pool.query (
    'SELECT i.ingredient_id, i.nom, isou.lieu, isou.prix, isou.quantite_achat FROM ingredients i JOIN ingredient_sources isou ON i.ingredient_id = isou.ingredient_id WHERE i.ingredient_id = $1',
    [IngredientId]
  );

  //On vérifie si l'ingrédient existe
  if(result.rows.length === 0){
    res.status(404).json({error:'Liste de sources non trouvées pour cet ingrédient'});
  }else {
    res.json(result.rows); // retourne une liste d'ingrédients avec leurs sources
  }
 } catch(err){
  res.status(500).json({error: err.message})
 }
});

// 6 - Route POST - Créer une nouvelle recette
app.post('/api/recipes', async (req, res) => {
  try {
    // Récupère les données du body
    const { nom, auteur, details_recette, lien, tag } = req.body;
    
    // Vérifie que "nom" existe
    if (!nom) {
      res.status(400).json({ error: 'Le champ "nom" est requis' });
      return;
    }
    
    // Insère dans PostgreSQL
    const result = await pool.query(
      'INSERT INTO recipes (nom, auteur, details_recette, lien, tag) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [nom, auteur, details_recette, lien, tag]
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
    const { nom, auteur, details_recette, lien, tag } = req.body;
    
    if (!nom) {
      res.status(400).json({ error: 'Le champ "nom" est requis' });
      return;
    }
    
    const result = await pool.query(
   'UPDATE recipes SET nom = $1, auteur = $2, details_recette = $3, lien = $4, tag = $5 WHERE recipe_id = $6 RETURNING *',
    [nom, auteur, details_recette, lien, tag, recipeId]
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
    const { lieu, prix, quantite_achat } = req.body;  // ← Sans source_id!
    
    // Vérifie que "lieu" existe
    if (!lieu) {
      res.status(400).json({ error: 'Le champ "lieu" est requis' });
      return;
    }
    
    // Insère dans PostgreSQL
    const result = await pool.query(
      'INSERT INTO ingredient_sources (ingredient_id, lieu, prix, quantite_achat) VALUES ($1, $2, $3, $4) RETURNING *',  // ← 4 paramètres!
      [ingredientId, lieu, prix, quantite_achat]  // ← 4 paramètres!
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
    const {lieu, prix, quantite_achat } = req.body;
    
    // Exécute l'UPDATE avec 2 conditions
    const result = await pool.query(
      'UPDATE ingredient_sources SET lieu = $1, prix = $2, quantite_achat = $3 WHERE ingredient_id = $4 AND source_id = $5 RETURNING *',
      [lieu, prix, quantite_achat, ingredientId, sourceId]
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

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
