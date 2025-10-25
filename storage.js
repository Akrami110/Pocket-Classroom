// storage.js

export const IDX_KEY = 'pc_capsules_index';
export const CAP_KEY = id => `pc_capsule_${id}`;
export const PROG_KEY = id => `pc_progress_${id}`;

// Load capsule index (list of all saved capsules)
export function loadIndex() {
  try {
    return JSON.parse(localStorage.getItem(IDX_KEY)) || [];
  } catch (e) {
    console.error('Error loading index:', e);
    return [];
  }
}

// Save capsule index
export function saveIndex(index) {
  localStorage.setItem(IDX_KEY, JSON.stringify(index));
}

// Load full capsule by ID
export function loadCap(id) {
  try {
    return JSON.parse(localStorage.getItem(CAP_KEY(id))) || null;
  } catch (e) {
    console.error('Error loading capsule:', e);
    return null;
  }
}

// Save full capsule
export function saveCap(cap) {
  localStorage.setItem(CAP_KEY(cap.id), JSON.stringify(cap));
}

// Load progress (best score, known flashcards)
export function loadProg(id) {
  try {
    return JSON.parse(localStorage.getItem(PROG_KEY(id))) || { bestScore: 0, knownFlashcards: [] };
  } catch (e) {
    console.error('Error loading progress:', e);
    return { bestScore: 0, knownFlashcards: [] };
  }
}

// Save progress
export function saveProg(id, progress) {
  localStorage.setItem(PROG_KEY(id), JSON.stringify(progress));
}