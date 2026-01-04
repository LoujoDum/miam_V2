import { useEffect, useState } from 'react';
import * as api from '../services/api';

export default function SelectIngredientModal({ onSelectIngredient, onClose }) {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [quantite, setQuantite] = useState('');
  const [unit, setUnit] = useState('g');
  const [comment, setComment] = useState('');

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

  // Filtrer les ingrédients par recherche
  const filteredIngredients = ingredients.filter(ing =>
    ing.nom.toLowerCase().includes(search.toLowerCase())
  );

  // Ajouter l'ingrédient
  function handleAddIngredient() {
    if (!selectedIngredient || !quantite) {
      alert('Sélectionne un ingrédient et entre une quantité');
      return;
    }

    onSelectIngredient({
      ingredient_id: selectedIngredient.ingredient_id,
      nom: selectedIngredient.nom,
      quantite: parseFloat(quantite),
      unit: unit,
      comment: comment
    });

    // Reset
    setSelectedIngredient(null);
    setQuantite('');
    setUnit('g');
    setComment('');
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4">
        
        {/* En-tête */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Add ingredient</h2>
        </div>

        {/* Contenu */}
        <div className="px-6 py-4 space-y-4 max-h-96 overflow-y-auto">
          
          {/* Recherche */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search ingredient
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Type to search..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>

          {/* Liste des ingrédients */}
          {loading ? (
            <p className="text-gray-600">Chargement...</p>
          ) : (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {filteredIngredients.map(ing => (
                <button
                  key={ing.ingredient_id}
                  onClick={() => setSelectedIngredient(ing)}
                  className={`w-full text-left px-4 py-2 rounded-lg border-2 transition ${
                    selectedIngredient?.ingredient_id === ing.ingredient_id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-medium text-gray-900">{ing.nom}</p>
                  <p className="text-sm text-gray-600">
                    Unit: {ing.unit_standard || '-'}
                  </p>
                </button>
              ))}
            </div>
          )}

          {/* Quantité et Unit */}
          {selectedIngredient && (
            <div className="space-y-4 border-t pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantité
                  </label>
                  <input
                    type="number"
                    value={quantite}
                    onChange={(e) => setQuantite(e.target.value)}
                    placeholder="e.g., 300"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit
                  </label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="e.g., g, ml, un"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Commentaire */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Comment (optionnel)
                </label>
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="e.g., Frais, Bio, etc."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-between gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleAddIngredient}
            disabled={!selectedIngredient || !quantite}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
          >
            Add ingredient
          </button>
        </div>

      </div>
    </div>
  );
}