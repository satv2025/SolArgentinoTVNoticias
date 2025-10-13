// assets/js/admin.js
import { supabase } from './supabaseConfig.js';

const form = document.getElementById("form-articulo");
const listaArticulos = document.getElementById("lista-articulos");

// Subir imagen a Supabase Storage
async function subirImagen(file) {
    if (!file) return null;
    const filePath = `public/${Date.now()}-${file.name}`;

    const { data, error } = await supabase.storage
        .from('imagenes')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

    if (error) {
        console.error("Error al subir imagen:", error);
        return null;
    }

    const { publicUrl } = supabase.storage.from('imagenes').getPublicUrl(data.path);
    return publicUrl;
}

// Crear artículo
export async function crearArticulo(titulo, contenido, categoria, file) {
    const imagen_url = await subirImagen(file);

    const { data, error } = await supabase
        .from('articulos')
        .insert([{ titulo, contenido, categoria, imagen_url }]); // no necesita created_at manual

    if (error) {
        console.error("Error al crear artículo:", error);
        alert("Error al crear artículo");
        return;
    }

    alert("Artículo creado!");
    initList();
}

// Listar artículos en el admin
export async function initList() {
    if (!listaArticulos) return;
    listaArticulos.innerHTML = '';

    const { data, error } = await supabase
        .from('articulos')
        .select('*')
        .order('id', { ascending: false }); // usamos id para ordenar

    if (error) {
        console.error("Error al listar artículos:", error);
        listaArticulos.innerHTML = '<p>Error al cargar artículos.</p>';
        return;
    }

    data.forEach(art => {
        const item = document.createElement("div");
        item.classList.add("articulo-item");
        item.innerHTML = `
            <h3>${art.titulo}</h3>
            <p class="categoria">${art.categoria}</p>
            ${art.imagen_url ? `<img src="${art.imagen_url}" alt="${art.titulo}" style="max-width:150px;border-radius:8px;">` : ''}
            <div class="contenido">${art.contenido}</div>
        `;
        listaArticulos.appendChild(item);
    });
}

// Form submit
if (form) {
    form.addEventListener("submit", e => {
        e.preventDefault();
        const titulo = form.titulo.value;
        const contenido = form.contenido.value;
        const categoria = form.categoria.value;
        const file = form.imagen.files[0];
        crearArticulo(titulo, contenido, categoria, file);
        form.reset();
    });
}

// Inicializar lista al cargar
document.addEventListener("DOMContentLoaded", () => {
    initList();
});