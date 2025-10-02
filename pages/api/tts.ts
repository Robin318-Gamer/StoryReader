// Version for deployment verification
const STORYREADER_API_VERSION = '2025-10-02T01:00Z';

import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Log version and timestamp for every invocation
  const now = new Date().toISOString();
  console.log(`[StoryReader API] Version: ${STORYREADER_API_VERSION}, Timestamp: ${now}`);
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

    const { text, voice, speed = 1.0 } = req.body;
    if (!text) {
      console.error('No text provided');
      return res.status(400).json({ error: 'Text is required' });
    }

    const voiceName = voice || 'yue-HK-Standard-A';
    const speedNum = parseFloat(String(speed));

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
      return res.status(200).json({
        audioUrl: existingHistory[0].audio_url,
        characterCount: text.length,
        voice: voiceName,
        speed: speedNum,
        cached: true,
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

    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: { text },
          voice: { languageCode, name: voiceName },
          audioConfig: { audioEncoding: 'MP3', speakingRate: speedNum }
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('Google TTS API error:', error);
      return res.status(response.status).json({ error: error.error?.message || 'Failed to generate speech' });
    }

    const data = await response.json();
    const audioContent = data.audioContent;

    // Upload audio to Supabase Storage
    const audioBuffer = Buffer.from(audioContent, 'base64');
    const fileName = `tts-audio/${user.id}/${Date.now()}.mp3`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('audio')
      .upload(fileName, audioBuffer, {
        contentType: 'audio/mp3',
        upsert: false,
      });
    console.log('Upload result:', uploadData, 'Upload error:', uploadError);

    if (uploadError) {
      console.error('Supabase Storage upload failed:', uploadError.message || uploadError);
      return res.status(500).json({ error: 'Failed to upload audio to Supabase Storage', details: uploadError.message || uploadError });
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage.from('audio').getPublicUrl(fileName);
    const audioUrl = publicUrlData?.publicUrl;
    console.log('Public audio URL:', audioUrl);

    // Save to history
    let insertError = null;
    if (audioUrl) {
      const insertRes = await supabase.from('tts_history').insert([
        {
          user_id: user.id,
          text,
          voice: voiceName,
          speed: speedNum,
          audio_url: audioUrl,
        },
      ]);
      insertError = insertRes.error;
      console.log('Insert result:', insertRes);
      if (insertError) {
        console.error('Insert error:', insertError);
      }
    } else {
      console.error('No audioUrl to insert');
    }

    // Always return audioUrl if available, even if insert fails
    if (audioUrl) {
      return res.status(200).json({
        audioUrl,
        characterCount: text.length,
        voice: voiceName,
        speed: speedNum,
        cached: false,
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
