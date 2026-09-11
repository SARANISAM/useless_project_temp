const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

async function request(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  });
  let body = null;
  try { body = await response.json(); } catch {}
  if (!response.ok || body?.success === false) {
    throw new Error(body?.error?.message || `Request failed (${response.status})`);
  }
  return body;
}

export const api = {
  getTasks: () => request("/tasks"),
  getTask: (id) => request(`/tasks/${id}`),
  createTask: (data) => request("/tasks", { method: "POST", body: JSON.stringify(data) }),
  updateTask: (id, data) => request(`/tasks/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteTask: (id) => request(`/tasks/${id}`, { method: "DELETE" }),
  startTask: (id) => request(`/tasks/${id}/start`, { method: "PATCH" }),
  completeTask: (id) => request(`/tasks/${id}/complete`, { method: "PATCH" }),
  aiMessage: (id) => request(`/tasks/${id}/ai-message`, { method: "POST" }),
  emergency: () => request("/emergency", { method: "POST" }),
  stats: () => request("/stats")
};
