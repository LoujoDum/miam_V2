export default function IngredientTable({ 
  ingredients, 
  loading, 
  error, 
  onAddIngredient,
  onModifyIngredient,
  onDeleteIngredient 
}) {
  return (
    <div className="space-y-4">
      {/* Bouton Add Ingredient */}
      <div className="flex justify-end">
        <button 
          onClick={onAddIngredient}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          + Add ingredient
        </button>
      </div>

      {/* Affichage du chargement */}
      {loading && (
        <div className="text-center py-12">
          <p className="text-gray-600">Chargement des ingrédients...</p>
        </div>
      )}

      {/* Affichage des erreurs */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Erreur: {error}
        </div>
      )}

      {/* Tableau des ingrédients */}
      {!loading && !error && ingredients.length > 0 && (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="w-full">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="px-6 py-3 text-left">Name</th>
                <th className="px-6 py-3 text-left">Unit Standard</th>
                <th className="px-6 py-3 text-left">Gluten Free</th>
                <th className="px-6 py-3 text-left">Fibre</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {ingredients.map((ingredient) => (
                <tr key={ingredient.ingredient_id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {ingredient.nom}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {ingredient.unit_standard || '-'}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {ingredient.gluten_free ? '✓' : '✗'}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {ingredient.fibre || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onModifyIngredient(ingredient)}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200 font-medium"
                      >
                        Modify
                      </button>
                      <button
                        onClick={() => onDeleteIngredient(ingredient.ingredient_id, ingredient.nom)}
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

      {/* Message si pas d'ingrédients */}
      {!loading && !error && ingredients.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-600">Aucun ingrédient trouvé</p>
        </div>
      )}
    </div>
  );
}