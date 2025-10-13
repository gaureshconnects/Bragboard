import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import "../../styles/Employeelist.scss";
import axios from "axios";

export default function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const accessToken = localStorage.getItem("accessToken");

  const fetchEmployees = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get("http://127.0.0.1:8000/admin/employees", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setEmployees(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch employees");
    } finally {
      setLoading(false);
    }
  };

  const deleteEmployee = async (id) => {
    if (!window.confirm("Are you sure you want to delete this employee?"))
      return;
    try {
      await axios.delete(`http://127.0.0.1:8000/admin/employees/${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      fetchEmployees(); // refresh list
    } catch (err) {
      console.error(err);
      alert("Failed to delete employee");
    }
  };

  const toggleSuspendEmployee = async (id, isActive) => {
    try {
      await axios.patch(
        `http://127.0.0.1:8000/admin/employees/${id}/suspend?suspend=${!isActive}`,
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      fetchEmployees(); // refresh list
    } catch (err) {
      console.error(err);
      alert("Failed to update employee status");
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return (
    <>
      <Navbar />
      <div className="dashboard-container">
        <h1>Employee List</h1>
        {loading && <p>Loading...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
        {!loading && !error && (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th> {/* ✅ New column */}
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id}>
                  <td>{emp.id}</td>
                  <td>{emp.name}</td>
                  <td>{emp.email}</td>
                  <td>{emp.department || "—"}</td> {/* ✅ Display department */}
                  <td>{emp.is_active ? "Active" : "Suspended"}</td>
                  <td>
                    <button
                      disabled={loading}
                      onClick={() =>
                        toggleSuspendEmployee(emp.id, emp.is_active)
                      }
                    >
                      {emp.is_active ? "Suspend" : "Unsuspend"}
                    </button>
                    <button
                      disabled={loading}
                      onClick={() => deleteEmployee(emp.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
