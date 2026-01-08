import { useEffect, useState } from 'react';
import IngredientTable from '../components/IngredientTable';
import CreateIngredientModal from '../components/CreateIngredientModal';
import ModifyIngredientModal from '../components/ModifyIngredientModal';
import * as api from '../services/api';

export default function IngredientList() {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isModifyModalOpen, setIsModifyModalOpen] = useState(false);
  const [ingredientToModify, setIngredientToModify] = useState(null);

  useEffect(() => {
    loadIngredients();
  }, []);

  async function loadIngredients() {
    try {
      setLoading(true);
      const data = await api.getIngredients();
      setIngredients(data);
      console.log('Ingrédients chargés:', data);
    } catch (err) {
      setError(err.message);
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleIngredientCreated() {
    loadIngredients();
  }

  function handleModifyIngredient(ingredient) {
    setIngredientToModify(ingredient);
    setIsModifyModalOpen(true);
  }

  function handleIngredientModified() {
    loadIngredients();
  }

  async function handleDeleteIngredient(ingredientId, ingredientName) {
    if (window.confirm(`Supprimer l'ingrédient "${ingredientName}"?`)) {
      try {
        await api.deleteIngredient(ingredientId);
        loadIngredients();
      } catch (err) {
        alert(`Erreur: ${err.message}`);
      }
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Ingredient List</h2>
      
      <IngredientTable 
        ingredients={ingredients} 
        loading={loading} 
        error={error}
        onAddIngredient={() => setIsCreateModalOpen(true)}
        onModifyIngredient={handleModifyIngredient}
        onDeleteIngredient={handleDeleteIngredient}
      />

      {isCreateModalOpen && (
        <CreateIngredientModal 
          onIngredientCreated={handleIngredientCreated}
          onClose={() => setIsCreateModalOpen(false)}
        />
      )}

      {isModifyModalOpen && ingredientToModify && (
        <ModifyIngredientModal 
          ingredient={ingredientToModify}
          onIngredientModified={handleIngredientModified}
          onClose={() => {
            setIsModifyModalOpen(false);
            setIngredientToModify(null);
          }}
        />
      )}
    </div>
  );
}