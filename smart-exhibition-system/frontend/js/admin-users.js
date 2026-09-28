async function render() {
  const body = document.getElementById("usersBody");
  try {
    let list = (await apiCall("/admin/users")).data || [];
    const q = document.getElementById("searchInput").value.toLowerCase();
    const role = document.getElementById("roleFilter").value;
    const status = document.getElementById("statusFilter").value;
    if (q)
      list = list.filter(
        (u) =>
          u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
      );
    if (role) list = list.filter((u) => u.role === role);
    if (status) list = list.filter((u) => u.status === status);
    body.innerHTML = list.length
      ? list
          .map(
            (u) =>
              `<tr><td>${u.name}</td><td>${u.email}</td><td>${u.role}</td><td>${new Date(u.joined).toLocaleDateString("en-IN")}</td><td>${u.status}</td><td><button onclick="setUserStatus(${u.user_id},'Active')">Activate</button><button class="danger" onclick="setUserStatus(${u.user_id},'Blocked')">Block</button></td></tr>`,
          )
          .join("")
      : `<tr><td colspan="6">No users.</td></tr>`;
  } catch (e) {
    body.innerHTML = `<tr><td colspan="6">${e.message}</td></tr>`;
  }
}
async function setUserStatus(id, status) {
  try {
    await apiCall(`/admin/users/${id}/status`, "PATCH", { status });
    await render();
  } catch (e) {
    alert(e.message);
  }
}
document.addEventListener("DOMContentLoaded", async () => {
  if (!requireAuth()) return;
  showUserChip("Admin");
  ["searchInput", "roleFilter", "statusFilter"].forEach((id) =>
    document
      .getElementById(id)
      .addEventListener(id === "searchInput" ? "input" : "change", render),
  );
  await render();
});
