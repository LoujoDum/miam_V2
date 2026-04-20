import { useState, useRef } from 'react';
import * as api from '../services/api';

// Composant réutilisable pour sélectionner une image (upload OU URL)
// Utilisé par CreateRecipeModal et ModifyRecipeModal
export default function ImagePicker({ currentImageUrl, onImageChange }) {
  const [mode, setMode] = useState(currentImageUrl ? 'preview' : 'choose'); // 'choose', 'url', 'upload', 'preview'
  const [urlInput, setUrlInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // Construit l'URL complète pour l'affichage
  // Les images uploadées sont des chemins relatifs (/uploads/...), les URLs externes sont complètes
  function getFullUrl(url) {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `http://localhost:3000${url}`;
  }

  // Upload un fichier image
  async function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
      const result = await api.uploadImage(file);
      onImageChange(result.image_url); // ex: "/uploads/1234-photo.jpg"
      setMode('preview');
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  // Confirmer une URL externe
  function handleConfirmUrl() {
    if (!urlInput.trim()) return;
    onImageChange(urlInput.trim());
    setMode('preview');
    setUrlInput('');
  }

  // Supprimer l'image
  function handleRemoveImage() {
    onImageChange(null);
    setMode('choose');
  }

  // Si une image existe, montrer le preview
  if (currentImageUrl && mode === 'preview') {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
        <div className="relative rounded-lg overflow-hidden border border-gray-200">
          <img
            src={getFullUrl(currentImageUrl)}
            alt="Recipe"
            className="w-full h-40 object-cover"
            onError={(e) => { e.target.src = ''; e.target.className = 'hidden'; }}
          />
          <button
            onClick={handleRemoveImage}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm hover:bg-red-600 shadow"
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  // Mode sélection : choisir entre upload et URL
  if (mode === 'choose') {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
        
        {error && (
          <p className="text-red-600 text-sm mb-2">{error}</p>
        )}

        <div className="flex gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex-1 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition text-sm font-medium"
          >
            {uploading ? 'Upload en cours...' : '📷 Uploader une photo'}
          </button>
          <button
            onClick={() => setMode('url')}
            className="flex-1 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition text-sm font-medium"
          >
            🔗 Coller une URL
          </button>
        </div>

        {/* Input fichier caché */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>
    );
  }

  // Mode URL : saisir une URL
  if (mode === 'url') {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://example.com/image.jpg"
            autoFocus
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            onKeyDown={(e) => { if (e.key === 'Enter') handleConfirmUrl(); }}
          />
          <button
            onClick={handleConfirmUrl}
            disabled={!urlInput.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            OK
          </button>
          <button
            onClick={() => { setMode('choose'); setUrlInput(''); }}
            className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  return null;
}
