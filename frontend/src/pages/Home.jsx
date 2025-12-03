import Navbar from "../components/Navbar";
import "../styles/Home.scss";
import { useEffect, useState } from "react";
import { api } from "../api";
import NotificationSlider from "../components/Stats";
import { format, render, cancel } from "timeago.js";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import {
  FaThumbsUp,
  FaHeart,
  FaRegLaughBeam,
  FaFire,
  FaPrayingHands,
} from "react-icons/fa";

export default function Home() {
  const [user, setUser] = useState({});
  const [appreciationScore, setAppreciationScore] = useState(0);
  const [employeeOfMonth, setEmployeeOfMonth] = useState(null);
  const [employees, setEmployees] = useState([]);
  // const [departments, setDepartments] = useState([]);
  const [feed, setFeed] = useState([]);
  //const [leaderboard, setLeaderboard] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [message, setMessage] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState({});
  const [commentsMap, setCommentsMap] = useState({});
  const [commentInput, setCommentInput] = useState({});
  const [topContributors, setTopContributors] = useState([]);
  const [engagementData, setEngagementData] = useState([]);

  // --------------------- Fetch Initial Data ---------------------
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    await Promise.all([
      fetchUserData(),
      fetchMetrics(),
      fetchEmployeeOfMonth(),
      fetchEmployees(),
      fetchDepartments(),
      fetchFeed(),
      fetchLeaderboard(),
      fetchNotifications(),
      fetchEngagementData(),
    ]);
  };

  const fetchEngagementData = async () => {
    try {
      const { data } = await api.get(
        "http://127.0.0.1:8000/auth/analytics/daily-activity"
      );
      if (Array.isArray(data)) {
        setEngagementData(data);
      } else {
        setEngagementData([]);
      }
    } catch (err) {
      console.error("Error fetching engagement data:", err);
      setEngagementData([]);
    }
  };

  const fetchUserData = async () => {
    try {
      const { data } = await api.get("/auth/me");
      setUser(data);
    } catch (err) {
      console.error("Error fetching user data:", err);
    }
  };

  const fetchMetrics = async () => {
    try {
      const res = await api.get("/metrics/me");
      setAppreciationScore(res.data.shoutouts_given || 0);
    } catch (err) {
      console.error("Error fetching appreciation score:", err);
    }
  };

  // ✅ Updated Employee of Month fetch
  const fetchEmployeeOfMonth = async () => {
    try {
      const { data } = await api.get("/auth/employee-of-month/");
      setEmployeeOfMonth(data);
    } catch (err) {
      console.warn("No Employee of the Month found.");
      setEmployeeOfMonth(null);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await api.get("/auth/department-employees");
      setEmployees(res.data || []);
    } catch (_) {}
  };

  const fetchDepartments = async () => {
    try {
      const { data } = await api.get("/auth/departments");
      setDepartments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching departments:", err);
    }
  };

  const fetchFeed = async () => {
    try {
      const { data } = await api.get("/auth/shoutouts/feed");
      setFeed(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching feed:", err);
    }
  };

  // ✅ Fetch Top Contributors (Leaderboard)
  const fetchLeaderboard = async () => {
    try {
      const { data } = await api.get("http://127.0.0.1:8000/auth/leaderboard"); // or "/auth/leaderboard"
      if (Array.isArray(data)) {
        // ✅ Handles object format from backend
        setTopContributors(data.slice(0, 3));
      } else if (data.top_contributors) {
        setTopContributors(data.top_contributors.slice(0, 3));
      } else {
        setTopContributors([]);
      }
    } catch (err) {
      console.error("Error fetching top contributors:", err);
      setTopContributors([]);
    }
  };

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get("/notifications");
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  // --------------------- Shoutout Post ---------------------
  const submitShoutOut = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    try {
      const form = new FormData();
      form.append("message", message);
      if (selectedTags.length)
        form.append("tagged_user_ids", selectedTags.join(","));
      if (imageFile) form.append("image", imageFile);

      await api.post("/auth/shoutouts", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage("");
      setSelectedTags([]);
      setImageFile(null);
      await Promise.all([fetchFeed(), fetchMetrics()]);
    } catch (err) {
      console.error("Error posting shoutout:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleTag = (id) => {
    setSelectedTags((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const react = async (id, emoji) => {
    try {
      await api.post(`/auth/shoutouts/${id}/react`, { emoji });
      fetchFeed();
    } catch (err) {
      console.error("Error reacting:", err);
    }
  };

  const toggleComments = async (id) => {
    setCommentsOpen((prev) => ({ ...prev, [id]: !prev[id] }));
    if (!commentsMap[id]) {
      try {
        const { data } = await api.get(`/auth/shoutouts/${id}/comments`);
        setCommentsMap((m) => ({ ...m, [id]: data }));
      } catch (err) {
        console.error("Error fetching comments:", err);
      }
    }
  };

  const submitComment = async (id) => {
    const text = (commentInput[id] || "").trim();
    if (!text) return;
    try {
      const { data } = await api.post(`/auth/shoutouts/${id}/comments`, {
        content: text,
      });
      setCommentsMap((m) => ({ ...m, [id]: [...(m[id] || []), data] }));
      setCommentInput((ci) => ({ ...ci, [id]: "" }));
      fetchFeed();
    } catch (err) {
      console.error("Error posting comment:", err);
    }
  };

  // ---------------- View My Shoutouts Popup ----------------
  const [showMyPosts, setShowMyPosts] = useState(false);
  const [myPosts, setMyPosts] = useState([]);
  const [loadingMyPosts, setLoadingMyPosts] = useState(false);

  const fetchMyPosts = async () => {
    setLoadingMyPosts(true);
    try {
      try {
        const res = await api.get("/auth/shoutouts/my");
        if (res && res.data) {
          setMyPosts(Array.isArray(res.data) ? res.data : []);
          setShowMyPosts(true);
          return;
        }
      } catch {
        try {
          const res2 = await api.get("/auth/shoutouts/my-posts");
          if (res2 && res2.data) {
            setMyPosts(Array.isArray(res2.data) ? res2.data : []);
            setShowMyPosts(true);
            return;
          }
        } catch {
          /* empty */
        }
      }

      if (Array.isArray(feed) && user?.id) {
        const mine = feed.filter(
          (s) =>
            s.author_id === user.id ||
            String(s.author_id) === String(user.id) ||
            s.author_name === user.name
        );
        setMyPosts(mine);
        setShowMyPosts(true);
        return;
      }

      setMyPosts([]);
      setShowMyPosts(true);
    } catch (err) {
      console.error("Error fetching my posts:", err);
      setMyPosts([]);
      setShowMyPosts(true);
    } finally {
      setLoadingMyPosts(false);
    }
  };

  // ✅ Edit Shoutout
  const editMyPost = async (id, oldMessage) => {
    const newMessage = prompt("Edit your shoutout:", oldMessage);
    if (!newMessage || newMessage.trim() === oldMessage.trim()) return;

    try {
      await api.put(`/shoutouts/${id}`, { message: newMessage.trim() }); // ✅ fixed URL
      await fetchMyPosts();
      alert("Shoutout updated successfully!");
    } catch (err) {
      console.error("Error updating post:", err);
      alert("Failed to update shoutout.");
    }
  };

  // ✅ Delete Shoutout
  const deleteMyPost = async (id) => {
    if (!window.confirm("Are you sure you want to delete this shoutout?"))
      return;

    try {
      await api.delete(`/shoutouts/${id}`); // ✅ fixed URL
      await fetchMyPosts();
      alert("Shoutout deleted successfully!");
    } catch (err) {
      console.error("Error deleting post:", err);
      alert("Failed to delete shoutout.");
    }
  };

  // ✅ Report Shoutout
  const handleReportPost = async (id) => {
    if (!window.confirm("Do you really want to report this post?")) return;

    try {
      await api.put(`/auth/shoutouts/${id}/report`);
      alert("Post reported successfully!");
      fetchFeed(); // refresh to update status
    } catch (err) {
      console.error("Error reporting post:", err);
      if (err.response?.data?.detail) {
        alert(` ${err.response.data.detail}`);
      } else {
        alert(" Failed to report this post.");
      }
    }
  };

  // top contributers-------------------------------------

  // --------------------- Render ---------------------
  return (
    <>
      <Navbar />
      <div className="home-container">
        {/* LEFT BAR */}
        <aside className="left-sidebar">
          <div className="profile-card">
            <div className="avatar">{user.name?.charAt(0)}</div>
            <div className="profile-info">
              <strong>{user.name}</strong>
              <div>Appreciation Score: {appreciationScore}</div>
              <button className="view-my-posts-btn" onClick={fetchMyPosts}>
                View My Shoutouts
              </button>
            </div>
          </div>

          {/* ✅ Employee of the Month */}
          <div className="employee-month-card">
            <h3>
              <i
                className="fa-solid fa-trophy"
                style={{ color: "#FFD700", marginRight: "8px" }}
              ></i>
              Employee of the Month
            </h3>
            {employeeOfMonth ? (
              <>
                <div className="eom-name">{employeeOfMonth.name}</div>
                <div className="eom-dept">{employeeOfMonth.department}</div>
                <small className="eom-date">
                  Announced on:{" "}
                  {new Date(employeeOfMonth.created_at).toLocaleDateString()}
                </small>
              </>
            ) : (
              <p className="no-eom">No employee announced yet.</p>
            )}
          </div>
          {/* 🏅 Top Contributors Card */}
          <div className="top-contributors-card">
            <h3>
              <i
                className="fa-solid fa-ranking-star"
                style={{ color: "#00BFFF", marginRight: "8px" }}
              ></i>
              Top Contributors
            </h3>

            {topContributors.map((contributor, index) => (
              <li key={index} className="contributor-item">
                <span className="rank">#{index + 1}</span>
                <span className="name">{contributor.author_name}</span>
                <span className="count">{contributor.count} posts</span>
              </li>
            ))}
          </div>
        </aside>

        {/* CENTER BAR */}
        <main className="content">
          {/* CREATE POST */}
          <div className="create-post">
            <h2>Create a Post</h2>
            <form className="shoutout-form" onSubmit={submitShoutOut}>
              {selectedTags.length > 0 && (
                <div className="selected-tags">
                  {selectedTags.map((id) => {
                    const emp = employees.find((e) => e.id === id);
                    return (
                      <span key={id} className="tag active">
                        @{emp?.name || `ID:${id}`}
                        <button type="button" onClick={() => toggleTag(id)}>
                          ×
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}

              <textarea
                placeholder="Write something..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />

              <div className="form-row">
                <label className="file-input">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  />
                </label>

                <div className="tags">
                  {employees.map((e) => (
                    <button
                      type="button"
                      key={e.id}
                      className={
                        selectedTags.includes(e.id) ? "tag active" : "tag"
                      }
                      onClick={() => toggleTag(e.id)}
                    >
                      @{e.name || e.id}
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" disabled={loading}>
                {loading ? "Posting..." : "Give Shoutout"}
              </button>
            </form>
          </div>

          {/* FEED */}
          <div className="feed">
            {feed.map((s) => {
              // Convert timestamp to "time ago"
              const createdAt = s.created_at
                ? new Date(s.created_at)
                : new Date();
              const now = new Date();
              const diffMs = now - createdAt;
              const diffMins = Math.floor(diffMs / (1000 * 60));
              const diffHrs = Math.floor(diffMins / 60);
              const diffDays = Math.floor(diffHrs / 24);
              let timeAgo = "";
              if (diffMins < 1) timeAgo = "just now";
              else if (diffMins < 60) timeAgo = `${diffMins} min ago`;
              else if (diffHrs < 24)
                timeAgo = `${diffHrs} hr${diffHrs > 1 ? "s" : ""} ago`;
              else timeAgo = `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;

              return (
                <div key={s.id} className="card shout">
                  <div className="meta">
                    <div className="author">
                      <i
                        className="fa-solid fa-user"
                        style={{ marginRight: "6px" }}
                      ></i>
                      {s.author_name || "Anonymous"}
                    </div>
                    <div className="time">
                      <i
                        className="fa-regular fa-clock"
                        style={{ marginRight: "6px" }}
                      ></i>
                      {/* ✅ Real-time relative time */}
                      <span
                        className="timeago"
                        dateTime={createdAt.toISOString()}
                      >
                        {format(createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="message">{s.message}</div>

                  {s.image_url && (
                    <img
                      src={`http://127.0.0.1:8000${s.image_url}`}
                      alt="shout"
                      className="image"
                    />
                  )}

                  {s.tagged_user_names?.length > 0 && (
                    <div className="tags-line">
                      <i
                        className="fa-solid fa-tags"
                        style={{ marginRight: "4px" }}
                      ></i>
                      Tagged:{" "}
                      {s.tagged_user_names.map((n, i) => (
                        <span key={i} className="tag-ref">
                          @{n}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="interaction-bar">
                    {/* Reaction Buttons */}
                    <div className="reactions">
                      <div className="reaction-buttons">
                        {[
                          {
                            icon: <FaThumbsUp color="#1E90FF" />,
                            key: "👍",
                            label: "Like",
                          },
                          {
                            icon: <FaHeart color="#FF4B4B" />,
                            key: "❤️",
                            label: "Love",
                          },
                          {
                            icon: <FaRegLaughBeam color="#FFD700" />,
                            key: "🎉",
                            label: "Celebrate",
                          },
                          {
                            icon: <FaFire color="#FF6B00" />,
                            key: "🔥",
                            label: "Hot",
                          },
                          {
                            icon: <FaPrayingHands color="#00C896" />,
                            key: "🙏",
                            label: "Thanks",
                          },
                        ].map((item) => (
                          <button
                            key={item.key}
                            className="reaction-btn"
                            onClick={() => react(s.id, item.key)}
                            title={`React with ${item.label}`}
                          >
                            <span className="reaction-icon">{item.icon}</span>
                            <span className="reaction-count">
                              {s.reactions?.[item.key] || 0}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Comments & Report Buttons */}
                    <div className="comments-actions">
                      <button
                        type="button"
                        className="toggle-button"
                        onClick={() => toggleComments(s.id)}
                      >
                        <i className="fa-regular fa-comment-dots"></i>{" "}
                        {s.comments_count || 0} Comments
                      </button>

                      <button
                        type="button"
                        className="report-button"
                        onClick={() => handleReportPost(s.id)}
                        title="Report Post"
                      >
                        <i className="fa-solid fa-flag"></i>
                      </button>
                    </div>
                  </div>

                  {/* Comments Section */}
                  {commentsOpen[s.id] && (
                    <div className="comments-body">
                      <ul className="comment-list">
                        {(commentsMap[s.id] || []).map((c) => (
                          <li key={c.id} className="comment-item">
                            <div className="comment-header">
                              <strong className="comment-author">
                                {c.author_name || "User"}
                              </strong>
                              <span className="comment-date">
                                {new Date(c.created_at).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                            <div className="comment-text">{c.content}</div>
                          </li>
                        ))}
                      </ul>

                      <div className="comment-form">
                        <input
                          type="text"
                          value={commentInput[s.id] || ""}
                          onChange={(e) =>
                            setCommentInput((ci) => ({
                              ...ci,
                              [s.id]: e.target.value,
                            }))
                          }
                          placeholder="Write a comment..."
                        />
                        <button
                          type="button"
                          onClick={() => submitComment(s.id)}
                        >
                          Add Comment
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </main>

        {/* RIGHT BAR */}
        <aside className="right-sidebar">
          <NotificationSlider notifications={notifications} />
          {/* 📊 Daily Engagement Graph */}
          <div className="daily-engagement-card">
            <h3>
              <i
                className="fa-solid fa-chart-line"
                style={{ color: "#32CD32", marginRight: "8px" }}
              ></i>
              Daily Engagement
            </h3>

            {engagementData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
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
        </aside>

        {/* ---------- My Shoutouts Popup ---------- */}
        {showMyPosts && (
          <div className="popup-overlay" onClick={() => setShowMyPosts(false)}>
            <div className="popup-card" onClick={(e) => e.stopPropagation()}>
              <button
                className="close-btn"
                onClick={() => setShowMyPosts(false)}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
              <h2>My Shoutouts</h2>

              {loadingMyPosts ? (
                <p>Loading...</p>
              ) : myPosts.length === 0 ? (
                <p>No shoutouts posted yet.</p>
              ) : (
                <div className="my-posts-container">
                  {myPosts.map((p) => (
                    <div key={p.id} className="my-post-card">
                      <div className="meta">
                        <div className="time">
                          {p.created_at?.replace("T", " ").slice(0, 16)}
                        </div>
                        <div className="actions">
                          <button
                            className="edit-btn"
                            title="Edit"
                            onClick={() => editMyPost(p.id, p.message)}
                          >
                            <i className="fa-solid fa-pen"></i>
                          </button>
                          <button
                            className="delete-btn"
                            title="Delete"
                            onClick={() => deleteMyPost(p.id)}
                          >
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </div>
                      <div className="message">{p.message}</div>
                      {p.image_url && (
                        <img
                          src={`http://127.0.0.1:8000${p.image_url}`}
                          alt="post"
                          className="image"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
