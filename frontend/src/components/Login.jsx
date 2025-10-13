import { useState } from "react";
import { api } from "../../src/api";
import Navbar from "./Navbar";
import "../styles/Login.scss";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("employee"); // default role
  const navigate = useNavigate();

  const handleLogin = async () => {
  try {
    const res = await api.post("auth/login", { email, password, role });
    console.log(res.data);

    localStorage.setItem("access_token", res.data.access_token);
    localStorage.setItem("refresh_token", res.data.refresh_token);
    localStorage.setItem("role", role);
        // Save access token in localStorage
    localStorage.setItem("accessToken", res.data.access_token);

    // Optionally save user info
    localStorage.setItem("user", JSON.stringify(res.data.user));

    alert(`${role.charAt(0).toUpperCase() + role.slice(1)} logged in successfully!`);

    // ✅ Redirect based on role
    if (role === "admin") {
      navigate("/admin/dashboard");
    } else {
      navigate("/employee/dashboard");
    }

  } catch (err) {
    console.error(err.response?.data || err.message);
    alert("Login failed.");
  }
};


  return (
    <>
      <Navbar />
      <div className="login-container">
        <h1>Login</h1>

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

        {/* Role Selection Buttons */}
        <div className="role-selection">
          <button
            type="button"
            className={role === "employee" ? "active" : ""}
            onClick={() => setRole("employee")}
          >
            Employee
          </button>
          <button
            type="button"
            className={role === "admin" ? "active" : ""}
            onClick={() => setRole("admin")}
          >
            Admin
          </button>
        </div>

        <button onClick={handleLogin} className="submit-btn">Login</button>
      </div>
    </>
  );
}
