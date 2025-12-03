// src/pages/Employee/EmployeeDashboard.jsx
import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import axios from "axios";
import "../AdminDashboard/AdminDashboard.scss"; // reuse same styles

import {
  FaUsers,
  FaBullhorn,
  FaMedal,
  FaChartLine,
} from "react-icons/fa";
import { MdNotificationsActive } from "react-icons/md";
import { GiLaurelsTrophy, GiTrophyCup } from "react-icons/gi";

// 📊 Recharts for engagement graph
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function EmployeeDashboard() {
  const BASE_URL = "http://localhost:8000";
  const USERS_URL = `${BASE_URL}/auth/users/`;
  const DEPARTMENTS_URL = `${BASE_URL}/auth/departments/`;
  const EMPLOYEE_OF_MONTH_URL = `${BASE_URL}/auth/employee-of-month/`;
  const NOTIFICATIONS_URL = `${BASE_URL}/notifications/`;
  const SHOUTOUTS_URL = `${BASE_URL}/auth/shoutouts/department`;

  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [shoutouts, setShoutouts] = useState([]);
  const [loadingShouts, setLoadingShouts] = useState(false);
  const [employeeOfMonth, setEmployeeOfMonth] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [mostTagged, setMostTagged] = useState(null);
  const [topContributors, setTopContributors] = useState([]);
  const [engagementData, setEngagementData] = useState([]); // ✅ for graph

  const token = localStorage.getItem("access_token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  useEffect(() => {
    fetchDepartments();
    fetchEmployees();
    fetchEmployeeOfMonth();
    fetchNotifications();
    fetchAllShoutouts();
  }, []);

  const fetchAllShoutouts = async () => {
    setLoadingShouts(true);
    try {
      const res = await axios.get(SHOUTOUTS_URL, { headers });
      const data = Array.isArray(res.data) ? res.data : [];
      setShoutouts(data);
      calculateInsights(data);
      buildEngagementData(data); // ✅ build data for line chart
    } catch (err) {
      console.error("Error fetching shoutouts:", err);
    } finally {
      setLoadingShouts(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(USERS_URL, { headers });
      setEmployees(res.data || []);
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };

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
      const res = await axios.get(EMPLOYEE_OF_MONTH_URL, { headers });
      setEmployeeOfMonth(res.data);
    } catch (err) {
      console.warn("No employee of the month yet.");
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(NOTIFICATIONS_URL, { headers });
      setNotifications(res.data || []);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  // same insight logic as admin (read-only)
  const calculateInsights = (shouts) => {
    if (!shouts.length) return;

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

  // ✅ Build daily engagement data (date vs count)
  const buildEngagementData = (shouts) => {
    const countsByDate = {};

    shouts.forEach((s) => {
      if (!s.created_at) return;
      const day = new Date(s.created_at).toISOString().slice(0, 10); // YYYY-MM-DD
      countsByDate[day] = (countsByDate[day] || 0) + 1;
    });

    const sortedDates = Object.keys(countsByDate).sort(); // oldest → newest
    const recentDates = sortedDates.slice(-7); // last 7 days (optional)

    const graphData = recentDates.map((d) => ({
      date: d,
      count: countsByDate[d],
    }));

    setEngagementData(graphData);
  };

  const formatUTC = (dateString) => {
    const date = new Date(dateString);
    return `${date.toUTCString()}`;
  };

  return (
    <>
      <Navbar />
      <div className="admin-dashboard">{/* reuse same layout/styles */}
        {/* Header */}
        <div className="dashboard-header">
          <h1>BragBoard Employee Dashboard</h1>
          {/* No CSV download for employees */}
        </div>

        {/* Summary Cards (same analytics, read-only) */}
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

        {/* 📊 Daily Engagement Graph (replaces All Shoutouts table) */}
        <div className="daily-engagement-card">
          <h2>
            <FaChartLine style={{ marginRight: "8px" }} />
            Daily Engagement
          </h2>

          {loadingShouts ? (
            <p>Loading engagement...</p>
          ) : engagementData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#4CAF50"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="no-data">No recent activity</p>
          )}
        </div>

        {/* Employee of the Month – display only */}
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
        </div>

        {/* Notifications – view only */}
        <div className="notifications-section">
          <h2>
            <MdNotificationsActive /> Announcements
          </h2>

          <div className="notification-list">
            <h3>Recent Notifications</h3>
            {notifications.length === 0 ? (
              <p>No notifications yet.</p>
            ) : (
              notifications.slice(0, 5).map((n) => (
                <div key={n.id} className="notif-row">
                  <span>{n.message}</span>
                  <small>{formatUTC(n.created_at)}</small>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
