// Configuration de base
const API_BASE_URL = 'http://localhost:3000/api';

// Helper pour les requêtes
async function request(method, endpoint, body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur API');
  }

  return response.json();
}

// ============================================
// RECIPES
// ============================================

export function getRecipes() {
  return request('GET', '/recipes');
}

export function getRecipeById(id) {
  return request('GET', `/recipes/${id}`);
}

export function createRecipe(data) {
  return request('POST', '/recipes', data);
}

export function updateRecipe(id, data) {
  return request('PUT', `/recipes/${id}`, data);
}

export function deleteRecipe(id) {
  return request('DELETE', `/recipes/${id}`);
}

// ============================================
// INGREDIENTS
// ============================================

export function getIngredients() {
  return request('GET', '/ingredients');
}

export function getIngredientById(id) {
  return request('GET', `/ingredients/${id}`);
}

export function createIngredient(data) {
  return request('POST', '/ingredients', data);
}

export function updateIngredient(id, data) {
  return request('PUT', `/ingredients/${id}`, data);
}

export function deleteIngredient(id) {
  return request('DELETE', `/ingredients/${id}`);
}

// ============================================
// RECIPE INGREDIENTS (Liaison)
// ============================================

export function getRecipeIngredients(recipeId) {
  return request('GET', `/recipes/${recipeId}/ingredients`);
}

export function addIngredientToRecipe(recipeId, data) {
  return request('POST', `/recipes/${recipeId}/ingredients`, data);
}

export function updateRecipeIngredient(recipeId, ingredientId, data) {
  return request('PUT', `/recipes/${recipeId}/ingredients/${ingredientId}`, data);
}

export function removeIngredientFromRecipe(recipeId, ingredientId) {
  return request('DELETE', `/recipes/${recipeId}/ingredients/${ingredientId}`);
}

// ============================================
// INGREDIENT SOURCES
// ============================================

export function getIngredientSources(ingredientId) {
  return request('GET', `/ingredients/${ingredientId}/sources`);
}

export function addSource(ingredientId, data) {
  return request('POST', `/ingredients/${ingredientId}/sources`, data);
}

export function updateSource(ingredientId, sourceId, data) {
  return request('PUT', `/ingredients/${ingredientId}/sources/${sourceId}`, data);
}

export function deleteSource(ingredientId, sourceId) {
  return request('DELETE', `/ingredients/${ingredientId}/sources/${sourceId}`);
}