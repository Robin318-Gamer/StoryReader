/**
 * Text Chunking Utility for Google TTS API
 * Splits text into chunks that respect the 5000 byte limit
 */

const MAX_BYTES = 4500; // Use 4500 to be safe with the 5000 limit

/**
 * Calculate byte size of a string
 */
export function getByteSize(text: string): number {
  return new TextEncoder().encode(text).length;
}

/**
 * Split text into sentences using common delimiters
 * Supports both English and Chinese punctuation
 */
function splitIntoSentences(text: string): string[] {
  // Split by common sentence delimiters (English and Chinese) while keeping the delimiter
  // This regex captures: . ! ? 。！？followed by optional whitespace
  // Also handles cases where there might be quotes or parentheses after punctuation
  const sentences = text.match(/[^.!?。！？\n]+[.!?。！？]+["'"）】）\]]*[\s\n]*|[^.!?。！？\n]+$/g) || [text];
  return sentences.map(s => s.trim()).filter(s => s.length > 0);
}

/**
 * Split text into chunks that don't exceed MAX_BYTES
 * Tries to respect sentence boundaries
 */
export function chunkText(text: string): string[] {
  const totalBytes = getByteSize(text);
  
  // If text is within limit, return as single chunk
  if (totalBytes <= MAX_BYTES) {
    return [text];
  }
  
  console.log('[textChunker] Text exceeds limit:', totalBytes, 'bytes');
  console.log('[textChunker] Splitting into chunks at sentence boundaries...');
  
  const sentences = splitIntoSentences(text);
  console.log('[textChunker] Found', sentences.length, 'sentences');
  
  const chunks: string[] = [];
  let currentChunk = '';
  let sentencesInChunk = 0;
  
  for (const sentence of sentences) {
    const sentenceBytes = getByteSize(sentence);
    
    // If a single sentence exceeds the limit, we need to split it by words/characters
    if (sentenceBytes > MAX_BYTES) {
      console.log('[textChunker] Warning: Single sentence exceeds limit (' + sentenceBytes + ' bytes), splitting it...');
      
      // Save current chunk if it exists
      if (currentChunk) {
        chunks.push(currentChunk.trim());
        console.log(`[textChunker] Chunk ${chunks.length}: ${sentencesInChunk} sentences, ${getByteSize(currentChunk)} bytes`);
        currentChunk = '';
        sentencesInChunk = 0;
      }
      
      // Split the long sentence into smaller parts
      const parts = splitLongSentence(sentence, MAX_BYTES);
      chunks.push(...parts);
      continue;
    }
    
    // Check if adding this sentence would exceed the limit
    const testChunk = currentChunk + (currentChunk ? ' ' : '') + sentence;
    const testBytes = getByteSize(testChunk);
    
    if (testBytes > MAX_BYTES) {
      // Save current chunk and start a new one (respecting sentence boundary)
      if (currentChunk) {
        chunks.push(currentChunk.trim());
        console.log(`[textChunker] Chunk ${chunks.length}: ${sentencesInChunk} sentences, ${getByteSize(currentChunk)} bytes (next sentence would exceed limit)`);
      }
      currentChunk = sentence;
      sentencesInChunk = 1;
    } else {
      // Add to current chunk
      currentChunk = testChunk;
      sentencesInChunk++;
    }
  }
  
  // Add the last chunk
  if (currentChunk) {
    chunks.push(currentChunk.trim());
    console.log(`[textChunker] Chunk ${chunks.length}: ${sentencesInChunk} sentences, ${getByteSize(currentChunk)} bytes`);
  }
  
  console.log('[textChunker] ✓ Created', chunks.length, 'chunks (respecting sentence boundaries)');
  console.log('[textChunker] Summary:');
  chunks.forEach((chunk, i) => {
    const preview = chunk.length > 50 ? chunk.substring(0, 50) + '...' : chunk;
    console.log(`  Chunk ${i + 1}: ${getByteSize(chunk)} bytes - "${preview}"`);
  });
  
  return chunks;
}

/**
 * Split a very long sentence into smaller parts
 * This is a fallback for sentences that are too long
 */
function splitLongSentence(sentence: string, maxBytes: number): string[] {
  const parts: string[] = [];
  let current = '';
  
  // Split by words or characters
  const words = sentence.split(/(\s+|,|，)/);
  
  for (const word of words) {
    const test = current + word;
    const testBytes = getByteSize(test);
    
    if (testBytes > maxBytes && current) {
      parts.push(current.trim());
      current = word;
    } else {
      current = test;
    }
  }
  
  if (current) {
    parts.push(current.trim());
  }
  
  return parts;
}

/**
 * Get estimated number of chunks for a given text
 */
export function estimateChunks(text: string): number {
  const bytes = getByteSize(text);
  return Math.ceil(bytes / MAX_BYTES);
}
