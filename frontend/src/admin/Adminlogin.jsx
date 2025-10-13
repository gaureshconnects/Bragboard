import { useState } from "react";
import { api } from "../../src/api";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar"; // make sure the path is correct
import "../admin/adminlogin.scss";
export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await api.post("/admin/auth/login", { email, password });

      localStorage.setItem("access_token", res.data.access_token);
      localStorage.setItem("refresh_token", res.data.refresh_token);
      localStorage.setItem("role", "admin");

      alert("Admin logged in successfully!");
      navigate("/admin/dashboard");
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("Login failed.");
    }
  };

  return (
    <>
      <Navbar /> {/* Added Navbar */}
      <div className="login-container">
        <h1>Admin Login</h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleLogin}>Login</button>
      </div>
    </>
  );
}
