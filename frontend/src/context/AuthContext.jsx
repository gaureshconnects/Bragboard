import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(localStorage.getItem("access_token"));

  useEffect(() => {
    localStorage.setItem("access_token", accessToken || "");
  }, [accessToken]);

  const login = (token) => setAccessToken(token);
  const logout = () => {
    setAccessToken(null);
    localStorage.removeItem("access_token");
  };

  return (
    <AuthContext.Provider value={{ accessToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
