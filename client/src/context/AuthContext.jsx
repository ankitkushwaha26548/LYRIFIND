import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, tokenStore } from '../api/client';

const AuthContext = createContext(null);

/** Holds the logged-in user. On first load it validates a saved token with /auth/me. */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(tokenStore.get()));

  useEffect(() => {
    if (!tokenStore.get()) return;
    api.me().then((d) => setUser(d.user)).catch(() => tokenStore.clear()).finally(() => setLoading(false));
  }, []);

  const authenticate = useCallback(async (mode, body) => {
    const data = await (mode === 'login' ? api.login(body) : api.register(body));
    tokenStore.set(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => { tokenStore.clear(); setUser(null); }, []);

  const value = useMemo(() => ({ user, loading, authenticate, logout, isAdmin: user?.role === 'admin' }), [user, loading, authenticate, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
