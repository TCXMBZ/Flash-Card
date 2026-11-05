const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const protoDir = path.join(root, 'prototype');
let css = fs.readFileSync(path.join(protoDir, 'styles.css'), 'utf8');

// Sanitize all viewport units for html_preview engine
css = css
  .replace(/\b100vh\b/g, '820px')
  .replace(/\b\d+vh\b/g, 'auto');

const files = [
  'screen1_login.html',
  'screen1_register.html',
  'screen2_dashboard.html',
  'screen3_flashcards.html',
  'screen3_flashcards_back.html',
  'screen4_add_card.html',
  'screen5_profile.html',
  'screen6_quiz.html',
  'overview_6screens.html'
];

for (const f of files) {
  const filePath = path.join(protoDir, f);
  if (!fs.existsSync(filePath)) continue;
  let html = fs.readFileSync(filePath, 'utf8');
  html = html.replace(/<link\s+rel=["']stylesheet["']\s+href=["']styles\.css["']\s*\/?>/i, `<style>\n${css}\n</style>`);
  html = html.replace(/\b100vh\b/g, '820px').replace(/\b\d+vh\b/g, 'auto');
  fs.writeFileSync(path.join(protoDir, 'inlined_' + f), html, 'utf8');
  console.log('created inlined_' + f);
}
