# SSML Speech Synthesis Feature

## 🎯 Overview

A new dedicated page for SSML (Speech Synthesis Markup Language) input that provides advanced text-to-speech capabilities with fine-grained control over speech properties.

## ✨ What is SSML?

SSML is an XML-based markup language that allows you to control various aspects of speech synthesis, including:

- **Pauses and Breaks**: Control timing between words/sentences
- **Emphasis**: Stress specific words or phrases
- **Prosody**: Adjust rate, pitch, and volume
- **Pronunciation**: Specify how words should be pronounced
- **Say-As**: Format numbers, dates, currencies, etc.

## 🚀 Features Implemented

### 1. **Dedicated SSML Page** (`/pages/ssml.tsx`)
- Large monospace textarea for SSML input
- Example SSML templates with common use cases
- Real-time character and byte counter
- Voice and speed selection
- Audio player for generated speech
- Educational tips and SSML documentation links

### 2. **SSML API Endpoint** (`/pages/api/tts-ssml.ts`)
- Validates SSML format (must have `<speak>` tags)
- Processes SSML through Google TTS API
- Uploads generated audio to Supabase
- Saves to history with full SSML content
- Comprehensive error handling and logging

### 3. **User Interface**
- Information banner explaining SSML capabilities
- "Load Example SSML" button with pre-built template
- Link to Google's SSML documentation
- Character/byte counter with warnings
- Visual feedback for processing status
- Integrated audio player

### 4. **Navigation**
- Link from main page to SSML mode
- Link back to plain text mode from SSML page
- Consistent navigation across all pages

## 📁 Files Created

1. **`/pages/ssml.tsx`** - SSML input page
2. **`/pages/api/tts-ssml.ts`** - SSML TTS API endpoint
3. **`/docs/SSML_FEATURE.md`** - This documentation

## 📝 Example SSML Templates

### Basic Example (Included in Page)
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
  <break time="300ms"/>
  <p>
    <s>你還可以控制音高：</s>
    <s><prosody pitch="high">高音</prosody>和<prosody pitch="low">低音</prosody>。</s>
  </p>
</speak>
```

### Advanced Examples

#### 1. News Reading with Pauses
```xml
<speak>
  <p>
    <s>今日新聞速報。</s>
    <break time="800ms"/>
    <s>股市今天上升<emphasis level="strong">三個百分點</emphasis>。</s>
    <break time="500ms"/>
    <s>天氣方面，明天會有<prosody volume="loud">大雨</prosody>。</s>
  </p>
</speak>
```

#### 2. Interactive Story with Voice Changes
```xml
<speak>
  <p>
    <s>從前有一個<prosody pitch="high" rate="fast">小女孩</prosody>。</s>
    <break time="300ms"/>
    <s>她遇到了一隻<prosody pitch="low" rate="slow">大灰狼</prosody>。</s>
    <break time="500ms"/>
    <s><prosody volume="loud">救命啊！</prosody></s>
  </p>
</speak>
```

#### 3. Numbers and Dates
```xml
<speak>
  <p>
    <s>今天是<say-as interpret-as="date" format="ymd">2025-10-02</say-as>。</s>
    <s>價格是<say-as interpret-as="currency" language="en-US">$42.50</say-as>。</s>
    <s>電話號碼是<say-as interpret-as="telephone">555-1234</say-as>。</s>
  </p>
</speak>
```

#### 4. Emphasis and Expression
```xml
<speak>
  <p>
    <s>這<emphasis level="reduced">可能</emphasis>是一個好主意。</s>
    <s>這<emphasis level="moderate">應該</emphasis>是一個好主意。</s>
    <s>這<emphasis level="strong">一定</emphasis>是一個好主意！</s>
  </p>
</speak>
```

## 🎨 Common SSML Tags Reference

### Structure Tags
| Tag | Description | Example |
|-----|-------------|---------|
| `<speak>` | Root element (required) | `<speak>...</speak>` |
| `<p>` | Paragraph | `<p>Paragraph text</p>` |
| `<s>` | Sentence | `<s>Sentence text.</s>` |

### Timing Tags
| Tag | Description | Example |
|-----|-------------|---------|
| `<break>` | Insert pause | `<break time="500ms"/>` |
| | | `<break time="2s"/>` |
| | | `<break strength="weak"/>` |

### Prosody Tags
| Tag | Attribute | Values | Example |
|-----|-----------|--------|---------|
| `<prosody>` | `rate` | `x-slow`, `slow`, `medium`, `fast`, `x-fast`, `80%`, `120%` | `<prosody rate="slow">Slow text</prosody>` |
| | `pitch` | `x-low`, `low`, `medium`, `high`, `x-high`, `+10%`, `-5%` | `<prosody pitch="high">High pitch</prosody>` |
| | `volume` | `silent`, `x-soft`, `soft`, `medium`, `loud`, `x-loud`, `+6dB` | `<prosody volume="loud">Loud text</prosody>` |

### Emphasis Tags
| Tag | Attribute | Values | Example |
|-----|-----------|--------|---------|
| `<emphasis>` | `level` | `strong`, `moderate`, `reduced` | `<emphasis level="strong">Important!</emphasis>` |

### Say-As Tags
| Tag | Attribute | Values | Example |
|-----|-----------|--------|---------|
| `<say-as>` | `interpret-as` | `cardinal`, `ordinal`, `characters`, `fraction`, `unit`, `date`, `time`, `telephone`, `currency` | `<say-as interpret-as="cardinal">123</say-as>` |

## 🔧 How to Use

### Step 1: Access SSML Page
1. Log in to StoryReader
2. Click "SSML Mode" button in the top navigation
3. You'll be taken to `/ssml` page

### Step 2: Enter or Load SSML
**Option A: Load Example**
- Click "Load Example SSML" button
- Modify the example to your needs

**Option B: Write Your Own**
- Start with `<speak>` tag
- Add your content with SSML markup
- End with `</speak>` tag

### Step 3: Configure Settings
- Select voice (Cantonese, Mandarin, English, etc.)
- Set base speed (Note: SSML prosody tags override this)

### Step 4: Generate Speech
- Click "🎵 Generate Speech from SSML"
- Wait for processing
- Audio player appears with your generated speech

### Step 5: Listen and Refine
- Play the audio
- Adjust SSML markup as needed
- Regenerate until perfect

## ⚠️ Limitations and Notes

### SSML Byte Limit
- **5000 bytes maximum** (same as plain text)
- SSML tags count toward the limit
- Counter shows real-time byte size
- Over-limit input is disabled

### SSML Validation
- Must start with `<speak>` and end with `</speak>`
- XML must be well-formed (all tags closed)
- Invalid SSML returns detailed error from Google API

### Speed Override
- Base speed setting can be overridden by `<prosody rate>` tags
- SSML-level control takes precedence

### Storage
- SSML content is stored in history table
- Full SSML markup is preserved
- Can be retrieved from history page

## 🎓 Learning Resources

### Official Documentation
- [Google Cloud TTS SSML Guide](https://cloud.google.com/text-to-speech/docs/ssml)
- [W3C SSML Specification](https://www.w3.org/TR/speech-synthesis/)

### Tips for Better Results

1. **Use Paragraphs and Sentences**
   ```xml
   <p><s>Sentence one.</s> <s>Sentence two.</s></p>
   ```

2. **Add Natural Pauses**
   ```xml
   <break time="500ms"/>  <!-- Half second pause -->
   ```

3. **Emphasize Keywords**
   ```xml
   This is <emphasis level="strong">very important</emphasis>.
   ```

4. **Adjust Pacing**
   ```xml
   <prosody rate="90%">Speak slightly slower</prosody>
   ```

5. **Combine Multiple Properties**
   ```xml
   <prosody rate="slow" pitch="low" volume="soft">Whispered text</prosody>
   ```

## 🐛 Troubleshooting

### Issue: "Invalid SSML" Error
**Solution**: Ensure your SSML:
- Starts with `<speak>`
- Ends with `</speak>`
- Has all tags properly closed
- Uses valid tag names

### Issue: "Exceeds 5000 bytes"
**Solution**: 
- Remove unnecessary tags
- Shorten text content
- Split into multiple generations

### Issue: Audio Doesn't Sound Right
**Solution**:
- Check prosody values (e.g., `rate="200%"` might be too fast)
- Ensure emphasis levels are appropriate
- Test with different voices

### Issue: Tags Not Working
**Solution**:
- Verify tag name spelling
- Check attribute values are valid
- Ensure XML syntax is correct
- Review Google's SSML documentation

## 📊 Comparison: Plain Text vs SSML

| Feature | Plain Text | SSML |
|---------|-----------|------|
| Ease of Use | ✅ Very Easy | ⚠️ Requires Learning |
| Control | ⚠️ Limited (speed only) | ✅ Full Control |
| Pauses | ❌ Natural only | ✅ Custom timing |
| Emphasis | ❌ None | ✅ Strong/Moderate/Reduced |
| Pitch Control | ❌ None | ✅ High/Low/Custom |
| Volume Control | ❌ None | ✅ Loud/Soft/Custom |
| Number Format | ⚠️ Auto | ✅ Customizable |
| Best For | Quick conversion | Professional audio, storytelling, accessibility |

## 🎉 Use Cases

### 1. **Audiobook Production**
- Control pacing for dramatic effect
- Different voices for characters
- Natural pauses between sections

### 2. **Language Learning**
- Slow down complex words
- Emphasize pronunciation points
- Consistent pacing for practice

### 3. **Accessibility**
- Proper number and date formatting
- Clear emphasis on important terms
- Adjustable speed for comprehension

### 4. **Podcast Intros**
- Professional-sounding announcements
- Precise timing and rhythm
- Volume control for music mixing

### 5. **Phone Systems (IVR)**
- Natural pauses in menus
- Clear emphasis on options
- Proper number pronunciation

## 🚀 Future Enhancements (Optional)

- [ ] SSML syntax highlighting in textarea
- [ ] Auto-completion for SSML tags
- [ ] Visual SSML builder (drag-and-drop interface)
- [ ] More example templates
- [ ] SSML validation before API call
- [ ] Preview mode (estimate how it will sound)
- [ ] Save custom SSML templates
- [ ] Import/export SSML files
- [ ] SSML to plain text converter
- [ ] Multi-voice support in single SSML

## 🎯 Quick Start Example

Try this simple SSML to hear the difference:

```xml
<speak>
  <p>
    <s>Hello, welcome to SSML.</s>
    <break time="500ms"/>
    <s>This is <emphasis level="strong">amazing</emphasis>!</s>
    <break time="300ms"/>
    <s><prosody rate="slow">You can control everything.</prosody></s>
  </p>
</speak>
```

Copy this into the SSML textarea, select a voice, and click "Generate Speech from SSML" to hear the advanced control in action! 🎵
