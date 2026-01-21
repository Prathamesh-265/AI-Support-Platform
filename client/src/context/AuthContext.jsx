import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getMe } from "../services/auth.api.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    const init = async () => {
      if (!token) return;
      try {
        setLoading(true);
        const me = await getMe();
        setUser(me);
      } catch {
        localStorage.removeItem("token");
        setToken("");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [token]);

  const value = useMemo(
    () => ({ token, setToken, user, setUser, loading }),
    [token, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
