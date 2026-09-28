let editingExhibitionId = null;

function formatDateRange(start, end) {
  const opts = { day: "numeric", month: "short", year: "numeric" };
  return `${new Date(start).toLocaleDateString("en-IN", opts)} – ${new Date(end).toLocaleDateString("en-IN", opts)}`;
}

async function loadExhibitions() {
  const result = await apiCall("/exhibition");
  return result.data || [];
}

function resetExhibitionForm() {
  document.getElementById("createExhibitionForm").reset();
  editingExhibitionId = null;
  document.querySelector("#createModal h3").textContent = "Create New Exhibition";
  
  document.getElementById("createFormError").classList.remove("active");
}

async function renderTable() {
  const tbody = document.getElementById("exhibitionsBody");
  try {
    const list = await loadExhibitions();
    if (!list.length) {
      tbody.innerHTML = `<tr><td colspan="6" class="empty-state">No exhibitions yet. Create your first one.</td></tr>`;
      return;
    }
    tbody.innerHTML = list.map((ex) => `
      <tr>
        <td>${ex.title}</td>
        <td>${ex.venue || "—"}</td>
        <td>${formatDateRange(ex.start_date, ex.end_date)}</td>
        <td>${ex.organization_name || "—"}</td>
        <td><span class="badge ${ex.status}">${ex.status}</span></td>
        <td>
          <div class="row-actions">
            <a href="#" onclick='editExhibition(${JSON.stringify(ex)}); return false;'>Edit</a>
            <button class="danger" onclick="deleteExhibition(${ex.exhibition_id})">Delete</button>
          </div>
        </td>
      </tr>`).join("");
  } catch (error) {
    tbody.innerHTML = `<tr><td colspan="6" class="empty-state">${error.message}</td></tr>`;
  }
}

function editExhibition(ex) {
  editingExhibitionId = ex.exhibition_id;
  document.querySelector("#createModal h3").textContent = "Edit Exhibition";
  
  for (const id of ["title", "description", "venue", "start_date", "end_date", "status"]) {
    const el = document.getElementById(id);
    if (el) el.value = ex[id] ?? "";
  }
  document.getElementById("createModal").classList.add("active");
}

async function deleteExhibition(id) {
  if (!confirm("Delete this exhibition?")) return;
  try {
    await apiCall(`/exhibition/${id}`, "DELETE");
    await renderTable();
  } catch (error) {
    alert(error.message);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  if (!requireAuth()) return;
  showUserChip("Organizer");

  const form = document.getElementById("createExhibitionForm");
  const overlay = document.getElementById("createModal");
  const reset = () => { form.reset(); editingExhibitionId = null; document.querySelector("#createModal h3").textContent = "Create New Exhibition";  };

  document.getElementById("openCreateModal").addEventListener("click", () => { reset(); overlay.classList.add("active"); });
  document.getElementById("closeCreateModal").addEventListener("click", () => overlay.classList.remove("active"));
  document.getElementById("cancelCreate").addEventListener("click", () => overlay.classList.remove("active"));

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const errorEl = document.getElementById("createFormError");
    errorEl.classList.remove("active");
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      if (editingExhibitionId) {
        await apiCall(`/exhibition/${editingExhibitionId}`, "PUT", data);
      } else {
        await apiCall("/exhibition", "POST", data);
      }
      overlay.classList.remove("active");
      reset();
      await renderTable();
    } catch (error) {
      errorEl.textContent = error.message;
      errorEl.classList.add("active");
    }
  });

  await renderTable();
});
