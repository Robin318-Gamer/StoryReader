-- Migration: Add SSML support and title to tts_history table
-- Created: 2025-10-02
-- Description: Adds columns for title, original text, SSML content, and processing status

-- Add new columns to tts_history table
ALTER TABLE tts_history 
ADD COLUMN IF NOT EXISTS title VARCHAR(255),
ADD COLUMN IF NOT EXISTS original_text TEXT,
ADD COLUMN IF NOT EXISTS ssml_content TEXT,
ADD COLUMN IF NOT EXISTS processing_status VARCHAR(50) DEFAULT 'completed';

-- Update existing records to set original_text = text for backwards compatibility
UPDATE tts_history 
SET original_text = text 
WHERE original_text IS NULL;

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_processing_status ON tts_history(processing_status);
CREATE INDEX IF NOT EXISTS idx_user_created ON tts_history(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_title ON tts_history(title);

-- Add comments for documentation
COMMENT ON COLUMN tts_history.title IS 'User-provided title for the audio';
COMMENT ON COLUMN tts_history.original_text IS 'Original plain text before SSML conversion';
COMMENT ON COLUMN tts_history.ssml_content IS 'Generated SSML markup (null if not using SSML)';
COMMENT ON COLUMN tts_history.processing_status IS 'Status: processing, completed, failed';
