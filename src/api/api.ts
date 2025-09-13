// api.ts
import axios, { AxiosInstance } from "axios";

// ✅ Read environment variable (Vite style)
const baseURL: string = import.meta.env.VITE_BACKEND_URL as string;

console.log(baseURL);

if (!baseURL) {
  console.warn("⚠️ VITE_BACKEND_URL is not defined in environment variables.");
}

// ✅ Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: `${baseURL}/api`, // fallback handled by .env
  // withCredentials: true, // enable if backend uses cookies/sessions
});

export default api;
