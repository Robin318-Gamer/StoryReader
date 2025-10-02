# Supabase Setup Instructions

Follow these steps to configure Supabase for StoryReader.

---

## 1. Create a Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Click "New Project"
3. Enter project name: `StoryReader`
4. Set a strong database password
5. Choose a region close to your users
6. Click "Create new project"

---

## 2. Enable Google OAuth

1. In your Supabase project, go to **Authentication** → **Providers**
2. Find **Google** and click to configure
3. Enable the Google provider
4. You'll need to create a Google OAuth app:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Navigate to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client ID"
   - Application type: "Web application"
   - Add authorized redirect URI: `https://<your-project-ref>.supabase.co/auth/v1/callback`
   - Copy Client ID and Client Secret
5. Paste Client ID and Client Secret into Supabase
6. Click "Save"

---

## 3. Create Storage Bucket for Audio Files

1. In Supabase Dashboard, go to **Storage**
2. Click "New bucket"
3. Name: `audio`
4. Make it **public** (so users can play audio files)
5. Click "Create bucket"

---

## 4. Run Database Migration

1. In Supabase Dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy and paste the content from `/supabase/migrations/001_create_tts_history.sql`
4. Click "Run" to execute the migration
5. Verify the `tts_history` table was created under **Database** → **Tables**

---

## 5. Get API Keys

1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key
   - **service_role** key (keep this secret!)

---

## 6. Add Environment Variables

Add these to your Vercel project (or `.env.local` for local dev):

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GOOGLE_CLOUD_TTS_API_KEY=your-google-tts-key
```

---

## 7. Configure Storage Policies (Optional)

If you want more granular control:

1. Go to **Storage** → **Policies**
2. Create policies for the `audio` bucket:
   - Allow authenticated users to upload
   - Allow public read access

---

## 8. Test Your Setup

1. Deploy to Vercel or run locally: `npm run dev`
2. Visit your app and sign in with Google
3. Generate speech and check:
   - Audio file appears in Supabase Storage
   - History record appears in `tts_history` table

---

## Troubleshooting

**"Invalid API key"**
- Check that environment variables are correctly set in Vercel

**"Auth session missing"**
- Verify Google OAuth is properly configured in Supabase
- Check redirect URIs match

**"Failed to upload audio"**
- Verify `audio` bucket exists and is public
- Check storage policies

---

_Last updated: 2025-10-02_
