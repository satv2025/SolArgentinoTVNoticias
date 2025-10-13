// assets/js/admin.js
import { supabase } from './supabaseConfig.js';

const form = document.getElementById("form-articulo");
const listaArticulos = document.getElementById("lista-articulos");
const statusEl = document.getElementById("status");
const btnLogout = document.getElementById("btn-logout");

// Util - mostrar mensaje en el panel
function status(msg, isError = false) {
    if (!statusEl) return;
    statusEl.textContent = msg || "";
    statusEl.style.color = isError ? "#b91c1c" : "#0f1720";
}

// Subir imagen a Supabase Storage
async function subirImagen(file) {
    if (!file) return null;

    try {
        // nombre seguro
        const safeName = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
        const filePath = `public/${safeName}`;

        const { data, error } = await supabase.storage
            .from('imagenes')
            .upload(filePath, file, { cacheControl: '3600', upsert: true });

        if (error) {
            console.error("Storage upload error:", error);
            return null;
        }

        // getPublicUrl devuelve { publicUrl }
        const { publicUrl } = supabase.storage.from('imagenes').getPublicUrl(data.path);
        return publicUrl || null;
    } catch (err) {
        console.error("Error inesperado en subirImagen:", err);
        return null;
    }
}

// Crear artículo (usa imageUrl si existe, sino intenta upload file)
async function crearArticulo(titulo, contenido, categoria, file, imageUrlInput) {
    try {
        status("Creando artículo...");
        let imagen_url = null;

        // prioridad: URL manual
        if (imageUrlInput && imageUrlInput.trim().length > 0) {
            imagen_url = imageUrlInput.trim();
        } else if (file) {
            status("Subiendo imagen...");
            imagen_url = await subirImagen(file);
            if (!imagen_url) {
                console.warn("No se obtuvo publicUrl; la imagen puede no estar disponible públicamente.");
            }
        }

        const { data, error } = await supabase
            .from('articulos')
            .insert([{ titulo, contenido, categoria, imagen_url }]);

        if (error) {
            console.error("Error al crear artículo (insert):", error);
            status("Error al crear artículo: " + (error.message || JSON.stringify(error)), true);
            return;
        }

        status("Artículo creado correctamente.");
        initList();
    } catch (err) {
        console.error("Error inesperado en crearArticulo:", err);
        status("Error inesperado al crear artículo.", true);
    }
}

// Listar artículos en el admin
async function initList() {
    if (!listaArticulos) return;
    listaArticulos.innerHTML = '';
    status("");

    try {
        const { data, error } = await supabase
            .from('articulos')
            .select('*')
            .order('id', { ascending: false });

        if (error) {
            console.error("Error al listar artículos:", error);
            listaArticulos.innerHTML = '<p>Error al cargar artículos.</p>';
            status("Error al cargar artículos.", true);
            return;
        }

        if (!data || data.length === 0) {
            listaArticulos.innerHTML = '<p>No hay artículos aún.</p>';
            return;
        }

        data.forEach(art => {
            const item = document.createElement("div");
            item.classList.add("article-item");
            item.style.marginBottom = "0.75rem";
            item.innerHTML = `
                <h3 style="margin-bottom:0.25rem;">${art.titulo}</h3>
                <p class="categoria" style="margin-bottom:0.5rem;">${art.categoria || ''}</p>
                ${art.imagen_url ? `<img src="${art.imagen_url}" alt="${art.titulo}" style="max-width:220px;border-radius:8px;margin-bottom:0.5rem;">` : ''}
                <div class="contenido">${art.contenido || ''}</div>
            `;
            listaArticulos.appendChild(item);
        });
    } catch (err) {
        console.error("Error inesperado en initList:", err);
        listaArticulos.innerHTML = '<p>Error inesperado al cargar artículos.</p>';
        status("Error inesperado al cargar artículos.", true);
    }
}

// Form submit
if (form) {
    form.addEventListener("submit", e => {
        e.preventDefault();
        status("");

        const titulo = form.titulo.value.trim();
        const contenido = form.contenido.value.trim();
        const categoria = form.categoria.value.trim();
        const file = form.imagen ? form.imagen.files[0] : null;
        const imageUrlInput = document.getElementById('imageUrl') ? document.getElementById('imageUrl').value : '';

        if (!titulo || !contenido) {
            status("Título y contenido son obligatorios.", true);
            return;
        }

        crearArticulo(titulo, contenido, categoria, file, imageUrlInput);
        form.reset();
    });
}

// Logout minimal (no auth configured)
if (btnLogout) {
    btnLogout.addEventListener("click", () => {
        alert("Logout no configurado en este panel (sin Auth).");
    });
}

// Inicializar lista al cargar
document.addEventListener("DOMContentLoaded", () => {
    initList();
});