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

// Sample Vocabs for optional Demo loading (20 words)
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
  },
  {
    vocab_word: "Collaborate",
    meaning_th: "ร่วมมือ, ทำงานร่วมกัน",
    part_of_speech: "Verb (คำกริยา)",
    category_name: "TOEIC",
    example_sentence: "Our engineering and design teams collaborate on every product release."
  },
  {
    vocab_word: "Repository",
    meaning_th: "คลังเก็บโค้ด, แหล่งเก็บข้อมูล",
    part_of_speech: "Noun (คำนาม)",
    category_name: "IT Vocab",
    example_sentence: "All source code changes are tracked inside the central Git repository."
  },
  {
    vocab_word: "Benchmark",
    meaning_th: "เกณฑ์มาตรฐาน, จุดอ้างอิงเปรียบเทียบ",
    part_of_speech: "Noun (คำนาม)",
    category_name: "TOEIC",
    example_sentence: "The new quarter sales performance served as a benchmark for future targets."
  },
  {
    vocab_word: "Authentication",
    meaning_th: "การยืนยันตัวตน, การตรวจสอบสิทธิ์",
    part_of_speech: "Noun (คำนาม)",
    category_name: "IT Vocab",
    example_sentence: "Multi-factor authentication significantly enhances application security."
  },
  {
    vocab_word: "Optimize",
    meaning_th: "ปรับแต่งให้มีประสิทธิภาพสูงสุด",
    part_of_speech: "Verb (คำกริยา)",
    category_name: "IT Vocab",
    example_sentence: "Developers constantly optimize database queries to decrease response latency."
  },
  {
    vocab_word: "Feasible",
    meaning_th: "เป็นไปได้, สามารถทำได้จริง",
    part_of_speech: "Adjective (คำคุณศัพท์)",
    category_name: "TOEIC",
    example_sentence: "The project manager assessed whether the deadline was technically feasible."
  },
  {
    vocab_word: "Scalability",
    meaning_th: "ความสามารถในการขยายขนาดระบบ",
    part_of_speech: "Noun (คำนาม)",
    category_name: "IT Vocab",
    example_sentence: "Cloud architecture provides high scalability to handle sudden traffic spikes."
  },
  {
    vocab_word: "Negotiate",
    meaning_th: "เจรจาต่อรอง",
    part_of_speech: "Verb (คำกริยา)",
    category_name: "TOEIC",
    example_sentence: "The procurement director will negotiate contract terms with the supplier."
  },
  {
    vocab_word: "Comprehensive",
    meaning_th: "ครอบคลุม, ละเอียดครบถ้วน",
    part_of_speech: "Adjective (คำคุณศัพท์)",
    category_name: "General English",
    example_sentence: "The mentor provided a comprehensive overview of cloud computing fundamentals."
  },
  {
    vocab_word: "Infrastructure",
    meaning_th: "โครงสร้างพื้นฐาน, ระบบสาธารณูปโภค",
    part_of_speech: "Noun (คำนาม)",
    category_name: "IT Vocab",
    example_sentence: "Migrating to modern serverless infrastructure lowered monthly operating expenses."
  },
  {
    vocab_word: "Incentive",
    meaning_th: "สิ่งจูงใจ, รางวัลกระตุ้นการทำงาน",
    part_of_speech: "Noun (คำนาม)",
    category_name: "TOEIC",
    example_sentence: "Performance bonuses serve as a powerful incentive for the sales department."
  },
  {
    vocab_word: "Vulnerability",
    meaning_th: "ช่องโหว่ความปลอดภัย, จุดอ่อน",
    part_of_speech: "Noun (คำนาม)",
    category_name: "IT Vocab",
    example_sentence: "The security audit revealed a critical vulnerability in the payment gateway."
  },
  {
    vocab_word: "Proficient",
    meaning_th: "ชำนาญ, เชี่ยวชาญ",
    part_of_speech: "Adjective (คำคุณศัพท์)",
    category_name: "General English",
    example_sentence: "Candidates must be proficient in both technical writing and spoken English."
  },
  {
    vocab_word: "Compliance",
    meaning_th: "การปฏิบัติตามกฎหมายหรือมาตรฐาน",
    part_of_speech: "Noun (คำนาม)",
    category_name: "TOEIC",
    example_sentence: "Strict compliance with data privacy regulations is mandatory for all banks."
  },
  {
    vocab_word: "Resilient",
    meaning_th: "ยืดหยุ่น, คืนสภาพได้เร็วหลังเจอปัญหา",
    part_of_speech: "Adjective (คำคุณศัพท์)",
    category_name: "General English",
    example_sentence: "Modern distributed architectures are engineered to be resilient against network failures."
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
  if (screenId === 'screen7') renderGlobalVocabs();
  if (screenId === 'screen6') openQuizSetup();
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
      <div class="nav-item ${screenId === 'screen7' ? 'active' : ''}" onclick="navigateTo('screen7')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="2" y1="12" x2="22" y2="12"/>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
        <span>คลังรวม</span>
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
  await loadGlobalVocabs();
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
// (ดึงคำศัพท์ส่วนตัวก่อน เติมด้วยคลังรวมเมื่อขาด และเลือก 5, 10, 15, 20 ข้อ)
// ==========================================
let selectedQuizQuestionCount = 5;

let quizSession = {
  questions: [],
  currentIndex: 0,
  score: 0,
  timerInterval: null,
  timeLeft: 15,
  isAnswered: false,
  answersLog: []
};

function openQuizSetup() {
  clearInterval(quizSession.timerInterval);
  const setupView = document.getElementById('quiz-setup-view');
  const playView = document.getElementById('quiz-play-view');
  if (setupView) setupView.style.display = 'flex';
  if (playView) playView.style.display = 'none';

  const personalCount = state.vocabs ? state.vocabs.length : 0;
  const pool = (Array.isArray(globalVocabs) && globalVocabs.length > 0)
    ? globalVocabs
    : (typeof DEFAULT_GLOBAL_VOCABS !== 'undefined' ? DEFAULT_GLOBAL_VOCABS : []);
  const globalCount = pool.length;

  const personalEl = document.getElementById('quiz-setup-personal-count');
  const globalEl = document.getElementById('quiz-setup-global-count');
  if (personalEl) personalEl.innerText = `${personalCount} คำ`;
  if (globalEl) globalEl.innerText = `${globalCount} คำ`;

  updateQuizSetupInfo();
}

function selectQuizCount(count) {
  selectedQuizQuestionCount = count;
  document.querySelectorAll('.quiz-count-btn').forEach(btn => {
    const btnCount = parseInt(btn.getAttribute('data-count'));
    if (btnCount === count) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  updateQuizSetupInfo();
}

function updateQuizSetupInfo() {
  const infoEl = document.getElementById('quiz-setup-info');
  if (!infoEl) return;

  const personalCount = state.vocabs ? state.vocabs.length : 0;
  const pool = (Array.isArray(globalVocabs) && globalVocabs.length > 0)
    ? globalVocabs
    : (typeof DEFAULT_GLOBAL_VOCABS !== 'undefined' ? DEFAULT_GLOBAL_VOCABS : []);
  const globalCount = pool.length;
  const totalAvailable = personalCount + globalCount;

  if (personalCount >= selectedQuizQuestionCount) {
    infoEl.innerText = `ใช้คำศัพท์ส่วนตัวของคุณทั้งหมด ${selectedQuizQuestionCount} ข้อ (จาก ${personalCount} คำที่มี)`;
  } else if (personalCount > 0) {
    const needFromGlobal = Math.min(selectedQuizQuestionCount - personalCount, globalCount);
    infoEl.innerText = `ใช้คำส่วนตัว ${personalCount} คำ + สุ่มเติมจากคลังรวมอีก ${needFromGlobal} คำ`;
  } else {
    infoEl.innerText = `สุ่มจากคลังคำศัพท์รวมทั้งหมด ${Math.min(selectedQuizQuestionCount, globalCount)} ข้อ`;
  }

  if (totalAvailable < selectedQuizQuestionCount) {
    infoEl.innerHTML = `<span style="color: var(--bad); font-weight: 600;">คำศัพท์ทั้งสองแหล่งมีรวมกันเพียง ${totalAvailable} คำ (ทำได้สูงสุด ${totalAvailable} ข้อ)</span>`;
  }
}

function startQuizWithSelectedCount() {
  const personalVocabs = state.vocabs || [];
  const globalPool = (Array.isArray(globalVocabs) && globalVocabs.length > 0)
    ? globalVocabs
    : (typeof DEFAULT_GLOBAL_VOCABS !== 'undefined' ? DEFAULT_GLOBAL_VOCABS : []);

  const totalAvailable = personalVocabs.length + globalPool.length;

  if (totalAvailable === 0) {
    showToast('ไม่มีคำศัพท์ในระบบสำหรับทำแบบทดสอบ');
    return;
  }

  const requestedCount = selectedQuizQuestionCount;

  // ตรวจสอบว่าคำศัพท์ทั้งสองแหล่งมีเพียงพอหรือไม่
  if (totalAvailable < requestedCount) {
    showToast(`มีคำศัพท์รวมเพียง ${totalAvailable} คำ (ไม่ถึง ${requestedCount} ข้อ) ระบบจะจัดข้อสอบเท่าที่มีจริง`);
  }

  const actualCount = Math.min(requestedCount, totalAvailable);
  let selectedQuestions = [];

  // กฎ: ใช้คำศัพท์ส่วนตัวของผู้ใช้ก่อนเสมอ
  if (personalVocabs.length >= actualCount) {
    // ถ้าคำส่วนตัวมีมากกว่าหรือเท่ากับจำนวนที่เลือก ให้สุ่มเลือกจากคำส่วนตัวเท่านั้น ไม่ต้องเติมคลังรวม
    const shuffledPersonal = [...personalVocabs].sort(() => 0.5 - Math.random());
    selectedQuestions = shuffledPersonal.slice(0, actualCount).map(v => ({
      vocab_id: v.vocab_id,
      vocab_word: v.vocab_word,
      meaning_th: v.meaning_th,
      part_of_speech: v.part_of_speech,
      category_name: v.category_id,
      example_sentence: v.example_sentence,
      is_personal: true
    }));
  } else {
    // ถ้าคำส่วนตัวมีน้อยกว่า ให้ใช้คำส่วนตัวทั้งหมดก่อน
    const personalMapped = personalVocabs.map(v => ({
      vocab_id: v.vocab_id,
      vocab_word: v.vocab_word,
      meaning_th: v.meaning_th,
      part_of_speech: v.part_of_speech,
      category_name: v.category_id,
      example_sentence: v.example_sentence,
      is_personal: true
    }));

    selectedQuestions = [...personalMapped];

    // คำนวณส่วนที่ยังขาด
    const deficit = actualCount - selectedQuestions.length;

    // กรองคำจากคลังรวมที่ไม่ซ้ำกับคำส่วนตัว (ตรวจ lowercase เพื่อความแม่นยำ)
    const personalWordSet = new Set(selectedQuestions.map(q => q.vocab_word.toLowerCase().trim()));
    const availableGlobal = globalPool.filter(g => !personalWordSet.has(g.vocab_word.toLowerCase().trim()));

    // สุ่มคำจากคลังรวมมาเติมเฉพาะส่วนที่ขาด
    const shuffledGlobal = [...availableGlobal].sort(() => 0.5 - Math.random());
    const fillGlobal = shuffledGlobal.slice(0, deficit).map(g => ({
      vocab_id: g.id,
      vocab_word: g.vocab_word,
      meaning_th: g.meaning_th,
      part_of_speech: g.part_of_speech,
      category_name: g.category_name,
      example_sentence: g.example_sentence,
      is_personal: false
    }));

    selectedQuestions = [...selectedQuestions, ...fillGlobal];
  }

  // สลับลำดับคำถามแบบสุ่ม (Shuffle)
  selectedQuestions = selectedQuestions.sort(() => 0.5 - Math.random());

  // รวบรวม Pool ความหมายจริงทั้งหมดจากทั้งสองแหล่งเพื่อใช้เป็นตัวเลือกหลอก
  const allPoolMeanings = [];
  personalVocabs.forEach(v => { if (v.meaning_th && v.meaning_th.trim()) allPoolMeanings.push(v.meaning_th.trim()); });
  globalPool.forEach(g => { if (g.meaning_th && g.meaning_th.trim()) allPoolMeanings.push(g.meaning_th.trim()); });

  quizSession.questions = selectedQuestions.map(card => {
    const correctMeaning = card.meaning_th;

    // ตัวเลือกหลอกจากคำอื่นที่ไม่ซ้ำกับคำตอบที่ถูกต้อง
    const otherMeanings = allPoolMeanings.filter(m => m !== correctMeaning && m !== '');
    const uniqueDistractors = [...new Set(otherMeanings)];

    // สุ่มตัวเลือกหลอกไม่เกิน 3 ข้อ (ห้ามสร้างคำหรือความหมายปลอม ใช้เท่าที่มีจริง)
    const maxDistractors = Math.min(3, uniqueDistractors.length);
    const chosenDistractors = uniqueDistractors
      .sort(() => 0.5 - Math.random())
      .slice(0, maxDistractors);

    // รวมคำตอบที่ถูกกับตัวเลือกหลอก แล้วสลับตำแหน่งแบบสุ่ม (Shuffle)
    const allChoices = [
      { text: correctMeaning, isCorrect: true },
      ...chosenDistractors.map(t => ({ text: t, isCorrect: false }))
    ].sort(() => 0.5 - Math.random());

    return {
      card: card,
      choices: allChoices
    };
  });

  quizSession.currentIndex = 0;
  quizSession.score = 0;
  quizSession.answersLog = [];

  // สลับหน้าจอเป็นหน้าทำแบบทดสอบ
  const setupView = document.getElementById('quiz-setup-view');
  const playView = document.getElementById('quiz-play-view');
  if (setupView) setupView.style.display = 'none';
  if (playView) playView.style.display = 'flex';

  renderQuizQuestion();
}

function startQuiz() {
  openQuizSetup();
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

  // Question Card (แสดงข้อมูลจากแหล่งคำถามให้ตรงกับข้อนั้น ๆ)
  const catName = currentQ.card.category_name || currentQ.card.category_id || 'TOEIC';
  const catBadge = document.getElementById('quiz-cat-badge');
  const posBadge = document.getElementById('quiz-pos-badge');

  if (catBadge) {
    catBadge.innerText = catName;
    catBadge.className = `badge ${catName === 'TOEIC' ? 'badge-warning' : 'badge-primary'}`;
  }
  if (posBadge) {
    posBadge.innerText = currentQ.card.part_of_speech || '';
  }
  document.getElementById('quiz-word').innerText = currentQ.card.vocab_word;
  
  // Blank out word in sentence (ใช้ประโยคตัวอย่างของคำนั้น)
  const sentence = currentQ.card.example_sentence || currentQ.card.vocab_word;
  const blanked = sentence.replace(new RegExp(currentQ.card.vocab_word, 'gi'), '_______');
  document.getElementById('quiz-sentence').innerText = `"${blanked}"`;

  // Render choices
  const letters = ['ก', 'ข', 'ค', 'ง'];
  const container = document.getElementById('quiz-choices-container');
  container.innerHTML = currentQ.choices.map((c, i) => `
    <button class="quiz-choice-btn" onclick="selectQuizChoice(this, ${c.isCorrect}, '${c.text.replace(/'/g, "\\'")}')">
      <span class="choice-key-badge">${letters[i] || (i + 1)}</span>
      <span>${c.text}</span>
    </button>
  `).join('');

  // Start timer (คงการทำงานเดิมของเวลา 15 วิ)
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
    vocab_word: currentQ.card.vocab_word,
    selected_choice: choiceText,
    correct_choice: currentQ.card.meaning_th,
    is_correct: isCorrect,
    is_personal: !!currentQ.card.is_personal
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
    vocab_word: currentQ.card.vocab_word,
    selected_choice: "หมดเวลา",
    correct_choice: currentQ.card.meaning_th,
    is_correct: false,
    is_personal: !!currentQ.card.is_personal
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
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;

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

  // 1. บันทึกคะแนนรวมลงตาราง quizzes ใน Supabase
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

      // 2. สำหรับคำศัพท์ส่วนตัว: ให้บันทึกคำตอบรายข้อลง quiz_answers เฉพาะเมื่อ card_id เป็นของคำศัพท์ส่วนตัวจริง
      // สำหรับคำศัพท์จากคลังรวม: ห้ามส่ง card_id ไป quiz_answers เพราะไม่ได้อ้างอิง flashcards
      if (!qErr && quizRow && quizSession.answersLog.length > 0) {
        const personalAnswers = quizSession.answersLog
          .filter(a => a.is_personal && a.card_id && state.vocabs.some(v => v.vocab_id === a.card_id))
          .map(a => ({
            quiz_id: quizRow.quiz_id,
            card_id: a.card_id,
            selected_choice: a.selected_choice,
            is_correct: a.is_correct
          }));

        if (personalAnswers.length > 0) {
          const { error: aErr } = await sb.from('quiz_answers').insert(personalAnswers);
          if (aErr) {
            console.warn('Could not insert personal quiz_answers:', aErr);
          }
        }
      }
    } catch (err) {
      console.warn('Error saving quiz summary score to Supabase:', err);
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
// SCREEN 7: GLOBAL VOCAB POOL (PUBLIC REPOSITORY)
// ==========================================
// โหลดข้อมูลคำศัพท์รวมเริ่มต้น 70 คำเต็ม เพื่อให้ใช้งานได้ทันทีแม้เปิดแบบ file:// หรือเครือข่ายออฟไลน์
const DEFAULT_GLOBAL_VOCABS = [
  {
    "id": 1,
    "vocab_word": "Collaborate",
    "part_of_speech": "Verb (คำกริยา)",
    "category_name": "TOEIC",
    "meaning_th": "ร่วมมือ, ทำงานร่วมกัน",
    "example_sentence": "Our engineering and design teams collaborate on every product release."
  },
  {
    "id": 2,
    "vocab_word": "Repository",
    "part_of_speech": "Noun (คำนาม)",
    "category_name": "IT Vocab",
    "meaning_th": "คลังเก็บโค้ด, แหล่งเก็บข้อมูล",
    "example_sentence": "All source code changes are tracked inside the central Git repository."
  },
  {
    "id": 3,
    "vocab_word": "Benchmark",
    "part_of_speech": "Noun (คำนาม)",
    "category_name": "TOEIC",
    "meaning_th": "เกณฑ์มาตรฐาน, จุดอ้างอิงเปรียบเทียบ",
    "example_sentence": "The new quarter sales performance served as a benchmark for future targets."
  },
  {
    "id": 4,
    "vocab_word": "Authentication",
    "part_of_speech": "Noun (คำนาม)",
    "category_name": "IT Vocab",
    "meaning_th": "การยืนยันตัวตน, การตรวจสอบสิทธิ์",
    "example_sentence": "Multi-factor authentication significantly enhances application security."
  },
  {
    "id": 5,
    "vocab_word": "Optimize",
    "part_of_speech": "Verb (คำกริยา)",
    "category_name": "IT Vocab",
    "meaning_th": "ปรับแต่งให้มีประสิทธิภาพสูงสุด",
    "example_sentence": "Developers constantly optimize database queries to decrease response latency."
  },
  {
    "id": 6,
    "vocab_word": "Feasible",
    "part_of_speech": "Adjective (คำคุณศัพท์)",
    "category_name": "TOEIC",
    "meaning_th": "เป็นไปได้, สามารถทำได้จริง",
    "example_sentence": "The project manager assessed whether the deadline was technically feasible."
  },
  {
    "id": 7,
    "vocab_word": "Scalability",
    "part_of_speech": "Noun (คำนาม)",
    "category_name": "IT Vocab",
    "meaning_th": "ความสามารถในการขยายขนาดระบบ",
    "example_sentence": "Cloud architecture provides high scalability to handle sudden traffic spikes."
  },
  {
    "id": 8,
    "vocab_word": "Negotiate",
    "part_of_speech": "Verb (คำกริยา)",
    "category_name": "TOEIC",
    "meaning_th": "เจรจาต่อรอง",
    "example_sentence": "The procurement director will negotiate contract terms with the supplier."
  },
  {
    "id": 9,
    "vocab_word": "Deploy",
    "part_of_speech": "Verb (คำกริยา)",
    "category_name": "IT Vocab",
    "meaning_th": "นำระบบหรือซอฟต์แวร์ไปติดตั้งใช้งานจริง",
    "example_sentence": "The automated CI/CD pipeline will deploy new features directly to production."
  },
  {
    "id": 10,
    "vocab_word": "Comprehensive",
    "part_of_speech": "Adjective (คำคุณศัพท์)",
    "category_name": "General English",
    "meaning_th": "ครอบคลุม, ละเอียดครบถ้วน",
    "example_sentence": "The mentor provided a comprehensive overview of cloud computing fundamentals."
  },
  {
    "id": 11,
    "vocab_word": "Infrastructure",
    "part_of_speech": "Noun (คำนาม)",
    "category_name": "IT Vocab",
    "meaning_th": "โครงสร้างพื้นฐาน, ระบบสาธารณูปโภค",
    "example_sentence": "Migrating to modern serverless infrastructure lowered monthly operating expenses."
  },
  {
    "id": 12,
    "vocab_word": "Incentive",
    "part_of_speech": "Noun (คำนาม)",
    "category_name": "TOEIC",
    "meaning_th": "สิ่งจูงใจ, รางวัลกระตุ้นการทำงาน",
    "example_sentence": "Performance bonuses serve as a powerful incentive for the sales department."
  },
  {
    "id": 13,
    "vocab_word": "Vulnerability",
    "part_of_speech": "Noun (คำนาม)",
    "category_name": "IT Vocab",
    "meaning_th": "ช่องโหว่ความปลอดภัย, จุดอ่อน",
    "example_sentence": "The security audit revealed a critical vulnerability in the payment gateway."
  },
  {
    "id": 14,
    "vocab_word": "Proficient",
    "part_of_speech": "Adjective (คำคุณศัพท์)",
    "category_name": "General English",
    "meaning_th": "ชำนาญ, เชี่ยวชาญ",
    "example_sentence": "Candidates must be proficient in both technical writing and spoken English."
  },
  {
    "id": 15,
    "vocab_word": "Redundant",
    "part_of_speech": "Adjective (คำคุณศัพท์)",
    "category_name": "IT Vocab",
    "meaning_th": "มีระบบสำรองซ้ำซ้อนเพื่อความปลอดภัย, ซ้ำซ้อน",
    "example_sentence": "Data centers deploy redundant power generators to prevent service downtime."
  },
  {
    "id": 16,
    "vocab_word": "Perspective",
    "part_of_speech": "Noun (คำนาม)",
    "category_name": "General English",
    "meaning_th": "มุมมอง, ทัศนคติ",
    "example_sentence": "Hearing feedback from international users gave us a fresh perspective."
  },
  {
    "id": 17,
    "vocab_word": "Compliance",
    "part_of_speech": "Noun (คำนาม)",
    "category_name": "TOEIC",
    "meaning_th": "การปฏิบัติตามกฎหมายหรือมาตรฐาน",
    "example_sentence": "Strict compliance with data privacy regulations is mandatory for all banks."
  },
  {
    "id": 18,
    "vocab_word": "Synchronize",
    "part_of_speech": "Verb (คำกริยา)",
    "category_name": "IT Vocab",
    "meaning_th": "ปรับข้อมูลให้ตรงกัน, ทำให้สอดคล้องกัน",
    "example_sentence": "The mobile app automatically synchronizes user bookmarks across all devices."
  },
  {
    "id": 19,
    "vocab_word": "Productivity",
    "part_of_speech": "Noun (คำนาม)",
    "category_name": "TOEIC",
    "meaning_th": "ผลิตภาพ, ประสิทธิภาพในการทำงาน",
    "example_sentence": "Adopting agile workflow tools increased overall team productivity by thirty percent."
  },
  {
    "id": 20,
    "vocab_word": "Resilient",
    "part_of_speech": "Adjective (คำคุณศัพท์)",
    "category_name": "General English",
    "meaning_th": "ยืดหยุ่น, คืนสภาพได้เร็วหลังเจอปัญหา",
    "example_sentence": "Modern distributed architectures are engineered to be resilient against network failures."
  },
  {
    "id": 21,
    "vocab_word": "Algorithm",
    "part_of_speech": "Noun (คำนาม)",
    "category_name": "IT Vocab",
    "meaning_th": "ขั้นตอนวิธี, อัลกอริทึมในการแก้ปัญหา",
    "example_sentence": "The recommendation engine uses a machine learning algorithm to personalize content."
  },
  {
    "id": 22,
    "vocab_word": "Acquire",
    "part_of_speech": "Verb (คำกริยา)",
    "category_name": "TOEIC",
    "meaning_th": "เข้าซื้อกิจการ, ได้รับมา",
    "example_sentence": "The tech corporation plans to acquire an AI startup next month."
  },
  {
    "id": 23,
    "vocab_word": "Bandwidth",
    "part_of_speech": "Noun (คำนาม)",
    "category_name": "IT Vocab",
    "meaning_th": "แบนด์วิดท์, ปริมาณการถ่ายโอนข้อมูล",
    "example_sentence": "High-definition video streaming requires substantial internet bandwidth."
  },
  {
    "id": 24,
    "vocab_word": "Agenda",
    "part_of_speech": "Noun (คำนาม)",
    "category_name": "TOEIC",
    "meaning_th": "วาระการประชุม, กำหนดการ",
    "example_sentence": "The chairperson distributed the meeting agenda two days in advance."
  },
  {
    "id": 25,
    "vocab_word": "Database",
    "part_of_speech": "Noun (คำนาม)",
    "category_name": "IT Vocab",
    "meaning_th": "ฐานข้อมูลสำหรับจัดเก็บและจัดการข้อมูล",
    "example_sentence": "PostgreSQL is a powerful and reliable relational database management system."
  },
  {
    "id": 26,
    "vocab_word": "Allocate",
    "part_of_speech": "Verb (คำกริยา)",
    "category_name": "TOEIC",
    "meaning_th": "จัดสรร, แบ่งสรรปันส่วน",
    "example_sentence": "The executive committee will allocate budget for cloud migration projects."
  },
  {
    "id": 27,
    "vocab_word": "Concurrency",
    "part_of_speech": "Noun (คำนาม)",
    "category_name": "IT Vocab",
    "meaning_th": "การทำงานหลายงานพร้อมกันในระบบ",
    "example_sentence": "Go handles high concurrency with lightweight threads known as goroutines."
  },
  {
    "id": 28,
    "vocab_word": "Compensation",
    "part_of_speech": "Noun (คำนาม)",
    "category_name": "TOEIC",
    "meaning_th": "ค่าตอบแทน, เงินชดเชย",
    "example_sentence": "The employee package offers competitive compensation and health insurance."
  },
  {
    "id": 29,
    "vocab_word": "Encryption",
    "part_of_speech": "Noun (คำนาม)",
    "category_name": "IT Vocab",
    "meaning_th": "การเข้ารหัสข้อมูลเพื่อความปลอดภัย",
    "example_sentence": "End-to-end encryption ensures that only the sender and recipient can read messages."
  },
  {
    "id": 30,
    "vocab_word": "Delegation",
    "part_of_speech": "Noun (คำนาม)",
    "category_name": "TOEIC",
    "meaning_th": "การมอบหมายงาน, คณะผู้แทน",
    "example_sentence": "Effective delegation empowers team members and enhances project momentum."
  },
  {
    "id": 31,
    "vocab_word": "Framework",
    "part_of_speech": "Noun (คำนาม)",
    "category_name": "IT Vocab",
    "meaning_th": "กรอบการทำงาน, โครงร่างมาตรฐานในการพัฒนา",
    "example_sentence": "Next.js is a popular React framework for building performant web applications."
  },
  {
    "id": 32,
    "vocab_word": "Eligible",
    "part_of_speech": "Adjective (คำคุณศัพท์)",
    "category_name": "TOEIC",
    "meaning_th": "มีคุณสมบัติเหมาะสม, มีสิทธิ์",
    "example_sentence": "Only full-time staff who passed the probation period are eligible for bonuses."
  },
  {
    "id": 33,
    "vocab_word": "Gateway",
    "part_of_speech": "Noun (คำนาม)",
    "category_name": "IT Vocab",
    "meaning_th": "เกตเวย์, ประตูเชื่อมต่อระหว่างเครือข่าย",
    "example_sentence": "The API gateway routes incoming client requests to appropriate microservices."
  },
  {
    "id": 34,
    "vocab_word": "Expenditure",
    "part_of_speech": "Noun (คำนาม)",
    "category_name": "TOEIC",
    "meaning_th": "ค่าใช้จ่าย, รายจ่าย",
    "example_sentence": "The finance department closely monitors quarterly marketing expenditure."
  },
  {
    "id": 35,
    "vocab_word": "Index",
    "part_of_speech": "Noun (คำนาม)",
    "category_name": "IT Vocab",
    "meaning_th": "ดัชนีชี้ตำแหน่งข้อมูลเพื่อการค้นหาที่รวดเร็ว",
    "example_sentence": "Creating a composite index on frequently searched columns speeds up lookup time."
  },
  {
    "id": 36,
    "vocab_word": "Facilitate",
    "part_of_speech": "Verb (คำกริยา)",
    "category_name": "TOEIC",
    "meaning_th": "อำนวยความสะดวก, ส่งเสริมให้เกิดขึ้น",
    "example_sentence": "Digital collaboration platforms facilitate seamless communication across remote teams."
  },
  {
    "id": 37,
    "vocab_word": "Latency",
    "part_of_speech": "Noun (คำนาม)",
    "category_name": "IT Vocab",
    "meaning_th": "ความล่าช้าในการส่งผ่านข้อมูล",
    "example_sentence": "Edge server caching minimizes network latency for global website visitors."
  },
  {
    "id": 38,
    "vocab_word": "Grievance",
    "part_of_speech": "Noun (คำนาม)",
    "category_name": "TOEIC",
    "meaning_th": "ข้อร้องทุกข์, ความไม่พอใจ",
    "example_sentence": "Human resources provides a confidential channel to file any workplace grievance."
  },
  {
    "id": 39,
    "vocab_word": "Middleware",
    "part_of_speech": "Noun (คำนาม)",
    "category_name": "IT Vocab",
    "meaning_th": "มิดเดิลแวร์, ซอฟต์แวร์ตัวกลางเชื่อมระหว่างระบบ",
    "example_sentence": "Custom middleware verifies JWT authentication tokens before passing requests."
  },
  {
    "id": 40,
    "vocab_word": "Hierarchy",
    "part_of_speech": "Noun (คำนาม)",
    "category_name": "General English",
    "meaning_th": "ลำดับชั้นการบริหารหรือองค์กร",
    "example_sentence": "A flat company hierarchy encourages open dialogue among all levels of staff."
  },
  {
    "id": 41,
    "vocab_word": "Namespace",
    "part_of_speech": "Noun (คำนาม)",
    "category_name": "IT Vocab",
    "meaning_th": "ขอบเขตชื่อเพื่อป้องกันการชนกันของตัวแปร",
    "example_sentence": "Kubernetes uses namespaces to isolate multiple environments within one cluster."
  },
  {
    "id": 42,
    "vocab_word": "Initiative",
    "part_of_speech": "Noun (คำนาม)",
    "category_name": "TOEIC",
    "meaning_th": "ความคิดริเริ่ม, โครงการริเริ่มใหม่",
    "example_sentence": "Management launched a green energy initiative to reduce carbon emissions."
  },
  {
    "id": 43,
    "vocab_word": "Payload",
    "part_of_speech": "Noun (คำนาม)",
    "category_name": "IT Vocab",
    "meaning_th": "ข้อมูลส่วนเนื้อหาที่ส่งผ่านเครือข่าย",
    "example_sentence": "The webhook handler parses the JSON payload sent from the payment server."
  },
  {
    "id": 44,
    "vocab_word": "Jeopardize",
    "part_of_speech": "Verb (คำกริยา)",
    "category_name": "TOEIC",
    "meaning_th": "ทำให้ตกอยู่ในอันตราย, เสี่ยงเสียหาย",
    "example_sentence": "Skipping system integration tests could jeopardize the entire product launch."
  },
  {
    "id": 45,
    "vocab_word": "Query",
    "part_of_speech": "Noun (คำนาม)",
    "category_name": "IT Vocab",
    "meaning_th": "คำสั่งสอบถามหรือเรียกดูข้อมูลจากฐานข้อมูล",
    "example_sentence": "The analyst executed a complex SQL query to aggregate monthly transaction data."
  },
  {
    "id": 46,
    "vocab_word": "Lucrative",
    "part_of_speech": "Adjective (คำคุณศัพท์)",
    "category_name": "TOEIC",
    "meaning_th": "ที่สร้างผลกำไรงดงาม, ทำเงินได้มาก",
    "example_sentence": "The enterprise software division proved to be a highly lucrative business model."
  },
  {
    "id": 47,
    "vocab_word": "Refactoring",
    "part_of_speech": "Noun (คำนาม)",
    "category_name": "IT Vocab",
    "meaning_th": "การปรับปรุงโครงสร้างโค้ดโดยไม่เปลี่ยนพฤติกรรมเดิม",
    "example_sentence": "Routine code refactoring prevents technical debt and improves maintainability."
  },
  {
    "id": 48,
    "vocab_word": "Mandatory",
    "part_of_speech": "Adjective (คำคุณศัพท์)",
    "category_name": "TOEIC",
    "meaning_th": "ที่เป็นข้อบังคับ, ต้องปฏิบัติตาม",
    "example_sentence": "Attending annual cybersecurity training is mandatory for all personnel."
  },
  {
    "id": 49,
    "vocab_word": "Schema",
    "part_of_speech": "Noun (คำนาม)",
    "category_name": "IT Vocab",
    "meaning_th": "โครงสร้างนิยามตารางและความสัมพันธ์ของฐานข้อมูล",
    "example_sentence": "The database schema was revised to accommodate newly requested user attributes."
  },
  {
    "id": 50,
    "vocab_word": "Negligent",
    "part_of_speech": "Adjective (คำคุณศัพท์)",
    "category_name": "TOEIC",
    "meaning_th": "ละเลย, ประมาทเลินเล่อ",
    "example_sentence": "The contractor was deemed negligent for failing to follow safety protocols."
  },
  {
    "id": 51,
    "vocab_word": "Token",
    "part_of_speech": "Noun (คำนาม)",
    "category_name": "IT Vocab",
    "meaning_th": "รหัสสิทธิ์ชั่วคราวสำหรับยืนยันตัวตน",
    "example_sentence": "Clients must attach a Bearer token in the authorization header of each request."
  },
  {
    "id": 52,
    "vocab_word": "Obligation",
    "part_of_speech": "Noun (คำนาม)",
    "category_name": "TOEIC",
    "meaning_th": "ภาระหน้าที่, ข้อผูกมัดตามสัญญา",
    "example_sentence": "Both companies fulfilled their contractual obligations ahead of schedule."
  },
  {
    "id": 53,
    "vocab_word": "Uncaught",
    "part_of_speech": "Adjective (คำคุณศัพท์)",
    "category_name": "IT Vocab",
    "meaning_th": "ที่ไม่ได้ถูกดักจับข้อผิดพลาด (Exception)",
    "example_sentence": "An uncaught runtime exception caused the background worker thread to terminate."
  },
  {
    "id": 54,
    "vocab_word": "Prospective",
    "part_of_speech": "Adjective (คำคุณศัพท์)",
    "category_name": "TOEIC",
    "meaning_th": "ที่คาดหวังในอนาคต, ว่าที่ลูกค้า",
    "example_sentence": "The sales director gave a product demonstration to several prospective clients."
  },
  {
    "id": 55,
    "vocab_word": "Virtualization",
    "part_of_speech": "Noun (คำนาม)",
    "category_name": "IT Vocab",
    "meaning_th": "การจำลองระบบเสมือนจริง เช่น VM หรือ Container",
    "example_sentence": "Server virtualization enables higher hardware utilization and easier provisioning."
  },
  {
    "id": 56,
    "vocab_word": "Quota",
    "part_of_speech": "Noun (คำนาม)",
    "category_name": "TOEIC",
    "meaning_th": "โควตา, สัดส่วนจำกัดที่กำหนดไว้",
    "example_sentence": "The representative exceeded the quarterly sales quota by twenty percent."
  },
  {
    "id": 57,
    "vocab_word": "Webhook",
    "part_of_speech": "Noun (คำนาม)",
    "category_name": "IT Vocab",
    "meaning_th": "ระบบแจ้งเตือนแบบเรียลไทม์ระหว่างแอปพลิเคชัน",
    "example_sentence": "Stripe triggers a webhook notification whenever an invoice is successfully paid."
  },
  {
    "id": 58,
    "vocab_word": "Reimburse",
    "part_of_speech": "Verb (คำกริยา)",
    "category_name": "TOEIC",
    "meaning_th": "ชำระเงินคืน, เบิกเงินชดเชย",
    "example_sentence": "The accounting office will reimburse travel expenses within five working days."
  },
  {
    "id": 59,
    "vocab_word": "Subnet",
    "part_of_speech": "Noun (คำนาม)",
    "category_name": "IT Vocab",
    "meaning_th": "เครือข่ายย่อยที่แบ่งออกจากเครือข่ายหลัก",
    "example_sentence": "Database instances should always reside in a private subnet for security."
  },
  {
    "id": 60,
    "vocab_word": "Scrutinize",
    "part_of_speech": "Verb (คำกริยา)",
    "category_name": "TOEIC",
    "meaning_th": "ตรวจสอบอย่างละเอียดถี่ถ้วน",
    "example_sentence": "External auditors thoroughly scrutinize all financial statements once a year."
  },
  {
    "id": 61,
    "vocab_word": "Throughput",
    "part_of_speech": "Noun (คำนาม)",
    "category_name": "IT Vocab",
    "meaning_th": "ปริมาณงานหรือข้อมูลที่ระบบประมวลผลได้ต่อหน่วยเวลา",
    "example_sentence": "The message queue handles a high throughput of over ten thousand events per second."
  },
  {
    "id": 62,
    "vocab_word": "Tentative",
    "part_of_speech": "Adjective (คำคุณศัพท์)",
    "category_name": "TOEIC",
    "meaning_th": "เป็นการชั่วคราว, ยังไม่แน่นอน",
    "example_sentence": "We agreed on a tentative project timeline pending final executive sign-off."
  },
  {
    "id": 63,
    "vocab_word": "Daemon",
    "part_of_speech": "Noun (คำนาม)",
    "category_name": "IT Vocab",
    "meaning_th": "โปรแกรมเบื้องหลังที่ทำงานต่อเนื่องในระบบ",
    "example_sentence": "The background logging daemon collects system metrics and exports them to Grafana."
  },
  {
    "id": 64,
    "vocab_word": "Unanimous",
    "part_of_speech": "Adjective (คำคุณศัพท์)",
    "category_name": "TOEIC",
    "meaning_th": "เป็นเอกฉันท์, เห็นพ้องต้องกันทั้งหมด",
    "example_sentence": "The board reached a unanimous decision to expand operations into Southeast Asia."
  },
  {
    "id": 65,
    "vocab_word": "Breakpoint",
    "part_of_speech": "Noun (คำนาม)",
    "category_name": "IT Vocab",
    "meaning_th": "จุดหยุดการทำงานของโค้ดเพื่อการดีบัก (Debug)",
    "example_sentence": "Set a conditional breakpoint inside the loop to inspect variable state changes."
  },
  {
    "id": 66,
    "vocab_word": "Versatile",
    "part_of_speech": "Adjective (คำคุณศัพท์)",
    "category_name": "General English",
    "meaning_th": "ใช้งานได้หลากหลาย, ปรับเปลี่ยนได้ดี",
    "example_sentence": "Python is considered one of the most versatile programming languages available."
  },
  {
    "id": 67,
    "vocab_word": "Idempotent",
    "part_of_speech": "Adjective (คำคุณศัพท์)",
    "category_name": "IT Vocab",
    "meaning_th": "การทำงานที่เรียกซ้ำกี่ครั้งก็ได้ผลลัพธ์เหมือนเดิม",
    "example_sentence": "HTTP PUT and DELETE requests are designed by specification to be idempotent."
  },
  {
    "id": 68,
    "vocab_word": "Warrant",
    "part_of_speech": "Verb (คำกริยา)",
    "category_name": "TOEIC",
    "meaning_th": "รับประกัน, สมควรได้รับ",
    "example_sentence": "The severity of the data outage warrants an immediate internal investigation."
  },
  {
    "id": 69,
    "vocab_word": "Deprecate",
    "part_of_speech": "Verb (คำกริยา)",
    "category_name": "IT Vocab",
    "meaning_th": "ยกเลิกการสนับสนุนฟังก์ชันเก่าเพื่อแนะนำวิธีใหม่",
    "example_sentence": "The library author plans to deprecate the legacy authentication endpoint in v3."
  },
  {
    "id": 70,
    "vocab_word": "Yield",
    "part_of_speech": "Verb (คำกริยา)",
    "category_name": "TOEIC",
    "meaning_th": "ให้ผลตอบแทน, ผลิตออกมา",
    "example_sentence": "The long-term treasury bond investment yielded consistent quarterly returns."
  }
]
;

let globalVocabs = [...DEFAULT_GLOBAL_VOCABS];
let currentGlobalIndex = 0;

async function loadGlobalVocabs() {
  // ลองดึงจากไฟล์ JSON เผื่อมีการอัปเดตไฟล์แบบ Dynamic
  const pathsToTry = ['data/global-vocabs.json', 'app/data/global-vocabs.json', '/app/data/global-vocabs.json'];
  for (const p of pathsToTry) {
    try {
      const res = await fetch(p);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          globalVocabs = data;
          break;
        }
      }
    } catch (e) {
      // ดำเนินการลอง path ถัดไป
    }
  }

  // หาก fetch ไม่สำเร็จ ให้ใช้ชุดข้อมูล 70 คำเต็มที่มีอยู่เสมอ
  if (!globalVocabs || globalVocabs.length === 0) {
    globalVocabs = [...DEFAULT_GLOBAL_VOCABS];
  }
}

function renderGlobalVocabs() {
  const emptyState = document.getElementById('global-empty-state');
  const cardContainer = document.getElementById('global-card-container');
  const counterBadge = document.getElementById('global-counter-badge');

  if (!globalVocabs || globalVocabs.length === 0) {
    if (emptyState) emptyState.style.display = 'block';
    if (cardContainer) cardContainer.style.display = 'none';
    if (counterBadge) counterBadge.innerText = '0 คำ';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';
  if (cardContainer) cardContainer.style.display = 'block';
  if (counterBadge) counterBadge.innerText = `${globalVocabs.length} คำ`;

  if (currentGlobalIndex >= globalVocabs.length) currentGlobalIndex = 0;
  if (currentGlobalIndex < 0) currentGlobalIndex = globalVocabs.length - 1;

  const card = globalVocabs[currentGlobalIndex];
  const cardInner = document.getElementById('global-card-inner');
  if (cardInner) cardInner.classList.remove('flipped');

  // Front Face
  const frontWord = document.getElementById('global-front-word');
  const frontPos = document.getElementById('global-front-pos');
  const frontCat = document.getElementById('global-front-cat');
  const frontEx = document.getElementById('global-front-example');

  if (frontWord) frontWord.innerText = card.vocab_word || '';
  if (frontPos) frontPos.innerText = card.part_of_speech || '';
  if (frontCat) {
    frontCat.innerText = card.category_name || 'TOEIC';
    frontCat.className = `badge ${card.category_name === 'TOEIC' ? 'badge-warning' : 'badge-primary'}`;
  }
  if (frontEx) frontEx.innerText = card.example_sentence ? `"${card.example_sentence}"` : '';

  // Back Face
  const backWord = document.getElementById('global-back-word');
  const backPos = document.getElementById('global-back-pos');
  const backCat = document.getElementById('global-back-cat');
  const backMeaning = document.getElementById('global-back-meaning');
  const backEx = document.getElementById('global-back-example');

  if (backWord) backWord.innerText = card.vocab_word || '';
  if (backPos) backPos.innerText = card.part_of_speech || '';
  if (backCat) {
    backCat.innerText = card.category_name || 'TOEIC';
    backCat.className = `badge ${card.category_name === 'TOEIC' ? 'badge-warning' : 'badge-primary'}`;
  }
  if (backMeaning) backMeaning.innerText = card.meaning_th || '';
  if (backEx) backEx.innerText = card.example_sentence ? `"${card.example_sentence}"` : '';

  // Indicator
  const indicator = document.getElementById('global-card-indicator');
  if (indicator) indicator.innerText = `คำที่ ${currentGlobalIndex + 1} / ${globalVocabs.length}`;
}

function flipGlobalCard() {
  const cardInner = document.getElementById('global-card-inner');
  if (cardInner) cardInner.classList.toggle('flipped');
}

function nextGlobalVocab() {
  if (!globalVocabs || globalVocabs.length <= 1) return;
  currentGlobalIndex = (currentGlobalIndex + 1) % globalVocabs.length;
  renderGlobalVocabs();
}

function prevGlobalVocab() {
  if (!globalVocabs || globalVocabs.length <= 1) return;
  currentGlobalIndex = (currentGlobalIndex - 1 + globalVocabs.length) % globalVocabs.length;
  renderGlobalVocabs();
}

function randomGlobalVocab() {
  if (!globalVocabs || globalVocabs.length === 0) {
    showToast('ไม่มีคำศัพท์ในคลังรวม');
    return;
  }
  if (globalVocabs.length === 1) {
    showToast(`สุ่มได้: ${globalVocabs[0].vocab_word}`);
    return;
  }
  let newIndex;
  do {
    newIndex = Math.floor(Math.random() * globalVocabs.length);
  } while (newIndex === currentGlobalIndex);

  currentGlobalIndex = newIndex;
  renderGlobalVocabs();
  showToast(`🎲 สุ่มได้: ${globalVocabs[currentGlobalIndex].vocab_word}`);
}

// ==========================================
// INITIAL BOOT & SESSION CHECK
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {
  await initApp();
});

async function initApp() {
  await loadGlobalVocabs();
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





