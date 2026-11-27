import { auth } from './firebase-config.js';
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js';
const button = document.getElementById('google-login');
const provider = new GoogleAuthProvider();
provider.setCustomParameters({prompt:'select_account'});
const original = button.innerHTML;
button.disabled = true;
onAuthStateChanged(auth, user => {
  if (user) location.replace('./dashboard.html');
  else button.disabled = false;
}, error => { button.disabled = false; console.error(error); alert('Sesi login tidak dapat diperiksa.'); });
button.addEventListener('click', async () => {
  button.disabled = true; button.textContent = 'Sedang masuk…';
  try { await signInWithPopup(auth, provider); location.replace('./dashboard.html'); }
  catch(error) {
    console.error(error);
    const messages = {'auth/unauthorized-domain':'Tambahkan syams123.github.io pada Authorized domains Firebase.', 'auth/popup-blocked':'Izinkan pop-up pada browser, lalu coba lagi.', 'auth/popup-closed-by-user':'Jendela login ditutup. Silakan coba lagi.', 'auth/network-request-failed':'Periksa koneksi internet.'};
    alert(messages[error.code] || `Login gagal (${error.code || 'unknown'}).`);
    button.innerHTML = original; button.disabled = false;
  }
});
