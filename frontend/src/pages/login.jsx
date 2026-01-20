import { useState } from "react";
import api from "../services/api";
import "./login.css";

const Login = () => {
    const [email,
    setEmail]=useState("");
    const [password,
    setPassword]=useState("");

    const handleLogin=async ()=> {
        try {
            const res=await api.post("/auth/login", {
                email,
                password,
            });
        localStorage.setItem("token", res.data.access_token);
        alert("Login successful!");
    }

    catch {
        alert("Login failed");
    }
};

return (
    <div className="login-box" > 
        <h2>Login</h2> 

        <input type="email" placeholder="Email" onChange= { (e)=> setEmail(e.target.value) } /> 

        <input type="password" placeholder="Password" onChange= { (e)=> setPassword(e.target.value) } /> 
        
        <button onClick= { handleLogin } >Login</button> </div>);
}

export default Login;