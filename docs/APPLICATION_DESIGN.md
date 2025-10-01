# Application Design: StoryReader

This document describes the architecture, data flow, and conventions for the StoryReader project. For detailed requirements, see `docs/PRD.md`.

---

## 1. Architecture Overview
StoryReader is a modern web application built with a React frontend and a Node.js/Express (or serverless) backend. It integrates with Google Cloud Text-to-Speech for audio synthesis and Supabase for authentication and persistent storage of user history and generated audio files. The architecture is designed to allow easy addition of other TTS providers (e.g., OpenAI, Azure, Amazon) in the future.

### Major Components
- **Frontend (React + TypeScript):**
	- Text input (textarea), file upload for text files, language/voice/speed selectors, and audio playback UI
	- Google login integration (via Supabase)
	- Responsive design for desktop and mobile
	- API calls to backend for TTS, history, and statistics
- **Backend (Node.js/Express or Serverless):**
	- Securely proxies requests to Google Cloud TTS API (and other providers in future)
	- Handles batching for long text inputs (per provider limits)
	- Stores/retrieves audio and user history in Supabase
	- Enforces authentication and rate limiting
	- Supports multiple TTS providers (Google for POC, extensible for others)
- **Supabase:**
	- User authentication (Google OAuth)
	- Database for user history and audio metadata
	- Storage for generated audio files
- **Google Cloud TTS:**
	- Provides multi-language, multi-voice text-to-speech synthesis

## 2. Data Flow
1. User logs in with Google (Supabase handles OAuth).
2. User enters text in textarea or uploads a text file.
3. App pre-selects best-fit language based on uploaded file content (user can override).
4. User selects language, voice (where available), and speed.
5. On "Read":
	 - Frontend sends request to backend with text, language, voice, speed.
	 - Backend checks if audio for this input exists in Supabase.
		 - If yes: returns existing audio URL.
		 - If no: splits text if needed, calls Google TTS (or other provider), stores audio in Supabase, returns URL.
6. Frontend plays audio, updates user history, and provides download option.
7. Usage statistics (e.g., character count, API usage) are displayed to the user.

## 3. Key Files & Directories
- `/src/components/` — React UI components (TextInput, FileUpload, LanguageSelector, VoiceSelector, AudioPlayer, UsageStats, etc.)
- `/src/pages/` — Main app and authentication pages
- `/src/api/` — API utilities for backend and Supabase
- `/supabase/` — Supabase config and migrations
- `/server/` — Backend API (if not serverless)
- `/docs/PRD.md` — Product requirements
- `/docs/APPLICATION_DESIGN.md` — (this file)
- `/docs/PROGRESS.md` — Progress tracking

## 4. Notable Patterns & Conventions
- Functional React components with hooks and TypeScript
- Context API for user/auth state
- Custom hooks for API/data logic
- All API keys/secrets stored server-side or in environment variables
- Audio files are never exposed directly—always via authenticated Supabase URLs
- Batching and caching logic in backend to minimize Google API usage
- Download option for generated audio files
- Usage statistics displayed in the UI
- Simple, professional look and feel (no custom branding required)

## 5. Integration Points
- **Google Cloud TTS:** via backend only (never from frontend; POC default)
- **Other TTS Providers:** architecture allows for future integration (OpenAI, Azure, Amazon)
- **Supabase:** for auth, database, and storage
- **Frontend/Backend:** via REST API endpoints (e.g., `/api/tts`, `/api/history`, `/api/stats`)

## 6. Security & Error Handling
- All TTS and history endpoints require authentication
- Input validation on both frontend and backend
- Graceful error messages for API or network failures

---
_Last updated: 2025-10-01 (fully aligned with clarified requirements)_
