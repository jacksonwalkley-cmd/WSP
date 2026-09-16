import { useEffect, useState } from 'react';
import { supabase } from './supabase';

const cache = new Map<string, string>();

// The wsp-media bucket is private (RLS-scoped per athlete), so every path
// needs a short-lived signed URL rather than a public one.
export function useSignedUrl(path: string | null | undefined, expirySeconds = 3600): string | null {
  const [url, setUrl] = useState<string | null>(path ? cache.get(path) ?? null : null);

  useEffect(() => {
    if (!path) {
      setUrl(null);
      return;
    }
    const hit = cache.get(path);
    if (hit) {
      setUrl(hit);
      return;
    }
    let cancelled = false;
    supabase.storage
      .from('wsp-media')
      .createSignedUrl(path, expirySeconds)
      .then(({ data }) => {
        if (!cancelled && data?.signedUrl) {
          cache.set(path, data.signedUrl);
          setUrl(data.signedUrl);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [path, expirySeconds]);

  return url;
}
