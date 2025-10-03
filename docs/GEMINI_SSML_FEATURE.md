# SSML with Gemini AI Feature - Setup Guide

## Overview
This feature adds AI-powered storytelling capabilities using Google Gemini to automatically generate SSML (Speech Synthesis Markup Language) from plain text, then convert it to natural-sounding speech with Google Text-to-Speech.

## What's New

### 1. **Title Field**
- Users can now provide a custom title for each audio
- Title is displayed in the history list
- Falls back to truncated text if no title provided

### 2. **AI-Powered SSML Generation**
- Checkbox option: "🎭 Apply Story Teller Tone (SSML with AI)"
- Uses Google Gemini to analyze text and add:
  - Natural pauses between sentences
  - Prosody adjustments (pitch, rate, volume)
  - Emphasis on important words
  - Context-aware storytelling enhancements

### 3. **Real-Time Progress Display**
- Live progress bar (0-100%)
- Step-by-step status messages:
  - Analyzing text with Gemini AI...
  - SSML generated successfully!
  - Converting to speech...
  - Uploading audio file...
  - Saving to database...
- Uses Server-Sent Events (SSE) for real-time updates

### 4. **Enhanced History**
- Title column instead of truncated text
- SSML badge indicator for AI-generated content
- Expandable SSML code viewer
- Displays both original text and generated SSML

---

## Database Changes

### Migration Script
Run the migration script to add new columns:

```bash
# File: supabase/migrations/002_add_ssml_and_title_columns.sql
```

**New Columns:**
- `title` - User-provided title (VARCHAR 255)
- `original_text` - Original plain text before SSML (TEXT)
- `ssml_content` - AI-generated SSML markup (TEXT, null if not used)
- `processing_status` - Processing status: 'processing', 'completed', 'failed' (VARCHAR 50)

**To run migration:**
```bash
# Using Supabase CLI
supabase db push

# Or manually in Supabase SQL Editor
# Copy and paste the contents of 002_add_ssml_and_title_columns.sql
```

---

## Environment Setup

### Required API Keys

Add these to your `.env.local` file:

```env
# Existing keys
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GOOGLE_CLOUD_TTS_API_KEY=your_google_tts_api_key

# NEW: Google Gemini API Key
GOOGLE_GEMINI_API_KEY=your_gemini_api_key
```

### How to Get Google Gemini API Key

1. **Go to Google AI Studio**
   - Visit: https://makersuite.google.com/app/apikey
   - Sign in with your Google account

2. **Create API Key**
   - Click "Get API Key"
   - Select your Google Cloud project (or create new one)
   - Click "Create API key"
   - Copy the key (starts with `AIza...`)

3. **Enable Gemini API**
   - Go to: https://console.cloud.google.com/apis/library
   - Search for "Generative Language API"
   - Click "Enable"

4. **Add to Environment**
   ```env
   GOOGLE_GEMINI_API_KEY=AIzaSy...your_actual_key...
   ```

5. **Restart Dev Server**
   ```bash
   npm run dev
   ```

---

## Cost Estimation

### Google Gemini API Pricing
- **Model:** gemini-pro
- **Cost:** ~$0.00025 per request (very cheap!)
- **Input:** ~100-500 tokens per request
- **Output:** ~200-800 tokens (SSML markup)
- **Example:** 100 requests/day = ~$0.025/day = $0.75/month

### Google TTS API Pricing
- **Standard voices:** $4 per 1 million characters
- **Neural voices:** $16 per 1 million characters
- **Example:** 10,000 characters/day = ~$0.16/day (neural) = $4.80/month

**Total estimated cost for moderate use:** ~$5-10/month

---

## How It Works

### User Flow

1. **User enters text** on the home page
2. **Optional:** Enters a custom title
3. **Checks "Apply Story Teller Tone"** checkbox
4. **Clicks "Generate Speech"**

### Backend Processing (Real-Time)

```
Step 1: Authenticate user (5%)
  ↓
Step 2: Call Gemini API (10-35%)
  - Analyze text context and language
  - Generate SSML with natural prosody
  - Add pauses, emphasis, pitch variations
  ↓
Step 3: Call Google TTS API (35-75%)
  - Convert SSML to audio (MP3)
  - Handle chunking if text is long
  - Merge audio chunks if needed
  ↓
Step 4: Upload to Supabase Storage (75-90%)
  - Save MP3 file
  - Generate public URL
  ↓
Step 5: Save to database (90-100%)
  - Store title, original_text, ssml_content
  - Link to audio URL
  ↓
Complete! Audio ready to play
```

### Frontend Updates

As the backend processes each step, the frontend receives real-time updates via Server-Sent Events:

- Progress bar animates from 0% to 100%
- Status message updates in real-time
- User sees exactly what's happening

---

## Files Changed

### New Files
- `src/utils/geminiClient.ts` - Gemini API client
- `pages/api/tts-with-gemini-stream.ts` - SSE-based TTS endpoint with Gemini
- `supabase/migrations/002_add_ssml_and_title_columns.sql` - Database migration

### Modified Files
- `pages/index.tsx` - Added title input, SSML checkbox, progress UI
- `pages/history.tsx` - Display title, SSML badge, expandable SSML viewer
- `pages/api/tts.ts` - Save title and original_text
- `pages/api/tts-ssml.ts` - Save title and ssml_content

---

## Testing

### 1. Run Database Migration
```bash
cd supabase
supabase db push
# Or run SQL manually in Supabase dashboard
```

### 2. Add Gemini API Key
```env
GOOGLE_GEMINI_API_KEY=AIza...your_key...
```

### 3. Start Dev Server
```bash
npm run dev
```

### 4. Test SSML Feature
1. Go to http://localhost:3000
2. Enter some text (story, narration, etc.)
3. Add a title
4. Check "Apply Story Teller Tone"
5. Click "Generate Speech"
6. Watch real-time progress
7. Listen to audio with AI-enhanced prosody

### 5. Check History
1. Go to http://localhost:3000/history
2. See your title in the list
3. Click on item to see full details
4. Expand SSML code viewer to see generated markup

---

## Troubleshooting

### Error: "GOOGLE_GEMINI_API_KEY is not configured"
**Solution:** Add the API key to `.env.local` and restart server

### Error: "Gemini API error: 400"
**Solution:** Check that Generative Language API is enabled in Google Cloud Console

### Error: "Failed to generate SSML"
**Solution:** 
- Check API key is valid
- Verify billing is enabled in Google Cloud
- Check API quotas

### Progress bar stuck at 0%
**Solution:**
- Check browser console for errors
- Verify SSE connection is working
- Try regular mode (uncheck SSML) to isolate issue

### No SSML badge showing in history
**Solution:**
- Migration might not be applied
- Run migration script
- Check that `ssml_content` column exists

---

## Production Deployment

### Vercel Deployment

1. **Add Environment Variables**
   - Go to Vercel dashboard
   - Project Settings → Environment Variables
   - Add `GOOGLE_GEMINI_API_KEY`

2. **Verify Timeout Settings**
   - Free tier: 10 second timeout
   - Pro tier: 30 second timeout
   - If processing takes longer, consider upgrading

3. **Deploy**
   ```bash
   git push origin main
   # Vercel auto-deploys
   ```

4. **Run Migration on Production**
   - Go to Supabase dashboard (production)
   - SQL Editor
   - Run migration script

---

## Future Enhancements

- [ ] Allow users to edit SSML before generating
- [ ] Preview SSML in real-time
- [ ] More AI prompts (casual, dramatic, news anchor, etc.)
- [ ] Background processing for very long texts
- [ ] Caching Gemini-generated SSML for reuse
- [ ] Batch processing multiple texts

---

## Support

For issues or questions:
1. Check console logs (browser & server)
2. Verify API keys are correct
3. Check Supabase logs
4. Review this documentation

---

**Last Updated:** October 2, 2025
**Version:** 1.0.0
