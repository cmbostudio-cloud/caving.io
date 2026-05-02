let deferredPrompt;

function setInstallVisible(visible) {
  const btn = document.getElementById('install-btn');
  if (!btn) return;
  btn.hidden = !visible;
}

window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  deferredPrompt = event;
  setInstallVisible(true);
});

window.addEventListener('appinstalled', () => {
  deferredPrompt = null;
  setInstallVisible(false);
});

async function installGame() {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  setInstallVisible(false);
}

window.installGame = installGame;

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js'));
}
