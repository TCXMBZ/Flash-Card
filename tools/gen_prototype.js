// Generator: rebuilds prototype/*.html from the new Modern EdTech Pro app design.
// Run: node tools/gen_prototype.js   (from project root)
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const out = (f, s) => fs.writeFileSync(path.join(root, 'prototype', f), s, 'utf8');

// ---- CSS: app stylesheet + prototype extras ----
let css = fs.readFileSync(path.join(root, 'app', 'styles.css'), 'utf8');
css = css.replace(/^\/\*[\s\S]*?\*\//, '/* Student Vocab - prototype stylesheet. Mirrors app/styles.css (v3: Modern EdTech Pro). */');
css += `
/* ---------- Prototype-only ---------- */
a { color: inherit; text-decoration: none; }
a.nav-item, a.row-cta, a.btn { text-decoration: none; }
.view-screen { display: flex; }
.proto-caption { max-width: 400px; margin: 14px auto 0; font-size: 13px; color: var(--ink-2); text-align: center; }
.proto-caption b { color: var(--ink); }
body.proto { flex-direction: column; justify-content: flex-start; padding: 24px 12px; }
`;
fs.writeFileSync(path.join(root, 'prototype', 'styles.css'), css, 'utf8');

// ---- shared pieces ----
const ic = {
  home: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
  cards: '<rect x="2" y="4" width="20" height="16" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>',
  quiz: '<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
  user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  edit: '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>',
  del: '<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  spk: '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>',
};
const svg = (k) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${ic[k]}</svg>`;
const iconBtn = (k, extra = '') => `<button class="icon-btn ${extra}">${svg(k)}</button>`;

function nav(active) {
  const items = [
    ['screen2_dashboard.html', 'home', 'หน้าหลัก', 2],
    ['screen3_flashcards.html', 'cards', 'ท่องการ์ด', 3],
    ['screen6_quiz.html', 'quiz', 'ทดสอบ', 6],
    ['screen5_profile.html', 'user', 'โปรไฟล์', 5],
  ];
  return `<nav class="app-navbar">
${items.map(([h, k, l, n]) => `      <a href="${h}" class="nav-item${n === active ? ' active' : ''}">${svg(k)}<span>${l}</span></a>`).join('\n')}
    </nav>`;
}

function page(title, body, active, caption) {
  return `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — Student Vocab prototype</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="styles.css">
</head>
<body class="proto">
  <div class="app-viewport">
    <div class="app-content">
${body}
    </div>
${active ? '    ' + nav(active) : ''}
  </div>
  <p class="proto-caption">${caption}</p>
</body>
</html>
`;
}

const words = [
  ['Implement', 'นำไปปฏิบัติ, พัฒนาระบบ', 'TOEIC'],
  ['Requirement', 'ความต้องการ, เงื่อนไขที่จำเป็น', 'TOEIC'],
  ['Deploy', 'นำระบบไปใช้งานจริง', 'IT Vocab'],
];

// ---- screen 1: login ----
out('screen1_login.html', page('หน้า 1 เข้าสู่ระบบ', `
      <section class="view-screen auth">
        <h1 class="title">Student Vocab</h1>
        <p class="subtitle" style="margin-bottom: 28px;">เข้าสู่ระบบเพื่อทบทวนคำศัพท์เตรียมสอบ</p>
        <div class="form-group">
          <label class="form-label">อีเมลหรือชื่อผู้ใช้</label>
          <input class="form-input" value="theeradech_019@vec.go.th">
        </div>
        <div class="form-group" style="margin-bottom: 24px;">
          <label class="form-label">รหัสผ่าน</label>
          <input class="form-input" type="password" value="12345678">
        </div>
        <a href="screen2_dashboard.html" class="btn btn-primary btn-block">เข้าสู่ระบบ</a>
        <p style="text-align: center; margin-top: 20px;"><span class="link">ยังไม่มีบัญชี? สมัครใช้งาน</span></p>
      </section>`, null, '<b>หน้า 1: เข้าสู่ระบบ</b> — ไม่มีแถบนำทางด้านล่าง กดเข้าสู่ระบบเพื่อไปหน้า 2'));

// ---- screen 2: dashboard ----
out('screen2_dashboard.html', page('หน้า 2 หน้าหลัก', `
      <section class="view-screen">
        <div class="screen-head">
          <div>
            <h2 class="title">สวัสดี นายธีรเดช</h2>
            <p class="subtitle">เป้าหมายสอบ: TOEIC &amp; IT Vocab</p>
          </div>
          <a href="screen4_add_card.html" class="btn btn-primary btn-sm">เพิ่มศัพท์</a>
        </div>
        <div class="stats">
          <div class="stat"><div class="stat-num">5</div><div class="label">ทั้งหมด</div></div>
          <div class="stat"><div class="stat-num ok">2</div><div class="label">จำได้แล้ว</div></div>
          <div class="stat"><div class="stat-num bad">3</div><div class="label">ยังจำไม่ได้</div></div>
        </div>
        <div class="progress">
          <div class="progress-top"><span>ความคืบหน้า</span><b>40%</b></div>
          <div class="bar"><div class="bar-fill" style="width: 40%;"></div></div>
        </div>
        <a href="screen6_quiz.html" class="row-cta">
          <div><div class="t">ทำแบบทดสอบ</div><div class="d">5 ข้อ จับเวลาข้อละ 15 วินาที</div></div>
          <span class="go">เริ่ม</span>
        </a>
        <div class="section-head"><h3>ต้องทบทวน</h3><a class="link" href="screen3_flashcards.html">ท่องทั้งหมด</a></div>
        <div class="word-list">
${words.map(([w, m, c]) => `          <div class="word-row">
            <a class="main" href="screen3_flashcards.html"><div class="w">${w}</div><div class="m">${m}</div></a>
            <span class="badge">${c}</span>
            <a href="screen4_add_card.html" class="icon-btn">${svg('edit')}</a>
            ${iconBtn('del', 'danger')}
          </div>`).join('\n')}
        </div>
      </section>`, 2, '<b>หน้า 2: หน้าหลัก</b> — แถบนำทาง 4 เมนู ปุ่ม "เพิ่มศัพท์" อยู่ที่หัวหน้านี้'));

// ---- screen 3: flashcards ----
out('screen3_flashcards.html', page('หน้า 3 ท่องการ์ด', `
      <section class="view-screen">
        <div class="screen-head"><h2 class="title">ท่องการ์ด</h2></div>
        <div class="tabs">
          <div class="filter-pill active">ยังจำไม่ได้ (3)</div>
          <div class="filter-pill">จำได้แล้ว (2)</div>
          <div class="filter-pill">ทั้งหมด (5)</div>
        </div>
        <div class="flashcard-stage">
          <div class="flashcard-inner">
            <div class="flashcard-front">
              <div class="card-top">
                <span class="badge">TOEIC</span>
                <div class="tools">${iconBtn('spk')}<a href="screen4_add_card.html" class="icon-btn">${svg('edit')}</a>${iconBtn('del', 'danger')}</div>
              </div>
              <div class="card-body">
                <h1 class="card-word">Requirement</h1>
                <div class="badge-gray badge" style="margin-top: 6px;">Noun (คำนาม)</div>
                <p class="card-example">"The client outlined clear software requirements."</p>
              </div>
              <div class="card-foot">แตะเพื่อพลิก · 2 / 3</div>
            </div>
          </div>
        </div>
        <div class="actions-2">
          <button class="btn btn-danger">✕ ยังจำไม่ได้</button>
          <button class="btn btn-success">✓ จำได้แล้ว</button>
        </div>
        <div class="pager"><span>ก่อนหน้า</span><span>ถัดไป</span></div>
      </section>`, 3, '<b>หน้า 3: ท่องการ์ด</b> — ด้านหน้าแสดงคำศัพท์ ด้านหลังแสดงคำแปล (ไม่เฉลยก่อนพลิก)'));

// ---- screen 4: add card (no tab active, reached from dashboard) ----
out('screen4_add_card.html', page('หน้า 4 เพิ่มคำศัพท์', `
      <section class="view-screen">
        <h2 class="title">เพิ่มคำศัพท์</h2>
        <p class="subtitle" style="margin-bottom: 24px;">กรอกข้อมูลเพื่อบันทึกลงคลังคำศัพท์</p>
        <div class="form-group"><label class="form-label">คำศัพท์</label><input class="form-input" placeholder="เช่น Requirement"></div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">ชนิดของคำ</label><select class="form-select"><option>Noun (คำนาม)</option></select></div>
          <div class="form-group"><label class="form-label">หมวดหมู่</label><select class="form-select"><option>TOEIC</option></select></div>
        </div>
        <div class="form-group"><label class="form-label">คำแปล</label><input class="form-input" placeholder="เช่น ความต้องการ"></div>
        <div class="form-group" style="margin-bottom: 24px;"><label class="form-label">ตัวอย่างประโยค</label><textarea class="form-textarea" placeholder="The system meets all security requirements."></textarea></div>
        <a href="screen2_dashboard.html" class="btn btn-primary btn-block" style="margin-bottom: 8px;">บันทึก</a>
        <a href="screen2_dashboard.html" class="btn btn-outline btn-block">ยกเลิก</a>
      </section>`, null, '<b>หน้า 4: เพิ่ม/แก้ไขคำศัพท์</b> — เข้าจากปุ่ม "เพิ่มศัพท์" หรือไอคอนแก้ไข ไม่อยู่ในแถบนำทาง'));

// ---- screen 5: profile ----
out('screen5_profile.html', page('หน้า 5 โปรไฟล์', `
      <section class="view-screen">
        <div class="profile-head">
          <div class="avatar">นธ</div>
          <div>
            <div style="font-size: 17px; font-weight: 700;">นายธีรเดช ผกามาด</div>
            <div class="subtitle">@theeradech_019</div>
            <div class="label" style="margin-top: 2px;">นักศึกษา (ID: 019)</div>
          </div>
        </div>
        <div class="section-head"><h3>บัญชี</h3></div>
        <div class="kv">
          <div class="kv-row"><span class="k">ชื่อผู้ใช้</span><span class="v">theeradech_019</span></div>
          <div class="kv-row"><span class="k">อีเมล</span><span class="v">theeradech_019@vec.go.th</span></div>
          <div class="kv-row"><span class="k">สร้างเมื่อ</span><span class="v">29 ต.ค. 2026</span></div>
        </div>
        <div class="section-head"><h3>ผลการเรียน</h3></div>
        <div class="kv">
          <div class="kv-row"><span class="k">คำศัพท์ทั้งหมด</span><span class="v">5 ใบ</span></div>
          <div class="kv-row"><span class="k">จำได้แล้ว</span><span class="v">2 ใบ (40%)</span></div>
          <div class="kv-row"><span class="k">คะแนนทดสอบล่าสุด</span><span class="v">4 / 5 (80%)</span></div>
        </div>
        <div style="margin-top: 24px;">
          <button class="btn btn-outline btn-block">แก้ไขข้อมูลส่วนตัว</button>
          <div class="actions-2" style="margin-top: 8px;">
            <button class="btn btn-outline btn-sm">รีเซ็ตข้อมูล</button>
            <a href="screen1_login.html" class="btn btn-outline btn-sm btn-text-danger">ออกจากระบบ</a>
          </div>
        </div>
      </section>`, 5, '<b>หน้า 5: โปรไฟล์</b> — ข้อมูลบัญชี ผลการเรียน และออกจากระบบ'));

// ---- screen 6: quiz ----
const choices = ['นำไปปฏิบัติ', 'ความต้องการ, เงื่อนไขที่จำเป็น', 'กรอบการทำงาน', 'นำระบบไปใช้งานจริง'];
out('screen6_quiz.html', page('หน้า 6 ทดสอบ', `
      <section class="view-screen">
        <div class="screen-head"><h2 class="title">แบบทดสอบ</h2><span class="title" style="font-variant-numeric: tabular-nums;">00:12</span></div>
        <div class="quiz-meta"><span>ข้อที่ 2 / 5</span><span><span class="badge">TOEIC</span> · <span class="badge">Noun</span></span></div>
        <div class="bar"><div class="bar-fill" style="width: 40%;"></div></div>
        <div class="quiz-header-card">
          <h1 class="quiz-word">Requirement</h1>
          <p class="quiz-sentence">"The client outlined clear software _______."</p>
        </div>
        <div style="flex: 1;">
${choices.map((c, i) => `          <button class="quiz-choice-btn${i === 1 ? ' correct' : ''}"><span class="choice-key-badge">${'กขคง'[i]}</span><span>${c}</span></button>`).join('\n')}
        </div>
      </section>`, 6, '<b>หน้า 6: แบบทดสอบ</b> — 5 ข้อ จับเวลาข้อละ 15 วินาที ตัวอย่างนี้แสดงสถานะตอบถูก'));

// ---- overview: iframes of the real prototype pages ----
const screens = [
  ['screen1_login.html', '1 เข้าสู่ระบบ'],
  ['screen2_dashboard.html', '2 หน้าหลัก'],
  ['screen3_flashcards.html', '3 ท่องการ์ด'],
  ['screen6_quiz.html', '4 ทดสอบ'],
  ['screen4_add_card.html', '5 เพิ่มศัพท์'],
  ['screen5_profile.html', '6 โปรไฟล์'],
];
const frameCss = `
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #f8fafc; color: #0f172a; font-family: 'IBM Plex Sans Thai', -apple-system, "Segoe UI", sans-serif; padding: 32px 24px; line-height: 1.5; }
    h1 { font-size: 24px; font-weight: 700; margin-bottom: 6px; } .sub { font-size: 14px; color: #475569; margin-bottom: 16px; }
    .links a { font-size: 13.5px; color: #2563eb; margin-right: 20px; text-decoration: none; font-weight: 600; padding: 4px 10px; background: #eff6ff; border-radius: 6px; border: 1px solid #bfdbfe; }
    .links a:hover { background: #dbeafe; }
`;
out('overview_6screens.html', `<!DOCTYPE html>
<html lang="th"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Wireframe 6 หน้าจอ — Student Vocab</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>${frameCss}
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: 32px 24px; margin-top: 24px; justify-items: center; }
    figure { margin: 0; width: 100%; max-width: 420px; } figcaption { font-size: 14px; font-weight: 700; color: #1e293b; margin-bottom: 10px; }
    iframe { width: 100%; height: 780px; border: 1px solid #cbd5e1; border-radius: 16px; background: #fff; box-shadow: 0 10px 25px -4px rgba(15,23,42,0.08); }
  </style></head>
<body>
  <h1>Student Vocab — 6 หน้าจอต้นแบบ (Interactive Prototype)</h1>
  <p class="sub">แถบนำทาง 4 เมนู: หน้าหลัก, ท่องการ์ด, ทดสอบ, โปรไฟล์ — เข้าสู่ระบบเพื่อเริ่มใช้งาน</p>
  <div class="links"><a href="../index.html">หน้าหลักโปรเจกต์</a><a href="wireframe_flow.html">แผนผังเส้นทางหน้าจอ</a><a href="../app/index.html">แอปที่ใช้งานได้จริง</a></div>
  <div class="grid">
${screens.map(([f, t]) => `    <figure><figcaption>${t}</figcaption><iframe src="${f}" title="${t}"></iframe></figure>`).join('\n')}
  </div>
</body></html>
`);

// ---- flow diagram ----
const W = 220, H = 400, S = 0.5; // thumbnail
const nodes = {
  s1: { f: 'screen1_login.html', t: '1 เข้าสู่ระบบ', x: 20, y: 250 },
  s2: { f: 'screen2_dashboard.html', t: '2 หน้าหลัก', x: 320, y: 250 },
  s3: { f: 'screen3_flashcards.html', t: '3 ท่องการ์ด', x: 620, y: 30 },
  s6: { f: 'screen6_quiz.html', t: '4 ทดสอบ', x: 620, y: 460 },
  s4: { f: 'screen4_add_card.html', t: '5 เพิ่ม/แก้ไขคำศัพท์', x: 320, y: 700 },
  s5: { f: 'screen5_profile.html', t: '6 โปรไฟล์', x: 940, y: 250 },
};
const nodeW = 200, nodeH = 372;
const node = (id) => {
  const n = nodes[id];
  return `    <a class="node" style="left:${n.x}px; top:${n.y}px;" href="${n.f}"><div class="nh">${n.t}</div><iframe src="${n.f}" tabindex="-1" scrolling="no"></iframe></a>`;
};
const mid = (id, side) => {
  const n = nodes[id];
  return { l: [n.x, n.y + nodeH / 2], r: [n.x + nodeW, n.y + nodeH / 2], t: [n.x + nodeW / 2, n.y], b: [n.x + nodeW / 2, n.y + nodeH] }[side];
};
const edge = (a, as, b, bs, label, dashed) => {
  const [x1, y1] = mid(a, as), [x2, y2] = mid(b, bs);
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  return { d: `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`, label, mx, my, dashed };
};
const edges = [
  edge('s1', 'r', 's2', 'l', 'เข้าสู่ระบบ'),
  edge('s2', 'r', 's3', 'l', 'ท่องการ์ด'),
  edge('s2', 'r', 's6', 'l', 'ทำแบบทดสอบ'),
  edge('s2', 'b', 's4', 't', 'เพิ่มศัพท์ / แก้ไข'),
  edge('s3', 'r', 's5', 'l', 'โปรไฟล์', true),
];
out('wireframe_flow.html', `<!DOCTYPE html>
<html lang="th"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>แผนผังเส้นทางหน้าจอ — Student Vocab</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>${frameCss}
    .stage { position: relative; width: 1160px; height: 1120px; margin-top: 20px; background: #fff; border: 1px solid #cbd5e1; border-radius: 16px; box-shadow: 0 4px 20px -2px rgba(15,23,42,0.06); overflow: hidden; }
    svg { position: absolute; inset: 0; width: 100%; height: 100%; }
    path { fill: none; stroke: #2563eb; stroke-width: 2; }
    path.dash { stroke: #64748b; stroke-dasharray: 6 5; }
    .lbl { position: absolute; transform: translate(-50%, -50%); background: #fff; font-size: 11.5px; font-weight: 600; color: #334155; padding: 2px 8px; border: 1px solid #e2e8f0; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .node { position: absolute; width: ${nodeW}px; border: 1.5px solid #cbd5e1; border-radius: 12px; overflow: hidden; background: #fff; color: inherit; text-decoration: none; box-shadow: 0 4px 12px rgba(15,23,42,0.06); transition: all 0.15s ease; }
    .node:hover { border-color: #2563eb; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(37,99,235,0.15); }
    .nh { font-size: 12.5px; font-weight: 700; padding: 8px 12px; border-bottom: 1px solid #e2e8f0; background: #f8fafc; color: #0f172a; }
    .node iframe { width: 400px; height: 680px; border: 0; transform: scale(0.5); transform-origin: 0 0; pointer-events: none; }
    .node { height: ${nodeH}px; }
  </style></head>
<body>
  <h1>Student Vocab — เส้นทางระหว่างหน้าจอ (Screen Flow)</h1>
  <p class="sub">เส้นทึบ = ทางหลัก, เส้นประ = ทางรอง · กดที่หน้าจอเพื่อเปิดดูต้นแบบหน้าจริง</p>
  <div class="links"><a href="../index.html">หน้าหลักโปรเจกต์</a><a href="overview_6screens.html">ดู 6 หน้าจอเรียงกัน</a><a href="../app/index.html">แอปที่ใช้งานได้จริง</a></div>
  <div class="stage">
    <svg><defs><marker id="a" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 1L10 5L0 9z" fill="#2563eb" stroke="none"/></marker></defs>
${edges.map((e) => `      <path ${e.dashed ? 'class="dash" ' : ''}d="${e.d}" marker-end="url(#a)"/>`).join('\n')}
    </svg>
${edges.map((e) => `    <span class="lbl" style="left:${e.mx}px; top:${e.my}px;">${e.label}</span>`).join('\n')}
${Object.keys(nodes).map(node).join('\n')}
  </div>
</body></html>
`);

out('index.html', `<!DOCTYPE html>
<html lang="th"><head><meta charset="UTF-8">
  <meta http-equiv="refresh" content="0; url=overview_6screens.html">
  <title>Student Vocab — Prototype</title>
</head><body><p><a href="overview_6screens.html">เปิด Wireframe 6 หน้าจอ</a></p></body></html>
`);
console.log('prototype successfully regenerated with Modern EdTech Pro styles');
