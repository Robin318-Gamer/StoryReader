import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '../src/utils/supabaseClient';

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const session = supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.replace('/login');
      } else {
        setUser(data.session.user);
      }
      setLoading(false);
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

  if (loading) return <div>Loading...</div>;
  if (!user) return null;
  return <>{children}</>;
}
