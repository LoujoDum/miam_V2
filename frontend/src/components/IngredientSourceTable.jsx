export default function IngredientSourceTable({
  selectedIngredient,
  sources,
  loading,
  error,
  onSelectIngredient,
  onAddSource,
  onModifySource,
  onDeleteSource
}) {
  return (
    <div className="space-y-4">
      {/* Sélection d'ingrédient */}
      <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Selected Ingredient</p>
            <p className="text-lg font-bold text-gray-900">
              {selectedIngredient ? selectedIngredient.nom : 'Select an ingredient'}
            </p>
          </div>
          <button
            onClick={onSelectIngredient}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            {selectedIngredient ? 'Change' : 'Select ingredient'}
          </button>
        </div>
      </div>

      {/* Bouton Add Source */}
      {selectedIngredient && (
        <div className="flex justify-end">
          <button
            onClick={onAddSource}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
          >
            + Add source
          </button>
        </div>
      )}

      {/* Message si pas d'ingrédient sélectionné */}
      {!selectedIngredient && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-600">Select an ingredient to view and manage its sources</p>
        </div>
      )}

      {/* Chargement */}
      {selectedIngredient && loading && (
        <div className="text-center py-12">
          <p className="text-gray-600">Chargement des sources...</p>
        </div>
      )}

      {/* Erreurs */}
      {selectedIngredient && error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Erreur: {error}
        </div>
      )}

      {/* Tableau des sources */}
      {selectedIngredient && !loading && !error && sources.length > 0 && (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="w-full">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="px-6 py-3 text-left">Where to buy</th>
                <th className="px-6 py-3 text-left">Price</th>
                <th className="px-6 py-3 text-left">Quantity</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sources.map((source) => (
                <tr key={source.source_id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {source.lieu}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {source.prix ? `${source.prix.toFixed(2)}€` : '-'}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {source.quantite_achat || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onModifySource(source)}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200 font-medium"
                      >
                        Modify
                      </button>
                      <button
                        onClick={() => onDeleteSource(source.source_id, source.lieu)}
                        className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded hover:bg-red-200 font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Message si pas de sources */}
      {selectedIngredient && !loading && !error && sources.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-600">Aucune source trouvée pour cet ingrédient</p>
        </div>
      )}
    </div>
  );
}