// main.js

// Navigation between sections
const btnLibrary = document.getElementById('btnLibrary');
const btnAuthor = document.getElementById('btnAuthor');
const btnLearn = document.getElementById('btnLearn');

const sectionLibrary = document.getElementById('sectionLibrary');
const sectionAuthor = document.getElementById('sectionAuthor');
const sectionLearn = document.getElementById('sectionLearn');

function showSection(section) {
  [sectionLibrary, sectionAuthor, sectionLearn].forEach(sec => sec.classList.add('d-none'));
  section.classList.remove('d-none');
}

btnLibrary.onclick = () => showSection(sectionLibrary);
btnAuthor.onclick = () => showSection(sectionAuthor);
btnLearn.onclick = () => showSection(sectionLearn);

// Default view
showSection(sectionLibrary);

// Theme toggle
const themeToggleBtn = document.createElement('button');
themeToggleBtn.className = 'btn btn-outline-light ms-2';
themeToggleBtn.textContent = '🌓 Toggle Theme';
document.querySelector('.navbar .ms-auto').appendChild(themeToggleBtn);

function applyTheme(theme) {
  document.body.classList.remove('light', 'dark');
  document.body.classList.add(theme);
  localStorage.setItem('pc_theme', theme);
}

themeToggleBtn.onclick = () => {
  const current = document.body.classList.contains('dark') ? 'dark' : 'light';
  applyTheme(current === 'dark' ? 'light' : 'dark');
};

// Load saved theme
const savedTheme = localStorage.getItem('pc_theme') || 'dark';
applyTheme(savedTheme);

// Flashcard flip animation
const flashcardText = document.getElementById('flashcardText');
const btnFlip = document.getElementById('btnFlip');
if (btnFlip) {
  btnFlip.onclick = () => {
    flashcardText.classList.toggle('flipped');
  };
}

// Learn tab switching
const learnTabs = document.querySelectorAll('#learnTabs button');
const learnTabContents = {
  notes: document.getElementById('tabNotes'),
  flashcards: document.getElementById('tabFlashcards'),
  quiz: document.getElementById('tabQuiz')
};

learnTabs.forEach(tab => {
  tab.onclick = () => {
    learnTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const selected = tab.dataset.tab;
    Object.values(learnTabContents).forEach(content => content.classList.add('d-none'));
    learnTabContents[selected].classList.remove('d-none');
  };
});