import axios from "axios";

// Base URL comes from the environment so the same build works against
// localhost during development and the deployed Render URL in production.
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Centralized error logging; individual hooks/pages decide how to
    // surface this to the user (e.g. "Offline" status, retry buttons).
    console.error("[API ERROR]", error?.response?.status, error?.config?.url, error?.message);
    return Promise.reject(error);
  }
);
