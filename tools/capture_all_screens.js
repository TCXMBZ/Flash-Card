const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const protoDir = path.join(root, 'prototype');
const outDir = path.join(root, 'docs', 'assets', 'screenshots');
const chrome = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const tasks = [
  { file: 'screen1_login.html', out: 'screen1_login.png', w: 440, h: 940 },
  { file: 'screen1_register.html', out: 'screen1_register.png', w: 440, h: 940 },
  { file: 'screen2_dashboard.html', out: 'screen2_dashboard.png', w: 440, h: 940 },
  { file: 'screen3_flashcards.html', out: 'screen3_flashcards.png', w: 440, h: 940 },
  { file: 'screen3_flashcards_back.html', out: 'screen3_flashcards_back.png', w: 440, h: 940 },
  { file: 'screen4_add_card.html', out: 'screen4_add_card.png', w: 440, h: 940 },
  { file: 'screen5_profile.html', out: 'screen5_profile.png', w: 440, h: 940 },
  { file: 'screen6_quiz.html', out: 'screen6_quiz.png', w: 440, h: 940 },
  { file: 'overview_6screens.html', out: 'overview_6screens.png', w: 1400, h: 1850 },
  { file: 'wireframe_flow.html', out: 'wireframe_flow.png', w: 1240, h: 1320 },
];

console.log('Capturing screenshots with Chrome Headless...');
for (const t of tasks) {
  const htmlPath = path.join(protoDir, t.file);
  const outPath = path.join(outDir, t.out);
  const fileUrl = 'file:///' + htmlPath.replace(/\\/g, '/');

  execFileSync(chrome, [
    '--headless',
    '--disable-gpu',
    '--hide-scrollbars',
    '--allow-file-access-from-files',
    `--window-size=${t.w},${t.h}`,
    `--screenshot=${outPath}`,
    fileUrl,
  ]);

  const stat = fs.statSync(outPath);
  console.log(`✓ ${t.out} (${stat.size} bytes)`);
}

console.log('All screenshots captured successfully.');
