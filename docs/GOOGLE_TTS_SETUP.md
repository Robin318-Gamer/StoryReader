# Google Cloud Text-to-Speech API Setup Guide

This guide will help you set up Google Cloud Text-to-Speech API credentials for the StoryReader POC.

---

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click "New Project"
4. Enter project name: `StoryReader-POC`
5. Click "Create"

---

## Step 2: Enable Text-to-Speech API

1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Cloud Text-to-Speech API"
3. Click on it
4. Click "Enable"

---

## Step 3: Create API Credentials

### Option A: API Key (Simpler, for POC)

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the API key that appears
4. (Optional) Click "Restrict Key" to add restrictions:
   - Under "API restrictions", select "Restrict key"
   - Select "Cloud Text-to-Speech API"
   - Click "Save"

**Use this for POC:** Add to `.env.local`:
```
GOOGLE_CLOUD_TTS_API_KEY=your-api-key-here
```

---

### Option B: Service Account (More secure, for production)

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Enter a name: `storyreader-tts-service`
4. Click "Create and Continue"
5. Grant role: "Cloud Text-to-Speech User"
6. Click "Done"
7. Click on the created service account
8. Go to "Keys" tab
9. Click "Add Key" > "Create new key"
10. Choose "JSON" format
11. Click "Create" (downloads JSON file)

**Use this for production:** Add to `.env.local`:
```
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
```

---

## Step 4: Set Up Billing (Required)

Google Cloud TTS requires a billing account, but offers a free tier:

1. Go to "Billing" in Google Cloud Console
2. Click "Link a billing account"
3. Follow steps to add payment method
4. **Free Tier:** First 1 million characters per month are free

---

## Step 5: Test Your Setup

Use the POC demo page to test:
```bash
cd /workspaces/StoryReader
npm run dev
```

Visit `http://localhost:3000/poc-demo.html`

---

## Quick Reference

### Free Tier Limits
- **Standard voices:** 0-1M characters/month = FREE
- **WaveNet voices:** 0-1M characters/month = FREE
- **Neural2 voices:** 0-1M characters/month = FREE

### Pricing After Free Tier
- Standard: $4 per 1M characters
- WaveNet: $16 per 1M characters
- Neural2: $16 per 1M characters

---

## Supported Cantonese Voices

Google TTS supports Cantonese (Hong Kong):
- Language code: `yue-HK` or `zh-HK`
- Available voices:
  - `yue-HK-Standard-A` (Female)
  - `yue-HK-Standard-B` (Male)
  - `yue-HK-Standard-C` (Female)
  - `yue-HK-Standard-D` (Male)

---

## Troubleshooting

**Error: "API key not valid"**
- Check if API key is correct
- Verify Text-to-Speech API is enabled
- Check if API key restrictions allow TTS API

**Error: "Billing account required"**
- You must link a billing account (free tier available)

**Error: "Permission denied"**
- Service account needs "Cloud Text-to-Speech User" role

---

_Last updated: 2025-10-01_
