import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import api from "../services/api";
import "./login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Email and password are required");
      return;
    }

    try {
      const response = await api.post("/api/auth/login", {
        email,
        password,
      });

      login(response.data.access_token, email);

      navigate("/", { replace: true });
    } catch (error) {
      console.error("Login failed:", error.response?.data);
      alert(error.response?.data?.detail || "Login failed");
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <h2 className="login-title">Welcome Back!</h2>

        <div className="input-group">
          <label>Email</label>
          <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div className="input-group">
          <label>Password</label>
          <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
        </div>

        <button className="login-btn" onClick={handleLogin}> Login </button>

        <p className="login-footer"> Don’t have an account? <Link to="/signup">Register</Link> </p>
      </div>
    </div>
  );
};

export default Login;