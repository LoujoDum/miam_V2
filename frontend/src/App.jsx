import { useState } from 'react';
import Header from './components/Header';
import RecipeList from './pages/RecipeList';
import IngredientList from './pages/IngredientList';
import IngredientSourceList from './pages/IngredientSourceList';

export default function App() {
  const [activeTab, setActiveTab] = useState('recipes');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="max-w-6xl mx-auto px-8 py-12">
        {activeTab === 'recipes' && <RecipeList />}  {/* ← Utiliser le composant */}
        
        {activeTab === 'ingredients' && <IngredientList />} {/* ← Utiliser le composant */}
        
        {activeTab === 'grocery' && <IngredientSourceList />}
        
        {activeTab === 'calendar' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Calendar</h2>
            <p className="text-gray-600">Le calendrier va ici</p>
          </div>
        )}
      </main>
    </div>
  );
}