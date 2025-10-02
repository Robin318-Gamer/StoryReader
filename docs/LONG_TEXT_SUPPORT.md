# Long Text Support - Implementation Guide

## 🎯 Overview

This document describes the implementation of automatic text chunking and audio merging to handle texts that exceed Google TTS API's 5000-byte limit.

## ✨ Features Implemented

### 1. **Character Counter** ✅
- Shows real-time character count and byte size
- Visual warning when approaching 5000-byte limit (turns orange at 4000+ bytes)
- Visual alert when exceeding limit (turns red at 5000+ bytes)
- Displays estimated number of chunks that will be created

### 2. **Intelligent Text Chunking** ✅
- Automatically splits text over 4500 bytes (safe margin below 5000 limit)
- **Respects sentence boundaries** - cuts after periods (.), exclamation marks (!), question marks (?), and Chinese equivalents (。！？)
- Handles both English and Chinese punctuation
- Falls back to word-level splitting if a single sentence is too long
- Comprehensive logging shows exactly where text was split

### 3. **Audio Merging** ✅
- Processes each chunk through Google TTS API sequentially
- Merges multiple MP3 audio files into a single seamless audio file
- Direct buffer concatenation (MP3 format supports this natively)
- Single audio file uploaded to Supabase
- Single playback experience for users

### 4. **Enhanced API Processing** ✅
- Automatic chunk detection and processing
- Sequential Google TTS API calls for each chunk
- Audio merging before Supabase upload
- Response includes chunking metadata
- Detailed server-side logging for debugging

### 5. **User Feedback** ✅
- Shows processing status with chunk count
- Success message indicates if text was chunked
- Warning banner when text will be split
- All processing happens transparently

## 📁 Files Created/Modified

### New Files

1. **`/src/utils/textChunker.ts`** - Text chunking utility
   - `getByteSize(text)` - Calculate byte size of text
   - `chunkText(text)` - Split text into chunks respecting sentences
   - `splitIntoSentences(text)` - Split by sentence delimiters
   - `estimateChunks(text)` - Estimate number of chunks needed

2. **`/src/utils/audioMerger.ts`** - Audio merging utility
   - `mergeMP3Buffers(buffers)` - Merge Buffer arrays
   - `mergeMP3Base64(base64Strings)` - Merge base64-encoded audio
   - `estimateMergedSize(bufferSizes)` - Estimate merged file size

### Modified Files

1. **`/pages/api/tts.ts`** - API endpoint
   - Added imports for chunking and merging utilities
   - Automatic text chunking before TTS processing
   - Sequential chunk processing with Google TTS API
   - Audio merging before upload
   - Enhanced response with chunking metadata

2. **`/pages/index.tsx`** - Frontend UI
   - Added character/byte counter with visual indicators
   - Warning banner for texts that will be chunked
   - Enhanced success messages showing chunk count
   - Color-coded text input border based on size

## 🔧 How It Works

### Text Chunking Process

```
1. Check if text exceeds 4500 bytes
   ↓
2. If yes, split into sentences using regex:
   - English: . ! ?
   - Chinese: 。！？
   ↓
3. Group sentences into chunks:
   - Start with empty chunk
   - Add sentences one by one
   - If adding next sentence exceeds limit, save current chunk and start new one
   ↓
4. Handle edge case: if single sentence is too long
   - Split by words or characters
   - Create multiple chunks
   ↓
5. Return array of text chunks (each < 4500 bytes)
```

### Audio Processing Flow

```
User submits long text (e.g., 12,000 bytes)
   ↓
Frontend shows: "Will be split into 3 chunks"
   ↓
API receives text
   ↓
Text chunker splits into 3 parts (at sentence boundaries)
   ↓
Process chunk 1 → Google TTS → audio1.mp3 (base64)
   ↓
Process chunk 2 → Google TTS → audio2.mp3 (base64)
   ↓
Process chunk 3 → Google TTS → audio3.mp3 (base64)
   ↓
Merge audio1 + audio2 + audio3 → finalAudio.mp3 (base64)
   ↓
Upload finalAudio.mp3 to Supabase
   ↓
Save to history with full original text
   ↓
Return audioUrl to frontend
   ↓
User plays seamless merged audio
```

## 📊 Example Scenarios

### Scenario 1: Short Text (Under 5000 bytes)
```
Input: "內地國慶黃金周..." (500 bytes)
Process: Single API call, no chunking
Result: One audio file, instant generation
```

### Scenario 2: Long Text (Over 5000 bytes)
```
Input: Long article (8,500 bytes)
Text Splitter: Finds sentence boundaries
  Chunk 1: First 4 sentences (4,200 bytes)
  Chunk 2: Next 3 sentences (4,300 bytes)
  
Google TTS: 
  Call 1 → audio1.mp3
  Call 2 → audio2.mp3
  
Audio Merger: audio1 + audio2 = finalAudio.mp3
Supabase: Upload finalAudio.mp3
User: Hears seamless audio of entire article
```

### Scenario 3: Very Long Text (15,000 bytes)
```
Input: Long story (15,000 bytes)
Chunks: 4 chunks (respecting sentence boundaries)
Processing: 4 sequential Google TTS calls
Merging: 4 audio files merged into 1
Result: Single seamless audio file for entire story
Status: "✅ Speech generated successfully! (Processed 4 chunks and merged)"
```

## 🎨 UI Features

### Character Counter Display

```
Normal (< 4000 bytes): Gray color
┌──────────────────────────────────┐
│ Text to Convert  150 characters | 450 bytes │
└──────────────────────────────────┘

Warning (4000-4999 bytes): Orange color
┌──────────────────────────────────┐
│ Text to Convert  1200 characters | 4200 bytes (⚠️ Approaching 5000 byte limit) │
└──────────────────────────────────┘

Over Limit (5000+ bytes): Red color
┌──────────────────────────────────┐
│ Text to Convert  2500 characters | 7500 bytes (⚠️ Will be split into chunks) │
│                                    │
│ [Warning Banner]                  │
│ ℹ️ Your text exceeds 5000 bytes. │
│ It will be automatically split    │
│ into 2 chunks and merged into a   │
│ single audio file.                │
└──────────────────────────────────┘
```

### Status Messages

```
Single chunk: "✅ Speech generated successfully!"
Multiple chunks: "✅ Speech generated successfully! (Processed 3 chunks and merged)"
From cache: "✅ Speech retrieved from cache!"
```

## 🐛 Debugging

### Server Logs to Monitor

```bash
# Text chunking
[textChunker] Text exceeds limit: 8500 bytes
[textChunker] Splitting into chunks at sentence boundaries...
[textChunker] Found 12 sentences
[textChunker] Chunk 1: 6 sentences, 4200 bytes (next sentence would exceed limit)
[textChunker] Chunk 2: 6 sentences, 4300 bytes
[textChunker] ✓ Created 2 chunks (respecting sentence boundaries)

# TTS processing
[TTS API] Processing 2 chunk(s)...
[TTS API] Processing chunk 1/2 (4200 bytes)...
[TTS API] ✓ Chunk 1/2 processed successfully
[TTS API] Processing chunk 2/2 (4300 bytes)...
[TTS API] ✓ Chunk 2/2 processed successfully

# Audio merging
[audioMerger] Merging 2 audio chunks
[audioMerger] Buffer 1: 125344 bytes
[audioMerger] Buffer 2: 128256 bytes
[audioMerger] ✓ Successfully merged audio into single buffer
[TTS API] ✓ Audio chunks merged successfully
```

## ⚠️ Important Notes

### Why 4500 bytes instead of 5000?
- Google's limit is 5000 bytes
- We use 4500 as a safety margin
- UTF-8 encoding can vary in byte size
- Better to be conservative and avoid errors

### Why chunk at sentence boundaries?
- More natural audio transitions
- Better listening experience
- Avoids cutting words mid-sentence
- Respects punctuation and pacing

### Why MP3 format?
- MP3 files can be concatenated directly
- No need for re-encoding or transcoding
- Efficient and fast merging
- Native format supported by Google TTS

## 🚀 Testing

### Test Case 1: Copy-paste long article
1. Copy an article > 5000 bytes
2. Paste into text box
3. Verify warning banner appears
4. Click "Generate Speech"
5. Verify status shows chunk count
6. Verify audio plays seamlessly

### Test Case 2: Gradual typing
1. Type text slowly
2. Watch character counter update in real-time
3. Watch color change from gray → orange → red
4. Verify warning banner appears at 5000+ bytes

### Test Case 3: Chinese text
1. Use Chinese text with 。！？punctuation
2. Verify chunking respects Chinese sentence boundaries
3. Verify audio sounds natural at chunk boundaries

## 📈 Performance Considerations

- **Sequential Processing**: Chunks are processed one at a time (not parallel) to avoid rate limits
- **Memory Efficient**: Audio chunks are merged in memory before upload
- **Single Upload**: Only one file uploaded to Supabase regardless of chunk count
- **Single History Entry**: Original full text saved, not individual chunks

## 🎉 Benefits

✅ **No user action required** - automatic chunking
✅ **Transparent processing** - user sees clear feedback  
✅ **Seamless audio** - single playback experience
✅ **Smart splitting** - respects sentence boundaries
✅ **Full text preserved** - original text saved in history
✅ **Efficient storage** - single merged audio file
✅ **Better UX** - clear warnings and status updates

## 🔮 Future Enhancements (Optional)

- [ ] Parallel chunk processing (with rate limit handling)
- [ ] Progress bar showing current chunk being processed
- [ ] Pause/resume for very long texts
- [ ] Preview of how text will be chunked before generation
- [ ] Streaming audio (play chunks as they're generated)
- [ ] Custom chunk size configuration
- [ ] Support for other audio formats (WAV, OGG)
