-- Create table for TTS history
CREATE TABLE IF NOT EXISTS tts_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  voice TEXT NOT NULL,
  speed NUMERIC NOT NULL,
  audio_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_tts_history_user_id ON tts_history(user_id);
CREATE INDEX IF NOT EXISTS idx_tts_history_created_at ON tts_history(created_at DESC);

-- Enable Row Level Security
ALTER TABLE tts_history ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only see their own history
CREATE POLICY "Users can view their own history"
  ON tts_history FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy: Users can insert their own history
CREATE POLICY "Users can insert their own history"
  ON tts_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);
