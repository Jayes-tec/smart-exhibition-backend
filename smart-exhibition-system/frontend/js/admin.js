document.addEventListener("DOMContentLoaded", async () => {
  if (!requireAuth()) return;
  showUserChip("Admin");
  try {
    const r = await apiCall("/admin/stats");
    const s = r.data;
    document.getElementById("statUsers").textContent = s.users;
    document.getElementById("statExhibitions").textContent = s.exhibitions;
    document.getElementById("statExhibitors").textContent = s.exhibitors;
    document.getElementById("statVisitors").textContent = s.visitors;
    document.getElementById("roleBreakdown").innerHTML =
      `<div>Organizers: ${s.organizers}</div><div>Exhibitors: ${s.exhibitors}</div><div>Visitors: ${s.visitors}</div>`;
    document.getElementById("activityBody").innerHTML =
      `<tr><td colspan="4">Live counts loaded from MySQL.</td></tr>`;
  } catch (e) {
    console.error(e);
  }
});
