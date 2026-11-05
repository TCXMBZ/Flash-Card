# Student Vocab – แอปพลิเคชันท่องศัพท์ Flashcards & แบบทดสอบ Quiz

แอปพลิเคชันคลังคำศัพท์และทบทวนเตรียมสอบภาษาอังกฤษ (TOEIC & IT Vocab) พัฒนาด้วย Static Web (HTML, CSS, Vanilla JavaScript) เชื่อมต่อฐานข้อมูลและระบบสมาชิกด้วย **Supabase (PostgreSQL & Supabase Auth)** รองรับการรันแบบ Localhost, GitHub Pages และ Deploy บน **Vercel**

---

## ☁️ 1. การตั้งค่า Deploy บน Vercel

โปรเจกต์นี้มีโครงสร้างเป็น Static Web ที่มีหน้า **Project Hub** อยู่ที่ root `index.html` และหน้าแอปพลิเคชันหลักอยู่ที่ `app/index.html` (เข้าถึงได้ที่ path `/app/`)

### การทำงานของระบบ Config และความปลอดภัยของ Publishable Key:
- **Publishable Key (`anon` key) เป็น Public Key:** ในเว็บแบบ Static Web คีย์นี้จำเป็นต้องถูกส่งให้เบราว์เซอร์ของผู้ใช้งาน เพื่อให้ JavaScript ติดต่อกับ Supabase API ได้โดยตรง จึงจะมองเห็นได้ใน Network tab และ JavaScript runtime ของเบราว์เซอร์เป็นเรื่องปกติ
- **หน้าที่ของ Environment Variables บน Vercel:** มีไว้เพื่อ **แยกการตั้งค่าออกจาก Git repository** ทำให้ไม่มีคีย์จริงถูกบันทึกลงใน GitHub Source Code โดยในขั้นตอน Build บน Vercel สคริปต์ `tools/generate-config.js` จะอ่านค่า Environment Variables มาสร้างไฟล์ `app/supabase-config.js` ให้อัตโนมัติ
- **การรักษาความปลอดภัยข้อมูล:** พึ่งพาระบบ **Row Level Security (RLS)** ของ Supabase ในการจำกัดสิทธิ์ให้แต่ละบัญชีเข้าถึงเฉพาะข้อมูลของตัวเอง
- ⚠️ **คำเตือน:** **ห้ามใส่ `secret` key หรือ `service_role` key ลงใน Environment Variables หรือ frontend เด็ดขาด!**

### ค่า Environment Variables ที่ต้องตั้งค่าใน Vercel:
ไปที่ **Vercel Dashboard** -> เลือกโปรเจกต์ -> **Settings** -> **Environment Variables** และเพิ่มค่าดังนี้:

| Variable Name | Value | คำอธิบาย |
|---|---|---|
| `SUPABASE_URL` | `https://movnbdvgcyepkalucbbd.supabase.co` | URL ของโปรเจกต์ Supabase |
| `SUPABASE_PUBLISHABLE_KEY` | *(Publishable / anon key จาก Supabase)* | คีย์แบบ public สำหรับเชื่อมต่อ client |

*(หมายเหตุ: ระบบรองรับชื่อ `SUPABASE_ANON_KEY` เป็นตัวสำรองได้ด้วยเช่นกัน)*

### การตั้งค่า Vercel Project Settings:
- **Framework Preset:** `Other`
- **Root Directory:** `./` (ค่าเริ่มต้น)
- **Build Command:** ปล่อยตามค่าเริ่มต้น (ใน `vercel.json` กำหนด `node tools/generate-config.js` ไว้อัตโนมัติแล้ว)
- **Output Directory:** `.` (หรือเว้นว่างตามค่าเริ่มต้นใน `vercel.json`)

---

## 💻 2. การตั้งค่าสำหรับทดสอบบนเครื่อง (Localhost)

ไฟล์คอนฟิกจริง `app/supabase-config.js` ถูกกำหนดไว้ใน `.gitignore` เพื่อไม่ให้อัปโหลดขึ้น GitHub:
1. หากยังไม่มีไฟล์ `app/supabase-config.js` ให้คัดลอกมาจาก `app/supabase-config.example.js`
2. ใส่ Publishable Key ที่ได้จาก Supabase ลงใน `app/supabase-config.js`:
   ```javascript
   window.SUPABASE_CONFIG = {
     url: "https://movnbdvgcyepkalucbbd.supabase.co",
     publishableKey: "ใส่_PUBLISHABLE_ANON_KEY_ตรงนี้"
   };
   ```
3. รันผ่าน Local Web Server เช่น VS Code Live Server หรือ `npx serve .`

---

## 🗄️ 3. SQL Migration ที่ต้องรันใน Supabase SQL Editor

คัดลอกคำสั่ง SQL ต่อไปนี้ไปรันใน **Supabase SQL Editor** (เป็น Safe Migration ไม่ลบตารางหรือข้อมูลเดิม):

```sql
-- =====================================================================
-- 1. สร้างตาราง profiles สำหรับเก็บข้อมูลเพิ่มเติมของผู้ใช้
-- (ชื่อ-นามสกุล, รหัสนักศึกษา, ชื่อผู้ใช้, เป้าหมายการสอบ)
-- ผูกกับ auth.users(id) ปลอดภัย ไม่มีการจัดเก็บรหัสผ่านเอง
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    full_name TEXT,
    student_id TEXT,
    target_exam TEXT DEFAULT 'TOEIC & IT Vocab',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- เปิดใช้งาน Row Level Security (RLS) บนตาราง profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- นโยบาย RLS: ผู้ใช้งานอ่านได้เฉพาะโปรไฟล์ของตนเอง
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

-- นโยบาย RLS: ผู้ใช้งานสร้างโปรไฟล์ของตนเองได้
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- นโยบาย RLS: ผู้ใช้งานแก้ไขโปรไฟล์ของตนเองได้
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id) 
WITH CHECK (auth.uid() = id);

-- =====================================================================
-- 2. จัดการ RLS Policy สำหรับ quiz_answers
-- เนื่องจากตาราง quiz_answers ไม่มีคอลัมน์ user_id ในตัว 
-- จึงต้องตรวจสอบสิทธิ์ผ่านตาราง quizzes ที่ผูกอยู่
-- =====================================================================
ALTER TABLE public.quiz_answers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view answers of their quizzes" ON public.quiz_answers;
CREATE POLICY "Users can view answers of their quizzes"
ON public.quiz_answers FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.quizzes
    WHERE public.quizzes.quiz_id = public.quiz_answers.quiz_id
      AND public.quizzes.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can insert answers for their quizzes" ON public.quiz_answers;
CREATE POLICY "Users can insert answers for their quizzes"
ON public.quiz_answers FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.quizzes
    WHERE public.quizzes.quiz_id = public.quiz_answers.quiz_id
      AND public.quizzes.user_id = auth.uid()
  )
);

-- =====================================================================
-- 3. ตรวจสอบข้อมูลหมวดหมู่เริ่มต้นในตาราง categories (ถ้ายังไม่มี)
-- =====================================================================
INSERT INTO public.categories (category_id, category_name) VALUES
(1, 'TOEIC'),
(2, 'IT Vocab'),
(3, 'General English')
ON CONFLICT (category_id) DO NOTHING;

-- อนุญาตให้อ่านหมวดหมู่คำศัพท์ได้
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow read categories for all authenticated and anon" ON public.categories;
CREATE POLICY "Allow read categories for all authenticated and anon"
ON public.categories FOR SELECT
USING (true);
```

---

## 🌐 4. การตั้งค่า Supabase Authentication URL Configuration

เพื่อให้ระบบ Redirect หลังยืนยันอีเมลหรือล็อกอินทำงานถูกต้องบน Vercel, Localhost และ GitHub Pages:
1. เข้าไปที่ **Supabase Dashboard** -> เลือกโปรเจกต์ -> **Authentication** -> **URL Configuration**
2. **Site URL:**
   - ใส่ URL ของ Vercel: `https://<YOUR-PROJECT-NAME>.vercel.app/`
3. **Redirect URLs** (กด **Add URL** เพิ่มให้ครบ):
   - `https://*.vercel.app/**`
   - `https://<YOUR-PROJECT-NAME>.vercel.app/**`
   - `http://localhost:*`
   - `http://127.0.0.1:*`
   - `http://localhost:5500/**`
   - `http://127.0.0.1:5500/**`
   - `http://localhost:3000/**`
   - `https://<YOUR_GITHUB_USERNAME>.github.io/**`

---

## 🧪 5. การตรวจสอบความถูกต้องหลัง Deploy บน Vercel

1. **ตรวจสอบหน้า Project Hub:**
   - เข้า URL หลัก เช่น `https://<YOUR-PROJECT-NAME>.vercel.app/`
   - จะต้องแสดงหน้า DevOps Project Hub พร้อมลิงก์ไปยัง Prototype และ App ได้ถูกต้อง
2. **ตรวจสอบหน้า Application (`/app/`):**
   - เข้า URL เช่น `https://<YOUR-PROJECT-NAME>.vercel.app/app` หรือ `https://<YOUR-PROJECT-NAME>.vercel.app/app/`
   - จะต้องแสดงหน้า **Screen 1 (เข้าสู่ระบบ)** โดยไม่มี Error 404 สำหรับ `supabase-config.js`
   - เปิด Developer Tools (F12) -> Console: พิมพ์ `window.SUPABASE_CONFIG` จะต้องแสดง Object ที่มี `url` และ `publishableKey` ถูกต้อง
3. **ทดสอบการทำงาน:**
   - ทดสอบสมัครสมาชิก ล็อกอิน เพิ่มคำศัพท์ และทำแบบทดสอบตามปกติ ข้อมูลจะซิงค์กับ Supabase เรียลไทม์

---

## 📁 6. สรุปไฟล์ที่เกี่ยวข้องกับการ Deploy

| ไฟล์ | หน้าที่ |
|---|---|
| `vercel.json` | ตั้งค่า Vercel Build Command, Output Directory และ URL Rewrites สำหรับ `/app/` |
| `tools/generate-config.js` | สคริปต์ Node.js สร้าง `app/supabase-config.js` จาก Environment Variables ตอน build |
| `app/supabase-config.example.js` | ไฟล์ตัวอย่างคอนฟิก (ใช้ placeholder ปราศจากคีย์จริง) |
| `app/supabase-config.js` | ไฟล์คอนฟิกจริงสำหรับเครื่อง Local (ไม่ถูก push ขึ้น Git เนื่องจากอยู่ใน `.gitignore`) |
| `.gitignore` | ป้องกันการ commit `app/supabase-config.js` ขึ้น Git repository |
