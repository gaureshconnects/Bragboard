import { useState } from "react";
import { api } from "../../src/api";
import Navbar from "./Navbar";
import "../styles/Login.scss";
import { useNavigate } from "react-router-dom";
import loginIllustration from "../../public/1.jpg";
import { ToastContainer, toast } from "react-toastify"; // ✅ Import toastify
import "react-toastify/dist/ReactToastify.css"; // ✅ Toastify styles

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("employee");
  const navigate = useNavigate();

  // ✅ Handle Login with toast notifications
  const handleLogin = async () => {
    try {
      const res = await api.post("auth/login", { email, password, role });
      console.log(res.data);

      localStorage.setItem("access_token", res.data.access_token);
      localStorage.setItem("refresh_token", res.data.refresh_token);
      localStorage.setItem("role", role);
      localStorage.setItem("accessToken", res.data.access_token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // ✅ Success toast (replaces alert)
      toast.success(
        `${role.charAt(0).toUpperCase() + role.slice(1)} logged in successfully!`,
        {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
        }
      );

      // ✅ Navigate after small delay (to let toast show)
      setTimeout(() => {
        if (role === "admin") {
          navigate("/home");
        } else {
          navigate("/home");
        }
      }, 1200);
    } catch (err) {
      console.error(err.response?.data || err.message);
      toast.error("Login failed. Please check your credentials.", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
    }
  };

  return (
    <>
      <Navbar />

      <div className="login-page">
        <div className="login-card">
          {/* 🖼️ Left Side Image */}
          <div className="login-image">
            <img src={loginIllustration} alt="Login Illustration" />
          </div>

          {/* 🔐 Right Side Form */}
          <div className="login-form">
            <h2>Welcome Back</h2>
            <p>Please sign in to continue</p>

            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

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

            <button onClick={handleLogin} className="submit-btn">
              Login
            </button>

            <p className="register-text">
              Don’t have an account? <a href="/register">Create one</a>
            </p>
          </div>
        </div>
      </div>

      {/* ✅ Toast container (needed to show toasts) */}
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
    </>
  );
}
