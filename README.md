# Friend – แอปท่องศัพท์ (Flashcards)

## โครงสร้างโปรเจกต์
```
index.html            หน้าพอร์ทัลรวมลิงก์
app/                  Frontend (HTML/CSS/JS) – จะ wrap เป็นแอป Android
prototype/            Wireframe / prototype หน้าจอ
backend/              Backend + database (เพื่อนรับผิดชอบ)
  database/           schema.sql, dbml
docs/
  design/             เอกสาร UI/UX, Style guide, ER diagram
  assets/             รูปประกอบ
```

## แผนขึ้น Play Store
1. Backend เสร็จ + deploy HTTPS (ดู `backend/README.md`)
2. แก้ `app/app.js` ให้เรียก API แทนเก็บข้อมูลในเครื่อง
3. Wrap เว็บเป็นแอปด้วย [Capacitor](https://capacitorjs.com) (`npx cap add android`) → สร้าง AAB ใน Android Studio
4. สมัคร Google Play Console (ค่าธรรมเนียมครั้งเดียว \$25), เตรียมไอคอน, screenshot, privacy policy
5. อัปโหลด AAB → ทดสอบ closed testing → ปล่อยจริง

