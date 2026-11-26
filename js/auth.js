import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";

import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

// Konfigurasi Firebase Birri
const firebaseConfig = {
    apiKey: "API_KEY",
    authDomain: "PROJECT_ID.firebaseapp.com",
    projectId: "PROJECT_ID",
    storageBucket: "STORAGE_BUCKET",
    messagingSenderId: "SENDER_ID",
    appId: "APP_ID"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

provider.setCustomParameters({
    prompt: "select_account"
});

const loginButton = document.getElementById("google-login");
const originalButton = loginButton.innerHTML;

// Google Login
loginButton.addEventListener("click", async () => {

    loginButton.disabled = true;
    loginButton.textContent = "Sedang masuk...";

    try {
        await signInWithPopup(auth, provider);

    } catch (error) {

        if (error.code === "auth/popup-blocked") {
            try {
                await signInWithRedirect(auth, provider);
                return;
            } catch (redirectError) {
                console.error(redirectError);
            }
        }

        console.error(error);

        alert("Gagal masuk. Silakan coba kembali.");

        loginButton.disabled = false;
        loginButton.innerHTML = originalButton;
    }
});

// Menangani hasil login redirect
getRedirectResult(auth).catch((error) => {
    console.error(error);
});

// Memeriksa status login pengguna
onAuthStateChanged(auth, (user) => {

    if (user) {
        window.location.replace("dashboard.html");
    }

});
