import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';
export const firebaseConfig = {
  apiKey: 'AIzaSyBn9tjBkKagA8zMi7XwLo8BUPUScWNpDao',
  authDomain: 'birri-51fdf.firebaseapp.com',
  projectId: 'birri-51fdf',
  storageBucket: 'birri-51fdf.firebasestorage.app',
  messagingSenderId: '884716478854',
  appId: '1:884716478854:web:8f3e8ef166485d8f5f4c07'
};
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
