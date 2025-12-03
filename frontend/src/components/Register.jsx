import { useState } from "react";
import { api } from "../../src/api";
import Navbar from "./Navbar";
import "../styles/Register.scss";
import { useNavigate } from "react-router-dom";
import registerIllustration from "../../public/2.jpg";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Register() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState("employee");
  const [securityKey, setSecurityKey] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ✅ Handle Registration with Toasts
  const handleRegister = async () => {
    if (
      !name.trim() ||
      !username.trim() ||
      !email.trim() ||
      !password ||
      !confirmPassword ||
      !department
    ) {
      toast.warn("⚠️ All fields are required!", { position: "top-right", theme: "colored" });
      return;
    }

    if (password !== confirmPassword) {
      toast.error("❌ Passwords do not match!", { position: "top-right", theme: "colored" });
      return;
    }

    if (role === "admin" && !securityKey.trim()) {
      toast.warn("🔐 Security Key is required for admin registration!", {
        position: "top-right",
        theme: "colored",
      });
      return;
    }

    try {
      setLoading(true);
      const payload = {
        name: name.trim(),
        username: username.trim(),
        email: email.trim(),
        password,
        role,
        department,
      };

      if (role === "admin") payload.security_key = securityKey.trim();

      const res = await api.post("/auth/register", payload);

      // ✅ Success Toast
      toast.success("🎉 Registration successful! Please login.", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });

      // ✅ Reset fields
      setName("");
      setUsername("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setDepartment("");
      setRole("employee");
      setSecurityKey("");

      // ✅ Redirect to Login after delay
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      const errorMsg = err.response?.data?.detail || "Registration failed. Try again.";
      toast.error(`❌ ${errorMsg}`, { position: "top-right", theme: "colored" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="register-page">
        <div className="register-card reverse">
          {/* 📝 Right Side Form */}
          <div className="register-form">
            <h2>Create Account</h2>
            <p>Join us by creating your account</p>

            {/* 🧩 Input rows */}
            <div className="input-row">
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
            </div>

            <div className="input-row">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              >
                <option value="">Select Department</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Finance">Finance</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="Operations">Operations</option>
              </select>
            </div>

            <div className="input-row">
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
            </div>

            {role === "admin" && (
              <div className="input-row single">
                <input
                  type="text"
                  placeholder="Security Key"
                  value={securityKey}
                  onChange={(e) => setSecurityKey(e.target.value)}
                />
              </div>
            )}

            <div className="role-selection">
              <button
                className={role === "employee" ? "active" : ""}
                onClick={() => setRole("employee")}
              >
                Employee
              </button>
              <button
                className={role === "admin" ? "active" : ""}
                onClick={() => setRole("admin")}
              >
                Admin
              </button>
            </div>

            <button className="submit-btn" onClick={handleRegister} disabled={loading}>
              {loading ? "Registering..." : "Register"}
            </button>

            <div className="register-text">
              Already have an account? <a href="/login">Login</a>
            </div>
          </div>

          {/* 🖼️ Left Side Image */}
          <div className="register-image">
            <img src={registerIllustration} alt="Register Illustration" />
          </div>
        </div>
      </div>

      {/* ✅ Toast Container */}
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
    </>
  );
}
