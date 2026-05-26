import axios from "axios";
import * as SecureStore from "expo-secure-store";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Auth ─────────────────────────────────────────────
export const register = (data: {
  email: string; password: string; display_name: string;
  loss_type?: string; loss_date?: string;
}) => api.post("/auth/register", data);

export const login = (email: string, password: string) =>
  api.post("/auth/login", { email, password });

// ── Journal ──────────────────────────────────────────
export const createEntry = (content: string, mood_self_report?: number) =>
  api.post("/journal/entry", { content, mood_self_report });

export const listEntries = () => api.get("/journal/entries");

export const getEntry = (id: string) => api.get(`/journal/entry/${id}`);

// ── Insights ─────────────────────────────────────────
export const getInsights = () => api.get("/insights/");

// ── Memory Capsule ───────────────────────────────────
export const createMemory = (title: string, content: string, memory_date?: string) =>
  api.post("/memory/", { title, content, memory_date });

export const listMemories = () => api.get("/memory/");

export const deleteMemory = (id: string) => api.delete(`/memory/${id}`);

export default api;
