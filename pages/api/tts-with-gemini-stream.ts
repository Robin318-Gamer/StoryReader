// TTS with Gemini SSML Generation - Server-Sent Events for Real-Time Progress
const STORYREADER_GEMINI_API_VERSION = '2025-10-02T10:00Z';

import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { generateStorytellerSSML } from '../../src/utils/geminiClient';
import { chunkText, getByteSize } from '../../src/utils/textChunker';
import { mergeMP3Base64 } from '../../src/utils/audioMerger';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const now = new Date().toISOString();
  console.log(`[Gemini TTS API] Version: ${STORYREADER_GEMINI_API_VERSION}, Timestamp: ${now}`);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Set up Server-Sent Events
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const sendProgress = (progress: number, message: string, data?: any) => {
    res.write(`data: ${JSON.stringify({ progress, message, ...data })}\n\n`);
  };

  try {
    // Authenticate user
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      sendProgress(0, 'Error: No authorization provided', { error: true });
      res.end();
      return;
    }

    sendProgress(5, 'Authenticating...');
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      sendProgress(0, 'Error: Authentication failed', { error: true });
      res.end();
      return;
    }

    const { text, voice, speed = 1.0, useSSML = false, title } = req.body;

    if (!text) {
      sendProgress(0, 'Error: Text is required', { error: true });
      res.end();
      return;
    }

    const voiceName = voice || 'yue-HK-Standard-A';
    const speedNum = parseFloat(String(speed));
    const audioTitle = title || text.slice(0, 50) + '...';

    console.log('[Gemini TTS API] Request:', { 
      useSSML, 
      textLength: text.length, 
      voice: voiceName,
      title: audioTitle 
    });

    let ssmlContent: string | null = null;
    let finalContent = text;

    // Step 1: Generate SSML if requested
    if (useSSML) {
      sendProgress(10, 'Analyzing text with Gemini AI...');
      console.log('[Gemini TTS API] Calling Gemini to generate SSML...');
      
      try {
        ssmlContent = await generateStorytellerSSML(text, voiceName);
        finalContent = ssmlContent;
        
        sendProgress(35, 'SSML generated successfully!', { ssmlLength: ssmlContent.length });
        console.log('[Gemini TTS API] SSML generated, length:', ssmlContent.length);
      } catch (geminiError: any) {
        console.error('[Gemini TTS API] Gemini error:', geminiError);
        sendProgress(0, `Error: Failed to generate SSML - ${geminiError.message}`, { error: true });
        res.end();
        return;
      }
    } else {
      sendProgress(35, 'Skipping SSML generation...');
    }

    // Step 2: Check byte size and chunk if necessary
    sendProgress(40, 'Preparing audio conversion...');
    const contentByteSize = getByteSize(finalContent);
    console.log('[Gemini TTS API] Content byte size:', contentByteSize);

    const shouldChunk = contentByteSize > 4500;
    let contentChunks: string[] = [];

    if (shouldChunk) {
      console.log('[Gemini TTS API] Content exceeds 4500 bytes, splitting into chunks...');
      contentChunks = chunkText(finalContent);
      sendProgress(45, `Text split into ${contentChunks.length} chunks...`);
    } else {
      contentChunks = [finalContent];
    }

    // Step 3: Call Google TTS API
    const apiKey = process.env.GOOGLE_CLOUD_TTS_API_KEY;
    if (!apiKey) {
      sendProgress(0, 'Error: Server configuration error', { error: true });
      res.end();
      return;
    }

    const languageCode = voiceName.startsWith('yue') ? 'yue-HK' :
      voiceName.startsWith('cmn') ? 'cmn-CN' :
      voiceName.startsWith('en') ? 'en-US' :
      voiceName.startsWith('ja') ? 'ja-JP' :
      voiceName.startsWith('ko') ? 'ko-KR' :
      voiceName.startsWith('fr') ? 'fr-FR' : 'yue-HK';

    sendProgress(50, `Converting to speech (${contentChunks.length} chunk(s))...`);
    const audioChunks: string[] = [];

    for (let i = 0; i < contentChunks.length; i++) {
      const chunk = contentChunks[i];
      const chunkProgress = 50 + Math.floor((i / contentChunks.length) * 25);
      sendProgress(chunkProgress, `Processing audio chunk ${i + 1}/${contentChunks.length}...`);

      const requestBody = useSSML ? 
        { input: { ssml: chunk }, voice: { languageCode, name: voiceName }, audioConfig: { audioEncoding: 'MP3', speakingRate: speedNum } } :
        { input: { text: chunk }, voice: { languageCode, name: voiceName }, audioConfig: { audioEncoding: 'MP3', speakingRate: speedNum } };

      const response = await fetch(
        `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        }
      );

      if (!response.ok) {
        const error = await response.json();
        console.error(`[Gemini TTS API] Google TTS error on chunk ${i + 1}:`, error);
        sendProgress(0, `Error: Failed to generate speech - ${error.error?.message}`, { error: true });
        res.end();
        return;
      }

      const data = await response.json();
      audioChunks.push(data.audioContent);
    }

    sendProgress(75, 'Audio generated, merging chunks...');

    // Merge audio chunks if needed
    let audioContent: string;
    if (audioChunks.length > 1) {
      audioContent = mergeMP3Base64(audioChunks);
      console.log('[Gemini TTS API] Audio chunks merged');
    } else {
      audioContent = audioChunks[0];
    }

    // Step 4: Upload to Supabase
    sendProgress(80, 'Uploading audio file...');
    const audioBuffer = Buffer.from(audioContent, 'base64');
    const fileName = `tts-audio/${user.id}/${Date.now()}.mp3`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('audio')
      .upload(fileName, audioBuffer, {
        contentType: 'audio/mp3',
        upsert: false,
      });

    if (uploadError) {
      console.error('[Gemini TTS API] Upload error:', uploadError);
      sendProgress(0, 'Error: Failed to upload audio', { error: true });
      res.end();
      return;
    }

    const { data: publicUrlData } = supabase.storage.from('audio').getPublicUrl(fileName);
    const audioUrl = publicUrlData?.publicUrl;

    sendProgress(90, 'Saving to database...');

    // Step 5: Save to history with new fields
    if (audioUrl) {
      const insertRes = await supabase.from('tts_history').insert([
        {
          user_id: user.id,
          title: audioTitle,
          text: finalContent, // Store final content (SSML or plain)
          original_text: text, // Always store original plain text
          ssml_content: ssmlContent, // Store generated SSML (null if not used)
          voice: voiceName,
          speed: speedNum,
          audio_url: audioUrl,
          processing_status: 'completed',
        },
      ]);

      if (insertRes.error) {
        console.error('[Gemini TTS API] Insert error:', insertRes.error);
      }
    }

    // Step 6: Complete
    sendProgress(100, 'Complete!', {
      audioUrl,
      title: audioTitle,
      useSSML,
      ssmlGenerated: !!ssmlContent,
      chunked: contentChunks.length > 1,
      chunkCount: contentChunks.length,
      version: STORYREADER_GEMINI_API_VERSION,
    });

    res.end();
  } catch (error: any) {
    console.error('[Gemini TTS API] Error:', error);
    sendProgress(0, `Error: ${error.message}`, { error: true });
    res.end();
  }
}
