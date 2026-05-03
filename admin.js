const db4 = firebase.firestore();

let adminItems = [];
let adminUser = null;
let currentFilter = "active";

firebase.auth().onAuthStateChanged(async function(user) {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  adminUser = user;

  const adminEmail = document.getElementById("adminEmail");
  if (adminEmail) {
    adminEmail.textContent = user.email || "Administrator";
  }

  try {
    const userDoc = await db4.collection("users").doc(user.uid).get();
    const role = userDoc.exists ? userDoc.data().role : "user";

    if (role !== "admin") {
      alert("Admin access only.");
      window.location.href = "dashboard.html";
      return;
    }

    loadAdmin();
  } catch (error) {
    console.error(error);
    alert("Failed to verify admin access.");
    window.location.href = "dashboard.html";
  }
});

async function loadAdmin() {
  const body = document.getElementById("adminBody");
  const resultInfo = document.getElementById("resultInfo");

  if (body) {
    body.innerHTML = `<tr><td colspan="8">Loading applications...</td></tr>`;
  }

  if (resultInfo) {
    resultInfo.textContent = "Loading applications...";
  }

  try {
    const snap = await db4.collection("sss-submissions").get();

    adminItems = [];

    snap.forEach(function(doc) {
      adminItems.push({
        id: doc.id,
        ...doc.data()
      });
    });

    adminItems.sort(function(a, b) {
      return new Date(b.timestamp || b.createdAt || 0) - new Date(a.timestamp || a.createdAt || 0);
    });

    updateCounts();
    renderTable();

    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
      searchInput.removeEventListener("input", renderTable);
      searchInput.addEventListener("input", renderTable);
    }

  } catch (error) {
    console.error("Admin load error:", error);

    if (body) {
      body.innerHTML = `
        <tr>
          <td colspan="8" style="color:#dc2626;">
            Failed to load submissions: ${escapeHtml(error.message)}
          </td>
        </tr>
      `;
    }

    if (resultInfo) {
      resultInfo.textContent = "Failed to load applications.";
    }
  }
}

function setFilter(filter, button) {
  currentFilter = filter;

  document.querySelectorAll(".filter-tab").forEach(function(tab) {
    tab.classList.remove("active");
  });

  if (button) {
    button.classList.add("active");
  }

  renderTable();
}

function updateCounts() {
  const active = adminItems.filter(function(item) {
    const status = (item.status || "pending").toLowerCase();
    return status === "pending" || status === "approved";
  }).length;

  const pending = adminItems.filter(function(item) {
    return (item.status || "pending").toLowerCase() === "pending";
  }).length;

  const approved = adminItems.filter(function(item) {
    return (item.status || "").toLowerCase() === "approved";
  }).length;

  const rejected = adminItems.filter(function(item) {
    return (item.status || "").toLowerCase() === "rejected";
  }).length;

  setText("activeCount", active);
  setText("pendingCount", pending);
  setText("approvedCount", approved);
  setText("rejectedCount", rejected);
}

function renderTable() {
  const body = document.getElementById("adminBody");
  const resultInfo = document.getElementById("resultInfo");
  const searchInput = document.getElementById("searchInput");
  const search = (searchInput ? searchInput.value : "").toLowerCase().trim();

  if (!body) return;

  const filtered = adminItems.filter(function(item) {
    const status = (item.status || "pending").toLowerCase();

    // If search box has text, search all applications regardless of tab.
    // If search box is empty, follow the selected filter tab.
    if (!search) {
      if (currentFilter === "active") {
        if (!(status === "pending" || status === "approved")) return false;
      } else {
        if (status !== currentFilter) return false;
      }
    }

    const searchableText = [
      item.userEmail || "",
      item.certName || "",
      item.specimenName1 || "",
      item.employerName || "",
      item.employerName2 || "",
      item.employerId || "",
      item.ssNumber || "",
      item.telephone || "",
      item.address || "",
      item.status || "",
      item.submissionId || "",
      item.id || ""
    ].join(" ").toLowerCase();

    return !search || searchableText.includes(search);
  });

  if (resultInfo) {
    resultInfo.textContent = `Showing ${filtered.length} application(s)`;
  }

  if (!filtered.length) {
    body.innerHTML = `
      <tr>
        <td colspan="8">
          <div class="empty-state">No applications found</div>
        </td>
      </tr>
    `;
    return;
  }

  body.innerHTML = filtered.map(function(item) {
    const status = (item.status || "pending").toLowerCase();

    return `
      <tr>
        <td>
          ${
            item.photo
              ? `<img src="${item.photo}" class="photo-thumb" alt="Photo">`
              : `<div style="width:42px;height:42px;background:#f1f5f9;border-radius:8px;display:flex;align-items:center;justify-content:center;">📷</div>`
          }
        </td>
        <td><strong>${escapeHtml(item.employerName || "N/A")}</strong></td>
        <td>${escapeHtml(item.certName || item.specimenName1 || "N/A")}</td>
        <td><strong>${escapeHtml(item.ssNumber || "N/A")}</strong></td>
        <td>${escapeHtml(item.userEmail || "N/A")}</td>
        <td><span class="status ${status}">${status.toUpperCase()}</span></td>
        <td>${formatDate(item.timestamp || item.createdAt)}</td>
        <td>
          <button class="btn btn-blue" onclick="viewDetails('${item.id}')">View</button>
        </td>
      </tr>
    `;
  }).join("");
}

function viewDetails(id) {
  const item = adminItems.find(x => x.id === id);
  if (!item) return;

  const status = (item.status || "pending").toLowerCase();
  const modal = document.getElementById("detailsModal");
  const body = document.getElementById("detailsBody");

  body.innerHTML = `
    <style>
      .card-view {
        width: 100%;
        max-width: 100%;
        background: white;
        border: 2px solid #111;
        padding: 18px;
        font-family: Arial, sans-serif;
        color: #111;
        overflow: hidden;
      }

      .card-header {
        display: grid;
        grid-template-columns: 85px minmax(0, 1fr);
        align-items: center;
        text-align: center;
        margin-bottom: 14px;
      }

      .card-header img {
        width: 65px;
        height: 55px;
        object-fit: contain;
      }

      .card-header h2 {
        font-size: 13px;
        margin: 0;
        font-weight: normal;
      }

      .card-header h3 {
        font-size: 15px;
        margin: 2px 0;
        font-weight: bold;
      }

      .card-header p {
        font-size: 10px;
        margin: 2px 0;
      }

      .card-title {
        text-align: center;
        font-weight: bold;
        font-size: 16px;
        margin: 12px 0;
      }

      .card-info {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 130px;
        border: 2px solid #111;
        margin-bottom: 16px;
        width: 100%;
        overflow: hidden;
      }

      .info-table {
        border-collapse: collapse;
        width: 100%;
        table-layout: fixed;
      }

      .info-table td {
        border-bottom: 1px solid #111;
        padding: 7px;
        font-size: 12px;
        word-break: break-word;
      }

      .info-table tr:last-child td {
        border-bottom: none;
      }

      .info-table td:first-child {
        width: 145px;
        font-weight: bold;
      }

      .photo-area {
        border-left: 2px solid #111;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        font-size: 12px;
        font-weight: bold;
        text-align: center;
        padding: 8px;
      }

      .photo-area img {
        width: 88px;
        height: 88px;
        object-fit: cover;
        margin-top: 6px;
        border: 1px solid #111;
      }

      .card-text {
        border: 1px solid #ddd;
        padding: 12px;
        font-size: 12px;
        line-height: 1.6;
        text-align: left;
        margin: 16px 0 26px;
      }

      .signature-row {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
        gap: 80px;
        margin-top: 20px;
      }

      .signature-label-top {
        font-size: 12px;
        margin-bottom: 22px;
      }

      .specimen-line,
      .employer-line {
        border-bottom: 2px solid #111;
        height: 38px;
        margin-bottom: 24px;
        position: relative;
      }

      .signature-img {
        max-width: 150px;
        max-height: 33px;
        object-fit: contain;
        display: block;
        margin: 0 auto;
      }

      .printed-name {
        font-size: 12px;
        text-align: center;
        margin-top: -20px;
      }

      .bottom-row {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
        margin-top: 38px;
        gap: 60px;
      }

      .return-note {
        font-size: 10px;
        font-weight: bold;
        align-self: end;
      }

      .noted {
        text-align: center;
        font-size: 11px;
      }

      .noted-line {
        border-bottom: 2px solid #111;
        width: 220px;
        max-width: 100%;
        margin: 24px auto 5px;
      }

      .admin-actions {
        margin-top: 18px;
        display: flex;
        gap: 10px;
      }

      .admin-actions button {
        flex: 1;
        padding: 10px;
        border: none;
        border-radius: 8px;
        color: white;
        font-weight: bold;
        cursor: pointer;
      }

      .approve-btn { background: #16a34a; }
      .reject-btn { background: #dc2626; }

      @media(max-width:768px) {
        .card-info {
          grid-template-columns: 1fr;
        }

        .photo-area {
          border-left: none;
          border-top: 2px solid #111;
          padding: 12px;
        }

        .signature-row,
        .bottom-row {
          grid-template-columns: 1fr;
          gap: 30px;
        }

        .info-table td:first-child {
          width: 120px;
        }
      }
    </style>

    <div class="card-view">
      <div class="card-header">
        <img src="republic-of-the-philippines-social-security-system-logo-png_seeklogo.png" alt="SSS Logo">
        <div>
          <h2>Social Security System</h2>
          <h3>EASTWOOD BRANCH</h3>
          <p>187 ABQ Building, E. Rodriguez Jr. Ave., Bagumbayan, QC</p>
          <p>Tel. Nos.: 8351-1605; 8351-1623</p>
        </div>
      </div>

      <div class="card-title">
        COMPANY REPRESENTATIVE AUTHORIZATION CARD
      </div>

      <div class="card-info">
        <table class="info-table">
          <tr>
            <td>EMPLOYER NAME:</td>
            <td>${escapeHtml(item.employerName || "")}</td>
          </tr>
          <tr>
            <td>EMPLOYER ID NO.:</td>
            <td>${escapeHtml(item.employerId || "")}</td>
          </tr>
          <tr>
            <td>ADDRESS:</td>
            <td>${escapeHtml(item.address || "")}</td>
          </tr>
          <tr>
            <td>TELEPHONE NO.:</td>
            <td>${escapeHtml(item.telephone || "")}</td>
          </tr>
        </table>

        <div class="photo-area">
          PHOTO<br>1x1
          ${
            item.photo
              ? `<img src="${item.photo}" alt="Photo">`
              : ""
          }
        </div>
      </div>

      <div class="card-text">
        This is to certify that Mr./Ms.
        <b>${escapeHtml(item.certName || item.specimenName1 || "")}</b>
        with SS #
        <b>${escapeHtml(item.ssNumber || "")}</b>,
        whose specimen signatures / initials appear below, is authorized to transact, verify and file
        Employer Data Change Request (R-8), Employer Registration Form (R-1),
        Employment Report (R-1A) and Member Data Change Request (E-4)
        of herein company's employees.
        <br><br>
        This Certification shall be valid within one (1) year from the date of issuance unless otherwise revoked and the SSS Eastwood Branch duly notified.
      </div>

      <div class="signature-row">
        <div>
          <div class="signature-label-top">Specimen Signature</div>

          <div class="specimen-line">
            ${
              item.specimenSignature1
                ? `<img class="signature-img" src="${item.specimenSignature1}" alt="Specimen Signature">`
                : ""
            }
          </div>

          <div class="specimen-line">
            ${
              item.specimenSignature1
                ? `<img class="signature-img" src="${item.specimenSignature1}" alt="Specimen Signature Duplicate">`
                : ""
            }
          </div>
        </div>

        <div>
          <div class="signature-label-top">
            Signature over Printed Name of Employer/Owner
          </div>

          <div class="employer-line">
            ${
              item.employerSignature
                ? `<img class="signature-img" src="${item.employerSignature}" alt="Employer Signature">`
                : ""
            }
          </div>

          <div class="printed-name">
            ${escapeHtml(item.employerName2 || "")}
          </div>
        </div>
      </div>

      <div class="bottom-row">
        <div class="return-note">
          IF FOUND, PLEASE RETURN TO THE<br>
          EMPLOYER ADDRESS OR ANY SSS OFFICE.
        </div>

        <div class="noted">
          Noted by:
          <div class="noted-line"></div>
          <b>ELEANOR F. DEATO</b><br>
          Branch Head
        </div>
      </div>

      <div style="margin-top:18px;text-align:center;">
        <span class="status ${status}">${status.toUpperCase()}</span>
        ${
          item.rejectionReason
            ? `<p style="color:#b91c1c;margin-top:8px;"><b>Reason:</b> ${escapeHtml(item.rejectionReason)}</p>`
            : ""
        }
      </div>

      <div class="admin-actions">
        <button class="approve-btn" onclick="updateStatus('${id}', 'approved')">Approve</button>
        <button class="reject-btn" onclick="quickReject('${id}')">Reject</button>
      </div>
    </div>
  `;

  modal.style.display = "flex";
}

async function updateStatus(id, status, reason = "") {
  try {
    await db4.collection("sss-submissions").doc(id).update({
      status: status,
      rejectionReason: reason,
      reviewedBy: adminUser ? adminUser.email : "",
      reviewedAt: new Date().toISOString()
    });

    await loadAdmin();
    updateCounts();
    closeDetails();

    alert("Application marked as " + status + ".");
  } catch (error) {
    console.error("Update status error:", error);
    alert("Failed to update status: " + error.message);
  }
}

function quickReject(id) {
  const reason = prompt("Reason for rejection:");
  if (reason === null) return;
  updateStatus(id, "rejected", reason || "No reason provided");
}

function rejectItem(id) {
  quickReject(id);
}

function rejectWithReason(id) {
  const textarea = document.getElementById(`rejectReason-${id}`);
  const reason = textarea ? textarea.value.trim() : "";

  if (!reason) {
    alert("Please enter rejection reason.");
    return;
  }

  updateStatus(id, "rejected", reason);
}

function closeDetails() {
  const modal = document.getElementById("detailsModal");
  if (modal) modal.style.display = "none";
}

function logout() {
  firebase.auth().signOut().then(function() {
    window.location.href = "login.html";
  });
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
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