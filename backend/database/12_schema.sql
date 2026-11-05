-- =====================================================================
-- โครงสร้างฐานข้อมูล: เว็บแอปพลิเคชันคลังคำศัพท์ Flashcard ช่วยจำสอบภาษาอังกฤษ
-- ไฟล์: 12_schema.sql (ปรับปรุงเพิ่มระบบแบบทดสอบ Quizzes & Quiz Answers)
-- =====================================================================

-- 1. สร้างตารางผู้ใช้งาน (users)
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    student_id VARCHAR(20),
    full_name VARCHAR(100),
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

-- 4. สร้างตารางรอบการทำแบบทดสอบ (quizzes)
CREATE TABLE IF NOT EXISTS quizzes (
    quiz_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    category_id INT,
    score INT NOT NULL DEFAULT 0,
    total_questions INT NOT NULL DEFAULT 5,
    tested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_quizzes_user FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE,
    CONSTRAINT fk_quizzes_category FOREIGN KEY (category_id) REFERENCES categories (category_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. สร้างตารางคำตอบแต่ละข้อในแบบทดสอบ (quiz_answers)
CREATE TABLE IF NOT EXISTS quiz_answers (
    answer_id INT AUTO_INCREMENT PRIMARY KEY,
    quiz_id INT NOT NULL,
    card_id INT NOT NULL,
    selected_choice VARCHAR(255) NOT NULL,
    is_correct BOOLEAN NOT NULL,
    CONSTRAINT fk_quiz_answers_quiz FOREIGN KEY (quiz_id) REFERENCES quizzes (quiz_id) ON DELETE CASCADE,
    CONSTRAINT fk_quiz_answers_card FOREIGN KEY (card_id) REFERENCES flashcards (card_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- ข้อมูลจำลองสำหรับทดสอบ (Mock Data ตามตัวอย่างในระบบ)
-- =====================================================================

-- เพิ่มข้อมูลผู้ใช้งานตัวอย่าง: นายธีรเดช ผกามาด (รหัส 019)
INSERT INTO users (user_id, username, email, password_hash, student_id, full_name, created_at)
VALUES (1, 'theeradech_019', 'theeradech_019@vec.go.th', '$2b$10$hashedpasswordforexamplepurposeonly123456789', '019', 'นายธีรเดช ผกามาด', '2026-10-29 09:41:00')
ON DUPLICATE KEY UPDATE username=VALUES(username);

-- เพิ่มหมวดหมู่คำศัพท์ตัวอย่าง
INSERT INTO categories (category_id, category_name) VALUES
(1, 'TOEIC'),
(2, 'IT Vocab'),
(3, 'General English')
ON DUPLICATE KEY UPDATE category_name=VALUES(category_name);

-- เพิ่มข้อมูลการ์ดคำศัพท์ 5 ใบ (จำได้ 2 คำ, ยังจำไม่ได้ 3 คำ อิงตามหน้าจอ Dashboard)
INSERT INTO flashcards (card_id, user_id, category_id, vocab_word, part_of_speech, meaning_th, example_sentence, is_remembered, created_at) VALUES
(1, 1, 1, 'Implement', 'Verb (คำกริยา)', 'นำไปปฏิบัติ, พัฒนาระบบ', 'We need to implement the new security policy.', FALSE, '2026-10-29 10:00:00'),
(2, 1, 1, 'Requirement', 'Noun (คำนาม)', 'ความต้องการ, เงื่อนไขที่จำเป็น', 'The client outlined clear software requirements.', FALSE, '2026-10-29 10:05:00'),
(3, 1, 2, 'Deploy', 'Verb (คำกริยา)', 'นำระบบไปใช้งานจริง', 'The DevOps engineer will deploy the build to production.', FALSE, '2026-10-29 10:10:00'),
(4, 1, 2, 'Agile', 'Adjective (คำคุณศัพท์)', 'ความคล่องตัว, การทำงานแบบปรับตัวเร็ว', 'Our development team follows Agile methodology.', TRUE, '2026-10-29 10:15:00'),
(5, 1, 1, 'Framework', 'Noun (คำนาม)', 'กรอบการทำงาน, โครงสร้างโปรแกรม', 'Bootstrap is a popular frontend framework.', TRUE, '2026-10-29 10:20:00')
ON DUPLICATE KEY UPDATE vocab_word=VALUES(vocab_word);

-- ข้อมูลจำลองรอบการทำแบบทดสอบ (Quiz)
INSERT INTO quizzes (quiz_id, user_id, category_id, score, total_questions, tested_at) VALUES
(1, 1, 1, 4, 5, '2026-11-01 14:30:00')
ON DUPLICATE KEY UPDATE score=VALUES(score);

-- ข้อมูลจำลองประวัติคำตอบแต่ละข้อในรอบการทดสอบ
INSERT INTO quiz_answers (answer_id, quiz_id, card_id, selected_choice, is_correct) VALUES
(1, 1, 1, 'นำไปปฏิบัติ, พัฒนาระบบ', TRUE),
(2, 1, 2, 'ความต้องการ, เงื่อนไขที่จำเป็น', TRUE),
(3, 1, 3, 'นำระบบไปใช้งานจริง', TRUE),
(4, 1, 4, 'กรอบการทำงาน', FALSE),
(5, 1, 5, 'กรอบการทำงาน, โครงสร้างโปรแกรม', TRUE)
ON DUPLICATE KEY UPDATE selected_choice=VALUES(selected_choice);
