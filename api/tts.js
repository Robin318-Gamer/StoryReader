/**
 * Google Cloud Text-to-Speech API Handler
 * Serverless function for Vercel deployment
 */

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text, voice, speed = 1.0 } = req.body;

    // Validation
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Get API key from environment variable
    const apiKey = process.env.GOOGLE_CLOUD_TTS_API_KEY;
    
    if (!apiKey) {
      console.error('GOOGLE_CLOUD_TTS_API_KEY is not configured');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Determine language code from voice
    const voiceName = voice || 'yue-HK-Standard-A';
    const languageCode = voiceName.startsWith('yue') ? 'yue-HK' : 
                        voiceName.startsWith('cmn') ? 'cmn-CN' :
                        voiceName.startsWith('en') ? 'en-US' :
                        voiceName.startsWith('ja') ? 'ja-JP' :
                        voiceName.startsWith('ko') ? 'ko-KR' :
                        voiceName.startsWith('fr') ? 'fr-FR' : 'yue-HK';

    // Call Google Cloud Text-to-Speech API
    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: { text },
          voice: {
            languageCode,
            name: voiceName
          },
          audioConfig: {
            audioEncoding: 'MP3',
            speakingRate: parseFloat(speed)
          }
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('Google TTS API error:', error);
      return res.status(response.status).json({ 
        error: error.error?.message || 'Failed to generate speech' 
      });
    }

    const data = await response.json();
    
    // Return the audio content
    return res.status(200).json({
      audioContent: data.audioContent,
      characterCount: text.length,
      voice: voiceName,
      speed: parseFloat(speed)
    });

  } catch (error) {
    console.error('TTS API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
