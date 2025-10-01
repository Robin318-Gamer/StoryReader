# StoryReader

A modern web application that converts text to speech using multiple TTS providers, with support for multiple languages, voices, and customizable reading speeds.

---

## 🚀 Features

- **Multi-language Support:** English, Cantonese, Mandarin, Korean, Japanese, French
- **Voice Selection:** Choose from available voices (male/female) per language
- **Speed Control:** Adjust reading speed from 0.5x to 2.0x
- **Text Input:** Type directly or upload text files
- **Auto Language Detection:** Automatically suggests language based on content
- **User History:** Save and replay generated audio
- **Usage Statistics:** Track character count and API usage
- **Download Audio:** Save generated audio files locally
- **Authentication:** Secure Google login via Supabase
- **Responsive Design:** Works on desktop and mobile

---

## 🛠️ Tech Stack

- **Frontend:** React 19+, TypeScript, CSS Modules
- **Backend:** Vercel Serverless Functions
- **Database:** Supabase (PostgreSQL)
- **Storage:** Supabase Storage
- **Authentication:** Supabase Auth (Google OAuth)
- **TTS:** Google Cloud Text-to-Speech (extensible for OpenAI, Azure, Amazon)
- **Deployment:** Vercel
- **CI/CD:** GitHub Actions

---

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Google Cloud Platform account (Text-to-Speech API enabled)
- Vercel account

---

## 🏁 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/Robin318-Gamer/StoryReader.git
cd StoryReader
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
```bash
cp .env.example .env.local
```
Edit `.env.local` with your API keys and configuration.

### 4. Run development server
```bash
npm run dev
```

Visit `http://localhost:3000` to see the app.

---

## 📚 Documentation

- [Application Design](docs/APPLICATION_DESIGN.md) - Architecture and data flow
- [Development Guide](docs/DEVELOPMENT_GUIDE.md) - Setup and workflows
- [API Documentation](docs/API.md) - Backend endpoints
- [Progress Tracker](docs/PROGRESS.md) - Current development status

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Check coverage
npm test -- --coverage
```

---

## 🚢 Deployment

The app is automatically deployed to Vercel on push to `main` branch.

**Production URL:** `https://storyreader.vercel.app` (to be configured)

---

## 🤝 Contributing

This is currently a POC project developed by AI agents. Contributions are welcome in future releases.

---

## 📝 License

MIT License - See LICENSE file for details

---

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

_Built with ❤️ by AI agents for better accessibility_