async function loadBooths() { const r = await apiCall("/booths"); return r.data || []; }
async function loadHalls() { const r = await apiCall("/halls"); return r.data || []; }
async function renderTable() {
  const tbody = document.getElementById("boothsBody");
  try {
    let list = await loadBooths();
    const hall = document.getElementById("hallFilter").value;
    const status = document.getElementById("statusFilter").value;
    if (hall) list = list.filter(b => String(b.hall_id) === String(hall));
    if (status) list = list.filter(b => b.status === status);
    tbody.innerHTML = list.length ? list.map(b => `<tr><td>${b.hall_name || b.hall_id}</td><td>${b.booth_number}</td><td>${b.size || "—"}</td><td>${b.location || "—"}</td><td><span class="badge ${String(b.status).toLowerCase()}">${b.status}</span></td></tr>`).join("") : `<tr><td colspan="5" class="empty-state">No booths found.</td></tr>`;
  } catch (e) { tbody.innerHTML = `<tr><td colspan="5" class="empty-state">${e.message}</td></tr>`; }
}
document.addEventListener("DOMContentLoaded", async () => {
  if (!requireAuth()) return;
  showUserChip("Organizer");
  const halls = await loadHalls().catch(() => []);
  const opts = halls.map(h => `<option value="${h.hall_id}">${h.hall_name} — ${h.exhibition_name || ""}</option>`).join("");
  document.getElementById("hall_id").innerHTML = opts;
  document.getElementById("hallFilter").innerHTML += opts;
  document.getElementById("hallFilter").onchange = renderTable;
  document.getElementById("statusFilter").onchange = renderTable;
  const overlay = document.getElementById("createModal");
  document.getElementById("openCreateModal").onclick = () => overlay.classList.add("active");
  document.getElementById("closeCreateModal").onclick = () => overlay.classList.remove("active");
  document.getElementById("cancelCreate").onclick = () => overlay.classList.remove("active");
  document.getElementById("createBoothForm").onsubmit = async e => {
    e.preventDefault();
    const error = document.getElementById("createFormError"); error.classList.remove("active");
    try { await apiCall("/booths", "POST", Object.fromEntries(new FormData(e.target).entries())); overlay.classList.remove("active"); e.target.reset(); await renderTable(); }
    catch(err) { error.textContent = err.message; error.classList.add("active"); }
  };
  await renderTable();
});
