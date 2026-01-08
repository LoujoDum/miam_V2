import { useEffect, useState } from 'react';
import IngredientSourceTable from '../components/IngredientSourceTable';
import SelectIngredientForSourceModal from '../components/SelectIngredientForSourceModal';
import CreateSourceModal from '../components/CreateSourceModal';
import ModifySourceModal from '../components/ModifySourceModal';
import * as api from '../services/api';

export default function IngredientSourceList() {
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [isSelectIngredientModalOpen, setIsSelectIngredientModalOpen] = useState(false);
  const [isCreateSourceModalOpen, setIsCreateSourceModalOpen] = useState(false);
  const [isModifySourceModalOpen, setIsModifySourceModalOpen] = useState(false);
  const [sourceToModify, setSourceToModify] = useState(null);

  // Charger les sources quand on sélectionne un ingrédient
  useEffect(() => {
    if (selectedIngredient) {
      loadSources();
    }
  }, [selectedIngredient]);

  async function loadSources() {
    try {
      setLoading(true);
      const data = await api.getIngredientSources(selectedIngredient.ingredient_id);
      setSources(data);
      console.log('Sources chargées:', data);
    } catch (err) {
      setError(err.message);
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleSelectIngredient(ingredient) {
    setSelectedIngredient(ingredient);
    setIsSelectIngredientModalOpen(false);
  }

  function handleSourceCreated() {
    loadSources();
  }

  function handleModifySource(source) {
    setSourceToModify(source);
    setIsModifySourceModalOpen(true);
  }

  function handleSourceModified() {
    loadSources();
  }

  async function handleDeleteSource(sourceId, sourceName) {
    if (window.confirm(`Supprimer la source "${sourceName}"?`)) {
      try {
        await api.deleteSource(selectedIngredient.ingredient_id, sourceId);
        loadSources();
      } catch (err) {
        alert(`Erreur: ${err.message}`);
      }
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Ingredient Sources</h2>
      
      <IngredientSourceTable
        selectedIngredient={selectedIngredient}
        sources={sources}
        loading={loading}
        error={error}
        onSelectIngredient={() => setIsSelectIngredientModalOpen(true)}
        onAddSource={() => setIsCreateSourceModalOpen(true)}
        onModifySource={handleModifySource}
        onDeleteSource={handleDeleteSource}
      />

      {isSelectIngredientModalOpen && (
        <SelectIngredientForSourceModal
          onSelectIngredient={handleSelectIngredient}
          onClose={() => setIsSelectIngredientModalOpen(false)}
        />
      )}

      {isCreateSourceModalOpen && selectedIngredient && (
        <CreateSourceModal
          ingredientId={selectedIngredient.ingredient_id}
          onSourceCreated={handleSourceCreated}
          onClose={() => setIsCreateSourceModalOpen(false)}
        />
      )}

      {isModifySourceModalOpen && selectedIngredient && sourceToModify && (
        <ModifySourceModal
          ingredientId={selectedIngredient.ingredient_id}
          source={sourceToModify}
          onSourceModified={handleSourceModified}
          onClose={() => {
            setIsModifySourceModalOpen(false);
            setSourceToModify(null);
          }}
        />
      )}
    </div>
  );
}