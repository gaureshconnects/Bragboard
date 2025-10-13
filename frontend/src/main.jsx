import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
//import "./index.css";
import "./styles/index.scss"; // instead of index.css
import "./styles/global.scss"; // ✅ import here


createRoot(document.getElementById("root")).render(<App />);
