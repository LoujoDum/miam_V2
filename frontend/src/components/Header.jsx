import miamLogo from '../assets/miam_spiffo.png';

export default function Header({ activeTab, setActiveTab }) {
  // activeTab = onglet actif ('recipes', 'ingredients', etc.)
  // setActiveTab = fonction pour changer l'onglet
  
  const tabs = [
    { id: 'calendar', label: 'Calendar' },
    { id: 'grocery', label: 'Grocery list' },
    { id: 'recipes', label: 'Recipe List' },
    { id: 'ingredients', label: 'Ingredient List' },
  ];

  return (
    <header className="bg-white shadow">
      <div className="max-w-6xl mx-auto px-8 py-6">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-6">
          <img 
            src={miamLogo} 
            alt="Miam V2 Logo"
            className="w-10 h-10 rounded"
          />
          <h1 className="text-3xl font-bold text-gray-900">Miam V2</h1>
        </div>

        {/* Onglets */}
        <nav className="flex gap-8 border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 font-medium transition ${
                activeTab === tab.id
                  ? 'text-gray-900 border-b-2 border-gray-900'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}