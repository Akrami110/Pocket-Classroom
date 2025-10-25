
// learn.js
import { loadIndex, loadCap, loadProg, saveProg } from './storage.js';

const learnSelector = document.getElementById('learnSelector');
const notesList = document.getElementById('notesList');
const noteSearch = document.getElementById('noteSearch');
const flashcardText = document.getElementById('flashcardText');
const btnFlip = document.getElementById('btnFlip');
const btnPrev = document.getElementById('btnPrev');
const btnNext = document.getElementById('btnNext');
const btnKnown = document.getElementById('btnKnown');
const btnUnknown = document.getElementById('btnUnknown');
const quizContainer = document.getElementById('quizContainer');

let currentCapsule = null;
let currentIndex = 0;
let showingFront = true;
let knownSet = new Set();
let quizIndex = 0;
let correctCount = 0;

// Load selector
export function loadLearnSelector() {
  const index = loadIndex();
  learnSelector.innerHTML = index.map(c => `
    <option value="${c.id}">${c.title}</option>
  `).join('');
  if (index.length) {
    loadCapsule(index[0].id);
  }
}

learnSelector.onchange = () => {
  loadCapsule(learnSelector.value);
};

// Load capsule
function loadCapsule(id) {
  currentCapsule = loadCap(id);
  if (!currentCapsule) return;

  // Notes
  renderNotes(currentCapsule.notes);

  // Flashcards
  currentIndex = 0;
  knownSet = new Set(loadProg(id).knownFlashcards || []);
  renderFlashcard();

  // Quiz
  quizIndex = 0;
  correctCount = 0;
  renderQuiz();
}

// Notes
function renderNotes(notes) {
  notesList.innerHTML = '';
  notes.forEach(n => {
    const li = document.createElement('li');
    li.className = 'list-group-item';
    li.textContent = n;
    notesList.appendChild(li);
  });
}

noteSearch.oninput = () => {
  const term = noteSearch.value.toLowerCase();
  const filtered = currentCapsule.notes.filter(n => n.toLowerCase().includes(term));
  renderNotes(filtered);
};

// Flashcards
function renderFlashcard() {
  const card = currentCapsule.flashcards[currentIndex];
  if (!card) {
    flashcardText.textContent = 'No flashcards';
    return;
  }
  showingFront = true;
  flashcardText.textContent = card.front;
}

btnFlip.onclick = () => {
  const card = currentCapsule.flashcards[currentIndex];
  if (!card) return;
  showingFront = !showingFront;
  flashcardText.textContent = showingFront ? card.front : card.back;
};

btnPrev.onclick = () => {
  if (currentIndex > 0) currentIndex--;
  renderFlashcard();
};

btnNext.onclick = () => {
  if (currentIndex < currentCapsule.flashcards.length - 1) currentIndex++;
  renderFlashcard();
};

btnKnown.onclick = () => {
  knownSet.add(currentIndex);
  saveProg(currentCapsule.id, {
    ...loadProg(currentCapsule.id),
    knownFlashcards: Array.from(knownSet)
  });
};

btnUnknown.onclick = () => {
  knownSet.delete(currentIndex);
  saveProg(currentCapsule.id, {
    ...loadProg(currentCapsule.id),
    knownFlashcards: Array.from(knownSet)
  });
};

// Quiz
function renderQuiz() {
  const Q = currentCapsule.quiz;
  if (!Q , !Q.length) {
    quizContainer.innerHTML = '<p class="text-muted">No quiz questions available.</p>';
    return;
  }

  const q = Q[quizIndex];
  quizContainer.innerHTML = ` 
    <h5>${q.q}</h5>
    <div class="list-group">
      ${q.choices.map((c, i) => 
        <button class="list-group-item list-group-item-action" data-index="${i}">${c}</button>
      ).join('')}
    </div>
  `;

  quizContainer.querySelectorAll('button').forEach(btn => {
    btn.onclick = () => {
      const choice = parseInt(btn.dataset.index);
      const correct = choice === q.answerIndex;
      btn.classList.add(correct ? 'list-group-item-success' : 'list-group-item-danger');
      if (correct) correctCount++;

      setTimeout(() => {
        quizIndex++;
        if (quizIndex < Q.length) {
          renderQuiz();
        } else {
          finishQuiz();
        }
      }, 1000);
    };
  });
}

function finishQuiz() {
  const score = Math.round((correctCount / currentCapsule.quiz.length) * 100);
  const prog = loadProg(currentCapsule.id);
  saveProg(currentCapsule.id, {
    ...prog,
    bestScore: Math.max(score, prog.bestScore || 0)
  });
  quizContainer.innerHTML = `<h5>Your Score: ${score}%</h5>`;
}