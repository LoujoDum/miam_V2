import { useEffect, useState } from 'react';
import * as api from './services/api';

export default function App() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recipeDetail, setRecipeDetail] = useState(null);

  useEffect(() => {
    loadRecipes();
    loadRecipeById(2);
  }, []);

  async function loadRecipes() {
    try {
      setLoading(true);
      const data = await api.getRecipes();
      setRecipes(data);
      console.log('Recettes chargées:', data);
    } catch (err) {
      setError(err.message);
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  }

 async function loadRecipeById(id) {
    try {
      setLoading(true);
      const data = await api.getRecipeById(id);
      setRecipeDetail(data);
      console.log('Recette by id chargée:', data);
    } catch (err) {
      setError(err.message);
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  }
  

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Test API
        </h1>

        {loading && <p className="text-gray-600">Chargement...</p>}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Erreur: {error}
          </div>
        )}

        {!loading && !error && (
          <div>
            <p className="text-gray-600 mb-4">
              {recipes.length} recettes chargées avec succès! ✅
            </p>
            <div className="bg-white rounded-lg p-4 shadow">
              <h2 className="font-bold mb-2">Recettes:</h2>
              <ul className="space-y-2">
                {recipes.map(recipe => (
                  <li key={recipe.recipe_id} className="text-gray-700">
                    • {recipe.nom} (par {recipe.auteur})
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-lg p-4 shadow">
             <h2 className="font-bold mb-2">Recette 2:</h2>
              <ul className="space-y-2">
               {recipeDetail && (  // ✅ Si recipeDetail existe
                 <li className="text-gray-700">
                • {recipeDetail.nom} (par {recipeDetail.auteur})
                </li>
                )}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}