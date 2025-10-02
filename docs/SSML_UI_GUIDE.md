# SSML Page Visual Guide

## 📱 Page Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  🎙️ SSML Speech Synthesis                [← Plain Text] [History] [Logout]  │
│  Advanced Text-to-Speech with SSML Markup                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ℹ️ What is SSML?                                              │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ SSML allows you to control speech properties like:      │ │
│  │ • <break time="500ms"/> - Add pauses                    │ │
│  │ • <emphasis level="strong"> - Emphasize words           │ │
│  │ • <prosody rate="slow" pitch="high"> - Control rate     │ │
│  │                                                          │ │
│  │ [Load Example SSML]  📖 SSML Documentation →            │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                 │
│  SSML Input                     150 characters | 450 bytes     │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ <speak>                                                  │ │
│  │   <p>                                                    │ │
│  │     <s>歡迎使用 SSML 語音合成。</s>                        │ │
│  │     <s>你可以控制<emphasis level="strong">              │ │
│  │        語速</emphasis>。</s>                             │ │
│  │   </p>                                                   │ │
│  │   <break time="500ms"/>                                 │ │
│  │   <p>                                                    │ │
│  │     <s>這是一個<prosody rate="slow">                     │ │
│  │        慢速</prosody>的例子。</s>                        │ │
│  │   </p>                                                   │ │
│  │ </speak>                                                 │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                 │
│  Voice                          Base Speed                     │
│  [Cantonese (HK) - Female A ▼]  [Normal (1.0x) ▼]            │
│                                  Note: SSML prosody overrides  │
│                                                                 │
│  [🎵 Generate Speech from SSML]                                │
│                                                                 │
│  ✅ SSML speech generated successfully!                        │
│                                                                 │
│  🎧 Audio Ready                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ ▶️ ━━━━━━━━━━━━━●─────── 0:15 / 0:30  🔊 ⚙️             │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                 │
│  💡 SSML Tips                                                  │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ Common SSML Tags:                                        │ │
│  │ • <speak> - Root element (required)                     │ │
│  │ • <p> and <s> - Paragraphs and sentences               │ │
│  │ • <break time="500ms"/> - Add pauses                   │ │
│  │ • <emphasis level="strong"> - Emphasize text           │ │
│  │ • <prosody rate="slow"> - Control speaking rate        │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 🎨 Visual Elements

### Info Banner (Blue)
```
┌────────────────────────────────────────┐
│ ℹ️ What is SSML?                      │
│ SSML allows you to control...         │
│                                        │
│ [Load Example SSML] 📖 Docs →         │
└────────────────────────────────────────┘
```

### Text Input (Monospace Font)
```
┌────────────────────────────────────────┐
│ <speak>                                │
│   <p>                                  │
│     <s>Your text here.</s>            │
│   </p>                                 │
│ </speak>                               │
└────────────────────────────────────────┘
```

### Warning (Red - Over Limit)
```
┌────────────────────────────────────────┐
│ ⚠️ Your SSML exceeds 5000 bytes.      │
│ Please reduce the content.             │
└────────────────────────────────────────┘
```

### Warning (Orange - Approaching Limit)
```
Text: 1200 characters | 4200 bytes (⚠️ Approaching limit)
```

### Success Message (Green)
```
┌────────────────────────────────────────┐
│ ✅ SSML speech generated successfully! │
└────────────────────────────────────────┘
```

### Error Message (Red)
```
┌────────────────────────────────────────┐
│ ❌ Error: Invalid SSML format          │
└────────────────────────────────────────┘
```

### Tips Section (Gray)
```
┌────────────────────────────────────────┐
│ 💡 SSML Tips                           │
│                                        │
│ Common SSML Tags:                      │
│ • <speak> - Root element               │
│ • <break/> - Add pauses                │
│ • <emphasis> - Emphasize text          │
└────────────────────────────────────────┘
```

## 🎯 Button Styles

| Button | Color | Purpose |
|--------|-------|---------|
| **SSML Mode** | Purple (#764ba2) | Switch to SSML page |
| **← Plain Text** | Purple (#667eea) | Back to plain text mode |
| **History** | Blue (#667eea) | View history |
| **Logout** | Gray (#ccc) | Log out |
| **Load Example SSML** | Blue (#2196f3) | Load example template |
| **🎵 Generate Speech** | Purple Gradient | Generate audio |

## 🔄 Navigation Flow

```
Plain Text Page (/)
       ↕
  [SSML Mode]
       ↓
  SSML Page (/ssml)
       ↕
  [← Plain Text]
       ↓
  Back to Plain Text Page
```

## 📊 State Indicators

### Normal State
- Border: Gray (#ccc)
- Counter: Gray
- Button: Enabled (purple gradient)

### Warning State (4000-4999 bytes)
- Border: Orange (#f57c00)
- Counter: Orange with warning
- Button: Enabled

### Error State (5000+ bytes)
- Border: Red (#c62828)
- Counter: Red with alert
- Warning banner: Red background
- Button: Disabled (gray)

### Loading State
- Button text: "Generating..."
- Button: Disabled
- Status: "Generating speech from SSML..."

### Success State
- Status: Green background
- Audio player: Visible
- Ready to play

## 🎨 Color Scheme

| Element | Color | Hex |
|---------|-------|-----|
| Primary Purple | Dark Purple | #764ba2 |
| Secondary Purple | Medium Purple | #667eea |
| Info Blue | Light Blue | #2196f3 |
| Success Green | Green | #388e3c |
| Warning Orange | Orange | #f57c00 |
| Error Red | Red | #c62828 |
| Text Gray | Dark Gray | #555 |
| Border Gray | Medium Gray | #ccc |
| Background Gray | Light Gray | #f5f5f5 |

## 🎭 Example SSML Display

### Before Loading Example
```
[Empty textarea with placeholder: "Enter SSML markup here..."]
```

### After Loading Example
```
<speak>
  <p>
    <s>歡迎使用 SSML 語音合成。</s>
    <s>你可以控制<emphasis level="strong">語速</emphasis>...</s>
  </p>
  <break time="500ms"/>
  ...
</speak>
```

## 🚦 User Flow

1. **Arrive at Page** → See info banner and example button
2. **Load Example** → SSML populates in textarea
3. **Modify** → Edit SSML as needed
4. **Check Counter** → Ensure under 5000 bytes
5. **Select Voice** → Choose preferred voice
6. **Generate** → Click button
7. **Wait** → Loading state shown
8. **Success** → Audio player appears
9. **Listen** → Play generated audio
10. **Refine** → Adjust SSML and regenerate

## 📱 Responsive Design

The page is centered with max-width of 900px and includes:
- Padding for readability
- Rounded corners (16px)
- Shadow for depth
- White background
- Purple accents for branding

---

**The SSML page provides a professional, user-friendly interface for advanced text-to-speech control!** 🎨
