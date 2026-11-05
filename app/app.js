/**
 * Student Vocab - Hybrid App Engine
 * Complete interactive logic with LocalStorage persistence & Speech Synthesis
 */

// Initial Seed Data (Matches template_obj46.bmp exactly: 5 words, 2 remembered (40%), 3 unremembered)
const DEFAULT_VOCABS = [
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
  }
];

const DEFAULT_USER = {
  user_id: 1,
  username: "theeradech_019",
  full_name: "นายธีรเดช ผกามาด",
  student_id: "019",
  email: "theeradech_019@vec.go.th",
  target_exam: "TOEIC & IT Vocab",
  created_at: "29 ต.ค. 2026",
  is_logged_in: true
};

// ==========================================
// STATE MANAGEMENT
// ==========================================
class AppState {
  constructor() {
    this.init();
  }

  init() {
    if (!localStorage.getItem('student_vocabs')) {
      localStorage.setItem('student_vocabs', JSON.stringify(DEFAULT_VOCABS));
    }
    if (!localStorage.getItem('student_user')) {
      localStorage.setItem('student_user', JSON.stringify(DEFAULT_USER));
    }
    this.currentView = 'screen2'; // Default to dashboard if logged in
    this.flashcardFilter = 'unremembered'; // 'unremembered' | 'remembered' | 'all'
    this.currentCardIndex = 0;
  }

  get vocabs() {
    return JSON.parse(localStorage.getItem('student_vocabs')) || [];
  }

  saveVocabs(items) {
    localStorage.setItem('student_vocabs', JSON.stringify(items));
  }

  get user() {
    return JSON.parse(localStorage.getItem('student_user')) || DEFAULT_USER;
  }

  saveUser(userData) {
    localStorage.setItem('student_user', JSON.stringify(userData));
  }

  resetDefaultData() {
    localStorage.setItem('student_vocabs', JSON.stringify(DEFAULT_VOCABS));
    localStorage.setItem('student_user', JSON.stringify(DEFAULT_USER));
    this.flashcardFilter = 'unremembered';
    this.currentCardIndex = 0;
  }
}

const state = new AppState();

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
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  } else {
    showToast('เบราว์เซอร์ไม่รองรับ Text-to-Speech');
  }
}

// ==========================================
// VIEW NAVIGATION & NAVBAR CONTROLLER
// ==========================================
function navigateTo(screenId) {
  state.currentView = screenId;
  
  // Hide all screens
  document.querySelectorAll('.view-screen').forEach(el => el.classList.remove('active'));
  
  // Show target screen
  const target = document.getElementById(screenId);
  if (target) {
    target.classList.add('active');
  }

  // Update Bottom Navbar
  renderNavbar(screenId);

  // Trigger screen-specific rendering
  if (screenId === 'screen2') renderDashboard();
  if (screenId === 'screen3') renderFlashcards();
  if (screenId === 'screen5') renderProfile();
}

function renderNavbar(screenId) {
  const navContainer = document.getElementById('app-navbar');
  if (!navContainer) return;

  if (screenId === 'screen1') {
    // Screen 1: Exactly 2 Items per Template
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
    // Screens 2 to 5: Exactly 4 Items (NO หมวดหมู่)
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
      <div class="nav-item ${screenId === 'screen4' ? 'active' : ''}" onclick="navigateTo('screen4')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="16"/>
          <line x1="8" y1="12" x2="16" y2="12"/>
        </svg>
        <span>เพิ่มศัพท์</span>
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
  const user = state.user;
  user.is_logged_in = true;
  state.saveUser(user);
  showToast('เข้าสู่ระบบสำเร็จ ยินดีต้อนรับ!');
  navigateTo('screen2');
}

function handleRegisterSubmit(e) {
  e.preventDefault();
  const fullName = document.getElementById('reg-fullname').value;
  const studentId = document.getElementById('reg-studentid').value;
  const email = document.getElementById('reg-email').value;
  const username = document.getElementById('reg-username').value;

  const newUser = {
    user_id: 1,
    username: username,
    full_name: fullName,
    student_id: studentId,
    email: email,
    target_exam: "TOEIC & IT Vocab",
    created_at: "29 ต.ค. 2026",
    is_logged_in: true
  };

  state.saveUser(newUser);
  showToast('สมัครสมาชิกสำเร็จ! กำลังเข้าสู่ระบบ...');
  setTimeout(() => {
    navigateTo('screen2');
  }, 400);
}

// ==========================================
// SCREEN 2: DASHBOARD CONTROLLER
// ==========================================
function renderDashboard() {
  const vocabs = state.vocabs;
  const user = state.user;

  // Update Greeting
  document.getElementById('dash-user-name').innerText = `สวัสดี ${user.full_name}`;
  document.getElementById('dash-target-exam').innerText = `เป้าหมายสอบ: ${user.target_exam}`;

  // Calculate statistics
  const total = vocabs.length;
  const remembered = vocabs.filter(v => v.is_remembered).length;
  const unremembered = total - remembered;
  const percentage = total > 0 ? Math.round((remembered / total) * 100) : 0;

  document.getElementById('dash-stat-total').innerText = total;
  document.getElementById('dash-stat-remembered').innerText = remembered;
  document.getElementById('dash-stat-unremembered').innerText = unremembered;
  document.getElementById('dash-progress-pct').innerText = `${percentage}%`;
  document.getElementById('dash-progress-fill').style.width = `${percentage}%`;

  // Render urgent review items (unremembered words)
  const urgentContainer = document.getElementById('dash-urgent-list');
  const unrememberedList = vocabs.filter(v => !v.is_remembered);

  if (unrememberedList.length === 0) {
    urgentContainer.innerHTML = `
      <div style="text-align: center; padding: 24px; color: #16a34a; font-size: 13px;">
        🎉 ยอดเยี่ยมมาก! คุณจำคำศัพท์ได้ครบทุกคำแล้ว
      </div>
    `;
  } else {
    urgentContainer.innerHTML = unrememberedList.map(item => `
      <div class="card-box" style="display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; margin-bottom: 8px; cursor: pointer;" onclick="openSpecificFlashcard(${item.vocab_id})">
        <div>
          <div style="font-size: 14px; font-weight: 700; color: #0f172a;">${item.vocab_word}</div>
          <div style="font-size: 11px; color: #64748b;">${item.meaning_th}</div>
        </div>
        <span class="badge ${item.category_id === 'TOEIC' ? 'badge-warning' : 'badge-primary'}">${item.category_id}</span>
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
  const vocabs = state.vocabs;
  const total = vocabs.length;
  const remembered = vocabs.filter(v => v.is_remembered).length;
  const unremembered = total - remembered;

  // Update filter pill counts & active states
  const pillUn = document.getElementById('pill-unremembered');
  const pillRem = document.getElementById('pill-remembered');
  const pillAll = document.getElementById('pill-all');

  pillUn.innerText = `ยังจำไม่ได้ (${unremembered})`;
  pillRem.innerText = `จำได้แล้ว (${remembered})`;
  pillAll.innerText = `ทั้งหมด (${total})`;

  pillUn.className = `filter-pill ${state.flashcardFilter === 'unremembered' ? 'active' : ''}`;
  pillRem.className = `filter-pill ${state.flashcardFilter === 'remembered' ? 'active' : ''}`;
  pillAll.className = `filter-pill ${state.flashcardFilter === 'all' ? 'active' : ''}`;

  const currentList = getFilteredVocabs();
  const cardInner = document.getElementById('flashcard-inner');
  cardInner.classList.remove('flipped'); // Reset flip

  if (currentList.length === 0) {
    document.getElementById('card-front-word').innerText = "ไม่มีคำศัพท์ในหมวดนี้";
    document.getElementById('card-front-pos').innerText = "-";
    document.getElementById('card-front-cat').innerText = "-";
    document.getElementById('card-back-meaning').innerText = "กรุณาเลือกหมวดหมู่อื่น หรือเพิ่มคำศัพท์ใหม่";
    document.getElementById('card-back-example').innerText = "";
    document.getElementById('card-indicator').innerText = "0 / 0";
    return;
  }

  // Bound index
  if (state.currentCardIndex >= currentList.length) state.currentCardIndex = 0;
  if (state.currentCardIndex < 0) state.currentCardIndex = currentList.length - 1;

  const card = currentList[state.currentCardIndex];

  // Front Face
  document.getElementById('card-front-cat').innerText = card.category_id;
  document.getElementById('card-front-cat').className = `badge ${card.category_id === 'TOEIC' ? 'badge-warning' : 'badge-primary'}`;
  document.getElementById('card-front-pos').innerText = card.part_of_speech;
  document.getElementById('card-front-word').innerText = card.vocab_word;
  document.getElementById('card-front-meaning-preview').innerText = card.meaning_th;
  document.getElementById('card-front-example').innerText = `"${card.example_sentence}"`;

  // Back Face
  document.getElementById('card-back-cat').innerText = card.category_id;
  document.getElementById('card-back-cat').className = `badge ${card.category_id === 'TOEIC' ? 'badge-warning' : 'badge-primary'}`;
  document.getElementById('card-back-pos').innerText = card.part_of_speech;
  document.getElementById('card-back-word').innerText = card.vocab_word;
  document.getElementById('card-back-meaning').innerText = card.meaning_th;
  document.getElementById('card-back-example').innerText = `"${card.example_sentence}"`;

  // Indicator (e.g. ใบที่ 2 / 3)
  document.getElementById('card-indicator').innerText = `ใบที่ ${state.currentCardIndex + 1} / ${currentList.length}`;
}

function flipCard() {
  const cardInner = document.getElementById('flashcard-inner');
  cardInner.classList.toggle('flipped');
}

function nextCard() {
  const currentList = getFilteredVocabs();
  if (currentList.length <= 1) return;
  state.currentCardIndex = (state.currentCardIndex + 1) % currentList.length;
  renderFlashcards();
}

function prevCard() {
  const currentList = getFilteredVocabs();
  if (currentList.length <= 1) return;
  state.currentCardIndex = (state.currentCardIndex - 1 + currentList.length) % currentList.length;
  renderFlashcards();
}

function markCardRemembered(status) {
  const currentList = getFilteredVocabs();
  if (currentList.length === 0) return;

  const currentCard = currentList[state.currentCardIndex];
  const allVocabs = state.vocabs;
  const target = allVocabs.find(v => v.vocab_id === currentCard.vocab_id);

  if (target) {
    target.is_remembered = status;
    state.saveVocabs(allVocabs);
    
    if (status) {
      showToast(`✓ จำได้แล้ว: ${target.vocab_word}`);
    } else {
      showToast(`✕ ยังจำไม่ได้: ${target.vocab_word}`);
    }

    renderFlashcards();
  }
}

// ==========================================
// SCREEN 4: ADD CARD CONTROLLER
// ==========================================
function handleAddCardSubmit(e) {
  e.preventDefault();
  const word = document.getElementById('add-word').value.trim();
  const pos = document.getElementById('add-pos').value;
  const category = document.getElementById('add-category').value;
  const meaning = document.getElementById('add-meaning').value.trim();
  const example = document.getElementById('add-example').value.trim();

  const vocabs = state.vocabs;
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

  // Clear form
  document.getElementById('add-word').value = '';
  document.getElementById('add-meaning').value = '';
  document.getElementById('add-example').value = '';

  showToast(`บันทึกคำศัพท์ "${word}" สำเร็จ!`);
  navigateTo('screen2');
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

  // Avatar initials
  const initials = user.full_name ? user.full_name.split(' ').map(n => n[0]).join('').slice(0, 2) : "TP";
  document.getElementById('prof-avatar').innerText = initials || "TP";
  document.getElementById('prof-fullname').innerText = user.full_name;
  document.getElementById('prof-username').innerText = `@${user.username}`;
  document.getElementById('prof-student-badge').innerText = `นักศึกษา (ID: ${user.student_id})`;

  // Account details
  document.getElementById('prof-user-id').innerText = user.user_id;
  document.getElementById('prof-account-username').innerText = user.username;
  document.getElementById('prof-email').innerText = user.email;
  document.getElementById('prof-created-at').innerText = user.created_at;

  // Learning stats
  document.getElementById('prof-total-cards').innerText = `${total} ใบ`;
  document.getElementById('prof-remembered-cards').innerText = `${remembered} ใบ (${percentage}%)`;
  document.getElementById('prof-target-badge').innerText = user.target_exam;
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
  user.full_name = document.getElementById('edit-fullname').value;
  user.student_id = document.getElementById('edit-studentid').value;
  user.target_exam = document.getElementById('edit-targetexam').value;
  state.saveUser(user);
  closeEditProfileModal();
  showToast('อัปเดตข้อมูลส่วนตัวสำเร็จ!');
  renderProfile();
}

function resetMockData() {
  if (confirm('ต้องการรีเซ็ตข้อมูลทั้งหมดกลับเป็นค่าเริ่มต้น 5 คำศัพท์ตามแบบ Wireframe หรือไม่?')) {
    state.resetDefaultData();
    showToast('รีเซ็ตข้อมูลเริ่มต้น 5 คำสำเร็จ!');
    renderProfile();
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

// Initial Boot
document.addEventListener('DOMContentLoaded', () => {
  navigateTo('screen2'); // Boot directly into Dashboard, user can test Screen 1 via Navbar or Logout
});
