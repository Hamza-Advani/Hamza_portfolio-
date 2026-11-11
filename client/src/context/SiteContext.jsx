import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { publicApi } from '../lib/api.js';

const SiteContext = createContext(null);

export function SiteProvider({ children }) {
  const [state, setState] = useState({ loading: true, error: null, profile: null, settings: null, video: null, meta: null });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await publicApi.site();
      setState({ loading: false, error: null, ...data });
    } catch (error) {
      setState((s) => ({ ...s, loading: false, error }));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return <SiteContext.Provider value={{ ...state, reload: load }}>{children}</SiteContext.Provider>;
}

export const useSite = () => useContext(SiteContext) || {};
