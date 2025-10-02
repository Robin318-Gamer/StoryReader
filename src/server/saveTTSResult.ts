import { supabase } from '../utils/supabaseClient';

export async function saveTTSResult({ userId, text, voice, speed, audioUrl }: {
  userId: string;
  text: string;
  voice: string;
  speed: number;
  audioUrl: string;
}) {
  const { data, error } = await supabase.from('tts_history').insert([
    {
      user_id: userId,
      text,
      voice,
      speed,
      audio_url: audioUrl,
    },
  ]);
  if (error) throw error;
  return data;
}
