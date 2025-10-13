// assets/js/admin.js
import { auth, db, storage } from './firebaseConfig.js';
import { collection, getDocs, addDoc, Timestamp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-storage.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

// Verifica que haya usuario logueado
onAuthStateChanged(auth, user => {
    if (!user) {
        window.location.href = "login.html";
    }
});

// Referencia a la colección
const articulosCol = collection(db, "articulos");

// Función para listar artículos en admin
export async function initList() {
    const listContainer = document.getElementById("lista-articulos");
    if (!listContainer) return;

    listContainer.innerHTML = "";
    try {
        const snapshot = await getDocs(articulosCol);
        snapshot.forEach(doc => {
            const data = doc.data();
            const item = document.createElement("div");
            item.classList.add("articulo-item");
            item.innerHTML = `
                <h3>${data.titulo}</h3>
                <p>${data.categoria} - ${data.fecha.toDate().toLocaleDateString()}</p>
                <a href="articulos/index.html?id=${doc.id}" target="_blank">Ver</a>
            `;
            listContainer.appendChild(item);
        });
    } catch (error) {
        console.error("Error al listar artículos:", error);
    }
}

// Función para crear un artículo
export async function crearArticulo(titulo, contenido, categoria, file) {
    try {
        let imagenURL = "";

        if (file) {
            const storageRef = ref(storage, `imagenes/${file.name}`);
            await uploadBytes(storageRef, file);
            imagenURL = await getDownloadURL(storageRef);
        }

        await addDoc(articulosCol, {
            titulo,
            contenido,
            categoria,
            fecha: Timestamp.fromDate(new Date()),
            imagenURL
        });

        alert("Artículo creado!");
        initList(); // refresca lista
    } catch (error) {
        console.error("Error al crear artículo:", error);
        alert("Error al crear artículo");
    }
}

// Logout
export function logout() {
    signOut(auth)
        .then(() => window.location.href = "login.html")
        .catch(error => console.error("Error logout:", error));
}

// Ejecutar al cargar
document.addEventListener("DOMContentLoaded", () => {
    initList();
});