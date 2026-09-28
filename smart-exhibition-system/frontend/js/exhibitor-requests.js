async function renderRequests() {
  const body = document.getElementById("requestsBody");
  try {
    let list = (await apiCall("/exhibitionExhibitor")).data || [];
    const filter = document.getElementById("statusFilter").value;
    if (filter) list = list.filter(x => String(x.status).toLowerCase() === filter.toLowerCase());
    const counts = { pending:0, approved:0, rejected:0 };
    list.forEach(x => { const k=String(x.status).toLowerCase(); if(k in counts) counts[k]++; });
    document.getElementById("statPending").textContent=counts.pending;
    document.getElementById("statConfirmed").textContent=counts.approved;
    document.getElementById("statRejected").textContent=counts.rejected;
    body.innerHTML = list.length ? list.map(x => `<tr>
      <td>${x.company_name}</td><td>${x.exhibition_name}</td><td>${x.booth_number || "—"}</td>
      <td><span class="badge ${String(x.status).toLowerCase()}">${x.status}</span></td>
      <td>${x.status === "Pending" ? `<a href="#" onclick="changeRequest(${x.exhibition_exhibitor_id},'Approved');return false;">Approve</a> <button onclick="changeRequest(${x.exhibition_exhibitor_id},'Rejected')">Reject</button>` : ""}</td>
    </tr>`).join("") : `<tr><td colspan="5" class="empty-state">No exhibitor requests.</td></tr>`;
  } catch(e) { body.innerHTML=`<tr><td colspan="5" class="empty-state">${e.message}</td></tr>`; }
}
async function changeRequest(id,status){try{await apiCall(`/exhibitionExhibitor/${id}/status`,"PUT",{status});await renderRequests();}catch(e){alert(e.message);}}
document.addEventListener("DOMContentLoaded",async()=>{if(!requireAuth())return;showUserChip("Organizer");document.getElementById("statusFilter").onchange=renderRequests;await renderRequests();});
