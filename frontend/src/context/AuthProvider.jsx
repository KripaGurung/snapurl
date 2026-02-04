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
    const res = await api.post(
      "/auth/login/",
      {
        email: data.email.trim().toLowerCase(), 
        password: data.password,
      }
    );

    const access_token = res.data.access_token;
    const userEmail = res.data.email;

    localStorage.setItem("access_token", access_token);
    if (userEmail) {
      localStorage.setItem("user_email", userEmail);
    }

    setToken(access_token);
    setEmail(userEmail || null);

    return res.data;
  };

  const signup = async (data) => {
    const res = await api.post(
      "/auth/signup/",   
      {
        email: data.email.trim().toLowerCase(),
        password: data.password,
      }
    );

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