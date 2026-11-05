/**
 * tools/generate-config.js
 * 
 * สคริปต์สำหรับสร้างไฟล์ app/supabase-config.js ในขั้นตอน Build บน Vercel
 * โดยอ่านค่าจาก Environment Variables เพื่อไม่ให้มี Publishable key ใน Git repository
 */

const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '..', 'app', 'supabase-config.js');

// อ่านค่าจาก Environment Variables ของ Vercel
const supabaseUrl = process.env.SUPABASE_URL || 'https://movnbdvgcyepkalucbbd.supabase.co';
const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || '';

// ถ้าเป็น Local และมีไฟล์ app/supabase-config.js อยู่แล้ว และไม่ได้ตั้ง env ไว้ ก็จะไม่เขียนทับ
if (fs.existsSync(targetPath) && !publishableKey) {
  console.log('[generate-config] app/supabase-config.js exists and no environment variable provided. Keeping existing file.');
  process.exit(0);
}

const configContent = `/**
 * Supabase Client Configuration
 * Auto-generated during Vercel deployment build step.
 * Generated at: ${new Date().toISOString()}
 * 
 * Note: Publishable key is a public key intended for browser clients.
 */
window.SUPABASE_CONFIG = {
  url: ${JSON.stringify(supabaseUrl)},
  publishableKey: ${JSON.stringify(publishableKey)}
};
`;

try {
  fs.writeFileSync(targetPath, configContent, 'utf8');
  console.log(`[generate-config] Successfully generated app/supabase-config.js`);
  console.log(`[generate-config] Target URL: ${supabaseUrl}`);
  if (!publishableKey) {
    console.warn('[generate-config] WARNING: SUPABASE_PUBLISHABLE_KEY environment variable is not set or empty!');
  }
} catch (err) {
  console.error('[generate-config] Failed to write config file:', err);
  process.exit(1);
}

