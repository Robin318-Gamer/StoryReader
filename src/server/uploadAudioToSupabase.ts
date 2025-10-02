import { supabase } from '../utils/supabaseClient';

export async function uploadAudioToSupabase(userId: string, audioBuffer: Buffer) {
  console.log('[uploadAudioToSupabase] Starting upload...');
  console.log('[uploadAudioToSupabase] User ID:', userId);
  console.log('[uploadAudioToSupabase] Buffer size:', audioBuffer.length, 'bytes');
  
  const fileName = `tts-audio/${userId}/${Date.now()}.mp3`;
  console.log('[uploadAudioToSupabase] Target file name:', fileName);
  
  try {
    const { data, error } = await supabase.storage
      .from('audio')
      .upload(fileName, audioBuffer, {
        contentType: 'audio/mp3',
        upsert: false,
      });
    
    console.log('[uploadAudioToSupabase] Upload data:', JSON.stringify(data, null, 2));
    console.log('[uploadAudioToSupabase] Upload error:', JSON.stringify(error, null, 2));
    
    if (error) {
      console.error('[uploadAudioToSupabase] Upload failed:', error);
      throw error;
    }
    
    // Get public URL
    console.log('[uploadAudioToSupabase] Getting public URL...');
    const { data: publicUrlData } = supabase.storage.from('audio').getPublicUrl(fileName);
    console.log('[uploadAudioToSupabase] Public URL data:', JSON.stringify(publicUrlData, null, 2));
    
    const publicUrl = publicUrlData?.publicUrl;
    console.log('[uploadAudioToSupabase] Final public URL:', publicUrl);
    
    return publicUrl;
  } catch (err) {
    console.error('[uploadAudioToSupabase] Exception caught:', err);
    throw err;
  }
}
