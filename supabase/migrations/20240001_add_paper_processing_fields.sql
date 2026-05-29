ALTER TABLE "GovPaper"
  ADD COLUMN IF NOT EXISTS "status"     TEXT NOT NULL DEFAULT 'ready',
  ADD COLUMN IF NOT EXISTS "pdfUrl"     TEXT,
  ADD COLUMN IF NOT EXISTS "uploadedBy" TEXT;
CREATE INDEX IF NOT EXISTS "GovPaper_uploadedBy_idx" ON "GovPaper" ("uploadedBy");
