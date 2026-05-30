-- ============================================================
-- TutorSpot Admin Setup — Run in Supabase SQL Editor
-- ============================================================

-- 1. Add missing columns to GovPaper if not exists
ALTER TABLE "GovPaper" ADD COLUMN IF NOT EXISTS "status"     TEXT NOT NULL DEFAULT 'ready';
ALTER TABLE "GovPaper" ADD COLUMN IF NOT EXISTS "pdfUrl"     TEXT;
ALTER TABLE "GovPaper" ADD COLUMN IF NOT EXISTS "uploadedBy" TEXT;

-- 2. Create Conversation + DirectMessage tables if not exist
CREATE TABLE IF NOT EXISTS "Conversation" (
  "id"            TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "studentId"     TEXT NOT NULL,
  "tutorId"       TEXT NOT NULL,
  "lastMessage"   TEXT,
  "lastAt"        TIMESTAMP(3),
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE("studentId","tutorId"),
  FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE,
  FOREIGN KEY ("tutorId")   REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "DirectMessage" (
  "id"             TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "conversationId" TEXT NOT NULL,
  "senderId"       TEXT NOT NULL,
  "content"        TEXT NOT NULL DEFAULT '',
  "fileUrl"        TEXT,
  "fileName"       TEXT,
  "fileSize"       INTEGER,
  "mimeType"       TEXT,
  "read"           BOOLEAN NOT NULL DEFAULT false,
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE,
  FOREIGN KEY ("senderId")       REFERENCES "User"("id") ON DELETE CASCADE
);

-- 3. Create admin account (password: Admin@TutorSpot2024)
-- bcrypt hash of 'Admin@TutorSpot2024'
INSERT INTO "User" ("id","email","name","role","passwordHash","emailVerified","updatedAt")
VALUES (
  'admin_tutorlk_001',
  'admin@tutorlk.lk',
  'TutorSpot Admin',
  'ADMIN',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TgxjIlGrJFUFwW4rLXRvvNOBKJYm',
  NOW(),
  NOW()
) ON CONFLICT ("email") DO UPDATE SET role = 'ADMIN';

-- 4. Verify
SELECT id, email, name, role FROM "User" WHERE role = 'ADMIN';
