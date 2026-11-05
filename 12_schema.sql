-- =====================================================================
-- โครงสร้างฐานข้อมูล: เว็บแอปพลิเคชันคลังคำศัพท์ Flashcard ช่วยจำสอบภาษาอังกฤษ
-- ไฟล์: 12_schema.sql
-- =====================================================================

-- 1. สร้างตารางผู้ใช้งาน (users)
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. สร้างตารางหมวดหมู่คำศัพท์ (categories)
CREATE TABLE IF NOT EXISTS categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. สร้างตารางการ์ดคำศัพท์ (flashcards)
CREATE TABLE IF NOT EXISTS flashcards (
    card_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    category_id INT,
    vocab_word VARCHAR(100) NOT NULL,
    part_of_speech VARCHAR(20),
    meaning_th VARCHAR(255) NOT NULL,
    example_sentence TEXT,
    is_remembered BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_flashcards_user FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE,
    CONSTRAINT fk_flashcards_category FOREIGN KEY (category_id) REFERENCES categories (category_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- ข้อมูลจำลองสำหรับทดสอบ (Mock Data ตามตัวอย่างในระบบ)
-- =====================================================================

-- เพิ่มข้อมูลผู้ใช้งานตัวอย่าง: นายธีรเดช ผกามาด (รหัส 019)
INSERT INTO users (user_id, username, email, password_hash, created_at)
VALUES (1, 'theeradech_019', 'theeradech_019@vec.go.th', '$2b$10$hashedpasswordforexamplepurposeonly123456789', '2026-02-29 09:41:00')
ON DUPLICATE KEY UPDATE username=VALUES(username);

-- เพิ่มหมวดหมู่คำศัพท์ตัวอย่าง
INSERT INTO categories (category_id, category_name) VALUES
(1, 'TOEIC'),
(2, 'IT Vocab'),
(3, 'General English')
ON DUPLICATE KEY UPDATE category_name=VALUES(category_name);

-- เพิ่มข้อมูลการ์ดคำศัพท์ 5 ใบ (จำได้ 2 คำ, ยังจำไม่ได้ 3 คำ อิงตามหน้าจอ Dashboard)
INSERT INTO flashcards (card_id, user_id, category_id, vocab_word, part_of_speech, meaning_th, example_sentence, is_remembered, created_at) VALUES
(1, 1, 1, 'Implement', 'Verb', 'นำไปปฏิบัติ, ดำเนินการ', 'The team will implement the new policy next Monday.', FALSE, '2026-03-01 10:00:00'),
(2, 1, 1, 'Requirement', 'Noun', 'ความต้องการ, เงื่อนไขที่จำเป็น', 'The client outlined new software requirements.', FALSE, '2026-03-01 10:05:00'),
(3, 1, 2, 'Deploy', 'Verb', 'นำระบบไปติดตั้ง/ใช้งานจริง', 'We will deploy the application to cloud servers tonight.', FALSE, '2026-03-01 10:10:00'),
(4, 1, 1, 'Collaborate', 'Verb', 'ร่วมมือทำงานด้วยกัน', 'Different departments need to collaborate closely.', TRUE, '2026-03-01 10:15:00'),
(5, 1, 2, 'Framework', 'Noun', 'กรอบการทำงาน, โครงสร้างหลัก', 'React is a popular frontend framework for web apps.', TRUE, '2026-03-01 10:20:00')
ON DUPLICATE KEY UPDATE vocab_word=VALUES(vocab_word);
