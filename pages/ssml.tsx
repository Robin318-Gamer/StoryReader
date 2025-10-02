import { useState, useEffect } from 'react';
import { supabase } from '../src/utils/supabaseClient';
import { useRouter } from 'next/router';

const EXAMPLE_SSML = `<speak>
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
</speak>`;

const VOICES = [
  { value: 'yue-HK-Standard-A', label: 'Cantonese (HK) - Female A' },
  { value: 'yue-HK-Standard-B', label: 'Cantonese (HK) - Male B' },
  { value: 'yue-HK-Standard-C', label: 'Cantonese (HK) - Female C' },
  { value: 'yue-HK-Standard-D', label: 'Cantonese (HK) - Male D' },
  { value: 'cmn-CN-Standard-A', label: 'Mandarin (CN) - Female A' },
  { value: 'cmn-CN-Standard-B', label: 'Mandarin (CN) - Male B' },
  { value: 'en-US-Neural2-A', label: 'English (US) - Female A' },
  { value: 'en-US-Neural2-D', label: 'English (US) - Male D' },
];

export default function SSMLPage() {
  const [ssml, setSsml] = useState(EXAMPLE_SSML);
  const [voice, setVoice] = useState(VOICES[0].value);
  const [speed, setSpeed] = useState('1.0');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  // Calculate character count
  const charCount = ssml.length;
  const byteSize = new TextEncoder().encode(ssml).length;
  const isOverLimit = byteSize > 5000;

  useEffect(() => {
    // Check authentication
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace('/login');
      } else {
        setUser(session.user);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace('/login');
      } else {
        setUser(session.user);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [router]);

  async function handleGenerate() {
    if (!user) {
      setStatus('Please log in first');
      return;
    }

    setLoading(true);
    setStatus('Generating speech from SSML...');
    setAudioUrl(null);
    
    try {
      console.log('[SSML Frontend] Starting SSML TTS generation...');
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setStatus('Error: Not authenticated');
        console.error('[SSML Frontend] No session found');
        return;
      }

      console.log('[SSML Frontend] Sending request to /api/tts-ssml...');
      const res = await fetch('/api/tts-ssml', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ ssml, voice, speed }),
      });

      console.log('[SSML Frontend] Response status:', res.status);

      if (!res.ok) {
        const err = await res.json();
        console.error('[SSML Frontend] Error response:', err);
        throw new Error(err.error || 'Failed to generate speech');
      }

      const data = await res.json();
      console.log('[SSML Frontend] Success response:', data);
      
      setStatus('✅ SSML speech generated successfully!');
      setAudioUrl(data.audioUrl);
      console.log('[SSML Frontend] Audio URL set:', data.audioUrl);
    } catch (e: any) {
      console.error('[SSML Frontend] Exception caught:', e);
      setStatus('Error: ' + e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace('/login');
  }

  function loadExample() {
    setSsml(EXAMPLE_SSML);
    setStatus('Example SSML loaded');
  }

  if (!user) return <div>Loading...</div>;

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', background: '#fff', borderRadius: 16, boxShadow: '0 8px 32px #0002', padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1>🎙️ SSML Speech Synthesis</h1>
          <p style={{ color: '#666', margin: 0 }}>Advanced Text-to-Speech with SSML Markup</p>
        </div>
        <div>
          <button onClick={() => router.push('/')} style={{ marginRight: 8, padding: '8px 16px', borderRadius: 8, background: '#667eea', color: '#fff', border: 'none', cursor: 'pointer' }}>
            ← Plain Text
          </button>
          <button onClick={() => router.push('/history')} style={{ marginRight: 8, padding: '8px 16px', borderRadius: 8, background: '#667eea', color: '#fff', border: 'none', cursor: 'pointer' }}>
            History
          </button>
          <button onClick={handleLogout} style={{ padding: '8px 16px', borderRadius: 8, background: '#ccc', color: '#333', border: 'none', cursor: 'pointer' }}>
            Logout
          </button>
        </div>
      </div>

      {/* SSML Info Banner */}
      <div style={{ marginBottom: 20, padding: 16, background: '#e3f2fd', borderRadius: 8, borderLeft: '4px solid #2196f3' }}>
        <h3 style={{ margin: '0 0 8px 0', color: '#1976d2' }}>What is SSML?</h3>
        <p style={{ margin: '0 0 8px 0', fontSize: 14, color: '#555' }}>
          SSML (Speech Synthesis Markup Language) allows you to control speech properties like:
        </p>
        <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: '#555' }}>
          <li><code>&lt;break time="500ms"/&gt;</code> - Add pauses</li>
          <li><code>&lt;emphasis level="strong"&gt;</code> - Emphasize words</li>
          <li><code>&lt;prosody rate="slow" pitch="high"&gt;</code> - Control rate and pitch</li>
          <li><code>&lt;say-as interpret-as="date"&gt;</code> - Format numbers, dates, etc.</li>
        </ul>
        <div style={{ marginTop: 10 }}>
          <button onClick={loadExample} style={{ padding: '6px 12px', fontSize: 13, borderRadius: 6, background: '#2196f3', color: '#fff', border: 'none', cursor: 'pointer' }}>
            Load Example SSML
          </button>
          <a href="https://cloud.google.com/text-to-speech/docs/ssml" target="_blank" rel="noopener" style={{ marginLeft: 12, fontSize: 13, color: '#2196f3' }}>
            📖 SSML Documentation
          </a>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <label style={{ fontWeight: 600 }}>SSML Input</label>
          <div style={{ fontSize: 14, color: isOverLimit ? '#c62828' : byteSize > 4000 ? '#f57c00' : '#666' }}>
            {charCount} characters | {byteSize} bytes
            {isOverLimit && ' (⚠️ Exceeds 5000 byte limit!)'}
            {byteSize > 4000 && !isOverLimit && ' (⚠️ Approaching 5000 byte limit)'}
          </div>
        </div>
        <textarea
          value={ssml}
          onChange={e => setSsml(e.target.value)}
          rows={12}
          style={{ 
            width: '100%', 
            padding: 12, 
            borderRadius: 8, 
            border: `1.5px solid ${isOverLimit ? '#c62828' : byteSize > 4000 ? '#f57c00' : '#ccc'}`,
            fontFamily: 'monospace',
            fontSize: 13,
            lineHeight: 1.5
          }}
          placeholder="Enter SSML markup here..."
        />
        {isOverLimit && (
          <div style={{ marginTop: 8, padding: 10, background: '#ffebee', borderRadius: 6, fontSize: 13, color: '#c62828' }}>
            ⚠️ Your SSML exceeds 5000 bytes. Please reduce the content or remove some markup.
          </div>
        )}
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
          <label style={{ fontWeight: 600 }}>Base Speed</label>
          <select value={speed} onChange={e => setSpeed(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1.5px solid #ccc', marginTop: 8 }}>
            <option value="0.75">Slow (0.75x)</option>
            <option value="1.0">Normal (1.0x)</option>
            <option value="1.25">Fast (1.25x)</option>
            <option value="1.5">Very Fast (1.5x)</option>
          </select>
          <p style={{ margin: '4px 0 0 0', fontSize: 12, color: '#999' }}>
            Note: SSML prosody tags override this setting
          </p>
        </div>
      </div>

      <button 
        onClick={handleGenerate} 
        disabled={loading || isOverLimit} 
        style={{ 
          background: isOverLimit ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
          color: '#fff', 
          border: 'none', 
          padding: '14px 28px', 
          borderRadius: 8, 
          fontWeight: 600, 
          fontSize: 16, 
          cursor: isOverLimit ? 'not-allowed' : 'pointer', 
          marginBottom: 16 
        }}
      >
        {loading ? 'Generating...' : '🎵 Generate Speech from SSML'}
      </button>

      {status && (
        <div style={{ 
          margin: '16px 0', 
          color: status.startsWith('Error') ? '#c62828' : '#388e3c', 
          background: status.startsWith('Error') ? '#ffebee' : '#e8f5e9', 
          padding: 12, 
          borderRadius: 8 
        }}>
          {status}
        </div>
      )}

      {audioUrl && (
        <div style={{ marginTop: 24, background: '#f5f5f5', borderRadius: 8, padding: 20 }}>
          <strong>🎧 Audio Ready</strong>
          <audio src={audioUrl} controls style={{ width: '100%', marginTop: 10 }} />
        </div>
      )}

      {/* SSML Tips */}
      <div style={{ marginTop: 30, padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
        <h4 style={{ margin: '0 0 12px 0' }}>💡 SSML Tips</h4>
        <div style={{ fontSize: 13, color: '#555', lineHeight: 1.8 }}>
          <strong>Common SSML Tags:</strong>
          <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
            <li><code>&lt;speak&gt;</code> - Root element (required)</li>
            <li><code>&lt;p&gt;</code> and <code>&lt;s&gt;</code> - Paragraphs and sentences</li>
            <li><code>&lt;break time="500ms"/&gt;</code> - Add pauses (ms or s)</li>
            <li><code>&lt;emphasis level="strong|moderate|reduced"&gt;</code> - Emphasize text</li>
            <li><code>&lt;prosody rate="slow|medium|fast|80%"&gt;</code> - Control speaking rate</li>
            <li><code>&lt;prosody pitch="high|medium|low|+10%"&gt;</code> - Control pitch</li>
            <li><code>&lt;prosody volume="loud|medium|soft|+6dB"&gt;</code> - Control volume</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
