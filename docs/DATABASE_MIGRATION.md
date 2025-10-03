# Database Migration - SSML and Title Support

## Quick Start

Run this SQL in your Supabase SQL Editor:

```sql
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
```

## What This Does

### New Columns

| Column | Type | Purpose | Nullable |
|--------|------|---------|----------|
| `title` | VARCHAR(255) | User-provided title for the audio | Yes |
| `original_text` | TEXT | Original plain text before SSML conversion | Yes |
| `ssml_content` | TEXT | AI-generated SSML markup (null if plain text) | Yes |
| `processing_status` | VARCHAR(50) | Processing status (default: 'completed') | No |

### Data Migration

- Existing records: `original_text` will be populated with current `text` value
- Existing records: `ssml_content` will be NULL (they were plain text)
- Existing records: `title` will be NULL
- Existing records: `processing_status` will be 'completed'

### Indexes Added

1. **idx_processing_status** - Fast filtering by status
2. **idx_user_created** - Fast user history queries sorted by date
3. **idx_title** - Fast title searches

## Verification

After running the migration, verify with:

```sql
-- Check new columns exist
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'tts_history'
AND column_name IN ('title', 'original_text', 'ssml_content', 'processing_status');

-- Check indexes
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'tts_history';

-- Check sample data
SELECT id, title, 
       SUBSTRING(original_text, 1, 50) as original_preview,
       CASE WHEN ssml_content IS NULL THEN 'Plain Text' ELSE 'SSML' END as type,
       processing_status
FROM tts_history
ORDER BY created_at DESC
LIMIT 5;
```

## Rollback

If you need to rollback this migration:

```sql
-- Remove new columns
ALTER TABLE tts_history 
DROP COLUMN IF EXISTS title,
DROP COLUMN IF EXISTS original_text,
DROP COLUMN IF EXISTS ssml_content,
DROP COLUMN IF EXISTS processing_status;

-- Remove indexes
DROP INDEX IF EXISTS idx_processing_status;
DROP INDEX IF EXISTS idx_user_created;
DROP INDEX IF EXISTS idx_title;
```

## Important Notes

1. **Backwards Compatible:** Existing code will continue to work
2. **No Data Loss:** Existing records are preserved
3. **Safe to Run Multiple Times:** Uses `IF NOT EXISTS` and `IF NULL` checks
4. **Production Ready:** Includes proper indexes for performance

## How to Apply

### Option 1: Supabase Dashboard
1. Go to Supabase Dashboard
2. Navigate to SQL Editor
3. Click "New Query"
4. Copy/paste the SQL from above
5. Click "Run"

### Option 2: Supabase CLI
1. Ensure migration file exists: `supabase/migrations/002_add_ssml_and_title_columns.sql`
2. Run: `supabase db push`

### Option 3: Manual Connection
```bash
psql postgresql://[connection-string] -f supabase/migrations/002_add_ssml_and_title_columns.sql
```

---

**File Location:** `supabase/migrations/002_add_ssml_and_title_columns.sql`
