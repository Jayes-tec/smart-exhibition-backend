let currentExhibitionForApply = null;
let availableBooths = [];

function formatDateRange(start, end) {
  const opts = { day: "numeric", month: "short", year: "numeric" };
  return `${new Date(start).toLocaleDateString("en-IN", opts)} – ${new Date(end).toLocaleDateString("en-IN", opts)}`;
}

async function loadExhibitions() {
  const response = await apiCall("/exhibition");
  return response.data || [];
}

async function loadBoothsForExhibition(exhibitionId) {
  const response = await apiCall("/booths");
  return (response.data || []).filter((b) =>
    String(b.exhibition_id) === String(exhibitionId) &&
    String(b.status).toLowerCase() === "available"
  );
}

async function renderGrid() {
  const grid = document.getElementById("exhibitionsGrid");
  const searchTerm = document.getElementById("searchInput").value.trim().toLowerCase();
  const statusTerm = document.getElementById("statusFilter").value;

  try {
    let list = await loadExhibitions();
    list = list.filter((ex) => ["upcoming", "ongoing"].includes(String(ex.status).toLowerCase()));

    if (searchTerm) {
      list = list.filter((ex) =>
        String(ex.title).toLowerCase().includes(searchTerm) ||
        String(ex.venue || "").toLowerCase().includes(searchTerm)
      );
    }
    if (statusTerm) list = list.filter((ex) => ex.status === statusTerm);

    if (!list.length) {
      grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;">No open exhibitions match your search right now.</div>`;
      return;
    }

    grid.innerHTML = list.map((ex) => `
      <div class="role-card organizer" style="border-top-color:var(--copper);">
        <div class="tag">${ex.status}</div>
        <h4>${ex.title}</h4>
        <p>${ex.venue || "Venue not available"}<br>${formatDateRange(ex.start_date, ex.end_date)}</p>
        <button class="btn btn-copper" style="width:100%; text-align:center;"
          onclick="openApplyModal(${ex.exhibition_id}, '${String(ex.title).replace(/'/g, "\\'")}')">Register</button>
      </div>
    `).join("");
  } catch (error) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;">${error.message}</div>`;
  }
}

async function openApplyModal(exhibitionId, title) {
  currentExhibitionForApply = { id: exhibitionId, title };
  document.getElementById("applyModalTitle").textContent = `Register — ${title}`;

  const boothSelect = document.getElementById("booth_choice");
  try {
    availableBooths = await loadBoothsForExhibition(exhibitionId);
    boothSelect.innerHTML = availableBooths.length
      ? availableBooths.map((b) => `<option value="${b.booth_id}">${b.booth_number} — ${b.size || ""}</option>`).join("")
      : `<option value="">No available booths</option>`;
  } catch (error) {
    boothSelect.innerHTML = `<option value="">Unable to load booths</option>`;
  }
  document.getElementById("applyModal").classList.add("active");
}

function closeApplyModal() {
  document.getElementById("applyModal").classList.remove("active");
  document.getElementById("applyForm").reset();
  document.getElementById("applyFormError").classList.remove("active");
  currentExhibitionForApply = null;
}

async function initApplyModal() {
  document.getElementById("closeApplyModal").addEventListener("click", closeApplyModal);
  document.getElementById("cancelApply").addEventListener("click", closeApplyModal);
  document.getElementById("applyModal").addEventListener("click", (e) => {
    if (e.target.id === "applyModal") closeApplyModal();
  });

  document.getElementById("applyForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const errorEl = document.getElementById("applyFormError");
    errorEl.classList.remove("active");

    if (!currentExhibitionForApply) return;

    const boothId = document.getElementById("booth_choice").value;
    if (!boothId) {
      errorEl.textContent = "No available booth selected.";
      errorEl.classList.add("active");
      return;
    }

    try {
      const exhibitorResponse = await apiCall("/exhibitors/me");
      const exhibitor = exhibitorResponse.data;

      await apiCall("/exhibitionExhibitor", "POST", {
        exhibition_id: currentExhibitionForApply.id,
        exhibitor_id: exhibitor.exhibitor_id,
        booth_id: Number(boothId),
        registration_date: new Date().toISOString().slice(0, 10),
      });

      closeApplyModal();
      alert("Application submitted successfully.");
      await renderGrid();
    } catch (error) {
      errorEl.textContent = error.message;
      errorEl.classList.add("active");
    }
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  if (!requireAuth()) return;
  showUserChip("Exhibitor");
  await renderGrid();
  await initApplyModal();
  document.getElementById("searchInput").addEventListener("input", renderGrid);
  document.getElementById("statusFilter").addEventListener("change", renderGrid);
});
