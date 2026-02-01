import { FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const { token, email, logout } = useAuth();

  const username = email ? email.split("@")[0] : "";

  return (
    <div className="navbar">
      <h2 className="navbar-logo" onClick={() => navigate("/")} style={{ cursor: "pointer" }} > SnapUrl </h2>

      {!token ? (
        <button className="login-btn" onClick={() => navigate("/login")} > Login </button>
      ) : (
        <div className="user-box">
          <FaUserCircle size={22} />
          <span className="username">{username}</span>
          <button className="logout-btn" onClick={() => { logout(); navigate("/login", { replace: true });}}> Logout </button>
        </div>
      )}
    </div>
  );
}

export default Navbar;