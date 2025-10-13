import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import "../AdminDashboard/AdminDashboard.scss";
import axios from "axios";

export default function SuperAdminDashboard({ accessToken: propToken }) {
  const [employees, setEmployees] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [securityKeys, setSecurityKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const accessToken = propToken || localStorage.getItem("accessToken");

  // ---------------- FETCH DATA ----------------
  const fetchAllData = async () => {
    if (!accessToken) {
      setError("Access token missing. Please login.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");

    try {
      const [empRes, adminRes, keyRes] = await Promise.all([
        axios.get("http://127.0.0.1:8000/admin/employees", {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
        axios.get("http://127.0.0.1:8000/admin/admins", {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
        axios.get("http://127.0.0.1:8000/auth/security-keys", {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      ]);

      setEmployees(empRes.data);
      setAdmins(adminRes.data);
      setSecurityKeys(keyRes.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch data.");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- GENERATE SECURITY KEY ----------------
  const generateKey = async () => {
    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/auth/security-keys",
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      alert(`New Security Key: ${res.data.security_key}`);
      fetchAllData();
    } catch (err) {
      console.error(err);
      alert("Failed to generate security key");
    }
  };

  // ---------------- DELETE SECURITY KEY ----------------
  const deleteKey = async (id) => {
    if (!window.confirm("Delete this security key?")) return;
    try {
      await axios.delete(`http://127.0.0.1:8000/auth/security-keys/${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      fetchAllData();
    } catch (err) {
      console.error(err);
      alert("Failed to delete security key");
    }
  };

  // ---------------- DELETE USER (Employee/Admin) ----------------
  const deleteUser = async (id, role) => {
    if (!window.confirm(`Delete this ${role}?`)) return;
    try {
      await axios.delete(`http://127.0.0.1:8000/admin/${role}s/${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      fetchAllData();
    } catch (err) {
      console.error(err);
      alert(`Failed to delete ${role}`);
    }
  };

  // ---------------- TOGGLE SUSPEND EMPLOYEE ----------------
  const toggleSuspendEmployee = async (id, isActive) => {
    try {
      await axios.patch(
        `http://127.0.0.1:8000/admin/employees/${id}/suspend?suspend=${isActive}`,
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      fetchAllData();
    } catch (err) {
      console.error(err);
      alert("Failed to update employee status");
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  return (
    <>
      <Navbar />
      <div className="dashboard-container">
        <h1>SuperAdmin Dashboard</h1>
        {loading && <p>Loading data...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {!loading && !error && (
          <>
            {/* --- Security Keys --- */}
            <div className="section">
              <h2>Security Keys</h2>
              <button onClick={generateKey}>Generate New Key</button>
              <ul>
                {securityKeys.map((k) => (
                  <li key={k.id}>
                    {k.key} -{" "}
                    <span className={k.is_used ? "used" : "available"}>
                      {k.is_used ? "Used" : "Available"}
                    </span>
                    <button onClick={() => deleteKey(k.id)}>Delete</button>
                  </li>
                ))}
              </ul>
            </div>

            {/* --- Employees --- */}
            <div className="section">
              <h2>All Employees</h2>
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((e) => (
                    <tr key={e.id}>
                      <td>{e.id}</td>
                      <td>{e.name}</td>
                      <td>{e.email}</td>
                      <td>{e.department}</td>
                      <td>{e.is_active ? "Active" : "Suspended"}</td>
                      <td>
                        <button
                          onClick={() =>
                            toggleSuspendEmployee(e.id, e.is_active)
                          }
                        >
                          {e.is_active ? "Suspend" : "Unsuspend"}
                        </button>
                        <button onClick={() => deleteUser(e.id, "employee")}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* --- Admins --- */}
            <div className="section">
              <h2>All Admins</h2>
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map((a) => (
                    <tr key={a.id}>
                      <td>{a.id}</td>
                      <td>{a.name}</td>
                      <td>{a.email}</td>
                      <td>{a.department || "All"}</td>
                      <td>
                        <button onClick={() => deleteUser(a.id, "admin")}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </>
  );
}
