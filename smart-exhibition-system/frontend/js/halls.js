async function loadHalls() {
  const result = await apiCall("/halls");
  return result.data || [];
}
async function loadExhibitions() {
  const result = await apiCall("/exhibition");
  return result.data || [];
}
async function renderTable() {
  const tbody = document.getElementById("hallsBody");
  try {
    const list = await loadHalls();
    const filter = document.getElementById("exhibitionFilter").value;
    const filtered = filter ? list.filter(h => String(h.exhibition_id) === String(filter)) : list;
    tbody.innerHTML = filtered.length ? filtered.map(h => `
      <tr><td>${h.exhibition_name || h.exhibition_id}</td><td>${h.hall_name}</td><td>${h.hall_number || "—"}</td><td>${h.floor || "—"}</td><td>${h.description || "—"}</td></tr>
    `).join("") : `<tr><td colspan="5" class="empty-state">No halls found.</td></tr>`;
  } catch (e) { tbody.innerHTML = `<tr><td colspan="5" class="empty-state">${e.message}</td></tr>`; }
}
document.addEventListener("DOMContentLoaded", async () => {
  if (!requireAuth()) return;
  showUserChip("Organizer");
  const exSelect = document.getElementById("exhibition_id");
  const filter = document.getElementById("exhibitionFilter");
  const exhibitions = await loadExhibitions().catch(() => []);
  const opts = exhibitions.map(e => `<option value="${e.exhibition_id}">${e.title}</option>`).join("");
  exSelect.innerHTML = opts;
  filter.innerHTML += opts;
  const overlay = document.getElementById("createModal");
  document.getElementById("openCreateModal").onclick = () => overlay.classList.add("active");
  document.getElementById("closeCreateModal").onclick = () => overlay.classList.remove("active");
  document.getElementById("cancelCreate").onclick = () => overlay.classList.remove("active");
  document.getElementById("exhibitionFilter").onchange = renderTable;
  document.getElementById("createHallForm").onsubmit = async (e) => {
    e.preventDefault();
    const error = document.getElementById("createFormError");
    error.classList.remove("active");
    try {
      await apiCall("/halls", "POST", Object.fromEntries(new FormData(e.target).entries()));
      overlay.classList.remove("active"); e.target.reset(); await renderTable();
    } catch (err) { error.textContent = err.message; error.classList.add("active"); }
  };
  await renderTable();
});
