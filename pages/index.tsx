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
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setStatus('Error: Not authenticated');
        return;
      }

      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ text, voice, speed }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to generate speech');
      }

      const data = await res.json();
      
      if (data.cached) {
        setStatus('✅ Speech retrieved from cache!');
      } else {
        setStatus('✅ Speech generated successfully!');
      }
      
      setAudioUrl(data.audioUrl);
    } catch (e: any) {
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
          <button onClick={() => router.push('/history')} style={{ marginRight: 8, padding: '8px 16px', borderRadius: 8, background: '#667eea', color: '#fff', border: 'none', cursor: 'pointer' }}>
            History
          </button>
          <button onClick={handleLogout} style={{ padding: '8px 16px', borderRadius: 8, background: '#ccc', color: '#333', border: 'none', cursor: 'pointer' }}>
            Logout
          </button>
        </div>
      </div>
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
