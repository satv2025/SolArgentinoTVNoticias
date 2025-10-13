// assets/js/index.js
import { supabase } from './supabaseConfig.js';

const newsList = document.querySelector('.news-list');

async function cargarArticulos() {
    if (!newsList) return;

    const { data, error } = await supabase
        .from('articulos')
        .select('*')
        .order('id', { ascending: false }); // usamos id si no hay created_at

    if (error) {
        console.error("Error al cargar artículos:", error);
        newsList.innerHTML = '<p>Error al cargar artículos.</p>';
        return;
    }

    newsList.innerHTML = '';

    data.forEach(art => {
        const card = document.createElement('article');
        card.classList.add('news-card');
        card.innerHTML = `
            <img src="${art.imagen_url || 'assets/images/placeholder.jpg'}" alt="${art.titulo}" class="news-thumb">
            <div class="news-body">
                <h4 class="news-title">${art.titulo}</h4>
                <p class="news-excerpt">${art.contenido.substring(0, 120)}...</p>
                <div class="meta">
                    <span class="categoria">${art.categoria}</span>
                    <span class="fecha">${new Date().toLocaleDateString()}</span>
                    <a href="articulos/index.html?id=${art.id}" class="leer">Leer</a>
                </div>
            </div>
        `;
        newsList.appendChild(card);
    });
}

document.addEventListener('DOMContentLoaded', cargarArticulos);