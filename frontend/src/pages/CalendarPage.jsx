import { useEffect, useState, useRef } from 'react';
import * as api from '../services/api';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAYS_FR = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const MEAL_TYPES = ['lunch', 'dinner'];
const MEAL_LABELS = { lunch: 'Midi', dinner: 'Soir' };

function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d;
}

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function getDayDate(monday, dayIndex) {
  const d = new Date(monday);
  d.setDate(d.getDate() + dayIndex);
  return d;
}

// ─── Composant RecipePicker ─────────────────────────────────
// Un dropdown avec recherche intégrée pour sélectionner une recette
function RecipePicker({ recipes, currentRecipeId, onSelect, disabled }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);

  // Ferme le dropdown quand on clique ailleurs
  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setIsOpen(false);
        setSearch('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = recipes.filter(r =>
    r.nom.toLowerCase().includes(search.toLowerCase())
  );

  const currentRecipe = recipes.find(r => r.recipe_id === currentRecipeId);

  return (
    <div ref={ref} className="relative">
      {/* Bouton qui ouvre le dropdown */}
      <button
        onClick={() => { if (!disabled) setIsOpen(!isOpen); }}
        disabled={disabled}
        className={`w-full text-left text-sm rounded-lg px-3 py-2 border transition
          ${currentRecipe 
            ? 'border-green-300 bg-green-50 text-gray-900' 
            : 'border-gray-200 bg-white text-gray-400 hover:border-blue-300'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        {currentRecipe ? currentRecipe.nom : '+ Ajouter un repas'}
      </button>

      {/* Dropdown avec recherche */}
      {isOpen && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-hidden">
          {/* Barre de recherche */}
          <div className="p-2 border-b border-gray-100">
            <input
              type="text"
              placeholder="Rechercher une recette..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
              className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Liste des recettes */}
          <div className="overflow-y-auto max-h-48">
            {/* Option pour vider le créneau */}
            {currentRecipe && (
              <button
                onClick={() => { onSelect(null); setIsOpen(false); setSearch(''); }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 border-b border-gray-100"
              >
                ✕ Retirer le repas
              </button>
            )}

            {filtered.length === 0 ? (
              <p className="px-4 py-3 text-sm text-gray-400">Aucune recette trouvée</p>
            ) : (
              filtered.map(r => (
                <button
                  key={r.recipe_id}
                  onClick={() => { onSelect(r.recipe_id); setIsOpen(false); setSearch(''); }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-50 transition
                    ${r.recipe_id === currentRecipeId ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'}
                  `}
                >
                  <span>{r.nom}</span>
                  {r.tag && (
                    <span className="ml-2 text-xs text-gray-400">{r.tag}</span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Composant principal CalendarPage ────────────────────────
export default function CalendarPage() {
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));
  const [mealPlan, setMealPlan] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);

  useEffect(() => {
    loadData();
  }, [weekStart]);

  async function loadData() {
    try {
      setLoading(true);
      const [planData, recipesData] = await Promise.all([
        api.getMealPlan(formatDate(weekStart)),
        api.getRecipes()
      ]);
      setMealPlan(planData);
      setRecipes(recipesData);
    } catch (err) {
      console.error('Erreur chargement:', err);
    } finally {
      setLoading(false);
    }
  }

  function getMealForSlot(dayIndex, mealType) {
    return mealPlan.find(
      m => m.day_of_week === dayIndex && m.meal_type === mealType
    );
  }

  async function handleSetMeal(dayIndex, mealType, recipeId) {
    const slotKey = `${dayIndex}-${mealType}`;
    setSaving(slotKey);
    try {
      await api.setMeal({
        week_start: formatDate(weekStart),
        day_of_week: dayIndex,
        meal_type: mealType,
        recipe_id: recipeId || null
      });
      const planData = await api.getMealPlan(formatDate(weekStart));
      setMealPlan(planData);
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setSaving(null);
    }
  }

  function goToPreviousWeek() {
    setWeekStart(prev => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 7);
      return d;
    });
  }

  function goToNextWeek() {
    setWeekStart(prev => {
      const d = new Date(prev);
      d.setDate(d.getDate() + 7);
      return d;
    });
  }

  function goToCurrentWeek() {
    setWeekStart(getMonday(new Date()));
  }

  const isCurrentWeek = formatDate(weekStart) === formatDate(getMonday(new Date()));
  const weekEnd = getDayDate(weekStart, 6);
  const weekLabel = `${weekStart.toLocaleDateString('fr-CA', { day: 'numeric', month: 'short' })} — ${weekEnd.toLocaleDateString('fr-CA', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  const plannedCount = mealPlan.length;

  // Recettes utilisées cette semaine (pour le résumé en bas)
  const usedRecipeIds = [...new Set(mealPlan.map(m => m.recipe_id))];
  const usedRecipes = recipes.filter(r => usedRecipeIds.includes(r.recipe_id));
  const unusedRecipes = recipes.filter(r => !usedRecipeIds.includes(r.recipe_id));

  return (
    <div>
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Meal Planning</h2>
        <span className="text-sm text-gray-500">{plannedCount}/14 repas planifiés</span>
      </div>

      {/* Navigation semaine */}
      <div className="flex items-center justify-between mb-6 bg-white rounded-lg shadow px-6 py-4">
        <button
          onClick={goToPreviousWeek}
          className="px-3 py-1.5 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition text-sm font-medium"
        >
          ← Précédente
        </button>
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900">{weekLabel}</p>
          {!isCurrentWeek && (
            <button onClick={goToCurrentWeek} className="text-sm text-blue-600 hover:text-blue-800 mt-1">
              Revenir à cette semaine
            </button>
          )}
        </div>
        <button
          onClick={goToNextWeek}
          className="px-3 py-1.5 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition text-sm font-medium"
        >
          Suivante →
        </button>
      </div>

      {/* Grille du calendrier */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Chargement du planning...</p>
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-3">
          {/* En-têtes des jours */}
          {DAYS.map((day, index) => {
            const dayDate = getDayDate(weekStart, index);
            const isToday = formatDate(dayDate) === formatDate(new Date());
            return (
              <div key={day} className={`text-center pb-2 border-b-2 ${isToday ? 'border-blue-500' : 'border-gray-200'}`}>
                <p className={`text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-500'}`}>{DAYS_FR[index]}</p>
                <p className={`text-lg font-bold ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>{dayDate.getDate()}</p>
              </div>
            );
          })}

          {/* Créneaux repas */}
          {MEAL_TYPES.map(mealType =>
            DAYS.map((day, dayIndex) => {
              const meal = getMealForSlot(dayIndex, mealType);
              const slotKey = `${dayIndex}-${mealType}`;
              const isSaving = saving === slotKey;

              return (
                <div
                  key={slotKey}
                  className={`bg-white rounded-lg border p-3 min-h-[90px] flex flex-col
                    ${meal ? 'border-green-200' : 'border-gray-200'}
                    ${isSaving ? 'opacity-50' : ''}
                  `}
                >
                  <p className="text-xs font-medium text-gray-400 mb-2 uppercase">
                    {MEAL_LABELS[mealType]}
                  </p>

                  <RecipePicker
                    recipes={recipes}
                    currentRecipeId={meal ? meal.recipe_id : null}
                    onSelect={(recipeId) => handleSetMeal(dayIndex, mealType, recipeId)}
                    disabled={isSaving}
                  />

                  {meal && meal.tag && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {meal.tag.split(',').map((tag, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ─── Résumé des recettes de la semaine ─── */}
      {!loading && mealPlan.length > 0 && (
        <div className="mt-10">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Recettes de la semaine ({usedRecipes.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {usedRecipes.map(recipe => {
              // Combien de fois cette recette est utilisée cette semaine
              const count = mealPlan.filter(m => m.recipe_id === recipe.recipe_id).length;
              return (
                <div key={recipe.recipe_id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition">
                  {/* Image de la recette */}
                  {recipe.image_url ? (
                    <img
                      src={recipe.image_url.startsWith('http') ? recipe.image_url : `http://localhost:3000${recipe.image_url}`}
                      alt={recipe.nom}
                      className="w-full h-40 object-cover"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <div className="w-full h-32 bg-gray-100 flex items-center justify-center">
                      <span className="text-4xl">🍽️</span>
                    </div>
                  )}
                  <div className="p-4">
                  <h4 className="font-semibold text-gray-900">{recipe.nom}</h4>
                  {recipe.auteur && (
                    <p className="text-sm text-gray-500 mt-0.5">par {recipe.auteur}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                      {count}× cette semaine
                    </span>
                    {recipe.tag && recipe.tag.split(',').map((tag, i) => (
                      <span key={i} className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                  {recipe.details_recette && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                      {recipe.details_recette}
                    </p>
                  )}
                  {recipe.lien && (
                    <a href={recipe.lien} target="_blank" rel="noopener noreferrer"
                       className="inline-block text-sm text-blue-600 hover:text-blue-800 mt-2">
                      Voir la recette originale →
                    </a>
                  )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── Autres recettes disponibles ─── */}
      {!loading && unusedRecipes.length > 0 && (
        <div className="mt-10">
          <h3 className="text-lg font-semibold text-gray-500 mb-4">
            Autres recettes disponibles ({unusedRecipes.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {unusedRecipes.map(recipe => (
              <div key={recipe.recipe_id} className="bg-white rounded-lg border border-gray-100 p-3 opacity-70 hover:opacity-100 transition">
                <h4 className="font-medium text-gray-700">{recipe.nom}</h4>
                {recipe.tag && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {recipe.tag.split(',').map((tag, i) => (
                      <span key={i} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
