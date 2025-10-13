import Navbar from "../components/Navbar";
import "../styles/Home.scss";
import { useState, useEffect } from "react";
import { api } from "../../src/api"; // your axios setup

export default function Home() {
  const [active, setActive] = useState("createPost");
  const [postText, setPostText] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [colleagues, setColleagues] = useState([]);

  // Fetch colleagues from backend
  useEffect(() => {
    const fetchColleagues = async () => {
      try {
        const res = await api.get("/users/colleagues"); // adjust API endpoint
        setColleagues(res.data); // assume it returns array of { id, name }
      } catch (err) {
        console.error("Failed to fetch colleagues", err);
      }
    };
    fetchColleagues();
  }, []);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleTagSelect = (e) => {
    const value = e.target.value;
    if (value && !selectedTags.includes(value)) {
      setSelectedTags([...selectedTags, value]);
    }
  };

  const handleRemoveTag = (tag) => {
    setSelectedTags(selectedTags.filter((t) => t !== tag));
  };

  const handlePost = async () => {
    const formData = new FormData();
    formData.append("text", postText);
    if (selectedImage) formData.append("image", selectedImage);
    formData.append("tags", JSON.stringify(selectedTags));

    try {
      const res = await api.post("/posts/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Post created successfully!");
      setPostText("");
      setSelectedImage(null);
      setSelectedTags([]);
    } catch (err) {
      console.error("Post creation failed", err);
      alert("Failed to create post");
    }
  };

  const menuItems = [
    { key: "createPost", label: "Create Post" },
    { key: "shout", label: "Shout to Employee" },
    { key: "timeline", label: "Write on Timeline" },
    { key: "myAchievements", label: "My Achievements" },
    { key: "notifications", label: "Notifications" },
    { key: "teamBoard", label: "Team Board" },
    { key: "profile", label: "Profile Settings" },
  ];

  return (
    <>
      <Navbar />
      <div className="home-container">
        <aside className="sidebar">
          <ul>
            {menuItems.map((item) => (
              <li
                key={item.key}
                className={active === item.key ? "active" : ""}
                onClick={() => setActive(item.key)}
              >
                {item.label}
              </li>
            ))}
          </ul>
        </aside>

        <main className="content">
          {active === "createPost" && (
            <div className="create-post-card">
              <h2>Create a new post</h2>
              <textarea
                placeholder="Write something..."
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
              ></textarea>

              <div className="image-upload">
                <label>
                  Insert Image:
                  <input type="file" accept="image/*" onChange={handleImageChange} />
                </label>
                {selectedImage && (
                  <img src={selectedImage} alt="Preview" className="preview-image" />
                )}
              </div>

              <div className="tags-input">
                <select onChange={handleTagSelect} defaultValue="">
                  <option value="" disabled>
                    Tag colleagues
                  </option>
                  {colleagues.map((colleague) => (
                    <option key={colleague.id} value={colleague.name}>
                      {colleague.name}
                    </option>
                  ))}
                </select>

                <div className="tags-list">
                  {selectedTags.map((tag, idx) => (
                    <span key={idx} className="tag">
                      @{tag} <button onClick={() => handleRemoveTag(tag)}>&times;</button>
                    </span>
                  ))}
                </div>
              </div>

              <button className="post-btn" onClick={handlePost}>
                Post
              </button>
            </div>
          )}

          {active === "shout" && <h2>Send a shout to an employee</h2>}
          {active === "timeline" && <h2>Write on your timeline</h2>}
          {active === "myAchievements" && <h2>My Achievements</h2>}
          {active === "notifications" && <h2>Notifications</h2>}
          {active === "teamBoard" && <h2>Team Board</h2>}
          {active === "profile" && <h2>Profile Settings</h2>}
        </main>
      </div>
    </>
  );
}
