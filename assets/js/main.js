document.addEventListener('DOMContentLoaded', function () {
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    const search = document.getElementById('search');
    if (search) {
        search.addEventListener('keyup', (e) => {
            console.log('Buscar:', e.target.value);
        });
    }
});