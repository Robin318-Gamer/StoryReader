
import { useEffect, useState } from 'react';
import { supabase } from '../src/utils/supabaseClient';
import { RequireAuth } from '../components/RequireAuth';
import { AudioPlayer } from '../components/AudioPlayer';
import { Pagination } from '../components/Pagination';
import { useRouter } from 'next/router';

interface HistoryItem {
  id: string;
  title?: string | null;
  text: string;
  original_text?: string | null;
  ssml_content?: string | null;
  voice: string;
  speed: number;
  audio_url: string;
  created_at: string;
  user_id?: string;
}

function getVoiceLanguage(voice: string) {
  if (voice.startsWith('yue')) return 'Cantonese';
  if (voice.startsWith('cmn')) return 'Mandarin';
  if (voice.startsWith('en')) return 'English';
  if (voice.startsWith('ja')) return 'Japanese';
  if (voice.startsWith('ko')) return 'Korean';
  if (voice.startsWith('fr')) return 'French';
  return voice;
}


export default function HistoryPage() {
  const router = useRouter();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<HistoryItem | null>(null);
  const [user, setUser] = useState<any>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;
  const totalPages = Math.ceil(history.length / pageSize);
  // Paginated data (move up for useEffect)
  const paginated = history.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Store audio durations
  const [audioDurations, setAudioDurations] = useState<{ [id: string]: number }>({});

  // Preload durations for visible items
  useEffect(() => {
    paginated.forEach(item => {
      if (!audioDurations[item.id] && item.audio_url) {
        const audio = new window.Audio(item.audio_url);
        audio.addEventListener('loadedmetadata', () => {
          setAudioDurations(d => ({ ...d, [item.id]: audio.duration }));
        });
      }
    });
    // eslint-disable-next-line
  }, [paginated]);

  function formatDuration(sec: number | undefined) {
    if (!sec || isNaN(sec)) return '--:--';
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    if (mins > 0) {
      return `${mins} min${mins > 1 ? 's' : ''} ${secs} sec`;
    }
    return `${secs} sec`;
  }

  useEffect(() => {
    async function fetchHistory() {
      setLoading(true);
      const userRes = await supabase.auth.getUser();
      const user = userRes.data.user;
      setUser(user);
      if (!user) return;
      const { data, error } = await supabase
        .from('tts_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (!error && data) setHistory(data as HistoryItem[]);
      setLoading(false);
    }
    fetchHistory();
  }, []);

  // Paginated data (moved above)
  // const paginated = history.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Download audio
  const handleDownload = (item: HistoryItem) => {
    if (!item.audio_url) return;
    const link = document.createElement('a');
    link.href = item.audio_url;
    link.download = `storyreader-audio-${item.id}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Delete item
  const handleDelete = async (item: HistoryItem) => {
    if (!window.confirm('Delete this history item?')) return;
    await supabase.from('tts_history').delete().eq('id', item.id);
    setHistory(h => h.filter(hh => hh.id !== item.id));
    if (selected?.id === item.id) setSelected(null);
  };

  return (
    <RequireAuth>
      <div
        style={{
          maxWidth: 900,
          margin: '20px auto',
          background: '#fff',
          borderRadius: 16,
          boxShadow: '0 8px 32px #0002',
          padding: '16px',
        }}
      >
        {/* Navigation Menu */}
        <nav style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
          <button
            onClick={() => router.push('/')}
            style={{ padding: '8px 16px', borderRadius: 8, background: '#667eea', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 500 }}
          >
            Home
          </button>
          <button
            onClick={() => router.push('/ssml')}
            style={{ padding: '8px 16px', borderRadius: 8, background: '#764ba2', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 500 }}
          >
            SSML
          </button>
          <button
            onClick={() => router.push('/history')}
            style={{ padding: '8px 16px', borderRadius: 8, background: '#333', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 500 }}
            disabled
          >
            History
          </button>
        </nav>
        <h1>🕑 History</h1>
        {loading ? (
          <div>Loading...</div>
        ) : history.length === 0 ? (
          <div>No history found.</div>
        ) : (
          <>
            <div style={{ width: '100%', overflowX: 'auto', marginTop: 16, WebkitOverflowScrolling: 'touch' }}>
              <table style={{ minWidth: 500, width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ background: '#f5f5f5' }}>
                    <th style={{ padding: '6px 8px', border: '1px solid #eee', fontSize: 13, whiteSpace: 'nowrap' }}>Title</th>
                    <th style={{ padding: '6px 8px', border: '1px solid #eee', fontSize: 13, whiteSpace: 'nowrap' }}>Length</th>
                    <th style={{ padding: '6px 8px', border: '1px solid #eee', fontSize: 13, whiteSpace: 'nowrap' }}>Language</th>
                    <th style={{ padding: '6px 8px', border: '1px solid #eee', fontSize: 13, whiteSpace: 'nowrap', display: window.innerWidth < 600 ? 'none' : 'table-cell' }}>Date</th>
                    <th style={{ padding: '6px 8px', border: '1px solid #eee', fontSize: 13, whiteSpace: 'nowrap' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map(item => (
                    <tr key={item.id} style={{ background: selected?.id === item.id ? '#e3f2fd' : undefined, cursor: 'pointer' }} onClick={() => setSelected(item)}>
                      <td style={{ padding: '6px 8px', border: '1px solid #eee', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 13 }}>
                        {item.title || (item.original_text || item.text).slice(0, 30) + '...'}
                        {item.ssml_content && <span style={{ marginLeft: 4, fontSize: 10, background: '#764ba2', color: '#fff', padding: '1px 4px', borderRadius: 2 }} title="Generated with AI SSML">🎭</span>}
                      </td>
                      <td style={{ padding: '6px 8px', border: '1px solid #eee', minWidth: 60, color: '#888', fontSize: 12, whiteSpace: 'nowrap' }}>
                        {formatDuration(audioDurations[item.id])}
                      </td>
                      <td style={{ padding: '6px 8px', border: '1px solid #eee', fontSize: 12, whiteSpace: 'nowrap' }}>{getVoiceLanguage(item.voice)}</td>
                      <td style={{ padding: '6px 8px', border: '1px solid #eee', fontSize: 11, whiteSpace: 'nowrap', display: window.innerWidth < 600 ? 'none' : 'table-cell' }}>{new Date(item.created_at).toLocaleString()}</td>
                      <td style={{ padding: '6px 8px', border: '1px solid #eee', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <button onClick={e => { e.stopPropagation(); handleDownload(item); }} style={{ marginRight: 4, border: 'none', background: 'none', cursor: 'pointer', fontSize: 18 }} title="Download"><span role="img" aria-label="download">⬇️</span></button>
                        <button onClick={e => { e.stopPropagation(); handleDelete(item); }} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 18 }} title="Delete"><span role="img" aria-label="delete">🗑️</span></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            {/* Enhanced Audio Player and Details */}
            <div
              style={{
                marginTop: 24,
                background: '#f5f5f5',
                borderRadius: 12,
                padding: 16,
                minHeight: 140,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                maxWidth: '100%',
              }}
            >
              <h3 style={{ margin: 0, marginBottom: 8, fontSize: 18 }}>🎧 Audio Player</h3>
              <div style={{ width: '100%', minWidth: 0 }}>
                <AudioPlayer src={selected?.audio_url || null} />
              </div>
              {selected && (
                <div style={{ marginTop: 8, width: '100%' }}>
                  {selected.title && (
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 13, color: '#888' }}>Title</div>
                      <div style={{ fontSize: 16, fontWeight: 600, color: '#333' }}>{selected.title}</div>
                    </div>
                  )}
                  <div style={{ fontWeight: 600, marginBottom: 6, fontSize: 14 }}>Full Text</div>
                  <div style={{ background: '#fff', borderRadius: 8, padding: 10, fontSize: 14, color: '#333', whiteSpace: 'pre-wrap', wordBreak: 'break-word', boxShadow: '0 2px 8px #0001', maxWidth: '100%', overflowX: 'auto' }}>
                    {selected.original_text || selected.text}
                  </div>
                  {selected.ssml_content && (
                    <div style={{ marginTop: 10 }}>
                      <div style={{ fontWeight: 600, marginBottom: 6, fontSize: 13, color: '#764ba2' }}>🎭 AI-Generated SSML Markup</div>
                      <details style={{ background: '#f9f9f9', borderRadius: 8, padding: 10 }}>
                        <summary style={{ cursor: 'pointer', fontWeight: 500, color: '#666', fontSize: 13 }}>View SSML Code</summary>
                        <pre style={{ marginTop: 8, fontSize: 11, overflow: 'auto', background: '#fff', padding: 8, borderRadius: 4, border: '1px solid #eee' }}>{selected.ssml_content}</pre>
                      </details>
                    </div>
                  )}
                  <div style={{ marginTop: 10, fontSize: 13, color: '#666', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span>Created By: <b>{user?.email || user?.id || 'Unknown'}</b></span>
                    <span>Create Date: <b>{new Date(selected.created_at).toLocaleString()}</b></span>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </RequireAuth>
  );
}
