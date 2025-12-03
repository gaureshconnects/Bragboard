import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import "../styles/Navbar.scss";
import { FaBell, FaChevronDown } from "react-icons/fa";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(false);
  const [username, setUsername] = useState("");

  const profileRef = useRef();
  const notifRef = useRef();
  const BASE_URL = "http://localhost:8000";

  // ✅ Fetch logged-in user's name
  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;
      const res = await axios.get(`${BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsername(res.data?.name || res.data?.username || "User");
    } catch (err) {
      console.error("Failed to fetch user:", err);
    }
  };

  // ✅ Fetch notifications
  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/notifications/`);
      const newNotifications = res.data || [];
      if (newNotifications.length > notifications.length) setUnread(true);
      setNotifications(newNotifications);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const userRole = localStorage.getItem("role");
    setIsLoggedIn(!!token);
    setRole(userRole || "");
    if (token) {
      fetchUser();
      fetchNotifications();
    }
  }, [location]);

  // ✅ Handle clicks outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target))
        setProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(event.target))
        setNotifOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    ["accessToken", "refreshToken", "role"].forEach((key) =>
      localStorage.removeItem(key)
    );
    setIsLoggedIn(false);
    setRole("");
    navigate("/login");
  };

  return (
    <nav className="navbar">
      {/* ---------- LOGO ---------- */}
      <div className="nav-logo" onClick={() => navigate("/home")}>
        <img
          src="https://static.cdnlogo.com/logos/f/9/flipboard_800.png"
          alt="Bragboard"
          className="logo-img"
        />
        <span className="logo-text">Bragboard</span>
      </div>

      {/* ---------- NAV LINKS ---------- */}
      <ul className="nav-links">
        {location.pathname !== "/login" && location.pathname !== "/register" && (
          <li><Link to="/home">Home</Link></li>
        )}

        {role === "employee" && <li><Link to="/employee/dashboard">Dashboard</Link></li>}
        {["admin", "superadmin"].includes(role) && (
          <>
            <li><Link to="/admin/dashboard">Dashboard</Link></li>
            <li><Link to="/AdminDashboard">Security Keys</Link></li>
            <li><Link to="/employee-list">Employee List</Link></li>
          </>
        )}
        {role === "superadmin" && <li><Link to="/admin-list">Admin List</Link></li>}

        {/* ---------- NOTIFICATIONS ---------- */}
        {isLoggedIn && (
          <li ref={notifRef} className="notif-dropdown">
            <button
              className="notif-btn"
              onClick={() => {
                setNotifOpen(!notifOpen);
                setUnread(false);
              }}
            >
              <FaBell />
              {unread && notifications.length > 0 && (
                <span className="notif-count">{notifications.length}</span>
              )}
            </button>

            {notifOpen && (
              <div className="notif-card">
                <h4>Notifications</h4>
                {notifications.length === 0 ? (
                  <p className="no-notif">No new notifications</p>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className="notif-item">
                      <p>{n.message}</p>
                      <span className="notif-time">
                        {new Date(n.created_at).toLocaleString([], {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </li>
        )}

        {/* ---------- PROFILE WITH USERNAME ---------- */}
        {isLoggedIn ? (
          <li
            ref={profileRef}
            className={`profile-dropdown ${profileOpen ? "open" : ""}`}
            onMouseEnter={() => setProfileOpen(true)}
            onMouseLeave={() => setProfileOpen(false)}
          >
            <button
              className={`profile-btn ${profileOpen ? "active" : ""}`}
              onClick={() => setProfileOpen(!profileOpen)}
            >
              <span className="username-display">{username}</span>
              <FaChevronDown className={`dropdown-icon ${profileOpen ? "rotated" : ""}`} />
            </button>

            {profileOpen && (
              <div className="dropdown-card visible">
                <Link to="/profile" onClick={() => setProfileOpen(false)}>
                  Profile
                </Link>
                <button onClick={handleLogout}>Logout</button>
              </div>
            )}
          </li>
        ) : (
          <>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/register">Register</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
}
