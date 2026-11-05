# Architecture: แอปท่องศัพท์ ↔ Backend (ร่างรอ approve)

## 1. Grounding (จากโค้ดจริง)
- `app/app.js` เก็บข้อมูลทั้งหมดผ่านคลาส `AppState` (บรรทัด ~80–125) ด้วย localStorage 3 key: `student_vocabs`, `student_user`, `student_latest_quiz` (+ `resetMockData`)
- UI เรียก `state.*` เท่านั้น ดังนั้นจุดต่อ backend คือ `AppState` ที่เดียว ไม่ต้องแก้ทุก handler
- Login/Register (`handleLoginSubmit`, `handleRegisterSubmit`) ยังเป็น mock
- DB (`backend/database/12_schema.sql`): users, categories, flashcards, quizzes, quiz_answers
- ช่องว่าง: schema ไม่มี `last_seen/updated_at` (ถ้าจะทำ offline sync) และ quiz ในแอปเก็บแค่ "ผลล่าสุด" ขณะที่ DB เก็บประวัติทุกรอบ

## 2. Usage sketch (เขียนจากฝั่งผู้เรียกก่อน)
```js
// ใน handler ต่าง ๆ แค่ await แทนการเรียกแบบ sync
const cards = await state.cards.list({ category: 'TOEIC' });
await state.cards.setRemembered(id, true);
const res = await state.quiz.submit({ categoryId, answers: [{cardId, selected}] });
await state.auth.login(username, password);
```

## 3. Candidates
| | A: Thin REST, server คิดคะแนน | B: Offline-first + sync queue |
|---|---|---|
| แอป | เรียก API ตรง ๆ ต้องมีเน็ต | เขียน local ก่อน แล้ว sync ภายหลัง |
| Backend | CRUD ธรรมดา, ตรวจคำตอบฝั่ง server | ต้องมี `updated_at`, conflict rule, delta endpoint |
| ความยาก | ต่ำ เหมาะกับเพื่อนทำ backend คนเดียว | สูง เกินขอบเขตวิชา |
| ความเสี่ยง | ใช้ออฟไลน์ไม่ได้ | bug ซ้ำซ้อน, ทดสอบยาก |

**เลือก A** แต่ซ่อนไว้หลัง interface `Repository` ของแอป เพื่อเปลี่ยนเป็น B ภายหลังได้โดยไม่แตะ UI

## 4. Module map
```
app/
  api/client.js      fetch + baseUrl + JWT + error mapping  (ลึก: ซ่อน header/refresh/retry)
  api/repos.js       auth / cards / quiz / profile (คืน type เดียวกับ API)
  app.js             UI เดิม เรียก repos ผ่าน AppState (async)
backend/ (stack เลือกเอง)
  openapi.yaml       สัญญา — แหล่งความจริงเดียว
  routes → services → db   (services เป็นที่เดียวที่มี logic เช่นคิดคะแนน)
```

## 5. Contract (ย่อ; ละเอียดจะลง `backend/openapi.yaml`)
Base `/api/v1`, JSON, `Authorization: Bearer <jwt>`, error = `{ "error": { "code", "message" } }`

| Method | Path | หมายเหตุ |
|---|---|---|
| POST | /auth/register | `{username,email,password,fullName,studentId?}` → `{token,user}` |
| POST | /auth/login | `{username,password}` → `{token,user}` |
| GET/PUT | /me | profile |
| GET | /categories | |
| GET/POST | /cards | filter: `category`, `remembered`, `q` |
| PUT/DELETE | /cards/{id} | เฉพาะเจ้าของ |
| PATCH | /cards/{id}/remembered | `{remembered:boolean}` |
| POST | /quizzes | ส่ง `{categoryId, answers:[{cardId,selected}]}` server ตรวจ+บันทึก → `{quizId,score,total}` |
| GET | /quizzes?limit= | ประวัติ (`latest` = รายการแรก) |

Types: `Card{id,word,partOfSpeech,meaningTh,example,remembered,categoryId,createdAt}`, `User{id,username,email,fullName,studentId}`, `QuizResult{id,score,total,testedAt}`

## 6. Red-flag check
- logic คะแนนอยู่ server ที่เดียว (กัน client โกง/ซ้ำซ้อน)
- ทุก endpoint ต้องเช็ค `user_id` เจ้าของ (กัน IDOR)
- รหัสผ่าน hash (bcrypt/argon2) ห้ามเก็บ plain; ลบ mock hash ใน seed ก่อน production
- HTTPS เท่านั้น (Android บล็อก cleartext)

## 7. ตัดสินใจแล้ว
1. เลือก A (อนุมัติ)
2. เพิ่ม `POST /auth/google` เป็น optional (ถ้าเพื่อนไม่ทำ ก็ตัดออกได้)
3. เก็บประวัติควิซทุกรอบ (`GET /quizzes`)

สถานะ: `backend/openapi.yaml` และ `app/api/{client,repos}.js` เขียนแล้ว แต่ยังไม่ได้ต่อเข้า `app.js`

