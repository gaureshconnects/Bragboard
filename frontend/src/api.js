// src/api.js
import axios from "axios";

const API_URL = "http://127.0.0.1:8000";

export const api = axios.create({
  baseURL: API_URL,
});

// Attach Authorization header if access token exists
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (_) {
    // ignore
  }
  return config;
});
