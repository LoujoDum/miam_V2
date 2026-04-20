import { useState } from 'react';
import Header from './components/Header';
import RecipeList from './pages/RecipeList';
import IngredientList from './pages/IngredientList';
import IngredientSourceList from './pages/IngredientSourceList';
import CalendarPage from './pages/CalendarPage';
import GroceryListPage from './pages/GroceryListPage';

export default function App() {
  const [activeTab, setActiveTab] = useState('calendar');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="max-w-6xl mx-auto px-8 py-12">
        {activeTab === 'calendar' && <CalendarPage />}
        
        {activeTab === 'recipes' && <RecipeList />}
        
        {activeTab === 'ingredients' && <IngredientList />}
        
        {activeTab === 'grocery' && <GroceryListPage />}
      </main>
    </div>
  );
}