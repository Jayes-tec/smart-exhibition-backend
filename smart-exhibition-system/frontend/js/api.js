// Central API helper for the Smart Exhibition frontend.
const BASE_URL = "http://localhost:5000/api";
const DEMO_MODE = false;

function getToken() {
  return localStorage.getItem("token");
}

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem("currentUser") || "{}");
  } catch {
    return {};
  }
}

async function apiCall(endpoint, method = "GET", data = null) {
  if (DEMO_MODE) throw new Error("Demo mode is disabled.");

  const options = { method, headers: {} };
  const token = getToken();

  if (token) options.headers.Authorization = `Bearer ${token}`;

  if (data !== null && data !== undefined) {
    options.headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(data);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, options);
  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.message || `Request failed (${response.status})`);
  }

  return result;
}

async function apiFormCall(endpoint, method = "POST", formData) {
  const options = { method, headers: {}, body: formData };
  const token = getToken();

  if (token) options.headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${BASE_URL}${endpoint}`, options);
  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.message || `Request failed (${response.status})`);
  }

  return result;
}

function requireAuth() {
  if (!getToken()) {
    window.location.href = getLoginPath();
    return false;
  }
  return true;
}

function getLoginPath() {
  const path = window.location.pathname;
  if (path.includes("/admin/") || path.includes("/organizer/") ||
      path.includes("/exhibitor/") || path.includes("/visitor/")) {
    return "../login.html";
  }
  return "login.html";
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("currentUser");
  localStorage.removeItem("role");
  localStorage.removeItem("demoUser");
  window.location.href = getLoginPath();
}

function showUserChip(fallback = "User") {
  const user = getCurrentUser();
  const name = user.name || user.company_name || fallback;
  const nameEl = document.getElementById("userName");
  const initialEl = document.getElementById("userInitial");
  if (nameEl) nameEl.textContent = name;
  if (initialEl) initialEl.textContent = name.charAt(0).toUpperCase();
}

document.addEventListener("DOMContentLoaded", () => {
  const logoutLink = document.querySelector('a[href$="login.html"]');
  if (logoutLink && /log\s*out/i.test(logoutLink.textContent)) {
    logoutLink.addEventListener("click", (e) => {
      e.preventDefault();
      logout();
    });
  }
});
