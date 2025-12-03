import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import axios from "axios";
import "../../styles/Employeelist.scss";

export default function AdminList() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const accessToken = localStorage.getItem("accessToken");

  const fetchAdmins = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get("http://127.0.0.1:8000/admin/admins", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setAdmins(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch admins");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  return (
    <>
      <Navbar />
      <div className="dashboard-container">
        <h1>Admin List</h1>
        {loading && <p>Loading...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
        {!loading && !error && (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => (
                <tr key={admin.id}>
                  <td>{admin.id}</td>
                  <td>{admin.name}</td>
                  <td>{admin.email}</td>
                  <td>{admin.department || "—"}</td>
                  <td>{admin.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
