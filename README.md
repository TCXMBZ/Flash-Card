# Student Vocab – แอปพลิเคชันท่องศัพท์ Flashcards & แบบทดสอบ Quiz

แอปพลิเคชันคลังคำศัพท์และทบทวนเตรียมสอบภาษาอังกฤษ (TOEIC & IT Vocab) พัฒนาด้วย Static Web (HTML, CSS, Vanilla JavaScript) 

มี 2 รูปแบบให้เลือกใช้งาน:
1. **📱 Interactive Prototype (แอปต้นแบบจำลอง — ไม่ต้องต่อ API):**  
   เปิดไฟล์ `prototype/app.html` ได้ทันทีแบบ 100% Offline รองรับการท่องการ์ด 3D, อ่านออกเสียง TTS, ทำแบบทดสอบ Quiz 15 วินาที, เพิ่ม/แก้ไข/ลบคำศัพท์ และบันทึกข้อมูลลง LocalStorage ทันทีโดยไม่ต้องตั้งค่าฐานข้อมูลหรือ API
2. **🚀 Live Production App (แอปพลิเคชันเต็มรูปแบบ):**  
   เปิดไฟล์ `app/index.html` เชื่อมต่อฐานข้อมูล PostgreSQL, Supabase Auth และ RLS Policies จริง

---

## 🚀 1. การติดตั้งและการตั้งค่า Supabase Publishable Key

ไฟล์คอนฟิกสำหรับเชื่อมต่อ Supabase ถูกแยกไว้ที่:
`app/supabase-config.js` (ไฟล์นี้ถูกเพิ่มไว้ใน `.gitignore` แล้ว เพื่อป้องกันการเผลออัปโหลดคีย์ขึ้น GitHub)

### ขั้นตอนการตั้งค่า:
1. เปิดไฟล์ `app/supabase-config.js` (หรือหากยังไม่มี ให้คัดลอกมาจาก `app/supabase-config.example.js`)
2. เข้าสู่ [Supabase Dashboard](https://supabase.com/dashboard) -> เลือกโปรเจกต์ของคุณ
3. ไปที่เมนู **Project Settings** (ไอคอนฟันเฟือง) -> **API**
4. ในส่วน **Project API keys** ให้คัดลอกคีย์ **`anon` `public`** (Publishable Key)
5. นำมาวางในไฟล์ `app/supabase-config.js`:
   ```javascript
   window.SUPABASE_CONFIG = {
     url: "https://movnbdvgcyepkalucbbd.supabase.co",
     publishableKey: "ใส่_ANON_PUBLIC_KEY_ตรงนี้"
   };
   ```
> ⚠️ **คำเตือนความปลอดภัยสำคัญมาก:**  
> - **ห้ามใช้หรือเปิดเผย `secret` / `service_role` key เด็ดขาด!**  
> - โค้ดฝั่งหน้าเว็บ (Browser Client) จะใช้เฉพาะ Publishable key (`anon`) และพึ่งพาระบบ Row Level Security (RLS) ในการจำกัดสิทธิ์ของข้อมูล

---

## 🗄️ 2. SQL Migration ที่ต้องรันเพิ่มเติมใน Supabase SQL Editor

เนื่องจากโครงสร้างเดิมและโจทย์มีความต้องการเฉพาะเกี่ยวกับ **โปรไฟล์ผู้ใช้ (`profiles`)**, **การตรวจสอบสิทธิ์คำตอบข้อสอบ (`quiz_answers` RLS)** และ **ข้อมูลหมวดหมู่ (`categories`)**  
กรุณาคัดลอก SQL ด้านล่างนี้ไปรันใน **Supabase SQL Editor** (เป็นคำสั่งแบบ Safe Migration ไม่ลบตารางหรือข้อมูลเดิม):

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

## 🌐 3. การตั้งค่า Supabase Authentication URL Configuration

เพื่อให้ระบบสมัครสมาชิก ยืนยันอีเมล และเข้าสู่ระบบทำงานได้อย่างถูกต้องทั้งบนเครื่องส่วนตัว (Localhost) และบน GitHub Pages:

1. เข้าไปที่ **Supabase Dashboard** -> เลือกโปรเจกต์
2. ไปที่เมนู **Authentication** -> **URL Configuration**
3. กำหนดค่าดังนี้:
   - **Site URL**:
     - หากเน้น GitHub Pages: `https://<YOUR_GITHUB_USERNAME>.github.io/<YOUR_REPO_NAME>/`
     - หรือหากทดสอบในเครื่อง: `http://localhost:5500/` หรือ `http://127.0.0.1:5500/`
   - **Redirect URLs** (กดปุ่ม **Add URL** เพิ่มให้ครบ):
     - `http://localhost:*`
     - `http://127.0.0.1:*`
     - `http://localhost:5500/**`
     - `http://127.0.0.1:5500/**`
     - `http://localhost:3000/**`
     - `https://<YOUR_GITHUB_USERNAME>.github.io/**`

*(หมายเหตุ: หากต้องการทดสอบสมัครแล้วล็อกอินได้ทันทีโดยไม่ต้องกดยืนยันอีเมล สามารถปิด **Confirm email** ชั่วคราวได้ที่ Authentication -> Providers -> Email -> ปิด Confirm email)*

---

## 🧪 4. วิธีทดสอบระบบ

### การทดสอบสมัครสมาชิกและล็อกอิน:
1. เปิดหน้าเว็บ `app/index.html` (แนะนำให้รันผ่าน Live Server เช่น VS Code Live Server หรือ `npx serve`)
2. ระบบจะตรวจพบว่ายังไม่มี Session และเปิดหน้า **Screen 1 (เข้าสู่ระบบ)**
3. คลิก **"ยังไม่มีบัญชี? สมัครใช้งาน"**
4. กรอกข้อมูล: ชื่อ-นามสกุล, รหัสนักศึกษา, ชื่อผู้ใช้, อีเมล และรหัสผ่าน (อย่างน้อย 6 ตัวอักษร) แล้วกด **"สมัครสมาชิก"**
5. เมื่อเข้าสู่ระบบสำเร็จ จะถูกนำไปยัง **Screen 2 (หน้าหลัก Dashboard)** สังเกตว่าผู้ใช้ใหม่จะพบจำนวนคำศัพท์ 0 คำ (ไม่มีข้อมูลตัวอย่างปะปน)

### การทดสอบจัดการคำศัพท์ (CRUD):
1. กดปุ่ม **"เพิ่มศัพท์"** -> กรอกคำศัพท์ ชนิดของคำ หมวดหมู่ คำแปล และตัวอย่างประโยค -> กด **"บันทึก"**
2. ข้อมูลจะถูกบันทึกลงตาราง `flashcards` ใน Supabase ทันที
3. ไปที่เมนู **"ท่องการ์ด"**: ลองคลิกพลิกการ์ด 3D, กดปุ่ม **"จำได้แล้ว"** หรือ **"ยังจำไม่ได้"** (สถานะ `is_remembered` จะอัปเดตลง Supabase ทันที)
4. กดไอคอน **แก้ไข** เพื่อเปลี่ยนคำแปล หรือไอคอน **ถังขยะ** เพื่อลบคำศัพท์

### การทดสอบแบบทดสอบ (Quiz):
1. ไปที่เมนู **"ทดสอบ"** (หรือกดปุ่มทำแบบทดสอบจาก Dashboard)
2. ตอบคำถามทั้ง 5 ข้อ (ระบบจับเวลาข้อละ 15 วินาที)
3. เมื่อทำเสร็จ คะแนนและประวัติคำตอบจะถูกบันทึกลงตาราง `quizzes` และ `quiz_answers` พร้อมแสดงคะแนนบนหน้าต่างสรุปและหน้า **โปรไฟล์**

### การทดสอบแยกข้อมูลระหว่าง 2 บัญชี (RLS Verification):
1. ไปที่แท็บ **"โปรไฟล์"** -> กดปุ่ม **"ออกจากระบบ"**
2. สมัครบัญชีที่ 2 ด้วยอีเมลอื่น
3. ตรวจสอบหน้า Dashboard: จะพบว่าคำศัพท์และประวัติคะแนนของบัญชีที่ 1 จะ**ไม่ปรากฏ**ในบัญชีที่ 2
4. ลองเพิ่มคำศัพท์ใหม่ในบัญชีที่ 2 แล้วสลับล็อกอินกลับไปบัญชีที่ 1 -> ข้อมูลจะแยกจากกันอย่างเด็ดขาดตามนโยบาย RLS

### การทดสอบโหลดข้อมูลตัวอย่าง (Demo Mode):
- หากผู้ใช้ใหม่ต้องการลองเล่นระบบทันที สามารถไปที่หน้า **"โปรไฟล์"** -> กดปุ่ม **"ศัพท์ตัวอย่าง (Demo)"** ระบบจะยืนยันและนำเข้าคำศัพท์ตัวอย่าง 5 คำเข้าสู่บัญชีของผู้ใช้นั้นๆ โดยตรง

---

## 📁 5. สรุปไฟล์ที่ได้รับการปรับปรุง

| ไฟล์ | การเปลี่ยนแปลง |
|---|---|
| `app/supabase-config.js` | ไฟล์คอนฟิกแยกสำหรับเก็บ Supabase URL และ Publishable Key |
| `app/supabase-config.example.js` | ไฟล์ต้นแบบสำหรับแนะนำการใส่คีย์ก่อนใช้งาน |
| `.gitignore` | ระบุไฟล์ `app/supabase-config.js` เพื่อความปลอดภัยไม่ให้หลุดขึ้น Git/GitHub |
| `app/index.html` | เพิ่มสคริปต์ Supabase JS SDK (v2 CDN) และ `supabase-config.js` พร้อมปรับ Placeholder ให้พร้อมใช้งาน |
| `app/app.js` | ปรับระบบ Auth, Session detection, Flashcards CRUD, Quiz log, Profile sync และ Category mapping สู่ Supabase แบบสมบูรณ์ |
| `README.md` | เอกสารคู่มือการใส่คีย์, SQL Migration, การตั้งค่า URL Configuration และขั้นตอนทดสอบ |

---

## 📌 6. ข้อจำกัดและข้อควรทราบที่ยังเหลือ
1. **การเข้าสู่ระบบด้วย Username**: Supabase Auth พื้นฐานจะใช้ Email เป็นหลัก ในแอปนี้หากผู้ใช้กรอก Email จะล็อกอินได้ทันที หากกรอก Username ระบบจะแนะนำให้ใช้อีเมลในการยืนยันตัวตนเพื่อความถูกต้องและปลอดภัยสูงสุด
2. **Text-to-Speech (TTS)**: ฟังก์ชันอ่านออกเสียงคำศัพท์ใช้งาน Web Speech API ของเบราว์เซอร์ ซึ่งขึ้นอยู่กับเสียงที่ติดตั้งในระบบปฏิบัติการของอุปกรณ์แต่ละเครื่อง
