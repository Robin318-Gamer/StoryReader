import { useEffect } from 'react';
import { supabase } from '../src/utils/supabaseClient';
import { useRouter } from 'next/router';

export default function Login() {
  const router = useRouter();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        router.replace('/');
      }
    });
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [router]);

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' });
  };

  return (
    <div style={{ maxWidth: 400, margin: '80px auto', background: '#fff', borderRadius: 12, boxShadow: '0 4px 24px #0002', padding: 32, textAlign: 'center' }}>
      <h2>Sign in to StoryReader</h2>
      <button onClick={handleLogin} style={{ marginTop: 24, padding: '12px 24px', borderRadius: 8, background: '#4285F4', color: '#fff', border: 'none', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>
        Sign in with Google
      </button>
    </div>
  );
}
