function redirectForRole(role) {
  const normalized = String(role || "").toLowerCase();
  if (normalized === "admin" || normalized === "1") window.location.href = "admin/dashboard.html";
  else if (normalized === "organizer" || normalized === "2") window.location.href = "organizer/dashboard.html";
  else if (normalized === "exhibitor" || normalized === "3") window.location.href = "exhibitor/dashboard.html";
  else window.location.href = "visitor/dashboard.html";
}

function initRoleSelect() {
  const roleInputs = document.querySelectorAll('input[name="role"]');
  roleInputs.forEach((input) => {
    input.addEventListener("change", () => {
      document.querySelectorAll(".conditional-fields").forEach((el) => el.classList.remove("active"));
      const target = document.getElementById(`fields-${input.value}`);
      if (target) target.classList.add("active");
    });
  });
  const checked = document.querySelector('input[name="role"]:checked');
  if (checked) checked.dispatchEvent(new Event("change"));
}

function initSignupForm() {
  const form = document.getElementById("signupForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const errorEl = document.getElementById("formError");
    errorEl.classList.remove("active");

    const payload = Object.fromEntries(new FormData(form).entries());
    const roleMap = { organizer: 2, exhibitor: 3, visitor: 4 };
    const role = payload.role;
    payload.role_id = roleMap[role];
    delete payload.role;

    try {
      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = "Creating account...";
      const result = await apiCall("/auth/signup", "POST", payload);
      alert(result.message || "Account created successfully. Please sign in.");
      window.location.href = "login.html";
    } catch (err) {
      errorEl.textContent = err.message;
      errorEl.classList.add("active");
      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = false;
      btn.textContent = "Create account";
    }
  });
}

function initLoginForm() {
  const form = document.getElementById("loginForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const errorEl = document.getElementById("formError");
    errorEl.classList.remove("active");

    const payload = Object.fromEntries(new FormData(form).entries());

    try {
      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = "Signing in...";

      const result = await apiCall("/auth/login", "POST", payload);
      localStorage.setItem("token", result.token);
      localStorage.setItem("role", result.role);
      localStorage.setItem("currentUser", JSON.stringify(result.user || {}));
      localStorage.setItem("demoUser", JSON.stringify(result.user || {}));
      redirectForRole(result.role);
    } catch (err) {
      errorEl.textContent = err.message;
      errorEl.classList.add("active");
      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = false;
      btn.textContent = "Sign in";
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initRoleSelect();
  initSignupForm();
  initLoginForm();
});
