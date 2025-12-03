import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import axios from "axios";
import { Grid } from "gridjs-react";
import "gridjs/dist/theme/mermaid.css";
import "./AdminDashboard.scss";

export default function AdminDashboard() {
  const BASE_URL = "http://localhost:8000";
  const USERS_URL = `${BASE_URL}/auth/users/`;
  const DEPARTMENTS_URL = `${BASE_URL}/auth/departments/`; // ✅ new
  const EMPLOYEE_OF_MONTH_URL = `${BASE_URL}/auth/employee-of-month/`;
  const NOTIFICATIONS_URL = `${BASE_URL}/notifications/`;
  const POSTS_URL = `${BASE_URL}/posts/`;

  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]); // ✅ new
  const [selectedDept, setSelectedDept] = useState("All"); // ✅ new
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [employeeOfMonth, setEmployeeOfMonth] = useState(null);
  const [status, setStatus] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [posts, setPosts] = useState([]);
  const [sending, setSending] = useState(false);
  const [notifMessage, setNotifMessage] = useState("");

  useEffect(() => {
    fetchEmployees();
    fetchDepartments(); // ✅ load all departments
    fetchEmployeeOfMonth();
    fetchPosts();
    fetchNotifications();
  }, []);

  // ✅ Fetch Employees
  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(USERS_URL, { headers });
      setEmployees(res.data || []);
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };

  // ✅ Fetch Departments
  const fetchDepartments = async () => {
    try {
      const res = await axios.get(DEPARTMENTS_URL);
      setDepartments(res.data || []);
    } catch (err) {
      console.error("Error fetching departments:", err);
    }
  };

  const fetchEmployeeOfMonth = async () => {
    try {
      const res = await axios.get(EMPLOYEE_OF_MONTH_URL);
      setEmployeeOfMonth(res.data);
    } catch {
      console.warn("No employee of the month yet.");
    }
  };

  const announceEmployeeOfMonth = async () => {
    if (!selectedEmployee) return alert("Select an employee first!");
    try {
      const res = await axios.post(EMPLOYEE_OF_MONTH_URL, {
        employee_id: selectedEmployee,
      });
      setEmployeeOfMonth(res.data);
      setStatus("✅ Employee of the Month updated!");
      alert(`🎉 ${res.data.name} is Employee of the Month!`);
    } catch (err) {
      console.error("Error announcing Employee of the Month:", err);
      alert("Failed to announce Employee of the Month.");
    }
  };

  const fetchPosts = async () => {
    try {
      const res = await axios.get(POSTS_URL);
      setPosts(res.data || []);
    } catch (err) {
      console.error("Error fetching posts:", err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(NOTIFICATIONS_URL);
      setNotifications(res.data || []);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  const handleSendNotification = async () => {
    const message = notifMessage.trim();
    if (!message) return alert("Please enter a notification message.");
    setSending(true);
    try {
      const res = await axios.post(NOTIFICATIONS_URL, { message });
      const created = res.data ?? {
        id: Math.random(),
        message,
        created_at: new Date().toISOString(),
      };
      setNotifications((prev) => [created, ...prev]);
      setNotifMessage("");
      alert("Notification sent!");
    } catch (err) {
      console.error("Failed to send notification:", err);
      alert("Failed to send notification.");
    } finally {
      setSending(false);
    }
  };

  const handleDismissNotification = (notif) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notif.id));
  };

  // ✅ Filter Employees by Department
  const filteredEmployees =
    selectedDept === "All"
      ? employees
      : employees.filter(
          (emp) =>
            emp.department?.toLowerCase() === selectedDept.toLowerCase()
        );

  // ==================== UI ====================
  return (
    <>
      <Navbar />
      <div className="admin-dashboard">
        {/* LEFT SIDEBAR */}
        <div className="leftbar">
          <h2>Summary</h2>
          <div className="stat-card">
            <h3>Total Employees</h3>
            <p>{employees.length}</p>
          </div>
          <div className="stat-card">
            <h3>Total Posts</h3>
            <p>{posts.length}</p>
          </div>
        </div>

        {/* CENTERBAR */}
        <div className="centerbar">
          {/* ✅ Department Filter Dropdown */}
          <div className="chart-section">
            <div className="dept-header">
              <h3>Employee Shoutouts</h3>
              <select
  value={selectedEmployee}
  onChange={(e) => setSelectedEmployee(e.target.value)}
>
  <option value="">-- Select Employee --</option>
  {employees.map((emp) => (
    <option key={emp.id} value={emp.id}>
      {emp.name || emp.username} ({emp.department || "N/A"})
    </option>
  ))}
</select>

            </div>

            {/* ✅ Grid filtered by department */}
            <Grid
              data={filteredEmployees.map((emp) => [
                emp.name || emp.username,
                emp.department || "—",
                emp.appreciation_score || 0,
              ])}
              columns={["Name", "Department", "Shoutouts"]}
              sort={true}
              search={true}
              pagination={{ enabled: true, limit: 5 }}
            />
          </div>

          {/* Employee of the Month Section */}
          <div className="employeeofmonth">
            <h2>
              <i
                className="fa-solid fa-trophy"
                style={{ color: "#FFD700", marginRight: "8px" }}
              ></i>
              Employee of the Month
            </h2>

            {employeeOfMonth ? (
              <div className="current-eom">
                <p>
                  <strong>{employeeOfMonth.name}</strong> —{" "}
                  {employeeOfMonth.department}
                </p>
                <small>
                  Announced on:{" "}
                  {new Date(employeeOfMonth.created_at).toLocaleDateString()}
                </small>
              </div>
            ) : (
              <p className="no-eom">No employee announced yet.</p>
            )}

            <hr />

            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
            >
              <option value="">-- Select Employee --</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name || emp.username} ({emp.department || "N/A"})
                </option>
              ))}
            </select>

            <button onClick={announceEmployeeOfMonth}>Announce</button>
            {status && <p className="status">{status}</p>}
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="rightbar">
          <div className="notification-card">
            <h2>Send Notifications</h2>
            <textarea
              placeholder="Type announcement..."
              value={notifMessage}
              onChange={(e) => setNotifMessage(e.target.value)}
              rows={4}
            />
            <button
              className="btn-send"
              onClick={handleSendNotification}
              disabled={sending}
            >
              {sending ? "Sending..." : "Send"}
            </button>
          </div>

          {/* ✅ Latest Notification Only */}
          <div className="notification-list">
            <h3>Latest Notification</h3>
            {notifications.length === 0 ? (
              <p>No notification yet.</p>
            ) : (
              (() => {
                const latest = notifications[0];
                return (
                  <div className="notif-row">
                    <span>{latest.message}</span>
                    <button
                      className="btn-dismiss"
                      onClick={() => handleDismissNotification(latest)}
                      title="Delete Notification"
                    >
                      ✕
                    </button>
                  </div>
                );
              })()
            )}
          </div>
        </div>
      </div>
    </>
  );
}
