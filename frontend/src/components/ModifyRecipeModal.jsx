import { useEffect, useState } from 'react';
import SelectIngredientModal from './SelectIngredientModal';
import * as api from '../services/api';

export default function ModifyRecipeModal({ recipe, onRecipeModified, onClose }) {
  // État avec données existantes
  const [formData, setFormData] = useState({
    nom: recipe.nom,
    auteur: recipe.auteur || '',
    tag: recipe.tag || '',
    lien: recipe.lien || '',
    details_recette: recipe.details_recette || ''
  });

  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingIngredients, setLoadingIngredients] = useState(true);
  const [error, setError] = useState(null);
  const [showIngredientModal, setShowIngredientModal] = useState(false);

  // Charger les ingrédients existants au démarrage
  useEffect(() => {
    loadRecipeIngredients();
  }, []);

  async function loadRecipeIngredients() {
    try {
      setLoadingIngredients(true);
      const data = await api.getRecipeIngredients(recipe.recipe_id);
      setIngredients(data);
      console.log('Ingrédients chargés:', data);
    } catch (err) {
      setError(err.message);
      console.error('Erreur:', err);
    } finally {
      setLoadingIngredients(false);
    }
  }

  // Mettre à jour un champ
  function handleInputChange(field, value) {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }

  // Ajouter un nouvel ingrédient
  function handleAddIngredient(newIngredient) {
    setIngredients(prev => [...prev, newIngredient]);
    setShowIngredientModal(false);
  }

  // Retirer un ingrédient
  function handleRemoveIngredient(index) {
    setIngredients(prev => prev.filter((_, i) => i !== index));
  }

  // Sauvegarder les modifications
  async function handleSaveRecipe() {
    try {
      // Validation
      if (!formData.nom.trim()) {
        setError('Le nom de la recette est requis');
        return;
      }

      setLoading(true);
      setError(null);

      // 1. Mettre à jour la recette
      await api.updateRecipe(recipe.recipe_id, {
        nom: formData.nom,
        auteur: formData.auteur || null,
        details_recette: formData.details_recette || null,
        lien: formData.lien || null,
        tag: formData.tag || null
      });

      console.log('Recette modifiée');

      // 2. Mettre à jour les ingrédients
      // On doit gérer les anciens vs nouveaux ingrédients
      
      // Récupérer les ingrédients actuels de la base
      const currentIngredients = await api.getRecipeIngredients(recipe.recipe_id);
      
      // Pour chaque ingrédient actuellement en base, vérifier s'il est toujours dans la liste
      for (const current of currentIngredients) {
        const stillExists = ingredients.some(
          ing => ing.ingredient_id === current.ingredient_id
        );
        
        if (!stillExists) {
          // Ingrédient supprimé: le retirer
          await api.removeIngredientFromRecipe(
            recipe.recipe_id,
            current.ingredient_id
          );
        }
      }

      // Pour chaque ingrédient dans la liste
      for (const ing of ingredients) {
        const currentIng = currentIngredients.find(
          c => c.ingredient_id === ing.ingredient_id
        );
        
        if (currentIng) {
          // Ingrédient existant: vérifier s'il faut le mettre à jour
          const needsUpdate = 
            currentIng.quantite !== ing.quantite ||
            currentIng.unit !== ing.unit ||
            currentIng.comment !== ing.comment;
          
          if (needsUpdate) {
            await api.updateRecipeIngredient(
              recipe.recipe_id,
              ing.ingredient_id,
              {
                quantite: ing.quantite,
                unit: ing.unit,
                comment: ing.comment
              }
            );
          }
        } else {
          // Nouvel ingrédient: l'ajouter
          await api.addIngredientToRecipe(recipe.recipe_id, {
            ingredient_id: ing.ingredient_id,
            quantite: ing.quantite,
            unit: ing.unit,
            comment: ing.comment
          });
        }
      }

      // 3. Notifier et fermer
      onRecipeModified();
      onClose();

    } catch (err) {
      setError(err.message);
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  }

  // Annuler
  function handleCancel() {
    setError(null);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
        
        {/* En-tête */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Modify recipe</h2>
          <p className="text-sm text-gray-600 mt-1">Editing: {recipe.nom}</p>
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
              value={formData.nom}
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
              value={formData.auteur}
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
              value={formData.tag}
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
              value={formData.lien}
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
            
            {/* Chargement des ingrédients */}
            {loadingIngredients ? (
              <p className="text-gray-600 text-sm">Chargement des ingrédients...</p>
            ) : (
              <>
                {/* Liste des ingrédients */}
                {ingredients.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {ingredients.map((ing, index) => (
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
              </>
            )}
          </div>

          {/* Details */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Details
            </label>
            <textarea
              value={formData.details_recette}
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
            onClick={handleSaveRecipe}
            disabled={loading}
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium disabled:opacity-50"
          >
            {loading ? 'Saving...' : '✓ Save changes'}
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