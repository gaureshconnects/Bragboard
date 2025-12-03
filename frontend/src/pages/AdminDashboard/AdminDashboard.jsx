import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import axios from "axios";
import "./AdminDashboard.scss";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DownloadCSVButton from "../../components/DownloadCSVButton";

// React Icons
import {
  FaUsers,
  FaSitemap,
  FaBullhorn,
  FaTrash,
  FaMedal,
} from "react-icons/fa";
import { MdReport, MdDone, MdNotificationsActive } from "react-icons/md";
import { GiLaurelsTrophy, GiTrophyCup } from "react-icons/gi";

export default function AdminDashboard() {
  const BASE_URL = "http://localhost:8000";
  const USERS_URL = `${BASE_URL}/auth/users/`;
  const DEPARTMENTS_URL = `${BASE_URL}/auth/departments/`;
  const EMPLOYEE_OF_MONTH_URL = `${BASE_URL}/auth/employee-of-month/`;
  const NOTIFICATIONS_URL = `${BASE_URL}/notifications/`;
  const SHOUTOUTS_URL = `${BASE_URL}/auth/shoutouts/department`;
  const DELETE_SHOUTOUT_URL = (id) => `${BASE_URL}/auth/shoutouts/${id}`;

  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [shoutouts, setShoutouts] = useState([]);
  const [loadingShouts, setLoadingShouts] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [employeeOfMonth, setEmployeeOfMonth] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [notifMessage, setNotifMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [mostTagged, setMostTagged] = useState(null);
  const [topContributors, setTopContributors] = useState([]);

  const token = localStorage.getItem("access_token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  // ---------------- FETCH ALL DATA ----------------
  useEffect(() => {
    fetchDepartments();
    fetchEmployees();
    fetchEmployeeOfMonth();
    fetchNotifications();
    fetchAllShoutouts();
    fetchMostTagged();

  }, []);

  // ✅ Fetch All Department Shoutouts
  const fetchAllShoutouts = async () => {
    setLoadingShouts(true);
    try {
      const res = await axios.get(SHOUTOUTS_URL, { headers });
      const data = Array.isArray(res.data) ? res.data : [];
      setShoutouts(data);
      calculateInsights(data); // 🔥 add this line
    } catch (err) {
      console.error("Error fetching shoutouts:", err);
      toast.error("Failed to fetch shoutouts.");
    } finally {
      setLoadingShouts(false);
    }
  };

  // ✅ Employees (filtered automatically by backend)
  const fetchEmployees = async () => {
    try {
      const res = await axios.get(USERS_URL, { headers });
      setEmployees(res.data || []);
      setFilteredEmployees(res.data || []);
    } catch (err) {
      console.error("Error fetching employees:", err);
      toast.error("Failed to fetch employees.");
    }
  };

  // ✅ Departments
  const fetchDepartments = async () => {
    try {
      const res = await axios.get(DEPARTMENTS_URL);
      setDepartments(res.data || []);
    } catch (err) {
      console.error("Error fetching departments:", err);
    }
  };

  // ✅ Calculate insights: Most Tagged + Top Contributors

  const fetchMostTagged = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/auth/most-tagged`, { headers });
    if (res.data?.name) {
      setMostTagged(res.data);
    } else {
      setMostTagged(null);
    }
  } catch (err) {
    console.error("Error fetching most tagged:", err);
  }
};


  const calculateInsights = (shouts) => {
    if (!shouts.length) return;

    // Count tagged users
    const tagCounts = {};
    shouts.forEach((s) => {
      (s.tagged_user_names || []).forEach((name) => {
        tagCounts[name] = (tagCounts[name] || 0) + 1;
      });
    });

    const sortedTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]);
    if (sortedTags.length > 0) {
      setMostTagged({ name: sortedTags[0][0], count: sortedTags[0][1] });
    }

    // Count top contributors (post authors)
    const authorCounts = {};
    shouts.forEach((s) => {
      const author = s.author_name || "Anonymous";
      authorCounts[author] = (authorCounts[author] || 0) + 1;
    });

    const sortedAuthors = Object.entries(authorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
    setTopContributors(sortedAuthors);
  };

  // ✅ Employee of the Month
  const fetchEmployeeOfMonth = async () => {
    try {
      const res = await axios.get(EMPLOYEE_OF_MONTH_URL, { headers });
      setEmployeeOfMonth(res.data);
    } catch (err) {
      console.warn("No employee of the month yet.");
    }
  };

  // ✅ Notifications
  const fetchNotifications = async () => {
    try {
      const res = await axios.get(NOTIFICATIONS_URL, { headers });
      setNotifications(res.data || []);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  // ✅ Delete a shoutout
  const handleDeleteShoutout = async (id) => {
    if (!window.confirm("Delete this shoutout?")) return;
    try {
      await axios.delete(DELETE_SHOUTOUT_URL(id), { headers });
      setShoutouts((prev) => prev.filter((s) => s.id !== id));
      toast.success("Shoutout deleted successfully!");
    } catch {
      toast.error("Failed to delete shoutout.");
    }
  };

  // ✅ Announce Employee of the Month (with Bearer token)
  const announceEmployeeOfMonth = async () => {
    if (!selectedEmployee) return toast.warn("Select an employee!");
    try {
      const res = await axios.post(
        EMPLOYEE_OF_MONTH_URL,
        { employee_id: selectedEmployee },
        { headers }
      );
      setEmployeeOfMonth(res.data);
      toast.success(`${res.data.name} announced as Employee of the Month!`);
    } catch (err) {
      console.error(err.response?.data || err);
      toast.error(
        err.response?.data?.detail ||
          "Failed to announce Employee of the Month."
      );
    }
  };

  // ✅ Send Notification
  const handleSendNotification = async () => {
    const message = notifMessage.trim();
    if (!message) return toast.warn("Enter a notification message!");
    setSending(true);
    try {
      const res = await axios.post(NOTIFICATIONS_URL, { message }, { headers });
      const created = res.data ?? {
        id: Math.random(),
        message,
        created_at: new Date().toISOString(),
      };
      setNotifications((prev) => [created, ...prev]);
      setNotifMessage("");
      toast.success("Notification sent!");
    } catch {
      toast.error("Failed to send notification.");
    } finally {
      setSending(false);
    }
  };

  // ✅ Convert to Realtime UTC format
  const formatUTC = (dateString) => {
    const date = new Date(dateString);
    return `${date.toUTCString()}`;
  };

  // ---------------- RENDER ----------------
  return (
    <>
      <Navbar />
      <div className="admin-dashboard">
        {/* Header */}
        <div className="dashboard-header">
          <h1>BragBoard Admin Dashboard</h1>
          <DownloadCSVButton
            employees={employees}
            departments={departments}
            shoutouts={shoutouts}
          />
        </div>

        {/* Summary Cards */}
        {/* ✅ Updated 4 Summary Cards */}
        <div className="card-grid four-cards">
          <div className="dashboard-card">
            <FaUsers />
            <h3>Total Employees</h3>
            <p>{employees.length}</p>
          </div>

          <div className="dashboard-card">
            <FaBullhorn />
            <h3>Total Shoutouts</h3>
            <p>{shoutouts.length}</p>
          </div>

          <div className="dashboard-card">
            <FaMedal />
            <h3>Most Tagged</h3>
            <p>
              {mostTagged ? `${mostTagged.name} (${mostTagged.count})` : "N/A"}
            </p>
          </div>

          <div className="dashboard-card">
            <GiLaurelsTrophy />
            <h3>Top Contributors</h3>
            <ul className="mini-list">
              {topContributors.length > 0 ? (
                topContributors.map(([name, count]) => (
                  <li key={name}>
                    {name} ({count})
                  </li>
                ))
              ) : (
                <li>N/A</li>
              )}
            </ul>
          </div>
        </div>

        {/* All Shoutouts Table */}
        <div className="moderation-section">
          <h2>All Shoutouts</h2>
          {loadingShouts ? (
            <p>Loading shoutouts...</p>
          ) : shoutouts.length === 0 ? (
            <p>No shoutouts available yet.</p>
          ) : (
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Message</th>
                  <th>Department</th>
                  <th>UTC Time</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {shoutouts.map((s) => (
                  <tr key={s.id}>
                    <td>{s.name || s.author_name || "Anonymous"}</td>
                    <td>{s.message || "—"}</td>
                    <td>{s.department || "—"}</td>
                    <td>{formatUTC(s.created_at)}</td>
                    <td className={s.is_reported ? "reported" : "clean"}>
                      {s.is_reported ? (
                        <>
                          <MdReport className="icon-flag" /> Reported
                        </>
                      ) : (
                        <>
                          <MdDone className="icon-ok" /> Clean
                        </>
                      )}
                    </td>
                    <td>
                      <button
                        className="btn-delete"
                        onClick={() => handleDeleteShoutout(s.id)}
                      >
                        <FaTrash /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Employee of the Month */}
        <div className="employee-month-section">
          <h2>
            <GiTrophyCup /> Employee of the Month
          </h2>
          {employeeOfMonth ? (
            <div className="current-eom">
              <p>
                <strong>{employeeOfMonth.name}</strong> —{" "}
                {employeeOfMonth.department}
              </p>
              <small>
                Announced on: {formatUTC(employeeOfMonth.created_at)}
              </small>
            </div>
          ) : (
            <p>No employee announced yet.</p>
          )}
          <hr />
          <div className="eom-controls">
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="employee-dropdown"
            >
              <option value="">-- Select Employee --</option>
              {filteredEmployees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name || emp.username} ({emp.department || "N/A"})
                </option>
              ))}
            </select>
            <button onClick={announceEmployeeOfMonth}>Announce</button>
          </div>
        </div>

        {/* Notifications */}
        <div className="notifications-section">
          <h2>
            <MdNotificationsActive /> Send Announcement
          </h2>
          <textarea
            placeholder="Type announcement..."
            value={notifMessage}
            onChange={(e) => setNotifMessage(e.target.value)}
          />
          <button onClick={handleSendNotification} disabled={sending}>
            {sending ? "Sending..." : "Send Notification"}
          </button>

          <div className="notification-list">
            <h3>Recent Notifications</h3>
            {notifications.length === 0 ? (
              <p>No notifications yet.</p>
            ) : (
              notifications.slice(0, 3).map((n) => (
                <div key={n.id} className="notif-row">
                  <span>{n.message}</span>
                  <small>{formatUTC(n.created_at)}</small>
                </div>
              ))
            )}
          </div>
        </div>

        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          theme="colored"
        />
      </div>
    </>
  );
}
