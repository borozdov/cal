import { useCallback, useEffect, useState } from 'react';
import type { Poll } from '@cal/shared';
import { api, ApiError } from '../../api/client.js';

export function usePoll(slug: string, adminToken?: string) {
  const [poll, setPoll] = useState<Poll | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      // A wrong admin token must not open the organizer page.
      if (adminToken) await api.get(`/polls/${slug}/admin/${adminToken}`);
      setPoll(await api.get<Poll>(`/polls/${slug}`));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Не удалось загрузить встречу');
    }
  }, [slug, adminToken]);

  useEffect(() => {
    // fetch-on-mount: `reload` is stable (keyed on slug), no render loop
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void reload();
  }, [reload]);

  // Answers arrive from other devices: refresh when the tab comes back into view.
  useEffect(() => {
    function onVisible() {
      if (document.visibilityState === 'visible') void reload();
    }
    document.addEventListener('visibilitychange', onVisible);
    const timer = setInterval(onVisible, 20_000);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      clearInterval(timer);
    };
  }, [reload]);

  return { poll, error, reload };
}
