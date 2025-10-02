import { useEffect, useState } from 'react';
import { supabase } from '../src/utils/supabaseClient';
import { RequireAuth } from '../components/RequireAuth';

interface HistoryItem {
  id: string;
  text: string;
  voice: string;
  speed: number;
  audio_url: string;
  created_at: string;
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      setLoading(true);
      const user = (await supabase.auth.getUser()).data.user;
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

  return (
    <RequireAuth>
      <div style={{ maxWidth: 800, margin: '40px auto', background: '#fff', borderRadius: 16, boxShadow: '0 8px 32px #0002', padding: 32 }}>
        <h1>🕑 History</h1>
        {loading ? (
          <div>Loading...</div>
        ) : history.length === 0 ? (
          <div>No history found.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 24 }}>
            <thead>
              <tr style={{ background: '#f5f5f5' }}>
                <th style={{ padding: 8, border: '1px solid #eee' }}>Text</th>
                <th style={{ padding: 8, border: '1px solid #eee' }}>Voice</th>
                <th style={{ padding: 8, border: '1px solid #eee' }}>Speed</th>
                <th style={{ padding: 8, border: '1px solid #eee' }}>Date</th>
                <th style={{ padding: 8, border: '1px solid #eee' }}>Audio</th>
              </tr>
            </thead>
            <tbody>
              {history.map(item => (
                <tr key={item.id}>
                  <td style={{ padding: 8, border: '1px solid #eee', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.text.slice(0, 50)}...</td>
                  <td style={{ padding: 8, border: '1px solid #eee' }}>{item.voice}</td>
                  <td style={{ padding: 8, border: '1px solid #eee' }}>{item.speed}</td>
                  <td style={{ padding: 8, border: '1px solid #eee' }}>{new Date(item.created_at).toLocaleString()}</td>
                  <td style={{ padding: 8, border: '1px solid #eee' }}>
                    <audio src={item.audio_url} controls style={{ width: 120 }} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </RequireAuth>
  );
}
