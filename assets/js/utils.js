// assets/js/utils.js
// Funciones utilitarias

export function slugify(text) {
    return text.toString().toLowerCase()
        .normalize('NFD')                   // eliminar acentos
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9 -]/g, '')        // eliminar chars invalidos
        .replace(/\s+/g, '-')               // espacios -> guiones
        .replace(/-+/g, '-')                // colapsar guiones
        .replace(/^-+|-+$/g, '');           // trim guiones
}

export function formatDate(ts) {
    const d = ts instanceof Date ? ts : (ts && ts.toDate ? ts.toDate() : new Date());
    return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });
}