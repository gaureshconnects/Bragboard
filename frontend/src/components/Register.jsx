import { useState } from "react";
import { api } from "../../src/api";
import Navbar from "./Navbar";
import "../styles/Register.scss";

export default function Register() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("employee"); // default role
  const [securityKey, setSecurityKey] = useState(""); // admin security key
  const [department, setDepartment] = useState(""); // new department state
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    // ----------------- Validation -----------------
    if (
      !name.trim() ||
      !username.trim() ||
      !email.trim() ||
      !password ||
      !confirmPassword ||
      !department
    ) {
      alert("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (role === "admin" && !securityKey.trim()) {
      alert("Security Key is required for admin registration");
      return;
    }

    try {
      setLoading(true);

      // ----------------- Payload -----------------
      const payload = {
        name: name.trim(),
        username: username.trim(),
        email: email.trim(),
        password,
        role,
        department,
      };

      if (role === "admin") {
        payload.security_key = securityKey.trim();
      }

      const res = await api.post("/auth/register", payload);

      console.log(res.data);
      alert("Registration successful! Please login.");

      // ----------------- Clear Form -----------------
      setName("");
      setUsername("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setRole("employee");
      setSecurityKey("");
      setDepartment("");
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert(err.response?.data?.detail || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="register-container">
        <h1>Register</h1>

        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
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
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        {/* Department Dropdown */}
        <select
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
        >
          <option value="">Select Department</option>
          <option value="Human Resources">Human Resources</option>
          <option value="Information Technology">Information Technology</option>
          <option value="Finance">Finance</option>
        </select>

        {/* Role Selection */}
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

        {/* Security Key input - only for admin */}
        {role === "admin" && (
          <input
            type="text"
            placeholder="Security Key"
            value={securityKey}
            onChange={(e) => setSecurityKey(e.target.value)}
          />
        )}

        <button
          onClick={handleRegister}
          type="button"
          className="register-submit"
          disabled={loading}
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </div>
    </>
  );
}
