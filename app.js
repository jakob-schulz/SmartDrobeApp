// Service Worker registrieren
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/service-worker.js")
    .then(reg => console.log("Service Worker registriert", reg))
    .catch(err => console.error("Service Worker Fehler", err));
}

// Prüfen ob App im Standalone-Modus läuft
function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches
         || window.navigator.standalone === true; // iOS
}

// Prüfen ob App-Modus angezeigt werden soll
function shouldShowApp() {
  const params = new URLSearchParams(location.search);
  return params.get('mode') === 'app' || isStandalone();
}

// Ansicht umschalten
function switchView() {
  const landing = document.getElementById('landing');
  const app = document.getElementById('app');
  const modeDisplay = document.getElementById('modeDisplay');
  
  if (shouldShowApp()) {
    landing.style.display = 'none';
    app.style.display = 'block';
    
    // Modus anzeigen
    if (modeDisplay) {
      if (isStandalone()) {
        modeDisplay.textContent = 'Installierte App (Standalone)';
      } else {
        modeDisplay.textContent = 'Browser (App-Modus)';
      }
    }
  } else {
    landing.style.display = 'flex';
    app.style.display = 'none';
  }
}

// Online/Offline Status
function updateOnlineStatus() {
  const statusDisplay = document.getElementById('statusDisplay');
  if (statusDisplay) {
    if (navigator.onLine) {
      statusDisplay.innerHTML = '<span class="online">● Online</span>';
    } else {
      statusDisplay.innerHTML = '<span class="offline">● Offline</span>';
    }
  }
}

// Install Prompt
let deferredPrompt;
const installBtn = document.getElementById("installBtn");
const iosHint = document.getElementById("iosHint");

// beforeinstallprompt Event (Android/Desktop Chrome)
window.addEventListener("beforeinstallprompt", e => {
  e.preventDefault();
  deferredPrompt = e;
  
  if (installBtn) {
    installBtn.hidden = false;
  }
});

// Install Button Click
if (installBtn) {
  installBtn.addEventListener("click", async () => {
    if (!deferredPrompt) {
      return;
    }
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`Installation: ${outcome}`);
    
    deferredPrompt = null;
    installBtn.hidden = true;
  });
}

// iOS Detection und Hinweis anzeigen
function checkIOS() {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  const isInStandaloneMode = window.navigator.standalone === true;
  
  if (isIOS && !isInStandaloneMode && iosHint) {
    iosHint.style.display = 'block';
    if (installBtn) {
      installBtn.style.display = 'none';
    }
  }
}

// App installed Event
window.addEventListener('appinstalled', () => {
  console.log('PWA wurde installiert');
  
  // Optional: Direkt zur App-Ansicht wechseln
  if (!location.search.includes('mode=app')) {
    location.assign('/?mode=app');
  }
});

// "Im Browser ausprobieren" Button
const tryBrowserBtn = document.getElementById('tryBrowserBtn');
if (tryBrowserBtn) {
  tryBrowserBtn.addEventListener('click', () => {
    location.assign('/?mode=app');
  });
}

// Card Click Events (optional)
document.addEventListener('click', (e) => {
  const card = e.target.closest('.card');
  if (card) {
    const cardTitle = card.querySelector('h3').textContent;
    alert(`Du hast auf "${cardTitle}" geklickt!`);
  }
});

// Initialisierung
document.addEventListener('DOMContentLoaded', () => {
  switchView();
  checkIOS();
  updateOnlineStatus();
  
  // Online/Offline Events
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
});