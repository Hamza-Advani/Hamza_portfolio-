import { useCallback, useEffect, useRef, useState } from 'react';

/** Runs an async loader on mount / when deps change. Returns { data, error, loading, reload, setData }. */
export function useFetch(loader, deps = []) {
  const [state, setState] = useState({ data: null, error: null, loading: true });
  const loaderRef = useRef(loader);
  loaderRef.current = loader;

  const run = useCallback(async (signal) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await loaderRef.current({ signal });
      if (!signal?.aborted) setState({ data, error: null, loading: false });
    } catch (error) {
      if (error.name !== 'AbortError' && !signal?.aborted) setState({ data: null, error, loading: false });
    }
  }, []);

  useEffect(() => {
    const ctrl = new AbortController();
    run(ctrl.signal);
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const reload = useCallback(() => run(), [run]);
  const setData = useCallback(
    (updater) => setState((s) => ({ ...s, data: typeof updater === 'function' ? updater(s.data) : updater })),
    [],
  );
  return { ...state, reload, setData };
}
