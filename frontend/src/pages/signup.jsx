import { useState } from "react";
import api from "../services/api";
import "./signup.css";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async () => {
    try {
      await api.post("/auth/signup", {
        email,
        password,
      });
      alert("Signup successful!");
    } catch {
      alert("Signup failed");
    }
  };

  return (
    <div className="signup-box">
      <h2>Signup</h2>

      <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />

      <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
      
      <button onClick={handleSignup}>Signup</button>

    </div>
  );
}

export default Signup;