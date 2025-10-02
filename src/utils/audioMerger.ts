/**
 * Audio Merger Utility
 * Merges multiple MP3 audio buffers into a single file
 * 
 * Note: MP3 is one of the few audio formats that can be concatenated directly
 * without re-encoding, making this process efficient.
 */

/**
 * Merge multiple MP3 audio buffers into one
 * @param buffers - Array of Buffer objects containing MP3 audio data
 * @returns Single merged Buffer containing all audio
 */
export function mergeMP3Buffers(buffers: Buffer[]): Buffer {
  console.log('[audioMerger] Merging', buffers.length, 'audio buffers');
  
  if (buffers.length === 0) {
    throw new Error('No audio buffers provided for merging');
  }
  
  if (buffers.length === 1) {
    console.log('[audioMerger] Only one buffer, returning as-is');
    return buffers[0];
  }
  
  // Calculate total size
  const totalSize = buffers.reduce((sum, buf) => sum + buf.length, 0);
  console.log('[audioMerger] Total size after merge:', totalSize, 'bytes');
  
  // Log individual buffer sizes
  buffers.forEach((buf, i) => {
    console.log(`[audioMerger] Buffer ${i + 1}: ${buf.length} bytes`);
  });
  
  // Concatenate all buffers
  const mergedBuffer = Buffer.concat(buffers);
  
  console.log('[audioMerger] ✓ Successfully merged audio into single buffer');
  
  return mergedBuffer;
}

/**
 * Merge multiple base64-encoded MP3 strings into one
 * @param base64Strings - Array of base64-encoded MP3 audio strings
 * @returns Single base64-encoded string containing all audio
 */
export function mergeMP3Base64(base64Strings: string[]): string {
  console.log('[audioMerger] Merging', base64Strings.length, 'base64 audio strings');
  
  if (base64Strings.length === 0) {
    throw new Error('No audio data provided for merging');
  }
  
  if (base64Strings.length === 1) {
    console.log('[audioMerger] Only one audio string, returning as-is');
    return base64Strings[0];
  }
  
  // Convert base64 strings to buffers
  const buffers = base64Strings.map((b64, i) => {
    const buffer = Buffer.from(b64, 'base64');
    console.log(`[audioMerger] Decoded buffer ${i + 1}: ${buffer.length} bytes`);
    return buffer;
  });
  
  // Merge buffers
  const mergedBuffer = mergeMP3Buffers(buffers);
  
  // Convert back to base64
  const mergedBase64 = mergedBuffer.toString('base64');
  console.log('[audioMerger] ✓ Final merged audio size:', mergedBase64.length, 'characters (base64)');
  
  return mergedBase64;
}

/**
 * Estimate the size of merged audio
 * @param bufferSizes - Array of buffer sizes in bytes
 * @returns Estimated total size in bytes
 */
export function estimateMergedSize(bufferSizes: number[]): number {
  return bufferSizes.reduce((sum, size) => sum + size, 0);
}
