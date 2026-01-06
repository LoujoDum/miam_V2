import { useEffect, useState } from 'react';
import RecipeTable from '../components/RecipeTable';
import CreateRecipeModal from '../components/CreateRecipeModal';
import ModifyRecipeModal from '../components/ModifyRecipeModal';  // ← Ajouter
import * as api from '../services/api';

export default function RecipeList() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isModifyModalOpen, setIsModifyModalOpen] = useState(false);  // ← Ajouter
  const [recipeToModify, setRecipeToModify] = useState(null);  // ← Ajouter

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

  function handleRecipeCreated() {
    loadRecipes();
  }

  function handleModifyRecipe(recipe) {
    setRecipeToModify(recipe);
    setIsModifyModalOpen(true);
  }

  function handleRecipeModified() {
    loadRecipes();
  }

  async function handleDeleteRecipe(recipeId, recipeName) {
    if (window.confirm(`Supprimer la recette "${recipeName}"?`)) {
      try {
        await api.deleteRecipe(recipeId);
        loadRecipes();
      } catch (err) {
        alert(`Erreur: ${err.message}`);
      }
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Recipe List</h2>
      
      <RecipeTable 
        recipes={recipes} 
        loading={loading} 
        error={error}
        onAddRecipe={() => setIsCreateModalOpen(true)}
        onModifyRecipe={handleModifyRecipe}  // ← Ajouter
        onDeleteRecipe={handleDeleteRecipe}  // ← Ajouter
      />

      {isCreateModalOpen && (
        <CreateRecipeModal 
          onRecipeCreated={handleRecipeCreated}
          onClose={() => setIsCreateModalOpen(false)}
        />
      )}

      {/* Modal de modification */}  {/* ← Ajouter */}
      {isModifyModalOpen && recipeToModify && (
        <ModifyRecipeModal 
          recipe={recipeToModify}
          onRecipeModified={handleRecipeModified}
          onClose={() => {
            setIsModifyModalOpen(false);
            setRecipeToModify(null);
          }}
        />
      )}
    </div>
  );
}