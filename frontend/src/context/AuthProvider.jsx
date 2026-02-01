import { useState } from "react";
import { AuthContext } from "./AuthContext";

function AuthProvider({ children }) {
  const [token, setToken] = useState(
    localStorage.getItem("access_token")
  );
  const [email, setEmail] = useState(
    localStorage.getItem("user_email")
  );

  const login = (token, email) => {
    localStorage.setItem("access_token", token);
    localStorage.setItem("user_email", email);
    setToken(token);
    setEmail(email);
  };

  const logout = () => {
    localStorage.clear();
    setToken(null);
    setEmail(null);
  };

  return (
    <AuthContext.Provider
      value={{ token, email, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;