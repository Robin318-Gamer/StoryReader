import { useState, useEffect } from 'react';
import { supabase } from '../src/utils/supabaseClient';
import { useRouter } from 'next/router';

const DEFAULT_TEXT =
  '內地國慶黃金周長假期間，大量市民出行遊玩，路上塞車嚴重。有深圳車主表示，自己昨天（9月30日）中午12點從深圳出發到湖南邵陽，到今天（1日）凌晨3點左右，開了15個小時車還沒出廣東。';

const VOICES = [
  { value: 'yue-HK-Standard-A', label: 'Cantonese (HK) - Female A' },
  { value: 'yue-HK-Standard-B', label: 'Cantonese (HK) - Male B' },
  { value: 'yue-HK-Standard-C', label: 'Cantonese (HK) - Female C' },
  { value: 'yue-HK-Standard-D', label: 'Cantonese (HK) - Male D' },
  { value: 'cmn-CN-Standard-A', label: 'Mandarin (CN) - Female A' },
  { value: 'cmn-CN-Standard-B', label: 'Mandarin (CN) - Male B' },
  // English (US) voices
  { value: 'en-US-Neural2-A', label: 'English (US) - Female A' },
  { value: 'en-US-Neural2-D', label: 'English (US) - Male D' },
];

export default function Home() {
  const [text, setText] = useState(DEFAULT_TEXT);
  const [title, setTitle] = useState('');
  const [voice, setVoice] = useState(VOICES[0].value);
  const [speed, setSpeed] = useState('1.0');
  const [useSSML, setUseSSML] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  // Calculate character count and byte size
  const charCount = text.length;
  const byteSize = new TextEncoder().encode(text).length;
  const isOverLimit = byteSize > 5000;
  const willBeSplit = byteSize > 5000;

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
    setStatus(null);
    setAudioUrl(null);
    setProgress(0);
    setProgressMessage('Starting...');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setStatus('Error: Not authenticated');
        setLoading(false);
        return;
      }

      // Use streaming endpoint if SSML is enabled, otherwise use regular endpoint
      if (useSSML) {
        console.log('[Frontend] Using SSML mode with real-time progress...');
        const eventSource = new EventSource(
          `/api/tts-with-gemini-stream?token=${session.access_token}`
        );

        // We need to send POST data, so we'll use fetch with streaming instead
        const response = await fetch('/api/tts-with-gemini-stream', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ text, voice, speed, useSSML: true, title }),
        });

        if (!response.body) {
          throw new Error('No response body');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = JSON.parse(line.slice(6));
              setProgress(data.progress);
              setProgressMessage(data.message);

              if (data.error) {
                setStatus(`Error: ${data.message}`);
                setLoading(false);
                return;
              }

              if (data.progress === 100 && data.audioUrl) {
                setAudioUrl(data.audioUrl);
                setStatus('✅ Speech generated successfully with AI storytelling!');
              }
            }
          }
        }
      } else {
        // Regular mode without SSML
        console.log('[Frontend] Using regular mode...');
        setProgressMessage('Generating speech...');
        
        const res = await fetch('/api/tts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ text, voice, speed, title }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Failed to generate speech');
        }

        const data = await res.json();
        
        if (data.cached) {
          setStatus('✅ Speech retrieved from cache!');
        } else if (data.chunked && data.chunkCount > 1) {
          setStatus(`✅ Speech generated successfully! (Processed ${data.chunkCount} chunks and merged)`);
        } else {
          setStatus('✅ Speech generated successfully!');
        }
        
        setAudioUrl(data.audioUrl);
        setProgress(100);
      }
    } catch (e: any) {
      console.error('[Frontend] Exception caught:', e);
      setStatus('Error: ' + e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace('/login');
  }

  if (!user) return <div>Loading...</div>;

  return (
    <div style={{ maxWidth: 700, margin: '20px auto', background: '#fff', borderRadius: 16, boxShadow: '0 8px 32px #0002', padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ flex: '1 1 auto', minWidth: 200 }}>
          <h1 style={{ fontSize: 24, margin: 0, marginBottom: 4 }}>🎙️ StoryReader</h1>
          <p style={{ color: '#666', margin: 0, fontSize: 13 }}>Google Cloud Text-to-Speech</p>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button onClick={() => router.push('/ssml')} style={{ padding: '6px 12px', borderRadius: 8, background: '#764ba2', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, whiteSpace: 'nowrap' }}>
            SSML
          </button>
          <button onClick={() => router.push('/history')} style={{ padding: '6px 12px', borderRadius: 8, background: '#667eea', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, whiteSpace: 'nowrap' }}>
            History
          </button>
          <button onClick={handleLogout} style={{ padding: '6px 12px', borderRadius: 8, background: '#ccc', color: '#333', border: 'none', cursor: 'pointer', fontSize: 13, whiteSpace: 'nowrap' }}>
            Logout
          </button>
        </div>
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontWeight: 600, fontSize: 14 }}>Title (Optional)</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Enter a title for this audio..."
          style={{ width: '100%', padding: 8, borderRadius: 8, border: '1.5px solid #ccc', marginTop: 6, fontSize: 14, boxSizing: 'border-box' }}
        />
      </div>
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6, flexWrap: 'wrap', gap: 8 }}>
          <label style={{ fontWeight: 600, fontSize: 14 }}>Text to Convert</label>
          <div style={{ fontSize: 12, color: isOverLimit ? '#c62828' : byteSize > 4000 ? '#f57c00' : '#666', textAlign: 'right' }}>
            {charCount} chars | {byteSize} bytes {isOverLimit && '(⚠️ Split)'}
            {byteSize > 4000 && !isOverLimit && '(⚠️ Near limit)'}
          </div>
        </div>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          rows={6}
          style={{ 
            width: '100%', 
            padding: 10, 
            borderRadius: 8, 
            border: `1.5px solid ${isOverLimit ? '#c62828' : byteSize > 4000 ? '#f57c00' : '#ccc'}`, 
            marginTop: 6,
            fontSize: 14,
            boxSizing: 'border-box'
          }}
        />
        {willBeSplit && (
          <div style={{ marginTop: 8, padding: 8, background: '#fff3e0', borderRadius: 6, fontSize: 12, color: '#e65100' }}>
            ℹ️ Text will be split into {Math.ceil(byteSize / 4500)} chunks and merged.
          </div>
        )}
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'not-allowed', opacity: 0.5 }}>
          <input
            type="checkbox"
            checked={useSSML}
            onChange={e => setUseSSML(e.target.checked)}
            disabled
            style={{ width: 16, height: 16, cursor: 'not-allowed' }}
          />
          <span style={{ fontWeight: 600, fontSize: 14 }}>🎭 Apply Story Teller Tone (SSML with AI) - Coming Soon</span>
        </label>
        <p style={{ fontSize: 12, color: '#999', margin: '6px 0 0 24px' }}>
          This feature is currently disabled. We're working on improvements to the AI-powered storytelling feature.
        </p>
      </div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 200px', minWidth: 150 }}>
          <label style={{ fontWeight: 600, fontSize: 14 }}>Voice</label>
          <select value={voice} onChange={e => setVoice(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1.5px solid #ccc', marginTop: 6, fontSize: 13, boxSizing: 'border-box' }}>
            {VOICES.map(v => (
              <option key={v.value} value={v.value}>{v.label}</option>
            ))}
          </select>
        </div>
        <div style={{ flex: '1 1 150px', minWidth: 120 }}>
          <label style={{ fontWeight: 600, fontSize: 14 }}>Speed</label>
          <select value={speed} onChange={e => setSpeed(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1.5px solid #ccc', marginTop: 6, fontSize: 13, boxSizing: 'border-box' }}>
            <option value="0.75">Slow (0.75x)</option>
            <option value="1.0">Normal (1.0x)</option>
            <option value="1.25">Fast (1.25x)</option>
            <option value="1.5">Very Fast (1.5x)</option>
          </select>
        </div>
      </div>
      <button onClick={handleGenerate} disabled={loading} style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff', border: 'none', padding: '14px 28px', borderRadius: 8, fontWeight: 600, fontSize: 16, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, marginBottom: 16 }}>
        {loading ? 'Generating...' : '🎵 Generate Speech'}
      </button>
      {loading && (
        <div style={{ marginBottom: 16, background: '#f5f5f5', borderRadius: 8, padding: 16 }}>
          <div style={{ marginBottom: 8, fontWeight: 600 }}>Processing Your Audio</div>
          <div style={{ width: '100%', height: 8, background: '#e0e0e0', borderRadius: 4, overflow: 'hidden', marginBottom: 8 }}>
            <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, #667eea, #764ba2)', transition: 'width 0.3s ease' }} />
          </div>
          <div style={{ fontSize: 14, color: '#666' }}>
            {progress}% - {progressMessage}
          </div>
        </div>
      )}
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
