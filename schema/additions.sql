-- ============================================================
-- TutorSpot — Schema Additions
-- Run this in Supabase SQL Editor
-- ============================================================

-- Conversations table (student <-> tutor)
CREATE TABLE IF NOT EXISTS "Conversation" (
  "id"            TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "studentId"     TEXT NOT NULL,
  "tutorId"       TEXT NOT NULL,
  "lastMessage"   TEXT,
  "lastAt"        TIMESTAMP(3),
  "unreadStudent" INTEGER NOT NULL DEFAULT 0,
  "unreadTutor"   INTEGER NOT NULL DEFAULT 0,
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE("studentId","tutorId"),
  FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE,
  FOREIGN KEY ("tutorId")   REFERENCES "User"("id") ON DELETE CASCADE
);

-- Direct messages
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

-- Add updatedAt defaults if missing
ALTER TABLE "User"            ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "TutorProfile"    ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "StudentProfile"  ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Booking"         ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- Ensure GovPaper has status column
ALTER TABLE "GovPaper" ADD COLUMN IF NOT EXISTS "status"     TEXT NOT NULL DEFAULT 'ready';
ALTER TABLE "GovPaper" ADD COLUMN IF NOT EXISTS "pdfUrl"     TEXT;
ALTER TABLE "GovPaper" ADD COLUMN IF NOT EXISTS "uploadedBy" TEXT;

SELECT 'Schema additions complete ✓' as result;
