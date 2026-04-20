import { useEffect, useState } from 'react';
import * as api from '../services/api';

const STORES = [
  'Boucherie - Marché Maisonneuve',
  'Chez Anna',
  'Dauphinais - Marché Maisonneuve',
  'Fromage - Marché Maisonneuve',
  'Maxi',
  'Merci - Marché Maisonneuve',
  'Poissonnier - Marché Maisonneuve',
  'SAQ',
  'Segal',
];

export default function ModifyIngredientModal({ ingredient, onIngredientModified, onClose }) {
  const [formData, setFormData] = useState({
    nom: ingredient.nom,
    unit_standard: ingredient.unit_standard || '',
    gluten_free: ingredient.gluten_free,
    fibre: ingredient.fibre || ''
  });

  // Chaque source a: { lieu, prix, quantite_achat, source_id?, isNew?, priorite }
  const [sources, setSources] = useState([]);
  const [showAddSource, setShowAddSource] = useState(false);
  const [selectedStores, setSelectedStores] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSources();
  }, []);

  async function loadSources() {
    try {
      const data = await api.getIngredientSources(ingredient.ingredient_id);
      // Les sources arrivent déjà triées par priorité depuis le backend
      setSources(data);
    } catch (err) {
      setSources([]);
    }
  }

  function handleInputChange(field, value) {
    setFormData(prev => ({ ...prev, [field]: value }));
  }

  function handleToggleStore(store) {
    setSelectedStores(prev => {
      if (prev[store]) {
        const updated = { ...prev };
        delete updated[store];
        return updated;
      } else {
        return { ...prev, [store]: { prix: '', quantite_achat: '' } };
      }
    });
  }

  function handleStoreDetailChange(store, field, value) {
    setSelectedStores(prev => ({
      ...prev,
      [store]: { ...prev[store], [field]: value }
    }));
  }

  function handleConfirmAddSources() {
    const currentLength = sources.length;
    const newSources = Object.entries(selectedStores).map(([lieu, details], i) => ({
      lieu,
      prix: details.prix,
      quantite_achat: details.quantite_achat,
      priorite: currentLength + i + 1, // Priorité après les existantes
      isNew: true
    }));
    setSources(prev => [...prev, ...newSources]);
    setSelectedStores({});
    setShowAddSource(false);
  }

  function handleRemoveSource(index) {
    setSources(prev => prev.filter((_, i) => i !== index));
  }

  // ─── Réordonner les sources (gérer les priorités) ───
  function handleMoveUp(index) {
    if (index === 0) return; // Déjà en premier
    setSources(prev => {
      const updated = [...prev];
      // Échange la position avec l'élément au-dessus
      [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
      return updated;
    });
  }

  function handleMoveDown(index) {
    if (index === sources.length - 1) return; // Déjà en dernier
    setSources(prev => {
      const updated = [...prev];
      [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
      return updated;
    });
  }

  async function handleSaveIngredient() {
    try {
      if (!formData.nom.trim()) {
        setError("Le nom de l'ingrédient est requis");
        return;
      }
      setLoading(true);
      setError(null);

      // 1. Mettre à jour l'ingrédient
      await api.updateIngredient(ingredient.ingredient_id, {
        nom: formData.nom,
        unit_standard: formData.unit_standard || null,
        gluten_free: formData.gluten_free,
        fibre: formData.fibre ? parseFloat(formData.fibre) : null
      });

      // 2. Synchroniser les sources
      const currentSources = await api.getIngredientSources(ingredient.ingredient_id);

      // Supprimer les sources qui ne sont plus dans la liste
      for (const current of currentSources) {
        const stillExists = sources.some(s => s.source_id === current.source_id);
        if (!stillExists) {
          await api.deleteSource(ingredient.ingredient_id, current.source_id);
        }
      }

      // Ajouter les nouvelles sources et mettre à jour les priorités
      for (let i = 0; i < sources.length; i++) {
        const source = sources[i];
        const newPriorite = i + 1; // Position dans la liste = priorité

        if (source.isNew) {
          // Nouvelle source : créer
          await api.addSource(ingredient.ingredient_id, {
            lieu: source.lieu,
            prix: source.prix ? parseFloat(source.prix) : null,
            quantite_achat: source.quantite_achat || null,
            priorite: newPriorite
          });
        } else if (source.source_id) {
          // Source existante : mettre à jour (priorité peut avoir changé)
          await api.updateSource(ingredient.ingredient_id, source.source_id, {
            lieu: source.lieu,
            prix: source.prix ? parseFloat(source.prix) : null,
            quantite_achat: source.quantite_achat || null,
            priorite: newPriorite
          });
        }
      }

      onIngredientModified();
      onClose();

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 max-h-screen overflow-y-auto">

        {/* En-tête */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Modify ingredient</h2>
          <p className="text-sm text-gray-600 mt-1">Editing: {ingredient.nom}</p>
        </div>

        <div className="px-6 py-4 space-y-4">

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Ingredient name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ingredient name *</label>
            <input
              type="text"
              value={formData.nom}
              onChange={(e) => handleInputChange('nom', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Unit Standard */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unit Standard</label>
            <input
              type="text"
              value={formData.unit_standard}
              onChange={(e) => handleInputChange('unit_standard', e.target.value)}
              placeholder="e.g., g, ml, un"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Gluten Free */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="gluten_free"
              checked={formData.gluten_free}
              onChange={(e) => handleInputChange('gluten_free', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <label htmlFor="gluten_free" className="ml-2 text-sm font-medium text-gray-700">
              Gluten Free
            </label>
          </div>

          {/* Fibre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fibre (g)</label>
            <input
              type="number"
              step="0.01"
              value={formData.fibre}
              onChange={(e) => handleInputChange('fibre', e.target.value)}
              placeholder="e.g., 2.5"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Sources avec priorité */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sources</label>
            <p className="text-xs text-gray-500 mb-2">
              Le premier magasin = préféré pour la liste de courses. Utilise ▲▼ pour réordonner.
            </p>

            {/* Liste des sources ordonnées par priorité */}
            {sources.length > 0 && (
              <div className="space-y-2 mb-3">
                {sources.map((source, index) => (
                  <div key={index} className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
                    index === 0 
                      ? 'bg-green-50 border-green-300' 
                      : 'bg-gray-50 border-gray-200'
                  }`}>
                    {/* Boutons réordonner */}
                    <div className="flex flex-col gap-0.5">
                      <button
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                        className="text-xs px-1 py-0.5 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Monter"
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => handleMoveDown(index)}
                        disabled={index === sources.length - 1}
                        className="text-xs px-1 py-0.5 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Descendre"
                      >
                        ▼
                      </button>
                    </div>

                    {/* Info source */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {index === 0 && (
                          <span className="text-xs px-1.5 py-0.5 bg-green-200 text-green-800 rounded font-medium">
                            Préféré
                          </span>
                        )}
                        <p className="font-medium text-gray-900 truncate">{source.lieu}</p>
                      </div>
                      <p className="text-sm text-gray-600">
                        {source.prix ? `${source.prix}$` : '-'}
                        {source.quantite_achat ? ` · ${source.quantite_achat}` : ''}
                      </p>
                    </div>

                    {/* Bouton supprimer */}
                    <button
                      onClick={() => handleRemoveSource(index)}
                      className="text-red-600 hover:text-red-700 font-bold flex-shrink-0"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Panneau d'ajout de sources */}
            {showAddSource && (
              <div className="border border-blue-200 rounded-lg p-3 mb-3 bg-blue-50 space-y-2">
                <p className="text-sm font-medium text-gray-700">Select stores:</p>

                {STORES.filter(store => !sources.some(s => s.lieu === store)).map(store => (
                  <div key={store}>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`store-${store}`}
                        checked={!!selectedStores[store]}
                        onChange={() => handleToggleStore(store)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <label htmlFor={`store-${store}`} className="text-sm text-gray-800 cursor-pointer">
                        {store}
                      </label>
                    </div>

                    {selectedStores[store] && (
                      <div className="flex gap-2 mt-1 ml-6">
                        <input
                          type="number"
                          placeholder="Price ($)"
                          value={selectedStores[store].prix}
                          onChange={(e) => handleStoreDetailChange(store, 'prix', e.target.value)}
                          className="w-1/2 px-3 py-1 border border-gray-300 rounded-lg text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Quantity (e.g., 1kg)"
                          value={selectedStores[store].quantite_achat}
                          onChange={(e) => handleStoreDetailChange(store, 'quantite_achat', e.target.value)}
                          className="w-1/2 px-3 py-1 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                    )}
                  </div>
                ))}

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={handleConfirmAddSources}
                    disabled={Object.keys(selectedStores).length === 0}
                    className="px-4 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
                  >
                    Add {Object.keys(selectedStores).length > 0 ? `(${Object.keys(selectedStores).length})` : ''}
                  </button>
                  <button
                    onClick={() => { setShowAddSource(false); setSelectedStores({}); }}
                    className="px-4 py-1 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {!showAddSource && (
              <button
                onClick={() => setShowAddSource(true)}
                className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-700 hover:border-blue-500 hover:text-blue-600 font-medium"
              >
                + Add source
              </button>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-between gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveIngredient}
            disabled={loading}
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium disabled:opacity-50"
          >
            {loading ? 'Saving...' : '✓ Save changes'}
          </button>
        </div>

      </div>
    </div>
  );
}
