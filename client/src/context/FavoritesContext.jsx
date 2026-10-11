import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from './AuthContext';

const FavoritesContext = createContext(null);

/** Keeps the set of favorite song ids in memory so every card can show a filled/empty heart instantly. */
export function FavoritesProvider({ children }) {
  const { user } = useAuth();
  const [ids, setIds] = useState(new Set());

  useEffect(() => {
    if (!user) { setIds(new Set()); return; }
    api.favorites().then((d) => setIds(new Set(d.favorites.map((s) => s._id)))).catch(() => {});
  }, [user]);

  const toggle = useCallback(async (songId) => {
    const has = ids.has(songId);
    // optimistic update, rolled back if the server rejects the change
    setIds((prev) => { const n = new Set(prev); if (has) n.delete(songId); else n.add(songId); return n; });
    try {
      await (has ? api.removeFavorite(songId) : api.addFavorite(songId));
    } catch (e) {
      setIds((prev) => { const n = new Set(prev); if (has) n.add(songId); else n.delete(songId); return n; });
      throw e;
    }
  }, [ids]);

  const value = useMemo(() => ({ ids, toggle }), [ids, toggle]);
  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export const useFavorites = () => useContext(FavoritesContext);
