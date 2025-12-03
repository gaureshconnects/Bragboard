import { useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import Navbar from "../components/Navbar.jsx";
import { useNavigate } from "react-router-dom";
import { api } from "../api"; 
import { useState } from "react";
import "../styles/Dashboard.scss";

export default function Dashboard() {
  const { logout } = useContext(AuthContext);
  const [employeeCount, setEmployeeCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem("role");

    // if not admin → redirect
    if (role !== "admin") {
      alert("Access denied! Admins only.");
      navigate("/login");
    } else {
      fetchEmployeeCount();
    }
  }, [navigate]);

  // Fetch registered employee count from backend
  const fetchEmployeeCount = async () => {
    try {
      const res = await api.get("/admin/employees/count"); // <-- create this API
      setEmployeeCount(res.data.count);
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };

  return (
    <>
      <Navbar />
      <div className="dashboard-container">
        <h1>Admin Dashboard</h1>
        <div className="cards">
          <div className="card">
            <h2>Total Employees</h2>
            <p>{employeeCount}</p>
          </div>
          <div className="card">
            <h2>Active Projects</h2>
            <p>15</p>
          </div>
          <div className="card">
            <h2>Pending Requests</h2>
            <p>8</p>
          </div>
        </div>
        <button className="logout-btn" onClick={logout}>Logout</button>
      </div>
    </>
  );
}
