firebase.auth().onAuthStateChanged(function(user) {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  loadMySubmissions(user);
});

async function loadMySubmissions(user) {
  const body = document.getElementById("myBody") || document.querySelector("tbody");

  if (!body) {
    console.error("myBody element not found.");
    return;
  }

  body.innerHTML = '<tr><td colspan="6">Loading...</td></tr>';

  try {
    const db = firebase.firestore();

    const snap = await db
      .collection("sss-submissions")
      .where("userId", "==", user.uid)
      .get();

    if (snap.empty) {
      body.innerHTML = '<tr><td colspan="6">No submissions yet.</td></tr>';
      return;
    }

    const submissions = [];

    snap.forEach(function(doc) {
      submissions.push({
        id: doc.id,
        ...doc.data()
      });
    });

    submissions.sort(function(a, b) {
      return new Date(b.timestamp || 0) - new Date(a.timestamp || 0);
    });

    body.innerHTML = submissions.map(function(item) {
      const status = (item.status || "pending").toLowerCase();

      // OPTIONAL: label for approved
      const approvedLabel = status === "approved"
        ? `<div style="font-size:11px;color:#16a34a;font-weight:bold;">✔ Approved Document</div>`
        : "";

      return `
        <tr>
          <td>${formatDate(item.timestamp)}</td>
          <td>${escapeHtml(item.certName || item.specimenName1 || "N/A")}</td>
          <td>${escapeHtml(item.employerName || "N/A")}</td>
          <td>
            <span class="status ${status}">${status.toUpperCase()}</span>
            ${approvedLabel}
          </td>
          <td>${escapeHtml(item.rejectionReason || "")}</td>
          <td>
            <a class="btn btn-blue" href="summary.html?id=${encodeURIComponent(item.id)}" target="_blank">View</a>
          </td>
        </tr>
      `;
    }).join("");

  } catch (error) {
    console.error("My submissions error:", error);
    body.innerHTML = '<tr><td colspan="6" style="color:red;">Failed to load submissions: ' + escapeHtml(error.message) + '</td></tr>';
  }
}

function formatDate(value) {
  if (!value) return "N/A";

  const date = new Date(value);

  if (isNaN(date.getTime())) {
    return "N/A";
  }

  return date.toLocaleString();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}