// SSML TTS API Endpoint
const STORYREADER_SSML_API_VERSION = '2025-10-02T02:30Z';

import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Log version and timestamp
  const now = new Date().toISOString();
  console.log(`[SSML TTS API] Version: ${STORYREADER_SSML_API_VERSION}, Timestamp: ${now}`);
  console.log('[DEBUG] Environment check:');
  console.log('[DEBUG] - NEXT_PUBLIC_SUPABASE_URL exists:', !!supabaseUrl);
  console.log('[DEBUG] - SUPABASE_SERVICE_ROLE_KEY exists:', !!supabaseServiceKey);
  
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
      console.error('[SSML TTS API] No Authorization header');
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }
    
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    console.log('[SSML TTS API] User from token:', user?.id);
    
    if (authError || !user) {
      console.error('[SSML TTS API] Auth error:', authError);
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }

    const { ssml, voice, speed = 1.0, title } = req.body;
    
    if (!ssml) {
      console.error('[SSML TTS API] No SSML provided');
      return res.status(400).json({ error: 'SSML content is required' });
    }

    // Basic SSML validation
    if (!ssml.trim().startsWith('<speak>') || !ssml.trim().endsWith('</speak>')) {
      console.error('[SSML TTS API] Invalid SSML format');
      return res.status(400).json({ 
        error: 'Invalid SSML: Must be wrapped in <speak> tags',
        hint: 'SSML must start with <speak> and end with </speak>'
      });
    }

    const voiceName = voice || 'yue-HK-Standard-A';
    const speedNum = parseFloat(String(speed));
    const audioTitle = title || 'SSML Audio';

    console.log('[SSML TTS API] Processing SSML:', {
      ssmlLength: ssml.length,
      voice: voiceName,
      speed: speedNum,
      userId: user.id
    });

    // Call Google TTS API with SSML
    const apiKey = process.env.GOOGLE_CLOUD_TTS_API_KEY;
    if (!apiKey) {
      console.error('[SSML TTS API] No Google TTS API key');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const languageCode = voiceName.startsWith('yue') ? 'yue-HK' :
      voiceName.startsWith('cmn') ? 'cmn-CN' :
      voiceName.startsWith('en') ? 'en-US' :
      voiceName.startsWith('ja') ? 'ja-JP' :
      voiceName.startsWith('ko') ? 'ko-KR' :
      voiceName.startsWith('fr') ? 'fr-FR' : 'yue-HK';

    console.log('[SSML TTS API] Calling Google TTS API with SSML...');
    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: { ssml }, // Use ssml instead of text
          voice: { languageCode, name: voiceName },
          audioConfig: { audioEncoding: 'MP3', speakingRate: speedNum }
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('[SSML TTS API] Google TTS API error:', error);
      return res.status(response.status).json({ 
        error: error.error?.message || 'Failed to generate speech from SSML',
        details: error.error?.details || null
      });
    }

    const data = await response.json();
    const audioContent = data.audioContent;
    console.log('[SSML TTS API] ✓ Google TTS API success');

    // Upload audio to Supabase Storage
    const audioBuffer = Buffer.from(audioContent, 'base64');
    console.log('[DEBUG] Audio buffer created, size:', audioBuffer.length, 'bytes');
    
    const fileName = `ssml-audio/${user.id}/${Date.now()}.mp3`;
    console.log('[DEBUG] Target file name:', fileName);
    
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
      return res.status(500).json({ 
        error: 'Failed to upload audio to Supabase Storage', 
        details: uploadError.message || uploadError
      });
    }

    // Get public URL
    console.log('[DEBUG] Getting public URL for file:', fileName);
    const { data: publicUrlData } = supabase.storage.from('audio').getPublicUrl(fileName);
    const audioUrl = publicUrlData?.publicUrl;
    console.log('[DEBUG] Public audio URL:', audioUrl);

    // Save to history (with SSML content)
    let insertError = null;
    if (audioUrl) {
      console.log('[DEBUG] Saving SSML to tts_history table...');
      const insertRes = await supabase.from('tts_history').insert([
        {
          user_id: user.id,
          title: audioTitle,
          text: ssml,
          original_text: null,
          ssml_content: ssml,
          voice: voiceName,
          speed: speedNum,
          audio_url: audioUrl,
          processing_status: 'completed',
        },
      ]);
      insertError = insertRes.error;
      
      if (insertError) {
        console.error('[ERROR] Insert error:', insertError.message);
      } else {
        console.log('[DEBUG] ✓ Successfully saved to history');
      }
    }

    // Return response
    if (audioUrl) {
      return res.status(200).json({
        audioUrl,
        ssmlLength: ssml.length,
        voice: voiceName,
        speed: speedNum,
        insertError: insertError ? insertError.message : undefined,
        version: STORYREADER_SSML_API_VERSION,
        timestamp: now,
      });
    } else {
      return res.status(500).json({ 
        error: 'Failed to generate audio URL after upload', 
        version: STORYREADER_SSML_API_VERSION, 
        timestamp: now 
      });
    }
  } catch (error: any) {
    console.error('[SSML TTS API] Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
}
