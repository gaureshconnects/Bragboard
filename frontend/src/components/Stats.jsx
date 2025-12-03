import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/Stats.scss";

const MiniStatsCard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("access_token"); // or however you store it
        const res = await axios.get("http://localhost:8000/metrics/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(res.data);
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    };
    fetchStats();
  }, []);

  if (!stats) {
    return <div className="card mini-stats-card">Loading stats...</div>;
  }

  const miniStats = [
    { id: 1, label: "Shoutouts Given", value: stats.shoutouts_given, icon: "fa-bullhorn" },
    { id: 2, label: "Shoutouts Received", value: stats.shoutouts_received, icon: "fa-trophy" },
    { id: 3, label: "Comments Made", value: stats.comments_made, icon: "fa-comment-dots" },
    { id: 4, label: "My Rank", value: stats.rank || "Top 5", icon: "fa-crown" }, // Adding My Rank
  ];

  return (
    <div className="card mini-stats-card">
      <div className="stats-grid">
        {miniStats.map((stat) => (
          <div key={stat.id} className={`stat-item ${stat.id === 4 ? "my-rank" : ""}`}>
            <div className="stat-icon">
              <i className={`fa-solid ${stat.icon}`}></i>
            </div>
            <div className="stat-info">
              <h5>{stat.value}</h5>
              <p>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MiniStatsCard;
