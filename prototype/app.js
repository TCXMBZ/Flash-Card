/**
 * Student Vocab — Interactive Prototype Engine (Standalone / Zero API)
 * 100% interactive using LocalStorage, Web Speech API (TTS), and DOM state.
 * No API key, Supabase, or external server required!
 */

// ==========================================
// DEFAULT SEED DATA
// ==========================================
const DEFAULT_PROTO_VOCABS = [
  {
    vocab_id: 1,
    vocab_word: "Requirement",
    meaning_th: "ความต้องการ, เงื่อนไขที่จำเป็น",
    part_of_speech: "Noun (คำนาม)",
    category_id: "TOEIC",
    example_sentence: "The client outlined clear software requirements.",
    is_remembered: false
  },
  {
    vocab_id: 2,
    vocab_word: "Implement",
    meaning_th: "นำไปปฏิบัติ, พัฒนาระบบ",
    part_of_speech: "Verb (คำกริยา)",
    category_id: "TOEIC",
    example_sentence: "We need to implement the new security policy.",
    is_remembered: false
  },
  {
    vocab_id: 3,
    vocab_word: "Deploy",
    meaning_th: "นำระบบไปใช้งานจริง",
    part_of_speech: "Verb (คำกริยา)",
    category_id: "IT Vocab",
    example_sentence: "The DevOps engineer will deploy the build to production.",
    is_remembered: false
  },
  {
    vocab_id: 4,
    vocab_word: "Agile",
    meaning_th: "ความคล่องตัว, การทำงานแบบปรับตัวเร็ว",
    part_of_speech: "Adjective (คำคุณศัพท์)",
    category_id: "IT Vocab",
    example_sentence: "Our development team follows Agile methodology.",
    is_remembered: true
  },
  {
    vocab_id: 5,
    vocab_word: "Framework",
    meaning_th: "กรอบการทำงาน, โครงสร้างโปรแกรม",
    part_of_speech: "Noun (คำนาม)",
    category_id: "TOEIC",
    example_sentence: "Bootstrap is a popular frontend framework.",
    is_remembered: true
  },
  {
    vocab_id: 6,
    vocab_word: "Repository",
    meaning_th: "คลังเก็บซอร์สโค้ดและข้อมูล",
    part_of_speech: "Noun (คำนาม)",
    category_id: "IT Vocab",
    example_sentence: "Clone the GitHub repository to your local computer.",
    is_remembered: false
  },
  {
    vocab_id: 7,
    vocab_word: "Pipeline",
    meaning_th: "สายการทำงานอัตโนมัติ (CI/CD)",
    part_of_speech: "Noun (คำนาม)",
    category_id: "IT Vocab",
    example_sentence: "The deployment pipeline passed all automated tests.",
    is_remembered: true
  },
  {
    vocab_id: 8,
    vocab_word: "Maintenance",
    meaning_th: "การบำรุงรักษา, การดูแลระบบ",
    part_of_speech: "Noun (คำนาม)",
    category_id: "TOEIC",
    example_sentence: "Regular server maintenance prevents unexpected downtime.",
    is_remembered: false
  }
];

const DEFAULT_PROTO_USER = {
  user_id: 1,
  username: "theeradech_019",
  full_name: "นายธีรเดช ผกามาด",
  student_id: "019",
  email: "theeradech_019@vec.go.th",
  target_exam: "TOEIC & IT Vocab",
  created_at: "29 ต.ค. 2026",
  is_logged_in: true
};

const DEFAULT_PROTO_QUIZ = {
  score: 4,
  total_questions: 5,
  percentage: 80,
  tested_at: "1 พ.ย. 2026 14:30"
};

// ==========================================
// STATE MANAGEMENT (LOCALSTORAGE ENGINE)
// ==========================================
class PrototypeState {
  constructor() {
    this.init();
  }

  init() {
    if (!localStorage.getItem('student_vocabs_proto')) {
      localStorage.setItem('student_vocabs_proto', JSON.stringify(DEFAULT_PROTO_VOCABS));
    }
    if (!localStorage.getItem('student_user_proto')) {
      localStorage.setItem('student_user_proto', JSON.stringify(DEFAULT_PROTO_USER));
    }
    if (!localStorage.getItem('student_latest_quiz_proto')) {
      localStorage.setItem('student_latest_quiz_proto', JSON.stringify(DEFAULT_PROTO_QUIZ));
    }
    this.currentView = 'screen2';
    this.flashcardFilter = 'unremembered'; // 'unremembered' | 'remembered' | 'all'
    this.currentCardIndex = 0;
  }

  get vocabs() {
    try {
      const data = localStorage.getItem('student_vocabs_proto');
      return data ? JSON.parse(data) : DEFAULT_PROTO_VOCABS;
    } catch (e) {
      return DEFAULT_PROTO_VOCABS;
    }
  }

  saveVocabs(items) {
    try {
      localStorage.setItem('student_vocabs_proto', JSON.stringify(items));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }

  get user() {
    try {
      const data = localStorage.getItem('student_user_proto');
      return data ? JSON.parse(data) : DEFAULT_PROTO_USER;
    } catch (e) {
      return DEFAULT_PROTO_USER;
    }
  }

  saveUser(userData) {
    try {
      localStorage.setItem('student_user_proto', JSON.stringify(userData));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }

  get latestQuiz() {
    try {
      const data = localStorage.getItem('student_latest_quiz_proto');
      return data ? JSON.parse(data) : DEFAULT_PROTO_QUIZ;
    } catch (e) {
      return DEFAULT_PROTO_QUIZ;
    }
  }

  saveLatestQuiz(quizData) {
    try {
      localStorage.setItem('student_latest_quiz_proto', JSON.stringify(quizData));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }

  resetDefaultData() {
    localStorage.setItem('student_vocabs_proto', JSON.stringify(DEFAULT_PROTO_VOCABS));
    localStorage.setItem('student_user_proto', JSON.stringify(DEFAULT_PROTO_USER));
    localStorage.setItem('student_latest_quiz_proto', JSON.stringify(DEFAULT_PROTO_QUIZ));
    this.flashcardFilter = 'unremembered';
    this.currentCardIndex = 0;
  }
}

const state = new PrototypeState();

// ==========================================
// TOAST & AUDIO HELPERS
// ==========================================
function showToast(message) {
  const toast = document.getElementById('app-toast');
  if (!toast) return;
  toast.innerText = message;
  toast.classList.add('visible');
  setTimeout(() => {
    toast.classList.remove('visible');
  }, 2200);
}

function speakWord(text) {
  if (!text) return;
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
    showToast(`🔊 กำลังอ่านออกเสียง: "${text}"`);
  } else {
    showToast('เบราว์เซอร์ไม่รองรับ Text-to-Speech');
  }
}

// ==========================================
// VIEW NAVIGATION & NAVBAR CONTROLLER
// ==========================================
function navigateTo(screenId) {
  state.currentView = screenId;

  // Unflip card if leaving flashcards
  const cardInner = document.getElementById('flashcard-inner');
  if (cardInner) cardInner.classList.remove('flipped');

  // Stop quiz timer if leaving quiz
  if (screenId !== 'screen6' && typeof quizSession !== 'undefined' && quizSession && quizSession.timerInterval) {
    clearInterval(quizSession.timerInterval);
  }

  // Hide all screens
  document.querySelectorAll('.view-screen').forEach(el => el.classList.remove('active'));

  // Show target screen
  const target = document.getElementById(screenId);
  if (target) {
    target.classList.add('active');
  }

  // Scroll to top of app content
  const content = document.querySelector('.app-content');
  if (content) content.scrollTop = 0;

  // Update Bottom Navbar
  renderNavbar(screenId);

  // Trigger screen-specific rendering
  if (screenId === 'screen2') renderDashboard();
  if (screenId === 'screen3') renderFlashcards();
  if (screenId === 'screen6') startQuiz();
  if (screenId === 'screen5') renderProfile();
}

function renderNavbar(screenId) {
  const navContainer = document.getElementById('app-navbar');
  if (!navContainer) return;

  if (screenId === 'screen1') {
    // Screen 1: Exactly 2 Items per Wireframe Spec
    navContainer.innerHTML = `
      <div class="nav-item active" onclick="navigateTo('screen1')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13.8 12H3"/>
        </svg>
        <span>เข้าสู่ระบบ</span>
      </div>
      <div class="nav-item" onclick="openHelpModal()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        <span>ความช่วยเหลือ</span>
      </div>
    `;
  } else {
    // Screens 2 to 6: 4 Items (หน้าหลัก, ท่องการ์ด, ทดสอบ, โปรไฟล์)
    navContainer.innerHTML = `
      <div class="nav-item ${screenId === 'screen2' ? 'active' : ''}" onclick="navigateTo('screen2')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
        <span>หน้าหลัก</span>
      </div>
      <div class="nav-item ${screenId === 'screen3' ? 'active' : ''}" onclick="navigateTo('screen3')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="2" y="4" width="20" height="16" rx="2"/>
          <line x1="2" y1="10" x2="22" y2="10"/>
        </svg>
        <span>ท่องการ์ด</span>
      </div>
      <div class="nav-item ${screenId === 'screen6' ? 'active' : ''}" onclick="navigateTo('screen6')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 11l3 3L22 4"/>
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
        </svg>
        <span>ทดสอบ</span>
      </div>
      <div class="nav-item ${screenId === 'screen5' ? 'active' : ''}" onclick="navigateTo('screen5')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
        <span>โปรไฟล์</span>
      </div>
    `;
  }
}

// ==========================================
// SCREEN 1: LOGIN / REGISTER CONTROLLER
// ==========================================
function switchAuthTab(showRegister) {
  const loginSection = document.getElementById('auth-login-section');
  const registerSection = document.getElementById('auth-register-section');
  const authTitle = document.getElementById('auth-sub-title');

  if (showRegister) {
    loginSection.style.display = 'none';
    registerSection.style.display = 'block';
    authTitle.innerText = 'สร้างบัญชีใหม่เพื่อเริ่มท่องจำคำศัพท์';
  } else {
    loginSection.style.display = 'block';
    registerSection.style.display = 'none';
    authTitle.innerText = 'เข้าสู่ระบบเพื่อทบทวนคลังคำศัพท์เตรียมสอบ';
  }
}

function handleLoginSubmit(e) {
  e.preventDefault();
  const identifier = document.getElementById('login-identifier').value.trim();
  const user = state.user;

  if (identifier) {
    if (identifier.includes('@')) {
      user.email = identifier;
    } else {
      user.username = identifier;
    }
  }
  user.is_logged_in = true;
  state.saveUser(user);
  showToast('เข้าสู่ระบบสำเร็จ (โหมดจำลอง Prototype)');
  navigateTo('screen2');
}

function handleRegisterSubmit(e) {
  e.preventDefault();
  const fullName = document.getElementById('reg-fullname').value.trim();
  const studentId = document.getElementById('reg-studentid').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const username = document.getElementById('reg-username').value.trim();

  const newUser = {
    user_id: 1,
    username: username || "student_user",
    full_name: fullName || "นักศึกษาใหม่",
    student_id: studentId || "001",
    email: email || "student@vec.go.th",
    target_exam: "TOEIC & IT Vocab",
    created_at: new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }),
    is_logged_in: true
  };

  state.saveUser(newUser);
  showToast('สมัครสมาชิกสำเร็จ! กำลังเข้าสู่ระบบ...');
  setTimeout(() => {
    navigateTo('screen2');
  }, 350);
}

function demoLogin() {
  const user = state.user;
  user.is_logged_in = true;
  state.saveUser(user);
  showToast('⚡ เข้าสู่ระบบโหมดทดลองเรียบร้อย!');
  navigateTo('screen2');
}

// ==========================================
// SCREEN 2: DASHBOARD CONTROLLER
// ==========================================
function renderDashboard() {
  const vocabs = state.vocabs;
  const user = state.user;

  // Header Greeting
  const nameEl = document.getElementById('dash-user-name');
  if (nameEl) nameEl.innerText = `สวัสดี ${user.full_name}`;
  const examEl = document.getElementById('dash-target-exam');
  if (examEl) examEl.innerText = `เป้าหมายสอบ: ${user.target_exam}`;

  // Statistics
  const total = vocabs.length;
  const remembered = vocabs.filter(v => v.is_remembered).length;
  const unremembered = total - remembered;
  const percentage = total > 0 ? Math.round((remembered / total) * 100) : 0;

  document.getElementById('dash-stat-total').innerText = total;
  document.getElementById('dash-stat-remembered').innerText = remembered;
  document.getElementById('dash-stat-unremembered').innerText = unremembered;
  document.getElementById('dash-progress-pct').innerText = `${percentage}%`;
  document.getElementById('dash-progress-fill').style.width = `${percentage}%`;

  // Urgent review words (unremembered)
  const urgentContainer = document.getElementById('dash-urgent-list');
  const unrememberedList = vocabs.filter(v => !v.is_remembered);

  if (total === 0) {
    urgentContainer.innerHTML = `<div class="empty">ยังไม่มีคำศัพท์ในคลัง กดปุ่ม "เพิ่มศัพท์" ด้านบนเพื่อเริ่มเรียนรู้</div>`;
  } else if (unrememberedList.length === 0) {
    urgentContainer.innerHTML = `<div class="empty">ยอดเยี่ยมมาก! จำคำศัพท์ได้ครบทุกคำแล้ว 🎉</div>`;
  } else {
    urgentContainer.innerHTML = unrememberedList.map(item => `
      <div class="word-row">
        <div class="main" onclick="openSpecificFlashcard(${item.vocab_id})">
          <div class="w">${item.vocab_word}</div>
          <div class="m">${item.meaning_th}</div>
        </div>
        <span class="badge ${item.category_id === 'TOEIC' ? 'badge-warning' : 'badge-primary'}">${item.category_id}</span>
        <button class="icon-btn" title="แก้ไข" onclick="event.stopPropagation(); openEditForm(${item.vocab_id});">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
        <button class="icon-btn danger" title="ลบ" onclick="event.stopPropagation(); confirmDeleteVocab(${item.vocab_id});">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        </button>
      </div>
    `).join('');
  }
}

function openSpecificFlashcard(vocabId) {
  state.flashcardFilter = 'all';
  const vocabs = state.vocabs;
  const idx = vocabs.findIndex(v => v.vocab_id === vocabId);
  state.currentCardIndex = idx !== -1 ? idx : 0;
  navigateTo('screen3');
}

// ==========================================
// SCREEN 3: FLASHCARDS CONTROLLER
// ==========================================
function getFilteredVocabs() {
  const vocabs = state.vocabs;
  if (state.flashcardFilter === 'unremembered') {
    return vocabs.filter(v => !v.is_remembered);
  }
  if (state.flashcardFilter === 'remembered') {
    return vocabs.filter(v => v.is_remembered);
  }
  return vocabs;
}

function setFlashcardFilter(filterName) {
  state.flashcardFilter = filterName;
  state.currentCardIndex = 0;
  renderFlashcards();
}

function renderFlashcards() {
  // Update Tab Pills
  const pUnrem = document.getElementById('pill-unremembered');
  const pRem = document.getElementById('pill-remembered');
  const pAll = document.getElementById('pill-all');

  const vocabs = state.vocabs;
  const countUnrem = vocabs.filter(v => !v.is_remembered).length;
  const countRem = vocabs.filter(v => v.is_remembered).length;
  const countAll = vocabs.length;

  pUnrem.innerText = `ยังจำไม่ได้ (${countUnrem})`;
  pRem.innerText = `จำได้แล้ว (${countRem})`;
  pAll.innerText = `ทั้งหมด (${countAll})`;

  [pUnrem, pRem, pAll].forEach(el => el.classList.remove('active'));
  if (state.flashcardFilter === 'unremembered') pUnrem.classList.add('active');
  if (state.flashcardFilter === 'remembered') pRem.classList.add('active');
  if (state.flashcardFilter === 'all') pAll.classList.add('active');

  const filtered = getFilteredVocabs();
  const cardInner = document.getElementById('flashcard-inner');
  if (cardInner) cardInner.classList.remove('flipped');

  if (filtered.length === 0) {
    document.getElementById('card-front-word').innerText = "ไม่มีคำศัพท์";
    document.getElementById('card-front-pos').innerText = "-";
    document.getElementById('card-front-cat').innerText = "-";
    document.getElementById('card-front-example').innerText = "ไม่มีคำศัพท์ในหมวดนี้ เลือกลองหมวดอื่นหรือกดเพิ่มคำศัพท์";
    document.getElementById('card-indicator').innerText = "0 / 0";
    document.getElementById('card-back-word').innerText = "";
    document.getElementById('card-back-meaning').innerText = "ไม่มีข้อมูล";
    document.getElementById('card-back-example').innerText = "";
    return;
  }

  if (state.currentCardIndex >= filtered.length) {
    state.currentCardIndex = 0;
  }

  const current = filtered[state.currentCardIndex];

  // FRONT
  document.getElementById('card-front-word').innerText = current.vocab_word;
  document.getElementById('card-front-pos').innerText = current.part_of_speech || '';
  document.getElementById('card-front-cat').innerText = current.category_id || 'TOEIC';
  document.getElementById('card-front-example').innerText = current.example_sentence ? `"${current.example_sentence}"` : '';
  document.getElementById('card-indicator').innerText = `${state.currentCardIndex + 1} / ${filtered.length}`;

  // BACK
  document.getElementById('card-back-word').innerText = `${current.vocab_word} (${current.part_of_speech || ''})`;
  document.getElementById('card-back-meaning').innerText = current.meaning_th;
  document.getElementById('card-back-example').innerText = current.example_sentence ? `ตัวอย่าง: ${current.example_sentence}` : '';
  document.getElementById('card-back-cat').innerText = current.category_id || 'TOEIC';
  document.getElementById('card-back-pos').innerText = current.part_of_speech || '';
}

function flipCard() {
  const cardInner = document.getElementById('flashcard-inner');
  if (cardInner) {
    cardInner.classList.toggle('flipped');
  }
}

function nextCard() {
  const filtered = getFilteredVocabs();
  if (filtered.length <= 1) return;
  state.currentCardIndex = (state.currentCardIndex + 1) % filtered.length;
  renderFlashcards();
}

function prevCard() {
  const filtered = getFilteredVocabs();
  if (filtered.length <= 1) return;
  state.currentCardIndex = (state.currentCardIndex - 1 + filtered.length) % filtered.length;
  renderFlashcards();
}

function markCardRemembered(status) {
  const filtered = getFilteredVocabs();
  if (filtered.length === 0) return;
  const current = filtered[state.currentCardIndex];

  const vocabs = state.vocabs;
  const target = vocabs.find(v => v.vocab_id === current.vocab_id);
  if (target) {
    target.is_remembered = status;
    state.saveVocabs(vocabs);
    showToast(status ? `✅ จำได้แล้ว: "${target.vocab_word}"` : `❌ ยังจำไม่ได้: "${target.vocab_word}"`);

    // Advance to next card or re-render
    if (state.flashcardFilter !== 'all') {
      renderFlashcards();
    } else {
      nextCard();
    }
  }
}

function handleEditCurrentCard() {
  const filtered = getFilteredVocabs();
  if (filtered.length === 0) return;
  const current = filtered[state.currentCardIndex];
  openEditForm(current.vocab_id);
}

function handleDeleteCurrentCard() {
  const filtered = getFilteredVocabs();
  if (filtered.length === 0) return;
  const current = filtered[state.currentCardIndex];
  confirmDeleteVocab(current.vocab_id);
}

// ==========================================
// SCREEN 6: QUIZ CHALLENGE ENGINE
// ==========================================
let quizSession = {
  questions: [],
  currentIndex: 0,
  score: 0,
  timerSeconds: 15,
  timerInterval: null,
  isAnswered: false,
  answersLog: []
};

function startQuiz() {
  const vocabs = state.vocabs;
  if (vocabs.length < 2) {
    showToast('ต้องมีคำศัพท์อย่างน้อย 2 คำเพื่อทำแบบทดสอบ');
    navigateTo('screen2');
    return;
  }

  // Shuffle and pick up to 5 questions
  const shuffledVocabs = [...vocabs].sort(() => 0.5 - Math.random());
  const selectedVocabs = shuffledVocabs.slice(0, Math.min(5, vocabs.length));

  // Build questions with 4 choices
  quizSession.questions = selectedVocabs.map(card => {
    // Other words as distractors
    const others = vocabs.filter(v => v.vocab_id !== card.vocab_id);
    const shuffledOthers = [...others].sort(() => 0.5 - Math.random());
    const distractors = shuffledOthers.slice(0, 3).map(o => o.meaning_th);

    // Combine correct and distractors
    const choices = [card.meaning_th, ...distractors].sort(() => 0.5 - Math.random());

    return {
      card: card,
      choices: choices,
      correctAnswer: card.meaning_th
    };
  });

  quizSession.currentIndex = 0;
  quizSession.score = 0;
  quizSession.answersLog = [];
  renderQuizQuestion();
}

function renderQuizQuestion() {
  if (quizSession.currentIndex >= quizSession.questions.length) {
    finishQuiz();
    return;
  }

  const q = quizSession.questions[quizSession.currentIndex];
  quizSession.isAnswered = false;

  // Header Info
  const qNum = quizSession.currentIndex + 1;
  const qTotal = quizSession.questions.length;
  document.getElementById('quiz-question-counter').innerText = `ข้อที่ ${qNum} / ${qTotal}`;
  document.getElementById('quiz-cat-badge').innerText = q.card.category_id || 'TOEIC';
  document.getElementById('quiz-pos-badge').innerText = q.card.part_of_speech || 'Noun';
  document.getElementById('quiz-progress-fill').style.width = `${(qNum / qTotal) * 100}%`;

  // Question Word
  document.getElementById('quiz-word').innerText = q.card.vocab_word;
  document.getElementById('quiz-sentence').innerText = q.card.example_sentence ? `"${q.card.example_sentence}"` : '';

  // Render Choices
  const container = document.getElementById('quiz-choices-container');
  container.innerHTML = q.choices.map((choice, idx) => {
    const letters = ['A', 'B', 'C', 'D'];
    const letter = letters[idx] || (idx + 1);
    const isCorrect = choice === q.correctAnswer;
    return `
      <button class="quiz-choice-btn" onclick="selectQuizChoice(this, ${isCorrect}, '${choice.replace(/'/g, "\\'")}')">
        <span class="choice-key">${letter}</span>
        <span>${choice}</span>
      </button>
    `;
  }).join('');

  // Start 15s Timer
  startQuizTimer();
}

function startQuizTimer() {
  clearInterval(quizSession.timerInterval);
  quizSession.timerSeconds = 15;
  const timerEl = document.getElementById('quiz-timer');
  timerEl.innerText = `00:15`;
  timerEl.style.color = 'var(--ink)';

  quizSession.timerInterval = setInterval(() => {
    quizSession.timerSeconds--;
    const sec = quizSession.timerSeconds;
    timerEl.innerText = `00:${sec < 10 ? '0' : ''}${sec}`;

    if (sec <= 5) {
      timerEl.style.color = 'var(--bad)';
    }

    if (sec <= 0) {
      clearInterval(quizSession.timerInterval);
      handleQuizTimeout();
    }
  }, 1000);
}

function selectQuizChoice(btn, isCorrect, choiceText) {
  if (quizSession.isAnswered) return;
  quizSession.isAnswered = true;
  clearInterval(quizSession.timerInterval);

  const currentQ = quizSession.questions[quizSession.currentIndex];
  quizSession.answersLog.push({
    card_id: currentQ.card.vocab_id,
    selected_choice: choiceText,
    is_correct: isCorrect
  });

  if (isCorrect) {
    quizSession.score++;
    btn.classList.add('correct');
    showToast('🎉 ถูกต้อง! +1 คะแนน');
  } else {
    btn.classList.add('wrong');
    // Highlight correct choice
    const allBtns = document.querySelectorAll('.quiz-choice-btn');
    allBtns.forEach(b => {
      if (b.innerText.includes(currentQ.correctAnswer)) {
        b.classList.add('correct');
      }
    });
    showToast('❌ ยังไม่ถูกต้อง');
  }

  // Advance to next question after 850ms
  setTimeout(() => {
    quizSession.currentIndex++;
    renderQuizQuestion();
  }, 850);
}

function handleQuizTimeout() {
  quizSession.isAnswered = true;
  showToast('⏰ หมดเวลาข้อนี้!');
  const currentQ = quizSession.questions[quizSession.currentIndex];
  quizSession.answersLog.push({
    card_id: currentQ.card.vocab_id,
    selected_choice: "หมดเวลา",
    is_correct: false
  });

  // Reveal correct choice
  const allBtns = document.querySelectorAll('.quiz-choice-btn');
  allBtns.forEach(b => {
    if (b.innerText.includes(currentQ.correctAnswer)) {
      b.classList.add('correct');
    }
  });

  setTimeout(() => {
    quizSession.currentIndex++;
    renderQuizQuestion();
  }, 900);
}

function finishQuiz() {
  clearInterval(quizSession.timerInterval);
  const total = quizSession.questions.length;
  const score = quizSession.score;
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;

  const now = new Date();
  const dateStr = `${now.getDate()} ${thaiMonthShort(now.getMonth())} ${now.getFullYear() + 543} ${now.getHours()}:${now.getMinutes() < 10 ? '0' : ''}${now.getMinutes()}`;

  const quizResult = {
    score: score,
    total_questions: total,
    percentage: pct,
    tested_at: dateStr,
    answers: quizSession.answersLog
  };

  state.saveLatestQuiz(quizResult);

  // Update result modal
  document.getElementById('quiz-result-score').innerText = `${score} / ${total}`;
  const badgeEl = document.getElementById('quiz-result-badge');

  if (pct >= 80) {
    badgeEl.className = "badge badge-success";
    badgeEl.innerText = `${pct}% — ยอดเยี่ยมมาก! เก่งมาก`;
  } else if (pct >= 50) {
    badgeEl.className = "badge badge-warning";
    badgeEl.innerText = `${pct}% — ผ่านเกณฑ์ ควรทบทวนเพิ่ม`;
  } else {
    badgeEl.className = "badge badge-danger";
    badgeEl.innerText = `${pct}% — ยังไม่ผ่าน ต้องรีบทบทวนศัพท์`;
  }

  document.getElementById('quiz-result-modal').classList.add('open');
}

function closeQuizResultModal() {
  document.getElementById('quiz-result-modal').classList.remove('open');
}

function thaiMonthShort(m) {
  const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  return months[m] || '';
}

// ==========================================
// SCREEN 4: ADD & EDIT CARD CONTROLLER
// ==========================================
function openAddForm() {
  document.getElementById('edit-vocab-id').value = '';
  document.getElementById('card-form-title').innerText = 'เพิ่มคำศัพท์';
  document.getElementById('card-form-subtitle').innerText = 'กรอกข้อมูลเพื่อบันทึกลงคลังคำศัพท์ (Prototype)';
  document.getElementById('card-form-submit-btn').innerText = 'บันทึกคำศัพท์';
  document.getElementById('add-word').value = '';
  document.getElementById('add-meaning').value = '';
  document.getElementById('add-example').value = '';
  document.getElementById('add-pos').selectedIndex = 0;
  document.getElementById('add-category').selectedIndex = 0;
  navigateTo('screen4');
}

function openEditForm(vocabId) {
  const vocabs = state.vocabs;
  const vocab = vocabs.find(v => v.vocab_id === vocabId);
  if (!vocab) return;

  document.getElementById('edit-vocab-id').value = vocab.vocab_id;
  document.getElementById('card-form-title').innerText = 'แก้ไขคำศัพท์';
  document.getElementById('card-form-subtitle').innerText = `แก้ไขข้อมูลของคำว่า "${vocab.vocab_word}"`;
  document.getElementById('card-form-submit-btn').innerText = 'บันทึกการแก้ไข';
  document.getElementById('add-word').value = vocab.vocab_word;
  document.getElementById('add-meaning').value = vocab.meaning_th;
  document.getElementById('add-example').value = vocab.example_sentence || '';

  const posSelect = document.getElementById('add-pos');
  for (let i = 0; i < posSelect.options.length; i++) {
    if (posSelect.options[i].value === vocab.part_of_speech) {
      posSelect.selectedIndex = i;
      break;
    }
  }

  const catSelect = document.getElementById('add-category');
  for (let i = 0; i < catSelect.options.length; i++) {
    if (catSelect.options[i].value === vocab.category_id) {
      catSelect.selectedIndex = i;
      break;
    }
  }

  navigateTo('screen4');
}

function cancelCardForm() {
  const editId = document.getElementById('edit-vocab-id').value;
  if (editId) {
    openSpecificFlashcard(parseInt(editId));
  } else {
    navigateTo('screen2');
  }
}

function handleCardFormSubmit(e) {
  e.preventDefault();
  const editId = document.getElementById('edit-vocab-id').value;
  const word = document.getElementById('add-word').value.trim();
  const pos = document.getElementById('add-pos').value;
  const category = document.getElementById('add-category').value;
  const meaning = document.getElementById('add-meaning').value.trim();
  const example = document.getElementById('add-example').value.trim();

  const vocabs = state.vocabs;

  if (editId) {
    // UPDATE
    const target = vocabs.find(v => v.vocab_id === parseInt(editId));
    if (target) {
      target.vocab_word = word;
      target.part_of_speech = pos;
      target.category_id = category;
      target.meaning_th = meaning;
      target.example_sentence = example || `Example sentence for ${word}.`;
      state.saveVocabs(vocabs);
      showToast(`บันทึกการแก้ไข "${word}" เรียบร้อย!`);
      openSpecificFlashcard(target.vocab_id);
    }
  } else {
    // CREATE
    const newId = vocabs.length > 0 ? Math.max(...vocabs.map(v => v.vocab_id)) + 1 : 1;
    const newCard = {
      vocab_id: newId,
      vocab_word: word,
      meaning_th: meaning,
      part_of_speech: pos,
      category_id: category,
      example_sentence: example || `Example sentence for ${word}.`,
      is_remembered: false
    };
    vocabs.push(newCard);
    state.saveVocabs(vocabs);
    showToast(`เพิ่มคำศัพท์ "${word}" สำเร็จ!`);
    navigateTo('screen2');
  }
}

// ==========================================
// DELETE CONFIRMATION CONTROLLER
// ==========================================
let pendingDeleteVocabId = null;

function confirmDeleteVocab(vocabId) {
  const vocabs = state.vocabs;
  const card = vocabs.find(v => v.vocab_id === vocabId);
  if (!card) return;
  pendingDeleteVocabId = vocabId;
  document.getElementById('delete-word-target').innerText = `"${card.vocab_word}"`;
  document.getElementById('delete-confirm-modal').classList.add('open');
}

function closeDeleteModal() {
  document.getElementById('delete-confirm-modal').classList.remove('open');
  pendingDeleteVocabId = null;
}

function executeDeleteVocab() {
  if (!pendingDeleteVocabId) return;
  let vocabs = state.vocabs;
  const deletedWord = vocabs.find(v => v.vocab_id === pendingDeleteVocabId)?.vocab_word || '';
  vocabs = vocabs.filter(v => v.vocab_id !== pendingDeleteVocabId);
  state.saveVocabs(vocabs);
  closeDeleteModal();
  showToast(`ลบคำศัพท์ "${deletedWord}" เรียบร้อย`);

  if (state.currentView === 'screen3') {
    state.currentCardIndex = 0;
    renderFlashcards();
  } else {
    renderDashboard();
  }
  renderProfile();
}

// ==========================================
// SCREEN 5: PROFILE CONTROLLER
// ==========================================
function renderProfile() {
  const user = state.user;
  const vocabs = state.vocabs;
  const total = vocabs.length;
  const remembered = vocabs.filter(v => v.is_remembered).length;
  const percentage = total > 0 ? Math.round((remembered / total) * 100) : 0;
  const latestQuiz = state.latestQuiz;

  // Avatar Initials
  const initials = user.full_name ? user.full_name.split(' ').map(n => n[0]).join('').slice(0, 2) : "TP";
  document.getElementById('prof-avatar').innerText = initials || "TP";
  document.getElementById('prof-fullname').innerText = user.full_name;
  document.getElementById('prof-username').innerText = `@${user.username}`;
  document.getElementById('prof-student-badge').innerText = `นักศึกษา (ID: ${user.student_id})`;

  // Account
  document.getElementById('prof-user-id').innerText = user.user_id;
  document.getElementById('prof-account-username').innerText = user.username;
  document.getElementById('prof-email').innerText = user.email;
  document.getElementById('prof-created-at').innerText = user.created_at;

  // Stats
  document.getElementById('prof-total-cards').innerText = `${total} ใบ`;
  document.getElementById('prof-remembered-cards').innerText = `${remembered} ใบ (${percentage}%)`;
  document.getElementById('prof-target-badge').innerText = user.target_exam;

  // Quiz
  const quizBadge = document.getElementById('prof-latest-quiz');
  if (quizBadge && latestQuiz) {
    quizBadge.innerText = `${latestQuiz.score} / ${latestQuiz.total_questions} (${latestQuiz.percentage}%)`;
  }
}

function openEditProfileModal() {
  const user = state.user;
  document.getElementById('edit-fullname').value = user.full_name;
  document.getElementById('edit-studentid').value = user.student_id;
  document.getElementById('edit-targetexam').value = user.target_exam;
  document.getElementById('profile-edit-modal').classList.add('open');
}

function closeEditProfileModal() {
  document.getElementById('profile-edit-modal').classList.remove('open');
}

function handleProfileEditSubmit(e) {
  e.preventDefault();
  const user = state.user;
  user.full_name = document.getElementById('edit-fullname').value.trim();
  user.student_id = document.getElementById('edit-studentid').value.trim();
  user.target_exam = document.getElementById('edit-targetexam').value.trim();
  state.saveUser(user);
  closeEditProfileModal();
  showToast('อัปเดตข้อมูลส่วนตัวสำเร็จ!');
  renderProfile();
}

function resetMockData() {
  if (confirm('ต้องการรีเซ็ตข้อมูลคลังคำศัพท์และผู้ใช้กลับเป็นค่าเริ่มต้นของแบบจำลองหรือไม่?')) {
    state.resetDefaultData();
    showToast('รีเซ็ตข้อมูลตัวอย่าง Prototype เรียบร้อย!');
    if (state.currentView === 'screen2') renderDashboard();
    if (state.currentView === 'screen3') renderFlashcards();
    if (state.currentView === 'screen5') renderProfile();
  }
}

function logout() {
  const user = state.user;
  user.is_logged_in = false;
  state.saveUser(user);
  showToast('ออกจากระบบแล้ว');
  navigateTo('screen1');
}

function openHelpModal() {
  document.getElementById('help-modal').classList.add('open');
}

function closeHelpModal() {
  document.getElementById('help-modal').classList.remove('open');
}

// Keyboard shortcuts for flashcards
window.addEventListener('keydown', (e) => {
  if (state.currentView === 'screen3') {
    if (e.key === 'ArrowLeft') {
      prevCard();
    } else if (e.key === 'ArrowRight') {
      nextCard();
    } else if (e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      flipCard();
    }
  }
});

// Boot app
document.addEventListener('DOMContentLoaded', () => {
  navigateTo('screen2');
});
