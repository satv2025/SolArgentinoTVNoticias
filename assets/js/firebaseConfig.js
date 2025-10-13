// assets/js/firebaseConfig.js
// Inicializa Firebase y exporta auth, db y storage

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-storage.js";

// Configuración de tu proyecto Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAeEvBmHhxRinFaMqArg89Cpa0IyD248AQ",
    authDomain: "sol-argentino-tv-noticias-2025.firebaseapp.com",
    projectId: "sol-argentino-tv-noticias-2025",
    storageBucket: "sol-argentino-tv-noticias-2025.appspot.com",
    messagingSenderId: "68575507123",
    appId: "1:68575507123:web:8945308cbeb0a9c25876c6"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar servicios que usarás
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);