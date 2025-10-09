import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import "../styles/Navbar.scss";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);

  const profileRef = useRef();

  useEffect(() => {
    const token = localStorage.getItem("accessToken"); 
    const userRole = localStorage.getItem("role");
    setIsLoggedIn(!!token);
    setRole(userRole || "");
  }, [location]);

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("role");
    setIsLoggedIn(false);
    setRole("");
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="nav-logo">
        <a href="/">
          <img
            src="https://static.cdnlogo.com/logos/f/9/flipboard_800.png"
            alt="Bragboard Logo"
            className="logo-img"
          />
        </a>
        Bragboard
      </div>

      <ul className="nav-links">
        {location.pathname !== "/login" && location.pathname !== "/register" && (
          <li><Link to="/home">Home</Link></li>
        )}

        {role === "employee" && (
          <li><Link to="/employee/dashboard">Dashboard</Link></li>
        )}

        {role === "admin" && (
          <>
            <li><Link to="/admin/dashboard">Dashboard</Link></li>
            <li><Link to="/AdminDashboard">Security Keys</Link></li>
            <li><Link to="/employee-list">Employee List</Link></li>
          </>
        )}

        {role === "superadmin" && (
          <>
            <li><Link to="/admin/dashboard">Dashboard</Link></li>
            <li><Link to="/AdminDashboard">Security Keys</Link></li>
            <li><Link to="/employee-list">Employee List</Link></li>
            <li><Link to="/admin-list">Admin List</Link></li>
          </>
        )}

        {/* Profile Icon */}
        {isLoggedIn && (
          <li ref={profileRef} className="profile-dropdown">
            <button
              className="profile-btn"
              onClick={() => setProfileOpen(!profileOpen)}
            >
              <img
                src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
                alt="Profile"
                className="profile-icon"
              />
            </button>

            {profileOpen && (
              <div className="dropdown-card">
                <Link to="/profile" onClick={() => setProfileOpen(false)}>Profile</Link>
                <button onClick={handleLogout}>Logout</button>
              </div>
            )}
          </li>
        )}

        {/* Not logged-in links */}
        {!isLoggedIn && (
          <>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/register">Register</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
}
