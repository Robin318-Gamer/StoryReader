# Debugging Audio Upload Issues - Quick Start

## What Was Added

I've added extensive debugging code throughout the application to help identify the Supabase audio upload issue. Here's what's now in place:

## 🔍 Debugging Features

### 1. **Server-Side Logging** (`/pages/api/tts.ts`)
Every request now logs:
- Environment variable status
- Available Supabase storage buckets
- Audio buffer size and details
- Upload attempt results
- Error details (full stack trace and error codes)
- Public URL generation
- Database insert operations

### 2. **Client-Side Logging** (`/pages/index.tsx`)
The frontend now logs:
- Request initiation
- Response status
- Error messages
- Success/failure states
- Warnings for partial failures

### 3. **Test Script** (`test-supabase-storage.js`)
Run this to verify your Supabase Storage setup:
```bash
node test-supabase-storage.js
```

## 🚀 How to Debug

### Option 1: Run the Test Script (Recommended First Step)
```bash
# Install dependencies if not already installed
npm install

# Run the test script
node test-supabase-storage.js
```

This will tell you immediately if:
- Environment variables are set correctly
- The "audio" bucket exists
- Upload/download permissions work
- Public URLs can be generated

### Option 2: Test with the Live Application

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Open the browser console** (F12 → Console tab)

3. **Open the terminal/logs** where `npm run dev` is running

4. **Try generating speech** from the UI

5. **Check both locations for logs:**
   - **Browser Console**: Look for `[Frontend]` logs
   - **Server Terminal**: Look for `[DEBUG]` and `[ERROR]` logs

### What to Look For

#### ✅ **Successful Upload Pattern:**
```
[DEBUG] Audio buffer created, size: 156384 bytes
[DEBUG] Available buckets: ["audio", ...]
[DEBUG] Upload result data: { "path": "tts-audio/..." }
[DEBUG] Public audio URL: https://...
[DEBUG] Successfully saved to history
```

#### ❌ **Common Failure Patterns:**

**Missing Bucket:**
```
[DEBUG] Available buckets: ["avatars"]
[ERROR] Bucket not found
```
→ **Fix:** Create "audio" bucket in Supabase Storage

**Permission Error:**
```
[ERROR] Error code: 403
[ERROR] Insufficient permissions
```
→ **Fix:** Check bucket permissions and RLS policies

**Missing Environment Variables:**
```
[DEBUG] - SUPABASE_SERVICE_ROLE_KEY exists: false
[ERROR] Server configuration error
```
→ **Fix:** Add environment variables to `.env.local`

## 📋 Checklist

Use this checklist to systematically debug:

- [ ] Run `node test-supabase-storage.js` successfully
- [ ] Verify "audio" bucket exists in Supabase dashboard
- [ ] Check bucket is set to "Public" if needed
- [ ] Verify environment variables in `.env.local`:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `GOOGLE_CLOUD_TTS_API_KEY`
- [ ] Check RLS policies on:
  - `storage.objects` table
  - `tts_history` table
- [ ] Test audio generation in the UI
- [ ] Review server logs for `[DEBUG]` messages
- [ ] Review browser console for `[Frontend]` messages

## 🔧 Quick Fixes

### Create the Audio Bucket
1. Go to Supabase Dashboard
2. Navigate to Storage
3. Click "Create Bucket"
4. Name it "audio"
5. Set to Public if you want public URLs

### Fix RLS Policies
If uploads fail with permission errors:

1. Go to Supabase Dashboard → Storage → Policies
2. Create policy for INSERT:
   ```sql
   CREATE POLICY "Allow authenticated users to upload"
   ON storage.objects
   FOR INSERT
   TO authenticated
   WITH CHECK (bucket_id = 'audio');
   ```

3. Create policy for SELECT (public access):
   ```sql
   CREATE POLICY "Allow public access to audio files"
   ON storage.objects
   FOR SELECT
   TO public
   USING (bucket_id = 'audio');
   ```

## 📝 Files Modified

1. `/pages/api/tts.ts` - Enhanced API endpoint with debugging
2. `/pages/index.tsx` - Frontend debugging logs
3. `/src/server/uploadAudioToSupabase.ts` - Upload function debugging
4. `/src/server/saveTTSResult.ts` - Database insert debugging
5. `/test-supabase-storage.js` - **NEW** Storage test script
6. `/docs/DEBUGGING_GUIDE.md` - **NEW** Comprehensive debugging guide

## 🎯 Next Steps

1. Run the test script first: `node test-supabase-storage.js`
2. If test passes but UI fails, check authentication tokens
3. If test fails, follow the error messages - they're now very detailed
4. Review the full debugging guide: `/docs/DEBUGGING_GUIDE.md`

## 💡 Tips

- Keep the browser console open while testing
- Check both client and server logs simultaneously
- The `[DEBUG]` prefix makes it easy to filter logs
- Error messages now include full context for easier troubleshooting
- If audio generates but history doesn't save, check database RLS policies

## 🆘 Still Having Issues?

Check the detailed guide at `/docs/DEBUGGING_GUIDE.md` which includes:
- Common error patterns and solutions
- Detailed log examples
- Supabase configuration steps
- Additional troubleshooting resources
