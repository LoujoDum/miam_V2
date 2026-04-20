import { useEffect, useState } from 'react';
import * as api from '../services/api';

// Calcule le lundi de la semaine pour une date donnée
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

export default function GroceryListPage() {
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));
  const [groceryList, setGroceryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkedItems, setCheckedItems] = useState({}); // Pour cocher les items achetés

  useEffect(() => {
    loadGroceryList();
  }, [weekStart]);

  async function loadGroceryList() {
    try {
      setLoading(true);
      const data = await api.getGroceryList(formatDate(weekStart));
      setGroceryList(data);
      setCheckedItems({}); // Reset les checkboxes quand on change de semaine
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  }

  function toggleItem(ingredientId) {
    setCheckedItems(prev => ({
      ...prev,
      [ingredientId]: !prev[ingredientId]
    }));
  }

  // Navigation semaines
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

  // ─── Regrouper les ingrédients par magasin prioritaire ───
  // Chaque ingrédient n'a maintenant qu'UNE seule source (la prioritaire)
  const byStore = {};
  const noStore = [];

  for (const item of groceryList) {
    if (!item.source) {
      noStore.push(item);
    } else {
      const store = item.source.lieu;
      if (!byStore[store]) {
        byStore[store] = [];
      }
      byStore[store].push({
        ...item,
        prix: item.source.prix,
        quantite_achat: item.source.quantite_achat
      });
    }
  }

  const storeNames = Object.keys(byStore).sort();
  const checkedCount = Object.values(checkedItems).filter(Boolean).length;
  const totalCount = groceryList.length;

  // Générer le texte de la liste pour copier/envoyer
  function generateListText() {
    let text = `🛒 Liste de courses — ${weekLabel}\n\n`;

    for (const store of storeNames) {
      text += `📍 ${store}\n`;
      for (const item of byStore[store]) {
        const qty = item.total_quantite ? `${item.total_quantite} ${item.unit || item.unit_standard || ''}` : '';
        text += `  • ${item.nom}${qty ? ' — ' + qty.trim() : ''}\n`;
      }
      text += '\n';
    }

    if (noStore.length > 0) {
      text += `❓ Magasin non défini\n`;
      for (const item of noStore) {
        const qty = item.total_quantite ? `${item.total_quantite} ${item.unit || item.unit_standard || ''}` : '';
        text += `  • ${item.nom}${qty ? ' — ' + qty.trim() : ''}\n`;
      }
    }

    return text;
  }

  function handleCopyList() {
    const text = generateListText();
    navigator.clipboard.writeText(text).then(() => {
      alert('Liste copiée dans le presse-papier !');
    }).catch(() => {
      // Fallback: ouvrir dans un prompt
      prompt('Copie cette liste:', text);
    });
  }

  return (
    <div>
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Grocery List</h2>
        {totalCount > 0 && (
          <span className="text-sm text-gray-500">
            {checkedCount}/{totalCount} achetés
          </span>
        )}
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

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Chargement de la liste...</p>
        </div>
      ) : groceryList.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-4xl mb-3">🛒</p>
          <p className="text-gray-600 font-medium">Aucun repas planifié cette semaine</p>
          <p className="text-gray-400 text-sm mt-1">Ajoute des recettes dans le calendrier pour générer ta liste de courses</p>
        </div>
      ) : (
        <>
          {/* Bouton copier la liste */}
          <div className="flex justify-end mb-4">
            <button
              onClick={handleCopyList}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
            >
              📋 Copier la liste
            </button>
          </div>

          {/* Sections par magasin */}
          <div className="space-y-6">
            {storeNames.map(store => (
              <div key={store} className="bg-white rounded-lg shadow overflow-hidden">
                {/* En-tête magasin */}
                <div className="bg-gray-800 text-white px-6 py-3">
                  <h3 className="font-semibold text-lg">📍 {store}</h3>
                  <p className="text-gray-300 text-sm">{byStore[store].length} article{byStore[store].length > 1 ? 's' : ''}</p>
                </div>

                {/* Liste des ingrédients */}
                <div className="divide-y divide-gray-100">
                  {byStore[store].map(item => {
                    const isChecked = checkedItems[item.ingredient_id] || false;
                    return (
                      <div
                        key={item.ingredient_id}
                        onClick={() => toggleItem(item.ingredient_id)}
                        className={`flex items-center px-6 py-3 cursor-pointer hover:bg-gray-50 transition
                          ${isChecked ? 'bg-green-50' : ''}
                        `}
                      >
                        {/* Checkbox */}
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mr-4 flex-shrink-0
                          ${isChecked ? 'bg-green-500 border-green-500' : 'border-gray-300'}
                        `}>
                          {isChecked && <span className="text-white text-xs">✓</span>}
                        </div>

                        {/* Nom et quantité */}
                        <div className={`flex-1 ${isChecked ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                          <span className="font-medium">{item.nom}</span>
                          {item.total_quantite && (
                            <span className="text-gray-500 ml-2">
                              — {item.total_quantite} {item.unit || item.unit_standard || ''}
                            </span>
                          )}
                        </div>

                        {/* Prix */}
                        {item.prix && (
                          <span className={`text-sm ml-4 ${isChecked ? 'text-gray-300' : 'text-gray-500'}`}>
                            {item.prix}$
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Section sans magasin */}
            {noStore.length > 0 && (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="bg-amber-100 px-6 py-3">
                  <h3 className="font-semibold text-lg text-amber-900">❓ Magasin non défini</h3>
                  <p className="text-amber-700 text-sm">Ces ingrédients n'ont pas de source configurée</p>
                </div>
                <div className="divide-y divide-gray-100">
                  {noStore.map(item => {
                    const isChecked = checkedItems[item.ingredient_id] || false;
                    return (
                      <div
                        key={item.ingredient_id}
                        onClick={() => toggleItem(item.ingredient_id)}
                        className={`flex items-center px-6 py-3 cursor-pointer hover:bg-gray-50 transition
                          ${isChecked ? 'bg-green-50' : ''}
                        `}
                      >
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mr-4 flex-shrink-0
                          ${isChecked ? 'bg-green-500 border-green-500' : 'border-gray-300'}
                        `}>
                          {isChecked && <span className="text-white text-xs">✓</span>}
                        </div>
                        <div className={`flex-1 ${isChecked ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                          <span className="font-medium">{item.nom}</span>
                          {item.total_quantite && (
                            <span className="text-gray-500 ml-2">
                              — {item.total_quantite} {item.unit || item.unit_standard || ''}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
