import { useEffect, useState } from 'react';
import * as api from '../services/api';

export default function SelectIngredientForSourceModal({ onSelectIngredient, onClose }) {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadIngredients();
  }, []);

  async function loadIngredients() {
    try {
      setLoading(true);
      const data = await api.getIngredients();
      setIngredients(data);
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  }

  const filteredIngredients = ingredients.filter(ing =>
    ing.nom.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4">
        
        {/* En-tête */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Select ingredient</h2>
        </div>

        {/* Contenu */}
        <div className="px-6 py-4 space-y-4 max-h-96 overflow-y-auto">
          
          {/* Recherche */}
          <div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ingredient..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>

          {/* Liste des ingrédients */}
          {loading ? (
            <p className="text-gray-600">Chargement...</p>
          ) : (
            <div className="space-y-2">
              {filteredIngredients.map(ing => (
                <button
                  key={ing.ingredient_id}
                  onClick={() => {
                    onSelectIngredient(ing);
                    onClose();
                  }}
                  className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-500 transition"
                >
                  <p className="font-medium text-gray-900">{ing.nom}</p>
                  <p className="text-sm text-gray-600">
                    Unit: {ing.unit_standard || '-'}
                  </p>
                </button>
              ))}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
}