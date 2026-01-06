export default function RecipeTable({ recipes, loading, error, onAddRecipe, onModifyRecipe, onDeleteRecipe }) {
  return (
    <div className="space-y-4">
      {/* Bouton Add Recipe */}
      <div className="flex justify-end">
        <button 
          onClick={onAddRecipe}  
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          + Add recipe
        </button>
      </div>

      {/* Affichage du chargement */}
      {loading && (
        <div className="text-center py-12">
          <p className="text-gray-600">Chargement des recettes...</p>
        </div>
      )}

      {/* Affichage des erreurs */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Erreur: {error}
        </div>
      )}

      {/* Tableau des recettes */}
      {!loading && !error && recipes.length > 0 && (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="w-full">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="px-6 py-3 text-left">Name</th>
                <th className="px-6 py-3 text-left">Description</th>
                <th className="px-6 py-3 text-left">Author</th>
                <th className="px-6 py-3 text-left">Link</th>
                <th className="px-6 py-3 text-left">GF</th>
                <th className="px-6 py-3 text-left">Tag</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recipes.map((recipe) => (
                <tr key={recipe.recipe_id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {recipe.nom}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                      {recipe.details_recette ? (
                        recipe.details_recette.length > 40
                          ? recipe.details_recette.substring(0, 40) + '...'
                          : recipe.details_recette
                      ) : (
                        '-'
                      )}
                    </td>
                  <td className="px-6 py-4 text-gray-600">
                    {recipe.auteur || '-'}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {recipe.lien ? (
                      <a href={recipe.lien} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        Link
                      </a>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-600">-</td>
                  <td className="px-6 py-4">
                      {recipe.tag && (
                        <div className="flex flex-wrap gap-2">
                          {recipe.tag.split(',').map((tag, index) => (
                            <span 
                              key={index}
                              className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm whitespace-nowrap"
                            >
                              {tag.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onModifyRecipe(recipe)}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200 font-medium"
                      >
                        Modify
                      </button>
                      <button
                        onClick={() => onDeleteRecipe(recipe.recipe_id, recipe.nom)}
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

      {/* Message si pas de recettes */}
      {!loading && !error && recipes.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-600">Aucune recette trouvée</p>
        </div>
      )}
    </div>
  );
}