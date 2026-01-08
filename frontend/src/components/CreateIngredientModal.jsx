import { useState } from 'react';
import * as api from '../services/api';

export default function CreateIngredientModal({ onIngredientCreated, onClose }) {
  const [ingredient, setIngredient] = useState({
    nom: '',
    unit_standard: '',
    gluten_free: true,
    fibre: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function handleInputChange(field, value) {
    setIngredient(prev => ({
      ...prev,
      [field]: value
    }));
  }

  async function handleCreateIngredient() {
    try {
      // Validation
      if (!ingredient.nom.trim()) {
        setError('Le nom de l\'ingrédient est requis');
        return;
      }

      setLoading(true);
      setError(null);

      // Créer l'ingrédient
      await api.createIngredient({
        nom: ingredient.nom,
        unit_standard: ingredient.unit_standard || null,
        gluten_free: ingredient.gluten_free,
        fibre: ingredient.fibre ? parseFloat(ingredient.fibre) : null
      });

      onIngredientCreated();
      onClose();

    } catch (err) {
      setError(err.message);
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
    setIngredient({
      nom: '',
      unit_standard: '',
      gluten_free: true,
      fibre: ''
    });
    setError(null);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
        
        {/* En-tête */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Create ingredient</h2>
        </div>

        {/* Contenu */}
        <div className="px-6 py-4 space-y-4">
          
          {/* Erreurs */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Ingredient name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ingredient name *
            </label>
            <input
              type="text"
              value={ingredient.nom}
              onChange={(e) => handleInputChange('nom', e.target.value)}
              placeholder="e.g., Tomato, Butter, etc."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Unit Standard */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unit Standard
            </label>
            <input
              type="text"
              value={ingredient.unit_standard}
              onChange={(e) => handleInputChange('unit_standard', e.target.value)}
              placeholder="e.g., g, ml, un"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Gluten Free */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="gluten_free"
              checked={ingredient.gluten_free}
              onChange={(e) => handleInputChange('gluten_free', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="gluten_free" className="ml-2 text-sm font-medium text-gray-700">
              Gluten Free
            </label>
          </div>

          {/* Fibre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fibre (g)
            </label>
            <input
              type="number"
              step="0.01"
              value={ingredient.fibre}
              onChange={(e) => handleInputChange('fibre', e.target.value)}
              placeholder="e.g., 2.5"
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
            onClick={handleCreateIngredient}
            disabled={loading}
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium disabled:opacity-50"
          >
            {loading ? 'Creating...' : '✓ Create'}
          </button>
        </div>

      </div>
    </div>
  );
}