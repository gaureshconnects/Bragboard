import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import "../../styles/Securitykeys.scss";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaTrashAlt, FaCopy } from "react-icons/fa";

export default function SecurityKeys({ accessToken: propToken }) {
  const [securityKeys, setSecurityKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      if (!res.ok) throw new Error(`Error: ${res.status} ${res.statusText}`);
      const data = await res.json();
      setSecurityKeys(data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch security keys");
      toast.error("Failed to fetch security keys", {
        position: "top-right",
        theme: "colored",
      });
    } finally {
      setLoading(false);
    }
  };

  // Generate new key
  const generateKey = async () => {
    if (!accessToken)
      return toast.warn("Access token missing. Please login.", {
        position: "top-right",
        theme: "colored",
      });
    try {
      const res = await fetch("http://127.0.0.1:8000/auth/security-keys", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error(`Error: ${res.status} ${res.statusText}`);
      const data = await res.json();

      toast.success(`New Security Key Generated!`, {
        position: "top-right",
        theme: "colored",
      });

      // Auto-copy new key to clipboard
      navigator.clipboard.writeText(data.security_key);
      toast.info("Key copied to clipboard!", {
        position: "top-right",
        autoClose: 2000,
      });

      fetchKeys(); // Refresh keys
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate security key", {
        position: "top-right",
        theme: "colored",
      });
    }
  };

  // Delete a key
  const deleteKey = async (id) => {
    if (!window.confirm("Are you sure you want to delete this key?")) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/auth/security-keys/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error(`Error: ${res.status} ${res.statusText}`);
      toast.success("Security key deleted successfully!", {
        position: "top-right",
        theme: "colored",
      });
      fetchKeys();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete security key", {
        position: "top-right",
        theme: "colored",
      });
    }
  };

  // Copy key to clipboard
  const copyKey = (key) => {
    navigator.clipboard.writeText(key);
    toast.info("Key copied to clipboard!", {
      position: "top-right",
      autoClose: 2000,
    });
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  return (
    <>
      <Navbar />
      <div className="dashboard-container">
        <h1>Security Keys</h1>

        {loading && <p>Loading security keys...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {!loading && !error && (
          <div className="security-key-section">
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
                    &nbsp;
                    {/* 📋 Copy Icon */}
                    <button
                      className="copy-key-btn"
                      onClick={() => copyKey(k.key)}
                      title="Copy"
                    >
                      <FaCopy />
                    </button>
                    &nbsp;
                    {/* 🗑️ Delete Icon */}
                    <button
                      className="delete-key-btn"
                      onClick={() => deleteKey(k.id)}
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* ✅ Toast Container */}
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
    </>
  );
}
