import { useState } from "react";
import { AuthContext } from "./AuthContext";
import api from "../services/api";

function AuthProvider({ children }) {
  const [token, setToken] = useState(() =>
    localStorage.getItem("access_token")
  );

  const [email, setEmail] = useState(() =>
    localStorage.getItem("user_email")
  );

  const login = async (data) => {
    const res = await api.post("/auth/login", data);

    const { access_token, email } = res.data;

    localStorage.setItem("access_token", access_token);
    localStorage.setItem("user_email", email);

    setToken(access_token);
    setEmail(email);

    return res.data;
  };

  const signup = async (data) => {
    const res = await api.post("/auth/signup", data);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_email");
    setToken(null);
    setEmail(null);
  };

  return (
    <AuthContext.Provider
      value={{ token, email, login, signup, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;