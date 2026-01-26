import { FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("access_token");
  const email = localStorage.getItem("user_email");

  const username = email ? email.split("@")[0] : "";

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="navbar">
      <h2 className="navbar-logo" onClick={() => navigate("/")}>
        SnapUrl
      </h2>

      {!token ? (
        <button className="login-btn" onClick={() => navigate("/login")}>
          Login
        </button>
      ) : (
        <div className="user-box">
          <FaUserCircle size={22} />
          <span className="username">{username}</span>
          <button className="logout-btn" onClick={logout}>
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default Navbar;