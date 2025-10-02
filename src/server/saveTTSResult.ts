import { supabase } from '../utils/supabaseClient';

export async function saveTTSResult({ userId, text, voice, speed, audioUrl }: {
  userId: string;
  text: string;
  voice: string;
  speed: number;
  audioUrl: string;
}) {
  console.log('[saveTTSResult] Starting save to database...');
  console.log('[saveTTSResult] User ID:', userId);
  console.log('[saveTTSResult] Text length:', text.length);
  console.log('[saveTTSResult] Voice:', voice);
  console.log('[saveTTSResult] Speed:', speed);
  console.log('[saveTTSResult] Audio URL:', audioUrl);
  
  try {
    const { data, error } = await supabase.from('tts_history').insert([
      {
        user_id: userId,
        text,
        voice,
        speed,
        audio_url: audioUrl,
      },
    ]);
    
    console.log('[saveTTSResult] Insert data:', JSON.stringify(data, null, 2));
    console.log('[saveTTSResult] Insert error:', JSON.stringify(error, null, 2));
    
    if (error) {
      console.error('[saveTTSResult] Insert failed:', error);
      console.error('[saveTTSResult] Error message:', error.message);
      console.error('[saveTTSResult] Error details:', error.details);
      console.error('[saveTTSResult] Error hint:', error.hint);
      throw error;
    }
    
    console.log('[saveTTSResult] Successfully saved to database');
    return data;
  } catch (err) {
    console.error('[saveTTSResult] Exception caught:', err);
    throw err;
  }
}
