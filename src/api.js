import axios from "axios";

const API_URL = "http://127.0.0.1:5000"; // Flask Backend URL

// Helper function to get auth headers
function getAuthHeader() {
  const token = localStorage.getItem("token");
  return token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };
}

// User Login
export async function login(email, password) {
  return axios.post(
    `${API_URL}/auth/login`,
    { email, password },
    { headers: { "Content-Type": "application/json" } },
  );
}

// Fetch User's Tasks
export async function getTasks() {
  return axios.get(`${API_URL}/tasks/`, { headers: getAuthHeader() });
}

// Complete a Task
export async function completeTask(taskTitle) {
  return axios.patch(
    `${API_URL}/tasks/${encodeURIComponent(taskTitle)}/complete`,
    {},
    { headers: getAuthHeader() },
  );
}

// Get Daily Progress
export async function getDailyProgress() {
  return axios.get(`${API_URL}/progress/daily/`, { headers: getAuthHeader() });
}

// User Registration
export async function register(name, email, password) {
  return axios.post(
    `${API_URL}/auth/register`,
    { name, email, password },
    { headers: { "Content-Type": "application/json" } },
  );
}

// Logout (Remove Token)
export function logout() {
  localStorage.removeItem("token");
}

export const createTask = async (taskData) => {
  return axios.post(`${API_URL}/tasks/`, taskData, {
    headers: getAuthHeader(),
  });
};
