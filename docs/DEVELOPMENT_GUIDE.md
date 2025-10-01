# Development Guide

This guide provides essential information for developing the StoryReader application, including setup, workflows, and best practices.

---

## Prerequisites
- Node.js 18+ and npm/yarn
- Git
- Supabase account
- Google Cloud Platform account (for Text-to-Speech API)
- Vercel account (for deployment)

---

## Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/Robin318-Gamer/StoryReader.git
cd StoryReader
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Environment Setup
Copy the `.env.example` file and configure your environment variables:
```bash
cp .env.example .env.local
```

See `.env.example` for required variables.

### 4. Run Development Server
```bash
npm run dev
# or
yarn dev
```

---

## Project Structure
```
/src
  /components     # React UI components
  /pages          # Next.js pages or main app pages
  /api            # API utilities and hooks
  /contexts       # React Context providers
  /hooks          # Custom React hooks
  /styles         # CSS modules and global styles
  /utils          # Utility functions
/server           # Backend API (if not serverless)
/supabase         # Supabase config and migrations
/docs             # Documentation
/tests            # Test files
```

---

## Development Workflow

### Feature Development
1. Create a feature branch: `git checkout -b feature/your-feature-name`
2. Write tests first (TDD approach)
3. Implement the feature
4. Run tests: `npm test`
5. Update PROGRESS.md
6. Commit with clear messages
7. Push and create a pull request

### Testing
- Run all tests: `npm test`
- Run tests in watch mode: `npm test -- --watch`
- Check coverage: `npm test -- --coverage`

### Code Quality
- Lint code: `npm run lint`
- Format code: `npm run format`
- Type check: `npm run type-check`

---

## Tech Stack
- **Frontend:** React 19+, TypeScript, CSS Modules
- **Backend:** Node.js/Express or Vercel Serverless Functions
- **Database:** Supabase (PostgreSQL)
- **Storage:** Supabase Storage
- **Authentication:** Supabase Auth (Google OAuth)
- **TTS:** Google Cloud Text-to-Speech (extensible for others)
- **Deployment:** Vercel
- **CI/CD:** GitHub Actions + Vercel

---

## Key Features Implementation Order
1. User authentication (Google login via Supabase)
2. Text input (textarea)
3. Text file upload
4. Language/voice/speed selection
5. Audio playback & download
6. User history (Supabase)
7. Usage statistics display
8. TTS provider abstraction (Google, extensible)

---

## Testing Strategy
- **Unit Tests:** All components, hooks, and utilities
- **Integration Tests:** API endpoints and data flows
- **E2E Tests:** Critical user paths (optional for POC)
- **Coverage Target:** >80% for core logic

---

## Deployment
- **Staging:** Automatic deployment on PR to main
- **Production:** Automatic deployment on merge to main
- **Environment Variables:** Managed via Vercel dashboard

---

## Troubleshooting
- **Supabase connection issues:** Check environment variables and API keys
- **TTS API errors:** Verify Google Cloud credentials and quotas
- **Build failures:** Check Node.js version and dependencies

---

_Last updated: 2025-10-01_
