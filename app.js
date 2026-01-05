// Service Worker registrieren (mit BASE_PATH aus config.js)
if ("serviceWorker" in navigator) {
  const swPath = getPath("/service-worker.js");
  navigator.serviceWorker.register(swPath, { scope: BASE_PATH + "/" })
    .then(reg => console.log("Service Worker registriert", reg))
    .catch(err => console.error("Service Worker Fehler", err));
}

// Prüfen ob App im Standalone-Modus läuft
function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches
         || window.navigator.standalone === true;
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

window.addEventListener("beforeinstallprompt", e => {
  e.preventDefault();
  deferredPrompt = e;
  
  const installBtn = document.getElementById("installBtn");
  if (installBtn) {
    installBtn.hidden = false;
  }
});

// iOS Detection
function checkIOS() {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  const isInStandaloneMode = window.navigator.standalone === true;
  
  const iosHint = document.getElementById("iosHint");
  const installBtn = document.getElementById("installBtn");
  
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
  if (!location.search.includes('mode=app')) {
    window.location.href = getPath('/?mode=app');
  }
});

// Initialisierung
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM geladen');
  
  // Ansicht umschalten
  switchView();
  checkIOS();
  updateOnlineStatus();
  
  // Install Button
  const installBtn = document.getElementById("installBtn");
  if (installBtn) {
    installBtn.addEventListener("click", async () => {
      if (!deferredPrompt) {
        console.log('Kein deferredPrompt verfügbar');
        return;
      }
      
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`Installation: ${outcome}`);
      
      deferredPrompt = null;
      installBtn.hidden = true;
    });
  }
  
  // "Im Browser ausprobieren" Button
  const tryBrowserBtn = document.getElementById('tryBrowserBtn');
  console.log('Try Browser Button:', tryBrowserBtn);
  
  if (tryBrowserBtn) {
    tryBrowserBtn.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('Button geklickt!');
      window.location.href = getPath('/?mode=app');
    });
  } else {
    console.error('tryBrowserBtn nicht gefunden!');
  }
  
  // Card Click Events (optional)
  document.addEventListener('click', (e) => {
    const card = e.target.closest('.card');
    if (card) {
      const cardTitle = card.querySelector('h3').textContent;
      alert(`Du hast auf "${cardTitle}" geklickt!`);
    }
  });
  
  // Online/Offline Events
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
});