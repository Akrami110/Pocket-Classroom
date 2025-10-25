
// library.js
import { loadIndex, saveIndex, loadCap, saveCap } from './storage.js';

const capsuleGrid = document.getElementById('capsuleGrid');
const btnImport = document.getElementById('btnImport');
const importFile = document.getElementById('importFile');

// Render all capsules
export function renderLibrary() {
  capsuleGrid.innerHTML = '';
  const index = loadIndex();
  if (index.length === 0) {
    capsuleGrid.innerHTML = '<p class="text-muted">No capsules yet. Click "New Capsule" to begin.</p>';
    return;
  }

  index.forEach(cap => {
    const card = document.createElement('div');
    card.className = 'col-md-4';
    card.innerHTML =`
      <div class="card bg-secondary text-light h-100">
        <div class="card-body">
          <h5 class="card-title">${cap.title}</h5>
          <span class="badge bg-info">${cap.level}</span>
          <p class="card-text">${cap.subject}</p>
          <small class="text-muted">Updated: ${timeAgo(cap.updatedAt)}</small>
          <div class="mt-3 d-flex justify-content-between">
            <button class="btn btn-sm btn-primary btnLearn" data-id="${cap.id}">Learn</button>
            <button class="btn btn-sm btn-warning btnEdit" data-id="${cap.id}">Edit</button>
            <button class="btn btn-sm btn-success btnExport" data-id="${cap.id}">Export</button>
            <button class="btn btn-sm btn-danger btnDelete" data-id="${cap.id}">Delete</button>
          </div>
        </div>
      </div>
    `;
    capsuleGrid.appendChild(card);
  });

  // Wire buttons
  capsuleGrid.querySelectorAll('.btnDelete').forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.id;
      const index = loadIndex().filter(c => c.id !== id);
      saveIndex(index);
      localStorage.removeItem(`pc_capsule_${id}`);
      localStorage.removeItem(`pc_progress_${id}`);
      renderLibrary();
    };
  });

  capsuleGrid.querySelectorAll('.btnExport').forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.id;
      const capsule = loadCap(id);
      const blob = new Blob([JSON.stringify(capsule, null, 2)], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${slugify(capsule.meta.title)}.json`;
      link.click();
    };
  });
}

// Import JSON
btnImport.onclick = () => importFile.click();

importFile.onchange = () => {
  const file = importFile.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (data.schema !== 'pocket-classroom/v1' || !data.meta?.title) {
        alert('Invalid capsule format.');
        return;
      }
      data.id = 'cap_' + Date.now();
      data.meta.createdAt = new Date().toISOString();
      data.meta.updatedAt = new Date().toISOString();

      saveCap(data);
      const index = loadIndex();
      index.push({
        id: data.id,
        title: data.meta.title,
        subject: data.meta.subject,
        level: data.meta.level,
        updatedAt: data.meta.updatedAt
      });
      saveIndex(index);
      renderLibrary();
    } catch (e) {
      alert('Failed to import capsule.');
      console.error(e);
    }
  };
  reader.readAsText(file);
};

// Utility: timeAgo
function timeAgo(iso) {
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// Utility: slugify title
function slugify(text) {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');
}


//Make New Capsule
const btnNewCapsule = document.getElementById('btnNewCapsule');
btnNewCapsule.onclick = () => {
  const newId = 'cap_' + Date.now();
  const newCapsule = {
    id: newId,
    schema: 'pocket-classroom/v1',
    meta: {
      title: 'Untitled Capsule',
      subject: '',
      level: 'Beginner',
      description: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    notes: [],
    flashcards: [],
    quiz: []
  };

  saveCap(newCapsule);

  const index = loadIndex();
  index.push({
    id: newId,
    title: newCapsule.meta.title,
    subject: newCapsule.meta.subject,
    level: newCapsule.meta.level,
    updatedAt: newCapsule.meta.updatedAt
  });
  saveIndex(index);

  renderLibrary();
};