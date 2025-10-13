// assets/js/admin.js
import { auth, db, storage } from './firebaseConfig.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { collection, addDoc, doc, setDoc, getDocs, updateDoc, deleteDoc, query, orderBy, serverTimestamp, getDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-storage.js";
import { slugify, formatDate } from './utils.js';

const articleForm = document.getElementById('articleForm');
const tituloEl = document.getElementById('titulo');
const categoriaEl = document.getElementById('categoria');
const estadoEl = document.getElementById('estado');
const slugEl = document.getElementById('slug');
const fileEl = document.getElementById('imagenFile');
const editor = document.getElementById('editor');
const docIdEl = document.getElementById('docId');
const imgPreview = document.getElementById('imgPreview');
const articlesContainer = document.getElementById('articles');
const logoutBtn = document.getElementById('logoutBtn');
const authStatus = document.getElementById('authStatus');

let currentImageFile = null;

// Check auth state
onAuthStateChanged(auth, user => {
    if (!user) {
        // no autorizado -> redirigir a login
        window.location.href = 'login.html';
        return;
    }
    authStatus.textContent = user.email;
    logoutBtn.style.display = 'inline-flex';
    initList();
});

// logout
if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        await signOut(auth);
        window.location.href = 'login.html';
    });
}

// image preview
fileEl.addEventListener('change', (e) => {
    const f = e.target.files[0];
    currentImageFile = f || null;
    if (!f) { imgPreview.style.display = 'none'; imgPreview.src = ''; return; }
    const url = URL.createObjectURL(f);
    imgPreview.src = url;
    imgPreview.style.display = 'block';
});

// Submit form: create or update
articleForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const titulo = tituloEl.value.trim();
    if (!titulo) return alert('El título es obligatorio.');
    const categoria = categoriaEl.value;
    const estado = estadoEl.value;
    const rawSlug = slugEl.value.trim() || slugify(titulo);
    const contentHTML = editor.innerHTML;

    // preparar metadata
    const data = {
        titulo,
        categoria,
        slug: rawSlug,
        contenido: contentHTML,
        estado,
        autor: auth.currentUser ? auth.currentUser.email : 'admin',
        actualizado: serverTimestamp(),
    };

    const docId = docIdEl.value;
    try {
        let imageUrl = null;

        // Si hay un archivo seleccionado, subirlo a Storage
        if (currentImageFile) {
            const storageRef = ref(storage, `articulos/${Date.now()}_${currentImageFile.name}`);
            const uploadTask = uploadBytesResumable(storageRef, currentImageFile);
            // await upload
            await new Promise((resolve, reject) => {
                uploadTask.on('state_changed', null, (err) => reject(err), async () => {
                    imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
                    resolve();
                });
            });
            data.imagen = imageUrl;
        }

        if (docId) {
            // actualizar documento existente
            const docRef = doc(db, 'articulos', docId);
            await updateDoc(docRef, data);
            alert('Artículo actualizado.');
        } else {
            // crear nuevo doc con fecha de creación
            data.creado = serverTimestamp();
            const colRef = collection(db, 'articulos');
            await addDoc(colRef, data);
            alert('Artículo creado.');
        }

        // limpiar y recargar lista
        resetForm();
        initList();
    } catch (err) {
        console.error(err);
        alert('Error guardando la noticia: ' + (err.message || err));
    }
});

// Reset form
document.getElementById('clearBtn').addEventListener('click', resetForm);
function resetForm() {
    articleForm.reset();
    editor.innerHTML = '<p>Empieza a escribir o pega HTML aquí...</p>';
    docIdEl.value = '';
    imgPreview.src = ''; imgPreview.style.display = 'none';
    currentImageFile = null;
    slugEl.value = '';
}

// List articles (básico)
async function initList() {
    articlesContainer.innerHTML = '<div class="small">Cargando...</div>';
    try {
        const col = collection(db, 'articulos');
        const q = query(col, orderBy('creado', 'desc'));
        const snap = await getDocs(q);
        if (snap.empty) {
            articlesContainer.innerHTML = '<div class="small">No hay artículos aún.</div>';
            return;
        }
        articlesContainer.innerHTML = '';
        snap.forEach(docSnap => {
            const d = docSnap.data();
            const id = docSnap.id;
            const item = document.createElement('div');
            item.className = 'article-item';
            item.innerHTML = `
        <div>
          <div style="font-weight:700">${d.titulo}</div>
          <div class="meta">${d.categoria} · ${d.estado || ''} · ${d.creado ? formatDate(d.creado) : ''}</div>
        </div>
        <div style="display:flex;gap:0.5rem;align-items:center">
          <button class="btn btn-ghost btn-edit" data-id="${id}">Editar</button>
          <button class="btn btn-ghost btn-delete" data-id="${id}">Borrar</button>
          <a class="btn btn-ghost" href="articulos/index.html?id=${id}&slug=${d.slug || ''}" target="_blank">Ver</a>
        </div>
      `;
            articlesContainer.appendChild(item);
        });

        // bind edit/delete
        document.querySelectorAll('.btn-edit').forEach(b => b.addEventListener('click', async (ev) => {
            const id = ev.currentTarget.dataset.id;
            loadArticleToForm(id);
        }));
        document.querySelectorAll('.btn-delete').forEach(b => b.addEventListener('click', async (ev) => {
            const id = ev.currentTarget.dataset.id;
            if (!confirm('Borrar este artículo?')) return;
            try {
                await deleteDoc(doc(db, 'articulos', id));
                alert('Artículo borrado.');
                initList();
            } catch (err) {
                console.error(err);
                alert('Error borrando: ' + err.message);
            }
        }));

    } catch (err) {
        console.error(err);
        articlesContainer.innerHTML = '<div class="small">Error cargando artículos.</div>';
    }
}

// Cargar artículo a form para editar
async function loadArticleToForm(id) {
    try {
        const docRef = doc(db, 'articulos', id);
        const snap = await getDoc(docRef);
        if (!snap.exists()) return alert('Documento no encontrado.');
        const d = snap.data();
        docIdEl.value = id;
        tituloEl.value = d.titulo || '';
        categoriaEl.value = d.categoria || 'General';
        estadoEl.value = d.estado || 'borrador';
        slugEl.value = d.slug || '';
        editor.innerHTML = d.contenido || '';
        if (d.imagen) {
            imgPreview.src = d.imagen;
            imgPreview.style.display = 'block';
        } else {
            imgPreview.style.display = 'none';
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
        console.error(err);
        alert('Error cargando artículo: ' + err.message);
    }
}