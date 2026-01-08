import { useState } from 'react';
import * as api from '../services/api';

export default function ModifySourceModal({ ingredientId, source, onSourceModified, onClose }) {
  const [formData, setFormData] = useState({
    lieu: source.lieu,
    prix: source.prix || '',
    quantite_achat: source.quantite_achat || ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function handleInputChange(field, value) {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }

  async function handleSaveSource() {
    try {
      if (!formData.lieu.trim()) {
        setError('Le lieu est requis');
        return;
      }

      setLoading(true);
      setError(null);

      await api.updateSource(ingredientId, source.source_id, {
        lieu: formData.lieu,
        prix: formData.prix ? parseFloat(formData.prix) : null,
        quantite_achat: formData.quantite_achat || null
      });

      onSourceModified();
      onClose();

    } catch (err) {
      setError(err.message);
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
    setError(null);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
        
        {/* En-tête */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Modify source</h2>
          <p className="text-sm text-gray-600 mt-1">Editing: {source.lieu}</p>
        </div>

        {/* Contenu */}
        <div className="px-6 py-4 space-y-4">
          
          {/* Erreurs */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Lieu */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Where to buy *
            </label>
            <input
              type="text"
              value={formData.lieu}
              onChange={(e) => handleInputChange('lieu', e.target.value)}
              placeholder="e.g., Carrefour, Marché local, etc."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Prix */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price (€)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.prix}
              onChange={(e) => handleInputChange('prix', e.target.value)}
              placeholder="e.g., 2.50"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Quantité d'achat */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity per purchase
            </label>
            <input
              type="text"
              value={formData.quantite_achat}
              onChange={(e) => handleInputChange('quantite_achat', e.target.value)}
              placeholder="e.g., 1kg, 500g, 6 pieces"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-between gap-3">
          <button
            onClick={handleCancel}
            disabled={loading}
            className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveSource}
            disabled={loading}
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium disabled:opacity-50"
          >
            {loading ? 'Saving...' : '✓ Save'}
          </button>
        </div>

      </div>
    </div>
  );
}