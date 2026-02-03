import { FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const { token, email, logout } = useAuth();

  const username = email
    ? email.split("@")[0].charAt(0).toUpperCase() +
      email.split("@")[0].slice(1)
    : "User";

    console.log("Navbar - email:", email, "username:", username);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="navbar">
      <h2 className="navbar-logo" onClick={() => navigate("/")} style={{ cursor: "pointer" }}> SnapUrl </h2>

      {!token ? (
        <button className="login-btn" onClick={() => navigate("/login")}> Login </button>
      ) : (
        <div className="user-box">
          <div className="user-info">
            <FaUserCircle size={22} />
            <span className="username">{username}</span>
          </div>

          <button className="logout-btn" onClick={handleLogout}> Logout </button>
        </div>
      )}
    </div>
  );
}

export default Navbar;