# SSML Feature - Quick Summary

## ✅ What Was Created

A complete SSML (Speech Synthesis Markup Language) page that gives you advanced control over text-to-speech generation.

## 🎯 New Pages & Features

### 1. **SSML Input Page** (`/ssml`)
- Dedicated textarea for SSML markup input
- Example SSML template with "Load Example" button
- Character/byte counter with warnings
- Voice and speed selection
- Built-in audio player
- Educational info banner and tips section
- Links to official SSML documentation

### 2. **SSML API Endpoint** (`/api/tts-ssml`)
- Accepts SSML formatted input
- Validates SSML structure (requires `<speak>` tags)
- Processes through Google TTS API
- Uploads audio to Supabase Storage
- Saves to history
- Comprehensive error handling

### 3. **Navigation Updates**
- Added "SSML Mode" button on main page (purple button)
- Added "← Plain Text" button on SSML page
- Seamless navigation between modes

## 🎨 What is SSML?

SSML allows you to control:
- **Pauses**: `<break time="500ms"/>`
- **Emphasis**: `<emphasis level="strong">important</emphasis>`
- **Speed**: `<prosody rate="slow">slower text</prosody>`
- **Pitch**: `<prosody pitch="high">higher pitch</prosody>`
- **Volume**: `<prosody volume="loud">louder text</prosody>`

## 📝 Example SSML (Pre-loaded)

```xml
<speak>
  <p>
    <s>歡迎使用 SSML 語音合成。</s>
    <s>你可以控制<emphasis level="strong">語速</emphasis>和<emphasis level="strong">音調</emphasis>。</s>
  </p>
  <break time="500ms"/>
  <p>
    <s>這是一個<prosody rate="slow">慢速</prosody>的例子。</s>
    <s>這是一個<prosody rate="fast">快速</prosody>的例子。</s>
  </p>
</speak>
```

## 🚀 How to Use

1. **Access SSML page**:
   - Click "SSML Mode" button on home page
   - Or navigate to `/ssml`

2. **Enter SSML**:
   - Click "Load Example SSML" button, OR
   - Write your own SSML markup

3. **Configure**:
   - Select voice (Cantonese, Mandarin, English, etc.)
   - Set base speed (optional)

4. **Generate**:
   - Click "🎵 Generate Speech from SSML"
   - Wait for processing
   - Audio player appears automatically

5. **Listen & Refine**:
   - Play the generated audio
   - Adjust SSML as needed
   - Regenerate

## 📁 New Files

1. `/pages/ssml.tsx` - SSML input page UI
2. `/pages/api/tts-ssml.ts` - SSML API endpoint
3. `/docs/SSML_FEATURE.md` - Complete documentation

## 📁 Modified Files

1. `/pages/index.tsx` - Added "SSML Mode" button

## ✨ Key Features

✅ **Example Template** - One-click to load working SSML
✅ **Real-time Counter** - Character and byte count
✅ **Validation** - Ensures proper SSML format
✅ **Educational Content** - Tips, examples, and documentation links
✅ **Full Integration** - Uses same Supabase storage and history
✅ **Error Handling** - Clear error messages from Google API

## 🎓 Common SSML Tags

| What You Want | SSML Tag |
|---------------|----------|
| Add pause | `<break time="500ms"/>` |
| Emphasize | `<emphasis level="strong">text</emphasis>` |
| Speak slower | `<prosody rate="slow">text</prosody>` |
| Higher pitch | `<prosody pitch="high">text</prosody>` |
| Louder | `<prosody volume="loud">text</prosody>` |
| Paragraph | `<p>text</p>` |
| Sentence | `<s>text</s>` |

## ⚠️ Important Notes

- **Must wrap in `<speak>` tags** - Required by SSML spec
- **5000 byte limit** - Same as plain text (tags count toward limit)
- **XML format** - All tags must be properly closed
- **Case sensitive** - Use lowercase for tag names

## 🎯 Use Cases

1. **Audiobooks** - Control pacing and emphasis
2. **Language Learning** - Slow down pronunciation
3. **Accessibility** - Clear emphasis on key terms
4. **Professional Audio** - Precise timing control
5. **Interactive Stories** - Different paces for characters

## 🎉 Ready to Use!

1. Refresh your browser or restart dev server
2. Click "SSML Mode" on the home page
3. Click "Load Example SSML" to see it in action
4. Generate and listen to advanced TTS with full control!

## 📚 Learn More

- Full documentation: `/docs/SSML_FEATURE.md`
- Google SSML Guide: https://cloud.google.com/text-to-speech/docs/ssml
- More examples and advanced features in the docs

---

**The SSML feature is fully functional and ready to test!** 🎵
