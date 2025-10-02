import { supabase } from '../utils/supabaseClient';

export async function uploadAudioToSupabase(userId: string, audioBuffer: Buffer) {
  const fileName = `tts-audio/${userId}/${Date.now()}.mp3`;
  const { data, error } = await supabase.storage
    .from('audio')
    .upload(fileName, audioBuffer, {
      contentType: 'audio/mp3',
      upsert: false,
    });
  if (error) throw error;
  // Get public URL
  const { data: publicUrlData } = supabase.storage.from('audio').getPublicUrl(fileName);
  return publicUrlData?.publicUrl;
}
