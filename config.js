// Automatische Erkennung: lokal oder GitHub Pages
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Basis-Pfad für GitHub Pages
// Lokal: '' (kein Präfix)
// GitHub Pages: '/pwa-demo' (dein Repository-Name)
const BASE_PATH = isLocal ? '' : '/SmartDrobeApp';

// Hilfsfunktion für Pfade
function getPath(path) {
  return BASE_PATH + path;
}

// Debug-Info
console.log('Environment:', isLocal ? 'LOCAL' : 'GITHUB PAGES');
console.log('BASE_PATH:', BASE_PATH);