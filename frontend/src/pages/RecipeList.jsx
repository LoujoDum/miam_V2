import { useEffect, useState } from 'react';
import RecipeTable from '../components/RecipeTable';
import CreateRecipeModal from '../components/CreateRecipeModal';
import * as api from '../services/api';

export default function RecipeList() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);  // ← Ajouter

  useEffect(() => {
    loadRecipes();
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

  // Quand une recette est créée
  function handleRecipeCreated() {
    loadRecipes();  // Rafraîchir la liste
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Recipe List</h2>
      
      {/* Passer le callback au bouton */}
      <RecipeTable 
        recipes={recipes} 
        loading={loading} 
        error={error}
        onAddRecipe={() => setIsModalOpen(true)}  // ← Ajouter
      />

      {/* Modal */}
      {isModalOpen && (
        <CreateRecipeModal 
          onRecipeCreated={handleRecipeCreated}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}