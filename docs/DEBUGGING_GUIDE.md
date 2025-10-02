# Debugging Guide - Audio Upload Issues

## Overview
This document outlines the debugging improvements added to identify issues with audio file uploads to Supabase Storage.

## Changes Made

### 1. Enhanced API Endpoint Debugging (`/pages/api/tts.ts`)

Added comprehensive logging for:
- **Environment Variables**: Check if Supabase URL and service key are properly set
- **Bucket Information**: List all available storage buckets
- **Upload Process**: Detailed logging of audio buffer creation and upload attempts
- **Error Details**: Full error object serialization including error codes, messages, and stack traces
- **Public URL Generation**: Verification that public URLs are generated correctly
- **Database Insert**: Detailed logging of history table insert operations

### 2. Frontend Debugging (`/pages/index.tsx`)

Added client-side logging for:
- TTS generation requests
- Response status and data
- Error handling and display
- Warning messages for partial failures (audio generated but history not saved)

### 3. Helper Function Debugging

#### `uploadAudioToSupabase.ts`
- Buffer size logging
- Upload result tracking
- Public URL generation verification
- Exception handling with detailed logs

#### `saveTTSResult.ts`
- Database insert operation logging
- Error details including message, details, and hints
- Success confirmation

### 4. Storage Test Script (`test-supabase-storage.js`)

A standalone test script that verifies:
1. Environment variables are properly configured
2. Supabase bucket access works
3. Audio bucket exists and is accessible
4. File upload functionality works
5. Public URL generation works
6. File download capability
7. File deletion (cleanup) works

## How to Use the Debugging Tools

### Step 1: Run the Storage Test Script

```bash
npm install dotenv @supabase/supabase-js
node test-supabase-storage.js
```

This will verify your Supabase Storage configuration is correct.

### Step 2: Monitor Server Logs

When testing the application:
1. Open the Vercel deployment logs or local development console
2. Trigger a TTS generation from the UI
3. Look for logs with these prefixes:
   - `[DEBUG]` - General debugging information
   - `[ERROR]` - Error conditions
   - `[StoryReader API]` - API version and timestamp
   - `[uploadAudioToSupabase]` - Storage upload operations
   - `[saveTTSResult]` - Database operations

### Step 3: Monitor Browser Console

Open browser DevTools (F12) and check the Console tab for:
- `[Frontend]` prefixed logs showing client-side operations
- Network requests to `/api/tts`
- Response data and error messages

## Common Issues to Look For

### 1. Missing Environment Variables
**Symptoms**: 
- "Server configuration error" messages
- Logs show `SUPABASE_SERVICE_ROLE_KEY exists: false`

**Solution**: 
- Check `.env.local` file has all required variables
- Verify Vercel environment variables are set correctly

### 2. Storage Bucket Not Created
**Symptoms**:
- `[DEBUG] Available buckets:` doesn't include "audio"
- Upload errors mentioning bucket not found

**Solution**:
- Create "audio" bucket in Supabase Storage dashboard
- Set appropriate permissions (public for public URLs)

### 3. Permission Issues
**Symptoms**:
- Upload errors with 403 status codes
- "Insufficient permissions" messages

**Solution**:
- Check RLS (Row Level Security) policies on storage bucket
- Verify service role key has admin permissions
- Check bucket policies allow uploads

### 4. File Path Issues
**Symptoms**:
- Upload succeeds but public URL doesn't work
- Files appear in wrong location

**Solution**:
- Check file path format: `tts-audio/${userId}/${timestamp}.mp3`
- Verify folder structure in Supabase Storage dashboard

### 5. Database Insert Failures
**Symptoms**:
- Audio generated and uploaded but not in history
- Warning: "History not saved" appears

**Solution**:
- Check `tts_history` table exists
- Verify RLS policies allow inserts
- Check foreign key constraints (user_id must exist in auth.users)

## Debug Log Examples

### Successful Upload
```
[DEBUG] Audio buffer created, size: 156384 bytes
[DEBUG] Target file name: tts-audio/abc123/1696234567890.mp3
[DEBUG] User ID: abc123
[DEBUG] Available buckets: ["audio", "avatars"]
[DEBUG] Attempting upload to audio bucket...
[DEBUG] Upload result data: { "path": "tts-audio/abc123/1696234567890.mp3" }
[DEBUG] Upload error: null
[DEBUG] Public audio URL: https://xxx.supabase.co/storage/v1/object/public/audio/tts-audio/abc123/1696234567890.mp3
[DEBUG] Successfully saved to history
```

### Failed Upload
```
[DEBUG] Audio buffer created, size: 156384 bytes
[DEBUG] Available buckets: ["avatars"]
[ERROR] Supabase Storage upload failed: { "statusCode": 404, "error": "Not Found" }
[ERROR] Error message: Bucket not found
```

## Next Steps

After adding debugging:
1. Test the application
2. Review all logs carefully
3. Identify which step is failing
4. Apply appropriate fix based on error patterns
5. Re-test to verify fix

## Additional Resources

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
