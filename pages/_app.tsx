import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { supabase } from '../src/utils/supabaseClient';

export default function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Optionally, you can add Supabase auth listeners here
  }, []);
  return <Component {...pageProps} />;
}
