
// author.js
import { loadCap, saveCap, loadIndex, saveIndex } from './storage.js';

const form = document.getElementById('authorForm');
const notesEditor = document.getElementById('notesEditor');
const flashcardsEditor = document.getElementById('flashcardsEditor');
const quizEditor = document.getElementById('quizEditor');
const btnAddFlashcard = document.getElementById('btnAddFlashcard');
const btnAddQuiz = document.getElementById('btnAddQuiz');

let currentId = null;

// Add flashcard row
btnAddFlashcard.onclick = () => addFlashcardRow();

function addFlashcardRow(front = '', back = '') {
  const row = document.createElement('div');
  row.className = 'row g-2 align-items-end';
  row.innerHTML = `
    <div class="col">
      <label class="form-label">Front</label>
      <input class="form-control fc-front" value="${front}">
    </div>
    <div class="col">
      <label class="form-label">Back</label>
      <input class="form-control fc-back" value="${back}">
    </div>
    <div class="col-auto">
      <button class="btn btn-outline-danger btnDel">X</button>
    </div>
  `;
  row.querySelector('.btnDel').onclick = () => row.remove();
  flashcardsEditor.appendChild(row);
}

// Add quiz question block
btnAddQuiz.onclick = () => addQuizBlock();

function addQuizBlock(q = '', choices = ['', '', '', ''], answerIndex = 0, explain = '') {
  const block = document.createElement('div');
  block.className = 'quiz-block';

  const choicesHTML = choices.map((c, i) => ` 
    <div class="col-6">
      <label class="form-label">Choice ${String.fromCharCode(65 + i)}</label>
      <input class="form-control quiz-choice" data-index="${i}" value="${c}">
    </div>
  `).join('');

  block.innerHTML = `
    <label class="form-label">Question</label>
    <input class="form-control quiz-q" value="${q}">
    <div class="row mt-2">
      ${choicesHTML}
    </div>
    <label class="form-label mt-2">Correct Answer Index (0-3)</label>
    <input type="number" class="form-control quiz-answer" min="0" max="3" value="${answerIndex}">
    <label class="form-label mt-2">Explanation (optional)</label>
    <input class="form-control quiz-explain" value="${explain}">
    <button class="btn btn-outline-danger mt-2 btnDel">Delete Question</button>
  `;

  block.querySelector('.btnDel').onclick = () => block.remove();
  quizEditor.appendChild(block);
}

// Save capsule
form.onsubmit = e => {
  e.preventDefault();
  const title = form.capTitle.value.trim();
  if (!title) return alert('Title is required.');

  const capsule = {
    schema: 'pocket-classroom/v1',
    id: currentId || 'cap_' + Date.now(),
    meta: {
      title,
      subject: form.capSubject.value.trim(),
      level: form.capLevel.value,
      desc: form.capDesc.value.trim(),
      createdAt: currentId ? loadCap(currentId).meta.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    notes: notesEditor.value.split('\n').map(n => n.trim()).filter(n => n),
    flashcards: Array.from(flashcardsEditor.querySelectorAll('.row')).map(row => {
      const front = row.querySelector('.fc-front').value.trim();
      const back = row.querySelector('.fc-back').value.trim();
      return front && back ? { front, back } : null;
    }).filter(Boolean),
    quiz: Array.from(quizEditor.querySelectorAll('.quiz-block')).map(block => {
      const q = block.querySelector('.quiz-q').value.trim();
      const choices = Array.from(block.querySelectorAll('.quiz-choice')).map(c => c.value.trim());
      const answerIndex = parseInt(block.querySelector('.quiz-answer').value);
      const explain = block.querySelector('.quiz-explain').value.trim();
      return q && choices.every(c => c) ? { q, choices, answerIndex, explain } : null;
    }).filter(Boolean)
  };

  if (!capsule.notes.length && !capsule.flashcards.length && !capsule.quiz.length) {
    return alert('At least one of notes, flashcards, or quiz must exist.');
  }
  
saveCap(capsule);
  const index = loadIndex().filter(c => c.id !== capsule.id);
  index.push({
    id: capsule.id,
    title: capsule.meta.title,
    subject: capsule.meta.subject,
    level: capsule.meta.level,
    updatedAt: capsule.meta.updatedAt
  });
  saveIndex(index);
  alert('Capsule saved!');
  form.reset();
  flashcardsEditor.innerHTML = '';
  quizEditor.innerHTML = '';
  currentId = null;
};