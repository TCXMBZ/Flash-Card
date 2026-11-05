/**
 * Student Vocab - Hybrid App Engine (Supabase Integrated)
 * Connects with Supabase Auth, PostgreSQL Tables & RLS Policies
 */

// ==========================================
// SUPABASE CLIENT INITIALIZATION
// ==========================================
let supabaseClient = null;

function getSupabase() {
  if (supabaseClient) return supabaseClient;
  const config = window.SUPABASE_CONFIG;
  if (!config || !config.url || !config.publishableKey || config.publishableKey.includes("YOUR_SUPABASE")) {
    return null;
  }
  if (!window.supabase) {
    console.error("Supabase JS Library ยังโหลดไม่เสร็จหรือถูกบล็อก");
    return null;
  }
  try {
    supabaseClient = window.supabase.createClient(config.url, config.publishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
    return supabaseClient;
  } catch (err) {
    console.error("Failed to initialize Supabase client:", err);
    return null;
  }
}

// Helper: แปลข้อความ Error จาก Supabase Auth ให้เป็นภาษาไทยที่เข้าใจง่าย
function translateAuthError(message) {
  if (!message) return 'เกิดข้อผิดพลาดในการเชื่อมต่อ';
  if (message.includes('Invalid login credentials')) return 'อีเมลหรือรหัสผ่านไม่ถูกต้อง';
  if (message.includes('Email not confirmed')) return 'กรุณายืนยันอีเมลในกล่องข้อความก่อนเข้าสู่ระบบ';
  if (message.includes('User already registered')) return 'อีเมลนี้ได้ลงทะเบียนไว้แล้ว';
  if (message.includes('Password should be at least')) return 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร';
  if (message.includes('rate limit')) return 'มีการส่งคำขอถี่เกินไป กรุณารอสักครู่แล้วลองใหม่';
  return message;
}

// Helper: เดือนภาษาไทยแบบย่อ
function thaiMonthShort(m) {
  const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  return months[m] || '';
}

// Sample Vocabs for optional Demo loading
const SAMPLE_MOCK_VOCABS = [
  {
    vocab_word: "Requirement",
    meaning_th: "ความต้องการ, เงื่อนไขที่จำเป็น",
    part_of_speech: "Noun (คำนาม)",
    category_name: "TOEIC",
    example_sentence: "The client outlined clear software requirements."
  },
  {
    vocab_word: "Implement",
    meaning_th: "นำไปปฏิบัติ, พัฒนาระบบ",
    part_of_speech: "Verb (คำกริยา)",
    category_name: "TOEIC",
    example_sentence: "We need to implement the new security policy."
  },
  {
    vocab_word: "Deploy",
    meaning_th: "นำระบบไปใช้งานจริง",
    part_of_speech: "Verb (คำกริยา)",
    category_name: "IT Vocab",
    example_sentence: "The DevOps engineer will deploy the build to production."
  },
  {
    vocab_word: "Agile",
    meaning_th: "ความคล่องตัว, การทำงานแบบปรับตัวเร็ว",
    part_of_speech: "Adjective (คำคุณศัพท์)",
    category_name: "IT Vocab",
    example_sentence: "Our development team follows Agile methodology."
  },
  {
    vocab_word: "Framework",
    meaning_th: "กรอบการทำงาน, โครงสร้างโปรแกรม",
    part_of_speech: "Noun (คำนาม)",
    category_name: "TOEIC",
    example_sentence: "Bootstrap is a popular frontend framework."
  }
];

// ==========================================
// CATEGORY MAPPING & CACHING
// ==========================================
let categoryNameToId = { 'TOEIC': 1, 'IT Vocab': 2, 'General English': 3 };
let categoryIdToName = { 1: 'TOEIC', 2: 'IT Vocab', 3: 'General English' };

async function loadCategories() {
  const sb = getSupabase();
  if (!sb) return;

  try {
    const { data, error } = await sb.from('categories').select('*').order('category_id');
    if (!error && data && data.length > 0) {
      categoryNameToId = {};
      categoryIdToName = {};
      data.forEach(c => {
        categoryNameToId[c.category_name] = c.category_id;
        categoryIdToName[c.category_id] = c.category_name;
      });

      // Update dropdown option in screen4
      const catSelect = document.getElementById('add-category');
      if (catSelect) {
        catSelect.innerHTML = data.map(c => `<option value="${c.category_name}">${c.category_name}</option>`).join('');
      }
    }
  } catch (err) {
    console.warn('Error loading categories from Supabase, using defaults:', err);
  }
}

// ==========================================
// STATE MANAGEMENT
// ==========================================
class AppState {
  constructor() {
    this.currentView = 'screen1';
    this.flashcardFilter = 'unremembered'; // 'unremembered' | 'remembered' | 'all'
    this.currentCardIndex = 0;
    this.currentUserId = null;
    this.user = null;
    this.vocabs = [];
    this.latestQuiz = null;
    this.isLoading = false;
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
  }, 2500);
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
  if (screenId === 'screen6') startQuiz();
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

async function handleLoginSubmit(e) {
  e.preventDefault();
  const identifier = document.getElementById('login-identifier').value.trim();
  const password = document.getElementById('login-password').value;

  const sb = getSupabase();
  if (!sb) {
    showToast('กรุณาระบุ Publishable Key ใน app/supabase-config.js');
    return;
  }

  showToast('กำลังเข้าสู่ระบบ...');
  try {
    let emailToUse = identifier;

    // ถ้าผู้ใช้กรอกเป็นชื่อผู้ใช้ (ไม่มี @) ให้ตรวจสอบ email จาก profile
    if (!identifier.includes('@')) {
      const { data: prof, error: pErr } = await sb
        .from('profiles')
        .select('id, username')
        .eq('username', identifier)
        .maybeSingle();

      if (pErr || !prof) {
        showToast('ไม่พบบัญชีนี้ กรุณาใช้อีเมลในการเข้าสู่ระบบ');
        return;
      }
      showToast('กรุณาใช้อีเมลที่ใช้สมัครในการเข้าสู่ระบบ');
      return;
    }

    const { data, error } = await sb.auth.signInWithPassword({
      email: emailToUse,
      password: password
    });

    if (error) {
      showToast(`เข้าสู่ระบบไม่สำเร็จ: ${translateAuthError(error.message)}`);
      return;
    }

    showToast('เข้าสู่ระบบสำเร็จ ยินดีต้อนรับ!');
    await handleAuthSuccess(data.session);
  } catch (err) {
    showToast(`เกิดข้อผิดพลาด: ${err.message}`);
  }
}

async function handleRegisterSubmit(e) {
  e.preventDefault();
  const fullName = document.getElementById('reg-fullname').value.trim();
  const studentId = document.getElementById('reg-studentid').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const username = document.getElementById('reg-username').value.trim();
  const password = document.getElementById('reg-password').value;

  if (password.length < 6) {
    showToast('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
    return;
  }

  const sb = getSupabase();
  if (!sb) {
    showToast('กรุณาระบุ Publishable Key ใน app/supabase-config.js');
    return;
  }

  showToast('กำลังสร้างบัญชี...');
  try {
    const { data, error } = await sb.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          full_name: fullName,
          student_id: studentId,
          username: username,
          target_exam: 'TOEIC & IT Vocab'
        }
      }
    });

    if (error) {
      showToast(`สมัครไม่สำเร็จ: ${translateAuthError(error.message)}`);
      return;
    }

    const authUser = data.user;
    if (authUser) {
      // บันทึกลงตาราง profiles
      try {
        await sb.from('profiles').upsert({
          id: authUser.id,
          username: username,
          full_name: fullName,
          student_id: studentId,
          target_exam: 'TOEIC & IT Vocab'
        });
      } catch (profErr) {
        console.warn('Could not upsert to profiles table:', profErr);
      }

      if (data.session) {
        showToast('สมัครสมาชิกและเข้าสู่ระบบสำเร็จ!');
        await handleAuthSuccess(data.session);
      } else {
        showToast('สมัครสำเร็จ! หากระบบต้องการยืนยัน โปรดตรวจสอบอีเมลของคุณ');
        switchAuthTab(false);
        document.getElementById('login-identifier').value = email;
      }
    }
  } catch (err) {
    showToast(`เกิดข้อผิดพลาด: ${err.message}`);
  }
}

// ==========================================
// AUTH SESSION HANDLER & DATA SYNC
// ==========================================
async function handleAuthSuccess(session) {
  if (!session || !session.user) return;
  const user = session.user;
  state.currentUserId = user.id;

  // โหลด Profile จากตาราง profiles หรือ fallback จาก user_metadata
  const meta = user.user_metadata || {};
  let userProfile = {
    user_id: user.id.slice(0, 8),
    full_user_id: user.id,
    email: user.email,
    username: meta.username || user.email.split('@')[0],
    full_name: meta.full_name || 'ผู้ใช้งาน',
    student_id: meta.student_id || '-',
    target_exam: meta.target_exam || 'TOEIC & IT Vocab',
    created_at: new Date(user.created_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }),
    is_logged_in: true
  };

  const sb = getSupabase();
  if (sb) {
    try {
      const { data: prof, error: profErr } = await sb
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (!profErr && prof) {
        if (prof.username) userProfile.username = prof.username;
        if (prof.full_name) userProfile.full_name = prof.full_name;
        if (prof.student_id) userProfile.student_id = prof.student_id;
        if (prof.target_exam) userProfile.target_exam = prof.target_exam;
        if (prof.created_at) {
          const cd = new Date(prof.created_at);
          userProfile.created_at = cd.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
        }
      } else if (!prof) {
        // ถ้ายังไม่มีแถวในตาราง profiles ให้สร้างอัตโนมัติ
        await sb.from('profiles').upsert({
          id: user.id,
          username: userProfile.username,
          full_name: userProfile.full_name,
          student_id: userProfile.student_id,
          target_exam: userProfile.target_exam
        });
      }
    } catch (e) {
      console.warn('Profiles sync error:', e);
    }
  }

  state.user = userProfile;

  // โหลด Categories, Flashcards และ ผลสอบล่าสุด
  await loadCategories();
  await loadFlashcards();
  await loadLatestQuiz();

  navigateTo('screen2');
}

// ==========================================
// DATA FETCHERS (SUPABASE)
// ==========================================
async function loadFlashcards() {
  const sb = getSupabase();
  if (!sb || !state.currentUserId) {
    state.vocabs = [];
    return;
  }

  try {
    const { data, error } = await sb
      .from('flashcards')
      .select('*')
      .eq('user_id', state.currentUserId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading flashcards:', error);
      showToast('ไม่สามารถดึงข้อมูลคำศัพท์ได้');
      return;
    }

    state.vocabs = (data || []).map(item => ({
      vocab_id: item.card_id,
      vocab_word: item.vocab_word,
      meaning_th: item.meaning_th,
      part_of_speech: item.part_of_speech || 'Noun (คำนาม)',
      category_id: categoryIdToName[item.category_id] || 'TOEIC',
      raw_category_id: item.category_id,
      example_sentence: item.example_sentence || '',
      is_remembered: !!item.is_remembered
    }));
  } catch (err) {
    console.error('Flashcard fetch error:', err);
  }
}

async function loadLatestQuiz() {
  const sb = getSupabase();
  if (!sb || !state.currentUserId) {
    state.latestQuiz = null;
    return;
  }

  try {
    const { data, error } = await sb
      .from('quizzes')
      .select('*')
      .eq('user_id', state.currentUserId)
      .order('tested_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      const d = new Date(data.tested_at);
      const min = d.getMinutes() < 10 ? `0${d.getMinutes()}` : d.getMinutes();
      const dateStr = `${d.getDate()} ${thaiMonthShort(d.getMonth())} ${d.getFullYear() + 543} ${d.getHours()}:${min}`;
      const pct = data.total_questions > 0 ? Math.round((data.score / data.total_questions) * 100) : 0;
      state.latestQuiz = {
        score: data.score,
        total_questions: data.total_questions,
        percentage: pct,
        tested_at: dateStr
      };
    } else {
      state.latestQuiz = null;
    }
  } catch (err) {
    console.warn('Latest quiz fetch error:', err);
    state.latestQuiz = null;
  }
}

// ==========================================
// SCREEN 2: DASHBOARD CONTROLLER
// ==========================================
function renderDashboard() {
  const vocabs = state.vocabs;
  const user = state.user || { full_name: 'ผู้ใช้งาน', target_exam: 'TOEIC & IT Vocab' };

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

  if (total === 0) {
    urgentContainer.innerHTML = `<div class="empty">ยังไม่มีคำศัพท์ในคลัง กดปุ่ม "เพิ่มศัพท์" ด้านบนเพื่อเริ่มเรียนรู้</div>`;
  } else if (unrememberedList.length === 0) {
    urgentContainer.innerHTML = `<div class="empty">จำคำศัพท์ได้ครบทุกคำแล้ว 🎉</div>`;
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
    document.getElementById('card-back-meaning').innerText = total === 0 ? "เพิ่มคำศัพท์ใหม่จากหน้าหลักได้เลย" : "กรุณาเลือกหมวดหมู่อื่น หรือเพิ่มคำศัพท์ใหม่";
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
  document.getElementById('card-front-example').innerText = card.example_sentence ? `"${card.example_sentence}"` : '';

  // Back Face
  document.getElementById('card-back-cat').innerText = card.category_id;
  document.getElementById('card-back-cat').className = `badge ${card.category_id === 'TOEIC' ? 'badge-warning' : 'badge-primary'}`;
  document.getElementById('card-back-pos').innerText = card.part_of_speech;
  document.getElementById('card-back-word').innerText = card.vocab_word;
  document.getElementById('card-back-meaning').innerText = card.meaning_th;
  document.getElementById('card-back-example').innerText = card.example_sentence ? `"${card.example_sentence}"` : '';

  // Indicator
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

async function markCardRemembered(status) {
  const currentList = getFilteredVocabs();
  if (currentList.length === 0) return;

  const currentCard = currentList[state.currentCardIndex];
  const sb = getSupabase();
  if (!sb || !state.currentUserId) return;

  try {
    const { error } = await sb
      .from('flashcards')
      .update({ is_remembered: status })
      .eq('card_id', currentCard.vocab_id)
      .eq('user_id', state.currentUserId);

    if (error) {
      showToast(`อัปเดตไม่สำเร็จ: ${error.message}`);
      return;
    }

    currentCard.is_remembered = status;
    const inAll = state.vocabs.find(v => v.vocab_id === currentCard.vocab_id);
    if (inAll) inAll.is_remembered = status;

    if (status) {
      showToast(`✓ จำได้แล้ว: ${currentCard.vocab_word}`);
    } else {
      showToast(`✕ ยังจำไม่ได้: ${currentCard.vocab_word}`);
    }

    renderFlashcards();
  } catch (err) {
    showToast(`เกิดข้อผิดพลาด: ${err.message}`);
  }
}

function handleEditCurrentCard() {
  const currentList = getFilteredVocabs();
  if (currentList.length === 0) return;
  const card = currentList[state.currentCardIndex];
  if (card) {
    openEditForm(card.vocab_id);
  }
}

function handleDeleteCurrentCard() {
  const currentList = getFilteredVocabs();
  if (currentList.length === 0) return;
  const card = currentList[state.currentCardIndex];
  if (card) {
    confirmDeleteVocab(card.vocab_id);
  }
}

// ==========================================
// SCREEN 6: QUIZ ENGINE CONTROLLER
// ==========================================
let quizSession = {
  questions: [],
  currentIndex: 0,
  score: 0,
  timerInterval: null,
  timeLeft: 15,
  isAnswered: false,
  answersLog: []
};

function startQuiz() {
  const vocabs = state.vocabs;
  if (vocabs.length === 0) {
    showToast('ไม่มีคำศัพท์ในระบบสำหรับทำแบบทดสอบ');
    navigateTo('screen2');
    return;
  }

  // Shuffle and pick up to 5 questions
  const shuffled = [...vocabs].sort(() => 0.5 - Math.random());
  const selectedVocabs = shuffled.slice(0, 5);

  quizSession.questions = selectedVocabs.map(card => {
    const correctMeaning = card.meaning_th;
    const otherMeanings = vocabs.filter(v => v.vocab_id !== card.vocab_id).map(v => v.meaning_th);
    const shuffledOthers = otherMeanings.sort(() => 0.5 - Math.random()).slice(0, 3);
    
    while (shuffledOthers.length < 3) {
      shuffledOthers.push("ความหมายเพิ่มเติมสำหรับการทดสอบ " + (shuffledOthers.length + 1));
    }

    const allChoices = [
      { text: correctMeaning, isCorrect: true },
      ...shuffledOthers.map(t => ({ text: t, isCorrect: false }))
    ].sort(() => 0.5 - Math.random());

    return {
      card: card,
      choices: allChoices
    };
  });

  quizSession.currentIndex = 0;
  quizSession.score = 0;
  quizSession.answersLog = [];
  renderQuizQuestion();
}

function renderQuizQuestion() {
  clearInterval(quizSession.timerInterval);
  quizSession.isAnswered = false;
  quizSession.timeLeft = 15;

  const currentQ = quizSession.questions[quizSession.currentIndex];
  if (!currentQ) return;

  const total = quizSession.questions.length;
  const currentNum = quizSession.currentIndex + 1;

  // Header and progress
  document.getElementById('quiz-question-counter').innerText = `ข้อที่ ${currentNum} / ${total}`;
  document.getElementById('quiz-progress-fill').style.width = `${(currentNum / total) * 100}%`;
  document.getElementById('quiz-timer').innerText = `00:15`;

  // Question Card
  document.getElementById('quiz-cat-badge').innerText = currentQ.card.category_id;
  document.getElementById('quiz-cat-badge').className = `badge ${currentQ.card.category_id === 'TOEIC' ? 'badge-warning' : 'badge-primary'}`;
  document.getElementById('quiz-pos-badge').innerText = currentQ.card.part_of_speech;
  document.getElementById('quiz-word').innerText = currentQ.card.vocab_word;
  
  // Blank out word in sentence
  const sentence = currentQ.card.example_sentence || currentQ.card.vocab_word;
  const blanked = sentence.replace(new RegExp(currentQ.card.vocab_word, 'gi'), '_______');
  document.getElementById('quiz-sentence').innerText = `"${blanked}"`;

  // Render 4 choices
  const letters = ['ก', 'ข', 'ค', 'ง'];
  const container = document.getElementById('quiz-choices-container');
  container.innerHTML = currentQ.choices.map((c, i) => `
    <button class="quiz-choice-btn" onclick="selectQuizChoice(this, ${c.isCorrect}, '${c.text.replace(/'/g, "\\'")}')">
      <span class="choice-key-badge">${letters[i]}</span>
      <span>${c.text}</span>
    </button>
  `).join('');

  // Start timer
  quizSession.timerInterval = setInterval(() => {
    quizSession.timeLeft--;
    const displaySec = quizSession.timeLeft < 10 ? `0${quizSession.timeLeft}` : quizSession.timeLeft;
    document.getElementById('quiz-timer').innerText = `00:${displaySec}`;

    if (quizSession.timeLeft <= 0) {
      clearInterval(quizSession.timerInterval);
      if (!quizSession.isAnswered) {
        handleQuizTimeout();
      }
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
    showToast('ถูกต้อง +1 คะแนน');
  } else {
    btn.classList.add('wrong');
    const allBtns = document.querySelectorAll('.quiz-choice-btn');
    allBtns.forEach(b => {
      if (b.innerText.includes(currentQ.card.meaning_th)) {
        b.classList.add('correct');
      }
    });
    showToast('ยังไม่ถูกต้อง');
  }

  setTimeout(() => {
    quizSession.currentIndex++;
    if (quizSession.currentIndex < quizSession.questions.length) {
      renderQuizQuestion();
    } else {
      finishQuiz();
    }
  }, 900);
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

  setTimeout(() => {
    quizSession.currentIndex++;
    if (quizSession.currentIndex < quizSession.questions.length) {
      renderQuizQuestion();
    } else {
      finishQuiz();
    }
  }, 900);
}

async function finishQuiz() {
  clearInterval(quizSession.timerInterval);
  const total = quizSession.questions.length;
  const score = quizSession.score;
  const pct = Math.round((score / total) * 100);

  const now = new Date();
  const min = now.getMinutes() < 10 ? `0${now.getMinutes()}` : now.getMinutes();
  const dateStr = `${now.getDate()} ${thaiMonthShort(now.getMonth())} ${now.getFullYear() + 543} ${now.getHours()}:${min}`;

  const quizResult = {
    score: score,
    total_questions: total,
    percentage: pct,
    tested_at: dateStr,
    answers: quizSession.answersLog
  };

  state.latestQuiz = quizResult;

  // บันทึกผลสอบลง Supabase quizzes & quiz_answers
  const sb = getSupabase();
  if (sb && state.currentUserId) {
    try {
      const { data: quizRow, error: qErr } = await sb
        .from('quizzes')
        .insert([{
          user_id: state.currentUserId,
          score: score,
          total_questions: total
        }])
        .select()
        .single();

      if (!qErr && quizRow && quizSession.answersLog.length > 0) {
        const answersToInsert = quizSession.answersLog.map(a => ({
          quiz_id: quizRow.quiz_id,
          card_id: a.card_id,
          selected_choice: a.selected_choice,
          is_correct: a.is_correct
        }));

        const { error: aErr } = await sb.from('quiz_answers').insert(answersToInsert);
        if (aErr) {
          console.warn('Could not insert quiz_answers to Supabase:', aErr);
        }
      }
    } catch (err) {
      console.warn('Error saving quiz result to Supabase:', err);
    }
  }

  // Update result modal
  document.getElementById('quiz-result-score').innerText = `${score} / ${total}`;
  const badgeEl = document.getElementById('quiz-result-badge');

  if (pct >= 80) {
    badgeEl.className = "badge badge-success";
    badgeEl.innerText = `${pct}% — ยอดเยี่ยมมาก`;
  } else if (pct >= 50) {
    badgeEl.className = "badge";
    badgeEl.innerText = `${pct}% — ผ่านเกณฑ์ ทบทวนอีกนิด`;
  } else {
    badgeEl.className = "badge badge-danger";
    badgeEl.innerText = `${pct}% — ต้องทบทวนคำศัพท์`;
  }

  document.getElementById('quiz-result-modal').classList.add('open');
}

function closeQuizResultModal() {
  document.getElementById('quiz-result-modal').classList.remove('open');
}

// ==========================================
// SCREEN 4: ADD & EDIT CARD CONTROLLER
// ==========================================
function openAddForm() {
  document.getElementById('edit-vocab-id').value = '';
  document.getElementById('card-form-title').innerText = 'เพิ่มการ์ดคำศัพท์ใหม่';
  document.getElementById('card-form-subtitle').innerText = 'กรอกข้อมูลคำศัพท์เพื่อบันทึกลงในคลังคำศัพท์';
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
  document.getElementById('card-form-title').innerText = 'แก้ไขข้อมูลคำศัพท์';
  document.getElementById('card-form-subtitle').innerText = `แก้ไขข้อมูลของคำศัพท์ "${vocab.vocab_word}"`;
  document.getElementById('card-form-submit-btn').innerText = 'บันทึกการแก้ไข';
  document.getElementById('add-word').value = vocab.vocab_word;
  document.getElementById('add-meaning').value = vocab.meaning_th;
  document.getElementById('add-example').value = vocab.example_sentence || '';
  
  // Select matching options
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

async function handleCardFormSubmit(e) {
  e.preventDefault();
  const editId = document.getElementById('edit-vocab-id').value;
  const word = document.getElementById('add-word').value.trim();
  const pos = document.getElementById('add-pos').value;
  const category = document.getElementById('add-category').value;
  const meaning = document.getElementById('add-meaning').value.trim();
  const example = document.getElementById('add-example').value.trim();

  const sb = getSupabase();
  if (!sb || !state.currentUserId) {
    showToast('กรุณาเข้าสู่ระบบก่อนบันทึกข้อมูล');
    return;
  }

  const categoryIdNum = categoryNameToId[category] || 1;
  const exampleSentence = example || `Example sentence for ${word}.`;

  if (editId) {
    // UPDATE MODE
    const cardId = parseInt(editId);
    showToast('กำลังบันทึกการแก้ไข...');
    try {
      const { error } = await sb
        .from('flashcards')
        .update({
          vocab_word: word,
          part_of_speech: pos,
          category_id: categoryIdNum,
          meaning_th: meaning,
          example_sentence: exampleSentence
        })
        .eq('card_id', cardId)
        .eq('user_id', state.currentUserId);

      if (error) {
        showToast(`แก้ไขไม่สำเร็จ: ${error.message}`);
        return;
      }

      showToast(`แก้ไขคำศัพท์ "${word}" สำเร็จ!`);
      await loadFlashcards();
      openSpecificFlashcard(cardId);
    } catch (err) {
      showToast(`เกิดข้อผิดพลาด: ${err.message}`);
    }
  } else {
    // ADD MODE
    showToast('กำลังบันทึกคำศัพท์...');
    try {
      const { error } = await sb
        .from('flashcards')
        .insert([{
          user_id: state.currentUserId,
          category_id: categoryIdNum,
          vocab_word: word,
          part_of_speech: pos,
          meaning_th: meaning,
          example_sentence: exampleSentence,
          is_remembered: false
        }]);

      if (error) {
        showToast(`บันทึกไม่สำเร็จ: ${error.message}`);
        return;
      }

      showToast(`บันทึกคำศัพท์ "${word}" สำเร็จ!`);
      await loadFlashcards();
      navigateTo('screen2');
    } catch (err) {
      showToast(`เกิดข้อผิดพลาด: ${err.message}`);
    }
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

async function executeDeleteVocab() {
  if (!pendingDeleteVocabId) return;
  const sb = getSupabase();
  if (!sb || !state.currentUserId) return;

  const card = state.vocabs.find(v => v.vocab_id === pendingDeleteVocabId);
  const deletedWord = card ? card.vocab_word : '';

  showToast('กำลังลบคำศัพท์...');
  try {
    const { error } = await sb
      .from('flashcards')
      .delete()
      .eq('card_id', pendingDeleteVocabId)
      .eq('user_id', state.currentUserId);

    closeDeleteModal();

    if (error) {
      showToast(`ลบไม่สำเร็จ: ${error.message}`);
      return;
    }

    showToast(`ลบคำศัพท์ "${deletedWord}" เรียบร้อยแล้ว`);
    await loadFlashcards();
    
    if (state.currentView === 'screen3') {
      state.currentCardIndex = 0;
      renderFlashcards();
    } else {
      renderDashboard();
    }
    renderProfile();
  } catch (err) {
    showToast(`เกิดข้อผิดพลาด: ${err.message}`);
  }
}

// ==========================================
// SCREEN 5: PROFILE CONTROLLER
// ==========================================
function renderProfile() {
  const user = state.user || {
    user_id: '-',
    username: '-',
    full_name: 'ผู้ใช้งาน',
    student_id: '-',
    email: '-',
    target_exam: 'TOEIC & IT Vocab',
    created_at: '-'
  };

  const vocabs = state.vocabs;
  const total = vocabs.length;
  const remembered = vocabs.filter(v => v.is_remembered).length;
  const percentage = total > 0 ? Math.round((remembered / total) * 100) : 0;
  const latestQuiz = state.latestQuiz;

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

  // Latest Quiz Result
  const quizBadge = document.getElementById('prof-latest-quiz');
  if (quizBadge) {
    if (latestQuiz) {
      quizBadge.innerText = `${latestQuiz.score} / ${latestQuiz.total_questions} (${latestQuiz.percentage}%)`;
    } else {
      quizBadge.innerText = 'ยังไม่มีประวัติการสอบ';
    }
  }
}

function openEditProfileModal() {
  const user = state.user || {};
  document.getElementById('edit-fullname').value = user.full_name || '';
  document.getElementById('edit-studentid').value = user.student_id || '';
  document.getElementById('edit-targetexam').value = user.target_exam || 'TOEIC & IT Vocab';
  document.getElementById('profile-edit-modal').classList.add('open');
}

function closeEditProfileModal() {
  document.getElementById('profile-edit-modal').classList.remove('open');
}

async function handleProfileEditSubmit(e) {
  e.preventDefault();
  const fullName = document.getElementById('edit-fullname').value.trim();
  const studentId = document.getElementById('edit-studentid').value.trim();
  const targetExam = document.getElementById('edit-targetexam').value.trim();

  state.user.full_name = fullName;
  state.user.student_id = studentId;
  state.user.target_exam = targetExam;

  const sb = getSupabase();
  if (sb && state.currentUserId) {
    showToast('กำลังบันทึกข้อมูลส่วนตัว...');
    try {
      await sb.from('profiles').upsert({
        id: state.currentUserId,
        full_name: fullName,
        student_id: studentId,
        target_exam: targetExam
      });

      await sb.auth.updateUser({
        data: {
          full_name: fullName,
          student_id: studentId,
          target_exam: targetExam
        }
      });
    } catch (err) {
      console.warn('Update profile error:', err);
    }
  }

  closeEditProfileModal();
  showToast('อัปเดตข้อมูลส่วนตัวสำเร็จ!');
  renderProfile();
  renderDashboard();
}

async function resetMockData() {
  if (confirm('คุณต้องการนำเข้า "คำศัพท์ตัวอย่าง 5 คำ (Demo)" เข้าสู่บัญชีของคุณหรือไม่?')) {
    const sb = getSupabase();
    if (!sb || !state.currentUserId) {
      showToast('กรุณาเข้าสู่ระบบก่อน');
      return;
    }

    showToast('กำลังนำเข้าคำศัพท์ตัวอย่าง...');
    try {
      const itemsToInsert = SAMPLE_MOCK_VOCABS.map(v => ({
        user_id: state.currentUserId,
        category_id: categoryNameToId[v.category_name] || 1,
        vocab_word: v.vocab_word,
        meaning_th: v.meaning_th,
        part_of_speech: v.part_of_speech,
        example_sentence: v.example_sentence,
        is_remembered: false
      }));

      const { error } = await sb.from('flashcards').insert(itemsToInsert);
      if (error) {
        showToast(`นำเข้าไม่สำเร็จ: ${error.message}`);
        return;
      }

      showToast('เพิ่มคำศัพท์ตัวอย่าง 5 คำสำเร็จ!');
      await loadFlashcards();
      renderProfile();
      renderDashboard();
    } catch (err) {
      showToast(`เกิดข้อผิดพลาด: ${err.message}`);
    }
  }
}

async function logout() {
  const sb = getSupabase();
  if (sb) {
    try {
      await sb.auth.signOut();
    } catch (e) {
      console.warn('Supabase sign out error:', e);
    }
  }

  state.currentUserId = null;
  state.user = null;
  state.vocabs = [];
  state.latestQuiz = null;

  showToast('ออกจากระบบแล้ว');
  navigateTo('screen1');
}

function openHelpModal() {
  document.getElementById('help-modal').classList.add('open');
}

function closeHelpModal() {
  document.getElementById('help-modal').classList.remove('open');
}

// ==========================================
// INITIAL BOOT & SESSION CHECK
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {
  await initApp();
});

async function initApp() {
  const sb = getSupabase();
  if (!sb) {
    console.info('Supabase config ยังไม่ระบุ Publishable key');
    navigateTo('screen1');
    return;
  }

  try {
    const { data: { session }, error } = await sb.auth.getSession();
    if (!error && session && session.user) {
      await handleAuthSuccess(session);
    } else {
      navigateTo('screen1');
    }
  } catch (err) {
    console.error('Initial session check error:', err);
    navigateTo('screen1');
  }

  // Listener เมื่อมีการเปลี่ยนแปลง Session / Auth state
  try {
    sb.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        state.currentUserId = null;
        state.user = null;
        state.vocabs = [];
        state.latestQuiz = null;
        navigateTo('screen1');
      }
    });
  } catch (err) {
    console.warn('Auth state change listener error:', err);
  }
}
