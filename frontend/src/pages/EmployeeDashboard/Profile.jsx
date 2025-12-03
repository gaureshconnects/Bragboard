import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import "../../styles/profile.scss";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    joining_date: "",
    current_project: "",
    group_members: [""],
  });
  const [departmentEmployees, setDepartmentEmployees] = useState([]);

  const accessToken = localStorage.getItem("accessToken");

  // Fetch user profile
  useEffect(() => {
    const fetchUser = async () => {
      if (!accessToken) {
        setError("Access token missing. Please login.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("http://127.0.0.1:8000/auth/me", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!res.ok) throw new Error(`Error: ${res.statusText}`);
        const data = await res.json();
        setUser(data);

        // Initialize group members (at least one)
        const membersArray = data.group_members
          ? data.group_members.split(",").map((m) => m.trim())
          : [""];
        setEditData({
          joining_date: data.joining_date || "",
          current_project: data.current_project || "",
          group_members: membersArray.length > 0 ? membersArray : [""],
        });

        // Fetch department employees
        const empRes = await fetch("http://127.0.0.1:8000/auth/department-employees", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!empRes.ok) throw new Error("Failed to fetch department employees");
        const empData = await empRes.json();
        setDepartmentEmployees(empData);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch user profile or employees.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [accessToken]);

  // Handle member change
  const handleMemberChange = (index, value) => {
    const updatedMembers = [...editData.group_members];
    updatedMembers[index] = value;
    setEditData({ ...editData, group_members: updatedMembers });
  };

  // Add new member field
  const handleAddMember = () => {
    setEditData({
      ...editData,
      group_members: [...editData.group_members, ""],
    });
  };

  // Remove member field
  const handleRemoveMember = (index) => {
    const updatedMembers = editData.group_members.filter((_, i) => i !== index);
    setEditData({ ...editData, group_members: updatedMembers });
  };

  // Save updated profile
  const handleSave = async () => {
    const membersArray = editData.group_members.filter((m) => m.trim() !== "");
    if (membersArray.length < 1) {
      alert("Please select at least one group member.");
      return;
    }

    try {
      const res = await fetch("http://127.0.0.1:8000/auth/update-profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          ...editData,
          group_members: membersArray.join(","), // Convert list → string
        }),
      });

      if (!res.ok) throw new Error("Update failed");

      const updatedUser = await res.json();
      setUser(updatedUser);
      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update profile.");
    }
  };

  return (
    <>
      <Navbar />
      <div className="profile-container">
        <h1>Profile</h1>
        {loading && <p>Loading...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {user && (
          <div className="profile-details">
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Username:</strong> {user.username}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> {user.role}</p>
            <p><strong>Department:</strong> {user.department}</p>

            {isEditing ? (
              <div className="edit-fields">
                <label>Joining Date:</label>
                <input
                  type="date"
                  value={editData.joining_date}
                  onChange={(e) =>
                    setEditData({ ...editData, joining_date: e.target.value })
                  }
                />

                <label>Current Project:</label>
                <input
                  type="text"
                  value={editData.current_project}
                  onChange={(e) =>
                    setEditData({ ...editData, current_project: e.target.value })
                  }
                />

                <label>Group Members (minimum 1):</label>
                {editData.group_members.map((member, index) => (
                  <div key={index} className="member-input">
                    <select
                      value={member}
                      onChange={(e) => handleMemberChange(index, e.target.value)}
                    >
                      <option value="">Select Member</option>
                      {departmentEmployees.map((emp) => (
                        <option key={emp.id} value={emp.name}>
                          {emp.name}
                        </option>
                      ))}
                    </select>

                    {editData.group_members.length > 1 && (
                      <button
                        className="remove-btn"
                        onClick={() => handleRemoveMember(index)}
                      >
                        ❌
                      </button>
                    )}
                  </div>
                ))}

                <button className="add-btn" onClick={handleAddMember}>
                  ➕ Add Member
                </button>

                <div style={{ marginTop: "10px" }}>
                  <button className="save-btn" onClick={handleSave}>
                    Save
                  </button>
                  <button className="cancel-btn" onClick={() => setIsEditing(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p><strong>Joining Date:</strong> {user.joining_date || "Not set"}</p>
                <p><strong>Current Project:</strong> {user.current_project || "Not set"}</p>
                <p><strong>Group Members:</strong> {user.group_members || "Not set"}</p>
                <button className="edit-btn" onClick={() => setIsEditing(true)}>
                  Edit Profile
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}
