# Vercel Deployment Guide

This guide explains how to deploy StoryReader to Vercel with secure API key management.

---

## 🚀 Quick Deployment Steps

### 1. Install Vercel CLI (Optional)
```bash
npm install -g vercel
```

### 2. Deploy to Vercel

**Option A: Using Vercel CLI**
```bash
cd /workspaces/StoryReader
vercel
```

**Option B: Using GitHub Integration (Recommended)**
1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "Add New Project"
4. Import your GitHub repository
5. Vercel will auto-detect settings
6. Click "Deploy"

---

## 🔐 Configure Environment Variables

After deployment, add your Google Cloud API key:

### Via Vercel Dashboard:
1. Go to your project in Vercel Dashboard
2. Click "Settings" → "Environment Variables"
3. Add a new variable:
   - **Name:** `GOOGLE_CLOUD_TTS_API_KEY`
   - **Value:** Your Google Cloud API key
   - **Environments:** Production, Preview, Development (select all)
4. Click "Save"

### Via Vercel CLI:
```bash
vercel env add GOOGLE_CLOUD_TTS_API_KEY
```
Enter your API key when prompted.

---

## 📁 Project Structure for Vercel

```
/workspaces/StoryReader
├── api/
│   └── tts.js                  # Serverless function
├── public/
│   └── index.html              # Frontend demo
├── vercel.json                 # Vercel configuration
├── package.json                # Dependencies
└── .env.example                # Environment template
```

---

## 🧪 Test Your Deployment

### Local Testing with Vercel Dev Server:
```bash
# Install dependencies
npm install -g vercel

# Set environment variable locally
export GOOGLE_CLOUD_TTS_API_KEY=your-api-key-here

# Run Vercel dev server
vercel dev
```

Visit `http://localhost:3000`

---

## 🔒 Security Best Practices

✅ **DO:**
- Store API keys in Vercel environment variables
- Use serverless functions to hide API keys
- Enable CORS only for your domain (in production)
- Monitor API usage in Google Cloud Console

❌ **DON'T:**
- Commit API keys to git
- Expose API keys in frontend code
- Share API keys publicly

---

## 📊 Monitor Your Deployment

### Vercel Dashboard:
- View deployment logs
- Monitor function execution
- Check analytics and performance

### Google Cloud Console:
- Monitor API usage
- Set up billing alerts
- Review TTS API quotas

---

## 🔄 Automatic Deployments

Vercel automatically deploys when you push to GitHub:

- **Push to `main` branch:** Deploys to production
- **Push to other branches:** Creates preview deployment
- **Pull requests:** Automatic preview deployments

---

## 🐛 Troubleshooting

**"Server configuration error"**
- Check that `GOOGLE_CLOUD_TTS_API_KEY` is set in Vercel environment variables
- Redeploy after adding environment variables

**"Failed to generate speech"**
- Verify API key is valid in Google Cloud Console
- Check that Text-to-Speech API is enabled
- Verify billing is set up

**Function timeout**
- Vercel free tier: 10s timeout
- Vercel Pro: 60s timeout
- Consider breaking long texts into batches

---

## 📝 Custom Domain (Optional)

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Wait for SSL certificate to provision

---

## 💰 Cost Estimation

**Vercel (Free Tier):**
- Unlimited deployments
- 100GB bandwidth/month
- Serverless function executions included

**Google Cloud TTS:**
- First 1M characters/month: FREE
- After: $4-16 per 1M characters (depending on voice type)

---

_Last updated: 2025-10-01_
