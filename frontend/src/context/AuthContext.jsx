import { createContext, useContext, useState, useEffect } from "react";
import { authApi } from "../api/endpoints";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("sharanee_user");
    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch {
        localStorage.removeItem("sharanee_user");
      }
    }
    setReady(true);
  }, []);

  const login = async (email, password) => {
    const { data } = await authApi.login({ email, password });
    localStorage.setItem("sharanee_token", data.token);
    localStorage.setItem("sharanee_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const register = async (payload) => {
    const { data } = await authApi.register(payload);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("sharanee_token");
    localStorage.removeItem("sharanee_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, ready, login, register, logout, isAdmin: user?.role === "admin" }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
