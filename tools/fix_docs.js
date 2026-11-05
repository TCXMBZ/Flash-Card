const fs = require('fs');
const dir = 'docs/design/';
const edit = (f, fn) => {
  const p = dir + f;
  const a = fs.readFileSync(p, 'utf8');
  const b = fn(a);
  if (a !== b) fs.writeFileSync(p, b, 'utf8');
  console.log(f, a !== b ? 'updated' : 'unchanged');
};

// Remove the "เพิ่มศัพท์" nav item from 5-tab lists and fix counts.
const navFix = (s) => s.split('\n').map((line) => {
  if (/(แท็บ|ปุ่ม)/.test(line) && /เพิ่มศัพท์/.test(line) && /\[.*\]|Dashboard, ท่องการ์ด/.test(line) && /5 (แท็บ|ปุ่ม)|5 แท็บ/.test(line) ) {
    line = line.replace(/, เพิ่มศัพท์( \([^)]*\))?/g, '').replace(/5 (แท็บ|ปุ่ม)/g, '4 $1');
  }
  return line;
}).join('\n');

edit('10_UI_UX_Design.md', (s) =>
  s.replace('(Dashboard, ท่องการ์ด, ทดสอบ, เพิ่มศัพท์, โปรไฟล์) มี 5 แท็บ', '(Dashboard, ท่องการ์ด, ทดสอบ, โปรไฟล์) มี 4 แท็บ ส่วนการเพิ่มศัพท์ทำผ่านปุ่มในหน้า Dashboard'));

edit('11_Wireframe_and_Prototype.md', (s) => {
  s = navFix(s);
  s = s.replace('B3["ทดสอบ"] <---> B4["เพิ่มศัพท์"] <---> B5["โปรไฟล์"]', 'B3["ทดสอบ"] <---> B5["โปรไฟล์"]');
  s = s.replace('แถบเมนูด้านล่าง 5 แท็บ (เชื่อมโยง', 'แถบเมนูด้านล่าง 4 แท็บ (เชื่อมโยง');
  s = s.replace('กดปุ่ม "+ เพิ่มศัพท์" หรือแท็บ "เพิ่มศัพท์"', 'กดปุ่ม "เพิ่มศัพท์" หรือไอคอนแก้ไข');
  s = s.replace(/ถ้ามี.*เพิ่มศัพท์ \(ไฮไลต์เมื่อเปิดโหมดเพิ่ม\)/, '');
  return s;
});

edit('13_Main_Screens_Design.md', (s) => {
  s = s.replace('แถบเมนูด้านล่าง 5 ปุ่ม โดยไฮไลต์ปุ่ม "เพิ่มศัพท์" (หากอยู่ในโหมดเพิ่ม)', 'แถบเมนูด้านล่าง 4 ปุ่ม ไม่มีปุ่มไฮไลต์ (หน้านี้เข้าจากปุ่ม "เพิ่มศัพท์" ในหน้าหลัก)');
  s = navFix(s);
  s = s.replace(/แถบเมนูด้านล่าง 5 ปุ่ม/g, 'แถบเมนูด้านล่าง 4 ปุ่ม');
  s = s.replace('การ์ดสีขาวเงาบาง มุมโค้ง 12px', 'การ์ดสีขาว เส้นขอบบาง ไม่มีเงา มุมโค้ง 8px');
  s = s.replace('พื้นหลังสีน้ำเงินไล่เฉด (Gradient Blue)', 'ไม่มีพื้นหลังสี ใช้ตัวอักษรขนาดใหญ่บนพื้นขาว');
  return s;
});

edit('14_Style_Guide.md', (s) =>
  s.replace(/เงาบาง \(Subtle Shadow: `0 2px 4px rgba\(0,0,0,0.05\)`\)/, 'ไม่ใช้เงา (flat) ไม่ใช้ gradient และไม่ใช้ emoji ประดับ (v2: สีเน้นสีเดียวคือน้ำเงิน)'));

edit('14_style_guide_preview.html', (s) => s.replace(/\s*box-shadow: 0 4px 20px rgba\(0, 0, 0, 0\.05\);/, ''));

