import { useState } from 'react';

const DEFAULT_TEXT =
  '內地國慶黃金周長假期間，大量市民出行遊玩，路上塞車嚴重。有深圳車主表示，自己昨天（9月30日）中午12點從深圳出發到湖南邵陽，到今天（1日）凌晨3點左右，開了15個小時車還沒出廣東。';

const VOICES = [
  { value: 'yue-HK-Standard-A', label: 'Cantonese (HK) - Female A' },
  { value: 'yue-HK-Standard-B', label: 'Cantonese (HK) - Male B' },
  { value: 'yue-HK-Standard-C', label: 'Cantonese (HK) - Female C' },
  { value: 'yue-HK-Standard-D', label: 'Cantonese (HK) - Male D' },
  { value: 'cmn-CN-Standard-A', label: 'Mandarin (CN) - Female A' },
  { value: 'cmn-CN-Standard-B', label: 'Mandarin (CN) - Male B' },
];

export default function Home() {
  const [text, setText] = useState(DEFAULT_TEXT);
  const [voice, setVoice] = useState(VOICES[0].value);
  const [speed, setSpeed] = useState('1.0');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  async function handleGenerate() {
    setLoading(true);
    setStatus('Generating speech...');
    setAudioUrl(null);
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice, speed }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to generate speech');
      }
      const data = await res.json();
      const audioContent = data.audioContent;
      const audioBlob = base64ToBlob(audioContent, 'audio/mp3');
      setAudioUrl(URL.createObjectURL(audioBlob));
      setStatus('Speech generated successfully!');
    } catch (e: any) {
      setStatus('Error: ' + e.message);
    } finally {
      setLoading(false);
    }
  }

  function base64ToBlob(base64: string, mimeType: string) {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  }

  return (
    <div style={{ maxWidth: 700, margin: '40px auto', background: '#fff', borderRadius: 16, boxShadow: '0 8px 32px #0002', padding: 32 }}>
      <h1>🎙️ StoryReader POC</h1>
      <p style={{ color: '#666', marginBottom: 24 }}>Google Cloud Text-to-Speech Demo - Cantonese</p>
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontWeight: 600 }}>Text to Convert</label>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          rows={6}
          style={{ width: '100%', padding: 12, borderRadius: 8, border: '1.5px solid #ccc', marginTop: 8 }}
        />
      </div>
      <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontWeight: 600 }}>Voice</label>
          <select value={voice} onChange={e => setVoice(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1.5px solid #ccc', marginTop: 8 }}>
            {VOICES.map(v => (
              <option key={v.value} value={v.value}>{v.label}</option>
            ))}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ fontWeight: 600 }}>Speed</label>
          <select value={speed} onChange={e => setSpeed(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1.5px solid #ccc', marginTop: 8 }}>
            <option value="0.75">Slow (0.75x)</option>
            <option value="1.0">Normal (1.0x)</option>
            <option value="1.25">Fast (1.25x)</option>
            <option value="1.5">Very Fast (1.5x)</option>
          </select>
        </div>
      </div>
      <button onClick={handleGenerate} disabled={loading} style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff', border: 'none', padding: '14px 28px', borderRadius: 8, fontWeight: 600, fontSize: 16, cursor: 'pointer', marginBottom: 16 }}>
        {loading ? 'Generating...' : '🎵 Generate Speech'}
      </button>
      {status && <div style={{ margin: '16px 0', color: status.startsWith('Error') ? '#c62828' : '#388e3c', background: status.startsWith('Error') ? '#ffebee' : '#e8f5e9', padding: 12, borderRadius: 8 }}>{status}</div>}
      {audioUrl && (
        <div style={{ marginTop: 24, background: '#f5f5f5', borderRadius: 8, padding: 20 }}>
          <strong>🎧 Audio Ready</strong>
          <audio src={audioUrl} controls style={{ width: '100%', marginTop: 10 }} />
        </div>
      )}
    </div>
  );
}
