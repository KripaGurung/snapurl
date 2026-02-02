import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import "./signup.css";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSignup = async () => {
    if (!email || !password) {
      alert("Email and password are required");
      return;
    }

    try {
      await signup({ email, password });
      alert("Signup successful!");
      console.log("User signed up:", email);
      navigate("/login");
    } catch (error) {
      console.error("Signup failed:", error);
      alert( error.response?.data?.detail || "Signup failed" );
    }
  };

  return (
    <div className="signup-wrapper">
      <div className="signup-card">
        <h2 className="signup-title">Registration Form</h2>

        <div className="input-group">
          <label>Email</label>
          <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div className="input-group">
          <label>Password</label>
          <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
        </div>

        <button className="signup-btn" onClick={handleSignup}> Signup </button>

        <p className="signup-footer"> Already have an account? <Link to="/login">Login</Link> </p>
      </div>
    </div>
  );
};

export default Signup;