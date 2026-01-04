import { useState } from 'react';
import Header from './components/Header';
import RecipeList from './pages/RecipeList';

export default function App() {
  const [activeTab, setActiveTab] = useState('recipes');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="max-w-6xl mx-auto px-8 py-12">
        {activeTab === 'recipes' && <RecipeList />}  {/* ← Utiliser le composant */}
        
        {activeTab === 'ingredients' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Ingredient List</h2>
            <p className="text-gray-600">Les ingrédients vont ici</p>
          </div>
        )}
        
        {activeTab === 'grocery' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Grocery List</h2>
            <p className="text-gray-600">La liste de course va ici</p>
          </div>
        )}
        
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