import { useEffect, useRef } from 'react';

export default function usePolling(fn, interval = 5000) {
  // fn: async function to call each interval
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => {
    let mounted = true;
    let timer = null;

    const run = async () => {
      if (!mounted) return;
      try { await fnRef.current(); } catch (e) { /* swallow; caller handles errors */ }
      if (!mounted) return;
      timer = setTimeout(run, interval);
    };

    // start initial run
    run();

    return () => {
      mounted = false;
      if (timer) clearTimeout(timer);
    };
  }, [interval]);
}