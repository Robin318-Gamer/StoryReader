// Version for deployment verification
const STORYREADER_API_VERSION = '2025-10-02T01:00Z';

import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { chunkText, getByteSize } from '../../src/utils/textChunker';
import { mergeMP3Base64 } from '../../src/utils/audioMerger';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Log version and timestamp for every invocation
  const now = new Date().toISOString();
  console.log(`[StoryReader API] Version: ${STORYREADER_API_VERSION}, Timestamp: ${now}`);
  console.log('[DEBUG] Environment check:');
  console.log('[DEBUG] - NEXT_PUBLIC_SUPABASE_URL exists:', !!supabaseUrl);
  console.log('[DEBUG] - NEXT_PUBLIC_SUPABASE_URL value:', supabaseUrl);
  console.log('[DEBUG] - SUPABASE_SERVICE_ROLE_KEY exists:', !!supabaseServiceKey);
  console.log('[DEBUG] - SUPABASE_SERVICE_ROLE_KEY length:', supabaseServiceKey?.length);
  console.log('[DEBUG] - Supabase client initialized:', !!supabase);
  
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get user from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.error('No Authorization header');
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    console.log('User from token:', user);
    if (authError || !user) {
      console.error('Auth error or no user:', authError);
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }

    const { text, voice, speed = 1.0, title } = req.body;
    if (!text) {
      console.error('No text provided');
      return res.status(400).json({ error: 'Text is required' });
    }

    const voiceName = voice || 'yue-HK-Standard-A';
    const speedNum = parseFloat(String(speed));
    const audioTitle = title || text.slice(0, 50) + '...';

    // Check byte size and chunk if necessary
    const textByteSize = getByteSize(text);
    console.log('[TTS API] Text byte size:', textByteSize);
    
    const shouldChunk = textByteSize > 4500;
    let textChunks: string[] = [];
    
    if (shouldChunk) {
      console.log('[TTS API] Text exceeds 4500 bytes, splitting into chunks...');
      textChunks = chunkText(text);
      console.log('[TTS API] Split into', textChunks.length, 'chunks');
    } else {
      textChunks = [text];
      console.log('[TTS API] Text within limit, processing as single chunk');
    }

    // Check if this exact request already exists in history
    const { data: existingHistory, error: historyError } = await supabase
      .from('tts_history')
      .select('*')
      .eq('user_id', user.id)
      .eq('text', text)
      .eq('voice', voiceName)
      .eq('speed', speedNum)
      .limit(1);
    console.log('Existing history:', existingHistory, 'History error:', historyError);

    if (!historyError && existingHistory && existingHistory.length > 0) {
      // Return existing audio from cache
      console.log('[TTS API] Returning cached audio');
      return res.status(200).json({
        audioUrl: existingHistory[0].audio_url,
        characterCount: text.length,
        voice: voiceName,
        speed: speedNum,
        cached: true,
        chunked: false,
        chunkCount: 1,
        version: STORYREADER_API_VERSION,
        timestamp: now,
      });
    }

    // Call Google TTS API
    const apiKey = process.env.GOOGLE_CLOUD_TTS_API_KEY;
    if (!apiKey) {
      console.error('No Google TTS API key');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const languageCode = voiceName.startsWith('yue') ? 'yue-HK' :
      voiceName.startsWith('cmn') ? 'cmn-CN' :
      voiceName.startsWith('en') ? 'en-US' :
      voiceName.startsWith('ja') ? 'ja-JP' :
      voiceName.startsWith('ko') ? 'ko-KR' :
      voiceName.startsWith('fr') ? 'fr-FR' : 'yue-HK';

    // Process each chunk and collect audio data
    console.log('[TTS API] Processing', textChunks.length, 'chunk(s)...');
    const audioChunks: string[] = [];
    
    for (let i = 0; i < textChunks.length; i++) {
      const chunk = textChunks[i];
      console.log(`[TTS API] Processing chunk ${i + 1}/${textChunks.length} (${getByteSize(chunk)} bytes)...`);
      
      const response = await fetch(
        `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            input: { text: chunk },
            voice: { languageCode, name: voiceName },
            audioConfig: { audioEncoding: 'MP3', speakingRate: speedNum }
          })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        console.error(`[TTS API] Google TTS API error on chunk ${i + 1}:`, error);
        return res.status(response.status).json({ error: error.error?.message || 'Failed to generate speech' });
      }

      const data = await response.json();
      audioChunks.push(data.audioContent);
      console.log(`[TTS API] ✓ Chunk ${i + 1}/${textChunks.length} processed successfully`);
    }

    // Merge audio chunks if there are multiple
    let audioContent: string;
    if (audioChunks.length > 1) {
      console.log('[TTS API] Merging', audioChunks.length, 'audio chunks...');
      audioContent = mergeMP3Base64(audioChunks);
      console.log('[TTS API] ✓ Audio chunks merged successfully');
    } else {
      audioContent = audioChunks[0];
    }

    // Upload audio to Supabase Storage
    const audioBuffer = Buffer.from(audioContent, 'base64');
    console.log('[DEBUG] Audio buffer created, size:', audioBuffer.length, 'bytes');
    
    const fileName = `tts-audio/${user.id}/${Date.now()}.mp3`;
    console.log('[DEBUG] Target file name:', fileName);
    console.log('[DEBUG] User ID:', user.id);
    console.log('[DEBUG] Supabase URL:', supabaseUrl);
    console.log('[DEBUG] Service key exists:', !!supabaseServiceKey);
    console.log('[DEBUG] Service key length:', supabaseServiceKey?.length);
    
    // Check if bucket exists
    console.log('[DEBUG] Checking if audio bucket exists...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    console.log('[DEBUG] Available buckets:', buckets?.map(b => b.name));
    console.log('[DEBUG] Buckets error:', bucketsError);
    
    console.log('[DEBUG] Attempting upload to audio bucket...');
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('audio')
      .upload(fileName, audioBuffer, {
        contentType: 'audio/mp3',
        upsert: false,
      });
    console.log('[DEBUG] Upload result data:', JSON.stringify(uploadData, null, 2));
    console.log('[DEBUG] Upload error:', JSON.stringify(uploadError, null, 2));

    if (uploadError) {
      console.error('[ERROR] Supabase Storage upload failed:', uploadError);
      console.error('[ERROR] Error name:', uploadError.name);
      console.error('[ERROR] Error message:', uploadError.message);
      console.error('[ERROR] Error stack:', uploadError.stack);
      console.error('[ERROR] Full error object:', JSON.stringify(uploadError, null, 2));
      return res.status(500).json({ 
        error: 'Failed to upload audio to Supabase Storage', 
        details: uploadError.message || uploadError,
        errorName: uploadError.name,
        errorCode: (uploadError as any).statusCode || (uploadError as any).code,
        fullError: JSON.stringify(uploadError)
      });
    }

    // Get public URL
    console.log('[DEBUG] Getting public URL for file:', fileName);
    const { data: publicUrlData } = supabase.storage.from('audio').getPublicUrl(fileName);
    const audioUrl = publicUrlData?.publicUrl;
    console.log('[DEBUG] Public audio URL:', audioUrl);
    console.log('[DEBUG] Public URL data:', JSON.stringify(publicUrlData, null, 2));

    // Save to history
    let insertError = null;
    if (audioUrl) {
      console.log('[DEBUG] Saving to tts_history table...');
      console.log('[DEBUG] Insert data:', { user_id: user.id, text: text.substring(0, 50) + '...', voice: voiceName, speed: speedNum, audio_url: audioUrl });
      const insertRes = await supabase.from('tts_history').insert([
        {
          user_id: user.id,
          title: audioTitle,
          text,
          original_text: text,
          ssml_content: null,
          voice: voiceName,
          speed: speedNum,
          audio_url: audioUrl,
          processing_status: 'completed',
        },
      ]);
      insertError = insertRes.error;
      console.log('[DEBUG] Insert result:', JSON.stringify(insertRes, null, 2));
      if (insertError) {
        console.error('[ERROR] Insert error:', JSON.stringify(insertError, null, 2));
        console.error('[ERROR] Insert error message:', insertError.message);
        console.error('[ERROR] Insert error details:', insertError.details);
        console.error('[ERROR] Insert error hint:', insertError.hint);
      } else {
        console.log('[DEBUG] Successfully saved to history');
      }
    } else {
      console.error('[ERROR] No audioUrl to insert - upload may have failed silently');
    }

    // Always return audioUrl if available, even if insert fails
    if (audioUrl) {
      return res.status(200).json({
        audioUrl,
        characterCount: text.length,
        voice: voiceName,
        speed: speedNum,
        cached: false,
        chunked: textChunks.length > 1,
        chunkCount: textChunks.length,
        insertError: insertError ? insertError.message : undefined,
        version: STORYREADER_API_VERSION,
        timestamp: now,
      });
    } else {
      return res.status(500).json({ error: 'Failed to generate audio URL after upload', version: STORYREADER_API_VERSION, timestamp: now });
    }
  } catch (error: any) {
    console.error('TTS API error:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}
