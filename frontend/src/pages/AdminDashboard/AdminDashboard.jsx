import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import "../AdminDashboard/AdminDashboard.scss";

export default function AdminDashboard({ accessToken: propToken }) {
  const [securityKeys, setSecurityKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Use token from prop or localStorage
  const accessToken = propToken || localStorage.getItem("accessToken");

  // Fetch all security keys
  const fetchKeys = async () => {
    if (!accessToken) {
      setError("Access token missing. Please login as admin.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("http://127.0.0.1:8000/auth/security-keys", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) {
        throw new Error(`Error: ${res.status} ${res.statusText}`);
      }
      const data = await res.json();
      setSecurityKeys(data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch security keys");
    } finally {
      setLoading(false);
    }
  };

  // Generate a new security key
  const generateKey = async () => {
    if (!accessToken) return alert("Access token missing. Please login.");
    try {
      const res = await fetch("http://127.0.0.1:8000/auth/security-keys", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) {
        throw new Error(`Error: ${res.status} ${res.statusText}`);
      }
      const data = await res.json();
      alert(`New Security Key: ${data.security_key}`);
      fetchKeys(); // Refresh list
    } catch (err) {
      console.error(err);
      alert("Failed to generate security key");
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  return (
    <>
      <Navbar />
      <div className="dashboard-container">
        <h1>Admin Dashboard</h1>
        <p>Welcome, Admin!</p>

        {loading && <p>Loading security keys...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {!loading && !error && (
          <div className="security-key-section">
            <h2>Security Keys</h2>
            <button onClick={generateKey}>Generate New Key</button>

            {securityKeys.length === 0 ? (
              <p>No security keys available.</p>
            ) : (
              <ul>
                {securityKeys.map((k) => (
                  <li key={k.id}>
                    {k.key} -
                    <span
                      className={`status ${k.is_used ? "used" : "available"}`}
                    >
                      {k.is_used ? "Used" : "Available"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </>
  );
}
