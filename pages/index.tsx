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
];

export default function Home() {
  const [text, setText] = useState(DEFAULT_TEXT);
  const [voice, setVoice] = useState(VOICES[0].value);
  const [speed, setSpeed] = useState('1.0');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
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
    setStatus('Generating speech...');
    setAudioUrl(null);
    try {
      console.log('[Frontend] Starting TTS generation...');
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setStatus('Error: Not authenticated');
        console.error('[Frontend] No session found');
        return;
      }
      console.log('[Frontend] Session found, user:', session.user.id);

      console.log('[Frontend] Sending request to /api/tts...');
      console.log('[Frontend] Request payload:', { text: text.substring(0, 50) + '...', voice, speed });
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ text, voice, speed }),
      });

      console.log('[Frontend] Response status:', res.status);
      console.log('[Frontend] Response OK:', res.ok);

      if (!res.ok) {
        const err = await res.json();
        console.error('[Frontend] Error response:', err);
        throw new Error(err.error || 'Failed to generate speech');
      }

      const data = await res.json();
      console.log('[Frontend] Success response:', data);
      
      if (data.cached) {
        setStatus('✅ Speech retrieved from cache!');
      } else if (data.chunked && data.chunkCount > 1) {
        setStatus(`✅ Speech generated successfully! (Processed ${data.chunkCount} chunks and merged)`);
      } else {
        setStatus('✅ Speech generated successfully!');
      }
      
      if (data.insertError) {
        console.warn('[Frontend] Warning: Insert error occurred:', data.insertError);
        setStatus(status => status + ' (Warning: History not saved)');
      }
      
      setAudioUrl(data.audioUrl);
      console.log('[Frontend] Audio URL set:', data.audioUrl);
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
    <div style={{ maxWidth: 700, margin: '40px auto', background: '#fff', borderRadius: 16, boxShadow: '0 8px 32px #0002', padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1>🎙️ StoryReader POC</h1>
          <p style={{ color: '#666', margin: 0 }}>Google Cloud Text-to-Speech Demo</p>
        </div>
        <div>
          <button onClick={() => router.push('/ssml')} style={{ marginRight: 8, padding: '8px 16px', borderRadius: 8, background: '#764ba2', color: '#fff', border: 'none', cursor: 'pointer' }}>
            SSML Mode
          </button>
          <button onClick={() => router.push('/history')} style={{ marginRight: 8, padding: '8px 16px', borderRadius: 8, background: '#667eea', color: '#fff', border: 'none', cursor: 'pointer' }}>
            History
          </button>
          <button onClick={handleLogout} style={{ padding: '8px 16px', borderRadius: 8, background: '#ccc', color: '#333', border: 'none', cursor: 'pointer' }}>
            Logout
          </button>
        </div>
      </div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <label style={{ fontWeight: 600 }}>Text to Convert</label>
          <div style={{ fontSize: 14, color: isOverLimit ? '#c62828' : byteSize > 4000 ? '#f57c00' : '#666' }}>
            {charCount} characters | {byteSize} bytes {isOverLimit && '(⚠️ Will be split into chunks)'}
            {byteSize > 4000 && !isOverLimit && '(⚠️ Approaching 5000 byte limit)'}
          </div>
        </div>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          rows={6}
          style={{ 
            width: '100%', 
            padding: 12, 
            borderRadius: 8, 
            border: `1.5px solid ${isOverLimit ? '#c62828' : byteSize > 4000 ? '#f57c00' : '#ccc'}`, 
            marginTop: 8 
          }}
        />
        {willBeSplit && (
          <div style={{ marginTop: 8, padding: 10, background: '#fff3e0', borderRadius: 6, fontSize: 13, color: '#e65100' }}>
            ℹ️ Your text exceeds 5000 bytes. It will be automatically split into {Math.ceil(byteSize / 4500)} chunks and merged into a single audio file.
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
