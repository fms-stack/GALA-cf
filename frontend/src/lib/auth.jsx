import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "./api";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);   // null = unknown, false = guest, object = authed
  const [loading, setLoading] = useState(true);
  const [checked, setChecked] = useState(false);

  const refresh = useCallback(async () => {
    setChecked(true);
    setLoading(true);
    try {
      const { data } = await api.get("/auth/me");
      setUser(data);
    } catch {
      setUser(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // La session n'est vérifiée que pour l'espace équipe : le site public n'envoie aucun appel /auth/me.
  useEffect(() => {
    if (/^\/(admin|portail)/.test(window.location.pathname)) refresh();
    else setLoading(false);
  }, [refresh]);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    setUser(data);
    return data;
  };

  const logout = async () => {
    try { await api.post("/auth/logout"); } catch {}
    setUser(false);
  };

  return (
    <AuthCtx.Provider value={{ user, loading, checked, login, logout, refresh, setUser }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
