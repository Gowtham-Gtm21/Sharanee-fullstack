import axios from "axios";

// In dev, Vite proxies /api and /uploads to the Express server (port 5000).
// In production, set VITE_API_URL to your deployed backend origin.
const BASE = import.meta.env.VITE_API_URL || "";

export const API_ORIGIN = BASE;

const api = axios.create({
  baseURL: `${BASE}/api`,
});

// Attach the JWT (if present) to every request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("sharanee_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Resolve an image path returned by the backend into a usable URL.
// The backend stores paths like "uploads/products/123.jpg".
export function imageUrl(path) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  const clean = path.replace(/\\/g, "/").replace(/^\/?/, "/");
  return `${BASE}${clean}`;
}

export default api;
