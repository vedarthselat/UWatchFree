import { createContext, useState } from "react";

// Create Context
export const AuthContext = createContext();

// AuthProvider component to provide authentication context
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null); // Default is null

  const login = (key) => {
    setToken(key); 
  };

  const logout = () => {
    setToken(null); 
  };

  const isAuthenticated = !!token; 

  return (
    <AuthContext.Provider value={{ token, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};
