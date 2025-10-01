# API Documentation

This document describes the backend API endpoints for the StoryReader application.

---

## Base URL
- **Development:** `http://localhost:3000/api`
- **Production:** `https://storyreader.vercel.app/api`

---

## Authentication
All endpoints require authentication via Supabase session token in the `Authorization` header:
```
Authorization: Bearer <supabase_token>
```

---

## Endpoints

### 1. Text-to-Speech

#### `POST /api/tts`
Generate audio from text using the selected TTS provider.

**Request Body:**
```json
{
  "text": "string (required)",
  "language": "string (required, e.g., 'en-US', 'zh-HK')",
  "voice": "string (optional, e.g., 'en-US-Neural2-A')",
  "speed": "number (optional, default: 1.0, range: 0.5-2.0)",
  "provider": "string (optional, default: 'google')"
}
```

**Response:**
```json
{
  "audioUrl": "string (Supabase storage URL)",
  "duration": "number (seconds)",
  "cached": "boolean",
  "characterCount": "number"
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid request
- `401` - Unauthorized
- `429` - Rate limit exceeded
- `500` - Server error

---

### 2. User History

#### `GET /api/history`
Retrieve user's audio generation history.

**Query Parameters:**
- `limit` (optional, default: 20)
- `offset` (optional, default: 0)

**Response:**
```json
{
  "history": [
    {
      "id": "string",
      "text": "string (excerpt)",
      "language": "string",
      "voice": "string",
      "speed": "number",
      "audioUrl": "string",
      "createdAt": "string (ISO 8601)",
      "characterCount": "number"
    }
  ],
  "total": "number"
}
```

---

### 3. Usage Statistics

#### `GET /api/stats`
Get user's usage statistics.

**Response:**
```json
{
  "totalCharacters": "number",
  "totalAudios": "number",
  "totalDuration": "number (seconds)",
  "apiCalls": "number",
  "storageUsed": "number (bytes)"
}
```

---

### 4. Available Voices

#### `GET /api/voices`
Get available voices for a specific language.

**Query Parameters:**
- `language` (required, e.g., 'en-US')

**Response:**
```json
{
  "voices": [
    {
      "name": "string",
      "gender": "string (MALE, FEMALE, NEUTRAL)",
      "languageCode": "string"
    }
  ]
}
```

---

### 5. Language Detection

#### `POST /api/detect-language`
Detect language from text content.

**Request Body:**
```json
{
  "text": "string (required)"
}
```

**Response:**
```json
{
  "language": "string (e.g., 'en-US')",
  "confidence": "number (0-1)"
}
```

---

## Error Response Format
```json
{
  "error": "string (error message)",
  "code": "string (error code)",
  "details": "object (optional, additional context)"
}
```

---

## Rate Limits
- **TTS Generation:** 50 requests/hour per user
- **History/Stats:** 100 requests/hour per user
- **Voice Listing:** 10 requests/minute per user

---

_Last updated: 2025-10-01_
