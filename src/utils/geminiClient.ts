/**
 * Google Gemini API Client
 * Generates SSML markup for storytelling using Gemini AI
 */

const GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-2.0-flash'; // Stable model without thinking mode for faster SSML generation

// Input limits for Gemini API
const MAX_INPUT_CHARS = 15000; // ~5000 words, safe limit for Gemini input
const MAX_INPUT_TOKENS_ESTIMATE = 20000; // Estimated token limit

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

/**
 * Split long text into manageable chunks for Gemini API
 * Tries to split at paragraph or sentence boundaries
 */
function splitTextForGemini(text: string): string[] {
  // If text is within limit, return as-is
  if (text.length <= MAX_INPUT_CHARS) {
    return [text];
  }

  console.log('[Gemini] Text exceeds', MAX_INPUT_CHARS, 'characters, splitting...');

  const chunks: string[] = [];
  
  // First try to split by double line breaks (paragraphs)
  const paragraphs = text.split(/\n\n+/);
  let currentChunk = '';

  for (const paragraph of paragraphs) {
    const trimmedParagraph = paragraph.trim();
    if (!trimmedParagraph) continue;

    // If single paragraph is too long, split it by sentences
    if (trimmedParagraph.length > MAX_INPUT_CHARS) {
      // Save current chunk
      if (currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = '';
      }

      // Split long paragraph into sentences
      const sentences = trimmedParagraph.match(/[^.!?。！？]+[.!?。！？]+["'"）】）\]]*[\s\n]*|[^.!?。！？]+$/g) || [trimmedParagraph];
      let sentenceChunk = '';

      for (const sentence of sentences) {
        const testChunk = sentenceChunk + (sentenceChunk ? ' ' : '') + sentence;
        if (testChunk.length > MAX_INPUT_CHARS) {
          if (sentenceChunk) {
            chunks.push(sentenceChunk.trim());
          }
          sentenceChunk = sentence;
        } else {
          sentenceChunk = testChunk;
        }
      }

      if (sentenceChunk) {
        currentChunk = sentenceChunk;
      }
      continue;
    }

    // Try to add paragraph to current chunk
    const testChunk = currentChunk + (currentChunk ? '\n\n' : '') + trimmedParagraph;
    
    if (testChunk.length > MAX_INPUT_CHARS) {
      // Save current chunk and start new one
      if (currentChunk) {
        chunks.push(currentChunk.trim());
      }
      currentChunk = trimmedParagraph;
    } else {
      currentChunk = testChunk;
    }
  }

  // Add final chunk
  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  console.log('[Gemini] Split into', chunks.length, 'chunks');
  chunks.forEach((chunk, i) => {
    console.log(`  Chunk ${i + 1}: ${chunk.length} characters`);
  });

  return chunks;
}

/**
 * Generate SSML for a single chunk of text
 */
async function generateSSMLForChunk(
  text: string, 
  chunkNumber: number, 
  totalChunks: number, 
  voice?: string
): Promise<string> {
  console.log(`[Gemini] Generating SSML for chunk ${chunkNumber}/${totalChunks}...`);

  const language = voice?.startsWith('yue') ? 'Cantonese' :
    voice?.startsWith('cmn') ? 'Mandarin Chinese' :
    voice?.startsWith('en') ? 'English' :
    voice?.startsWith('ja') ? 'Japanese' :
    voice?.startsWith('ko') ? 'Korean' :
    voice?.startsWith('fr') ? 'French' : 'English';

  const prompt = `You are an expert in Google Cloud Text-to-Speech SSML (Speech Synthesis Markup Language). 

Your task: Convert the following ${language} text into SSML markup optimized for engaging storytelling.

${totalChunks > 1 ? `NOTE: This is part ${chunkNumber} of ${totalChunks} in a longer story. Maintain storytelling continuity.` : ''}

Guidelines:
1. DO NOT add opening <speak> or closing </speak> tags (they will be added automatically)
2. Use <s> tags for sentences and <p> tags for paragraphs
3. Add <break time="..."/> for natural pauses (300ms-800ms between sentences, 1s between paragraphs)
4. Use <prosody> to adjust:
   - rate: "slow", "medium", "fast", or percentage (e.g., "90%", "110%")
   - pitch: "low", "medium", "high", or relative (e.g., "+10%", "-5%")
   - volume: "soft", "medium", "loud", or relative (e.g., "+6dB")
5. Use <emphasis level="strong"> for important words or dramatic moments
6. Vary prosody throughout to make it engaging
7. For questions, increase pitch slightly
8. For dramatic moments, slow down rate and add pauses
9. Output ONLY the SSML content (no <speak> wrapper, no explanations)

Text to convert:
"""
${text}
"""

SSML Output (without <speak> wrapper):`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8192,
          candidateCount: 1,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    console.error('[Gemini API] Error:', error);
    throw new Error(`Gemini API error: ${error.error?.message || 'Unknown error'}`);
  }

  const data: any = await response.json();

  // Handle response
  let ssmlChunk: string;
  
  if (data.candidates && data.candidates.length > 0) {
    const candidate = data.candidates[0];
    
    // Check for MAX_TOKENS error
    if (candidate.finishReason === 'MAX_TOKENS' && (!candidate.content.parts || candidate.content.parts.length === 0)) {
      throw new Error('Gemini hit token limit. Try shorter text.');
    }
    
    if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
      ssmlChunk = candidate.content.parts[0].text.trim();
    } else {
      throw new Error('Unexpected response structure from Gemini API');
    }
  } else {
    throw new Error('No SSML generated - no candidates returned');
  }

  // Clean up - remove code blocks and any speak tags
  ssmlChunk = ssmlChunk
    .replace(/```xml\n?/g, '')
    .replace(/```\n?/g, '')
    .replace(/^<speak>\s*/i, '')
    .replace(/\s*<\/speak>$/i, '')
    .trim();

  console.log(`[Gemini] ✓ Chunk ${chunkNumber}/${totalChunks} SSML generated (${ssmlChunk.length} characters)`);
  return ssmlChunk;
}

/**
 * Generate storyteller SSML from plain text using Gemini AI
 * Automatically chunks long text to avoid token limits
 * @param text - Plain text to convert to SSML
 * @param voice - Voice name for context (optional)
 * @returns SSML markup optimized for storytelling
 */
export async function generateStorytellerSSML(text: string, voice?: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('GOOGLE_GEMINI_API_KEY is not configured');
  }

  console.log('[Gemini] Generating storyteller SSML...');
  console.log('[Gemini] Input text length:', text.length, 'characters');

  try {
    // Split text if needed
    const textChunks = splitTextForGemini(text);

    // Generate SSML for each chunk
    const ssmlChunks: string[] = [];
    for (let i = 0; i < textChunks.length; i++) {
      const chunkSSML = await generateSSMLForChunk(textChunks[i], i + 1, textChunks.length, voice);
      ssmlChunks.push(chunkSSML);
    }

    // Merge all SSML chunks with appropriate breaks
    let finalSSML = '<speak>';
    
    for (let i = 0; i < ssmlChunks.length; i++) {
      finalSSML += ssmlChunks[i];
      
      // Add a pause between chunks (except after the last one)
      if (i < ssmlChunks.length - 1) {
        finalSSML += '<break time="1.5s"/>';
      }
    }
    
    finalSSML += '</speak>';

    console.log('[Gemini] ✓ Final SSML generated');
    console.log('[Gemini] ✓ Total chunks:', textChunks.length);
    console.log('[Gemini] ✓ Final SSML length:', finalSSML.length, 'characters');
    
    return finalSSML;
  } catch (error: any) {
    console.error('[Gemini] Error:', error);
    throw new Error(`Failed to generate SSML: ${error.message}`);
  }
}

/**
 * Estimate token count for billing purposes
 * @param text - Input text
 * @returns Estimated token count
 */
export function estimateTokenCount(text: string): number {
  // Rough estimate: ~4 characters per token
  return Math.ceil((text.length + 500) / 4); // +500 for prompt overhead
}
