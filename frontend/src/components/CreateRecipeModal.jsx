import { useState } from 'react';
import * as api from '../services/api';
import SelectIngredientModal from './SelectIngredientModal';

export default function CreateRecipeModal({ onRecipeCreated, onClose }) {
  // État imbriqué (Option B)
  const [recipe, setRecipe] = useState({
    nom: '',
    auteur: '',
    tag: '',
    lien: '',
    details_recette: '',
    ingredients: []
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showIngredientModal, setShowIngredientModal] = useState(false); 

  // Mettre à jour un champ simple
  function handleInputChange(field, value) {
    setRecipe(prev => ({
      ...prev,
      [field]: value
    }));
  }

  // Créer la recette
  async function handleCreateRecipe() {
    try {
      // Validation
      if (!recipe.nom.trim()) {
        setError('Le nom de la recette est requis');
        return;
      }

      setLoading(true);
      setError(null);

      // 1. Créer la recette
      const newRecipe = await api.createRecipe({
        nom: recipe.nom,
        auteur: recipe.auteur || null,
        details_recette: recipe.details_recette || null,
        lien: recipe.lien || null,
        tag: recipe.tag || null
      });

      console.log('Recette créée:', newRecipe);

      // 2. Ajouter les ingrédients (si existe)
      if (recipe.ingredients.length > 0) {
        for (const ing of recipe.ingredients) {
          await api.addIngredientToRecipe(newRecipe.recipe_id, {
            ingredient_id: ing.ingredient_id,
            quantite: ing.quantite,
            unit: ing.unit,
            comment: ing.comment
          });
        }
      }

      // 3. Notifier le parent et fermer
      onRecipeCreated();
      onClose();

    } catch (err) {
      setError(err.message);
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  }

// Ajouter un ingrédient
  function handleAddIngredient(ingredient) {
    setRecipe(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, ingredient]
    }));
    setShowIngredientModal(false);
  }

  // Retirer un ingrédient
  function handleRemoveIngredient(index) {
    setRecipe(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  }

  // Annuler
  function handleCancel() {
    setRecipe({
      nom: '',
      auteur: '',
      tag: '',
      lien: '',
      details_recette: '',
      ingredients: []
    });
    setError(null);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
        
        {/* En-tête */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Create recipe</h2>
        </div>

        {/* Contenu */}
        <div className="px-6 py-4 space-y-4">
          
          {/* Erreurs */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Recipe name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recipe name *
            </label>
            <input
              type="text"
              value={recipe.nom}
              onChange={(e) => handleInputChange('nom', e.target.value)}
              placeholder="Here we write the name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Author */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Author
            </label>
            <input
              type="text"
              value={recipe.auteur}
              onChange={(e) => handleInputChange('auteur', e.target.value)}
              placeholder="Here is the author of the recipe"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Tag */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tag
            </label>
            <input
              type="text"
              value={recipe.tag}
              onChange={(e) => handleInputChange('tag', e.target.value)}
              placeholder="e.g., Italian, Quick, Dessert"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Link */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Link
            </label>
            <input
              type="url"
              value={recipe.lien}
              onChange={(e) => handleInputChange('lien', e.target.value)}
              placeholder="https://example.com/recipe"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Ingredients */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ingredients
            </label>
            
            {/* Liste des ingrédients ajoutés */}
            {recipe.ingredients.length > 0 && (
              <div className="space-y-2 mb-4">
                {recipe.ingredients.map((ing, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
                    <div>
                      <p className="font-medium text-gray-900">{ing.nom}</p>
                      <p className="text-sm text-gray-600">
                        {ing.quantite} {ing.unit}
                        {ing.comment && ` - ${ing.comment}`}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveIngredient(index)}
                      className="text-red-600 hover:text-red-700 font-bold"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {/* Bouton ajouter ingrédient */}
            <button
              onClick={() => setShowIngredientModal(true)}
              className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-700 hover:border-blue-500 hover:text-blue-600 font-medium"
            >
              + Add ingredient
            </button>
          </div>

          {/* Details */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Details
            </label>
            <textarea
              value={recipe.details_recette}
              onChange={(e) => handleInputChange('details_recette', e.target.value)}
              placeholder="Description, steps, notes..."
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

        </div>

        {/* Footer - Boutons */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-between gap-3">
          <button
            onClick={handleCancel}
            disabled={loading}
            className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateRecipe}
            disabled={loading}
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium disabled:opacity-50"
          >
            {loading ? 'Creating...' : '✓ Create recipe'}
          </button>
        </div>

      </div>
      {/* Modal pour ajouter un ingrédient */}
      {showIngredientModal && (
        <SelectIngredientModal
          onSelectIngredient={handleAddIngredient}
          onClose={() => setShowIngredientModal(false)}
        />
      )}
    </div>
  );
}