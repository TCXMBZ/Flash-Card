# Backend (สำหรับเพื่อน)

โฟลเดอร์นี้เป็นของ backend ทั้งหมด เลือก stack ได้เอง (เช่น Node.js/Express, FastAPI, Laravel)

## ของที่มีให้แล้ว
- `database/12_schema.sql` – schema ฐานข้อมูล
- `database/12_database.dbml` – ER diagram (dbml)
- `../docs/design/12_Database_ER_Diagram.md` – อธิบายตาราง

## สิ่งที่ต้องทำ
1. สร้างฐานข้อมูลจาก `12_schema.sql`
2. ทำ REST API (JSON) ให้ตรงกับฟีเจอร์ใน `../app/app.js` ตอนนี้ app เก็บข้อมูลฝั่ง client:
   - Auth: `POST /auth/register`, `POST /auth/login` (JWT)
   - Flashcards: `GET/POST/PUT/DELETE /cards`
   - Quiz / ความคืบหน้า: `POST /quiz/results`, `GET /progress`
   - Profile: `GET/PUT /me`
3. ต้อง deploy บน HTTPS (Play Store/Android ไม่อนุญาต HTTP ธรรมดา)
4. เปิด CORS ตามที่ต้องการ และแจ้ง base URL ให้ฝั่งแอป

## ตกลงกับฝั่งแอป
เขียนสัญญา API ลง `openapi.yaml` ในโฟลเดอร์นี้ก่อนเริ่มเขียนโค้ด

