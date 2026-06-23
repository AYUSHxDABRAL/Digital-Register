/*
 *  MODAL HELPERS (LOGIN + POLICY DETAILS)
 */
function openLogin(role) {
  const modal = document.getElementById(role + "Modal");
  if (modal) modal.style.display = "flex";
}

function closeLogin(role) {
  const modal = document.getElementById(role + "Modal");
  if (modal) modal.style.display = "none";
}

/*
   LOGIN HANDLER
 */
async function login(role) {
  if (role === "admin") {
    await loginAdmin();
  } else if (role === "citizen") {
    await loginCitizen();
  }
}

async function loginAdmin() {
  const email = document.getElementById("adminEmail").value.trim();
  const password = document.getElementById("adminPass").value.trim();
  const errorBox = document.getElementById("adminError");
  errorBox.textContent = "";

  try {
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();

    if (!data.success) {
      errorBox.textContent = data.message || "Login failed";
      return;
    }

    // Success – show admin dashboard
    closeLogin("admin");
    document.querySelector(".hero").style.display = "none";
    document.getElementById("mainSection").style.display = "none";
    document.getElementById("adminDash").style.display = "block";

    // Default tab = citizens
    switchTab("citizens");
    await loadAll();
  } catch (err) {
    console.error(err);
    errorBox.textContent = "Server error";
  }
}

async function loginCitizen() {
  const email = document.getElementById("citizenEmail").value.trim();
  const errorBox = document.getElementById("citizenError");
  errorBox.textContent = "";

  if (!email) {
    errorBox.textContent = "Please enter email";
    return;
  }

  try {
    const res = await fetch("/api/citizens/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();

    if (!data.success) {
      errorBox.textContent = data.message || "Login failed";
      return;
    }

    const c = data.citizen;
    const policies = data.eligiblePolicies || []; // array of policy objects
    const lands = data.lands || [];

    closeLogin("citizen");
    document.querySelector(".hero").style.display = "none";
    document.getElementById("mainSection").style.display = "none";
    document.getElementById("citizenDash").style.display = "block";

    // -------- Fill citizen profile ----------
    document.getElementById("citizenName").textContent = c.name || "Citizen";
    document.getElementById("citizenEmailText").textContent = c.email || "";
    document.getElementById("citizenAge").textContent = c.age ?? "-";
    document.getElementById("citizenGender").textContent = c.gender || "-";
    document.getElementById("citizenIncome").textContent = c.income ?? "-";
    document.getElementById("citizenMobile").textContent = c.mobile || "-";
    document.getElementById("citizenCategory").textContent = c.category || "-";
    document.getElementById("citizenAddress").textContent = c.address || "-";

    const initials =
      (c.name || "")
        .split(" ")
        .filter(Boolean)
        .map((x) => x[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || "CT";
    document.getElementById("citizenInitials").textContent = initials;

    // -------- Eligible policies list ----------
    const polUl = document.getElementById("citizenPolicies");
    polUl.innerHTML = "";

    if (policies.length === 0) {
      polUl.innerHTML = "<li>No eligible policies found.</li>";
    } else {
      policies.forEach((p) => {
        const li = document.createElement("li");
        li.style.cursor = "pointer";

        li.innerHTML = `
          <strong>${p.name}</strong><br>
          <span style="font-size:12px;color:#9ca3af;">
            Min Age: ${p.minAge ?? "N/A"} | Min Income: ${p.minIncome ?? "N/A"}
          </span><br>
          <a href="${p.description}" target="_blank" style="color:#3b82f6;">
            🔗 Register / View Details
          </a>
        `;

        // Open modal with more info
        li.addEventListener("click", (e) => {
          // avoid double-firing when clicking the link
          if (e.target.tagName.toLowerCase() === "a") return;
          openPolicyDetails(p);
        });

        polUl.appendChild(li);
      });
    }

    // -------- Land records list ----------
    const landUl = document.getElementById("citizenLands");
    landUl.innerHTML = "";
    if (lands.length === 0) {
      landUl.innerHTML = "<li>No land records found.</li>";
    } else {
      lands.forEach((l) => {
        const li = document.createElement("li");
        li.textContent = `${l.size} – ${l.ownerName} (${l.ownerEmail})`;
        landUl.appendChild(li);
      });
    }
  } catch (err) {
    console.error(err);
    errorBox.textContent = "Server error";
  }
}

/*************************************************
 *  LOGOUT
 *************************************************/
function logout() {
  document.getElementById("adminDash").style.display = "none";
  document.getElementById("citizenDash").style.display = "none";
  document.querySelector(".hero").style.display = "flex";
  document.getElementById("mainSection").style.display = "block";
}

/*************************************************
 *  LOAD DATA FOR ADMIN DASHBOARD
 *************************************************/
async function loadAll() {
  await Promise.all([loadCitizens(), loadPolicies(), loadLands()]);
}

async function loadCitizens() {
  const res = await fetch("/api/citizens");
  const list = await res.json();

  const tbody = document.querySelector("#citizensTable tbody");
  tbody.innerHTML = "";

  list.forEach((c) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${c.name || ""}</td>
      <td>${c.email || ""}</td>
      <td>${c.age ?? ""}</td>
      <td>${c.gender || ""}</td>
      <td>${c.income ?? ""}</td>
      <td>${c.mobile || ""}</td>
      <td>${c.category || ""}</td>
      <td>
        <button class="action-btn delete" onclick="deleteCitizen('${c._id}')">
          Delete
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  document.getElementById("statCitizens").textContent = list.length;
}

async function loadPolicies() {
  const res = await fetch("/api/policies");
  const list = await res.json();

  const tbody = document.querySelector("#policiesTable tbody");
  tbody.innerHTML = "";

  list.forEach((p) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.policyId || ""}</td>
      <td class="policy-click" style="color:#3b82f6;cursor:pointer;">
        ${p.name || ""}
      </td>
      <td>${p.minAge ?? "N/A"}</td>
      <td>${p.minIncome ?? "N/A"}</td>
      <td>${p.description || ""}</td>
      <td>
        <button class="action-btn delete" onclick="deletePolicy('${p._id}')">
          Delete
        </button>
      </td>
    `;

    // Make Name clickable -> open details modal
    tr.querySelector(".policy-click").addEventListener("click", () =>
      openPolicyDetails(p)
    );

    tbody.appendChild(tr);
  });

  document.getElementById("statPolicies").textContent = list.length;
}

async function loadLands() {
  const res = await fetch("/api/lands");
  const list = await res.json();

  const tbody = document.querySelector("#landsTable tbody");
  tbody.innerHTML = "";

  list.forEach((l) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${l.size || ""}</td>
      <td>${l.ownerName || ""}</td>
      <td>${l.ownerEmail || ""}</td>
      <td>
        <button class="action-btn delete" onclick="deleteLand('${l._id}')">
          Delete
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  document.getElementById("statLands").textContent = list.length;
}

/*************************************************
 *  DELETE HANDLERS
 *************************************************/
async function deleteCitizen(id) {
  await fetch(`/api/citizens/${id}`, { method: "DELETE" });
  loadCitizens();
}

async function deletePolicy(id) {
  await fetch(`/api/policies/${id}`, { method: "DELETE" });
  loadPolicies();
}

async function deleteLand(id) {
  await fetch(`/api/lands/${id}`, { method: "DELETE" });
  loadLands();
}

/*************************************************
 *  ADD / EDIT FORMS (ADMIN)
 *************************************************/
function showAddForm(type) {
  const box = document.getElementById("formContainer");
  box.innerHTML = "";

  if (type === "citizen") {
    box.innerHTML = `
      <div class="form-title">Add Citizen</div>
      <div class="form-grid">
        <div class="form-field"><label>Name</label><input id="c_name" /></div>
        <div class="form-field"><label>Email</label><input id="c_email" type="email" /></div>
        <div class="form-field"><label>Age</label><input id="c_age" type="number" /></div>
        <div class="form-field">
          <label>Gender</label>
          <select id="c_gender">
            <option value="">Select</option>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
        </div>
        <div class="form-field"><label>Annual Income</label><input id="c_income" type="number" /></div>
        <div class="form-field"><label>Mobile</label><input id="c_mobile" /></div>
        <div class="form-field"><label>Category</label><input id="c_category" /></div>
        <div class="form-field"><label>Address</label><input id="c_address" /></div>
      </div>
      <div class="form-actions">
        <button class="btn-primary" onclick="saveCitizen()">Save Citizen</button>
        <button class="btn-secondary" onclick="clearForm()">Cancel</button>
      </div>
    `;
  } else if (type === "policy") {
    box.innerHTML = `
      <div class="form-title">Add Policy</div>
      <div class="form-grid">
        <div class="form-field"><label>Policy ID</label><input id="p_id" /></div>
        <div class="form-field"><label>Policy Name</label><input id="p_name" /></div>
        <div class="form-field"><label>Minimum Age</label><input id="p_minAge" type="number" /></div>
        <div class="form-field"><label>Minimum Income</label><input id="p_minIncome" type="number" /></div>
        <div class="form-field" style="grid-column:1/-1;">
          <label>Description (Registration Link)</label>
          <textarea id="p_desc"></textarea>
        </div>
      </div>
      <div class="form-actions">
        <button class="btn-primary" onclick="savePolicy()">Save Policy</button>
        <button class="btn-secondary" onclick="clearForm()">Cancel</button>
      </div>
    `;
  } else if (type === "land") {
    box.innerHTML = `
      <div class="form-title">Add Land Record</div>
      <div class="form-grid">
        <div class="form-field"><label>Land Size</label><input id="l_size" /></div>
        <div class="form-field"><label>Owner Name</label><input id="l_ownerName" /></div>
        <div class="form-field"><label>Owner Email</label><input id="l_ownerEmail" type="email" /></div>
      </div>
      <div class="form-actions">
        <button class="btn-primary" onclick="saveLand()">Save Land</button>
        <button class="btn-secondary" onclick="clearForm()">Cancel</button>
      </div>
    `;
  }
}

function clearForm() {
  document.getElementById("formContainer").innerHTML = "";
}

async function saveCitizen() {
  const payload = {
    name: document.getElementById("c_name").value.trim(),
    email: document.getElementById("c_email").value.trim(),
    age: parseInt(document.getElementById("c_age").value) || 0,
    gender: document.getElementById("c_gender").value,
    income: parseInt(document.getElementById("c_income").value) || 0,
    mobile: document.getElementById("c_mobile").value.trim(),
    category: document.getElementById("c_category").value.trim(),
    address: document.getElementById("c_address").value.trim(),
  };

  await fetch("/api/citizens", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  clearForm();
  loadCitizens();
}

async function savePolicy() {
  const payload = {
    policyId: document.getElementById("p_id").value.trim(),
    name: document.getElementById("p_name").value.trim(),
    minAge: parseInt(document.getElementById("p_minAge").value) || null,
    minIncome: parseInt(document.getElementById("p_minIncome").value) || null,
    description: document.getElementById("p_desc").value.trim(), // URL
  };

  await fetch("/api/policies", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  clearForm();
  loadPolicies();
}

async function saveLand() {
  const payload = {
    size: document.getElementById("l_size").value.trim(),
    ownerName: document.getElementById("l_ownerName").value.trim(),
    ownerEmail: document.getElementById("l_ownerEmail").value.trim(),
  };

  await fetch("/api/lands", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  clearForm();
  loadLands();
}

/*************************************************
 *  TABS / NAV (ADMIN)
 *************************************************/
function switchTab(tab) {
  // nav buttons
  const navCit = document.getElementById("navCitizens");
  const navPol = document.getElementById("navPolicies");
  const navLand = document.getElementById("navLands");

  navCit.classList.remove("active");
  navPol.classList.remove("active");
  navLand.classList.remove("active");

  // panels
  document.getElementById("panelCitizens").style.display = "none";
  document.getElementById("panelPolicies").style.display = "none";
  document.getElementById("panelLands").style.display = "none";

  if (tab === "citizens") {
    navCit.classList.add("active");
    document.getElementById("panelCitizens").style.display = "block";
  } else if (tab === "policies") {
    navPol.classList.add("active");
    document.getElementById("panelPolicies").style.display = "block";
  } else if (tab === "lands") {
    navLand.classList.add("active");
    document.getElementById("panelLands").style.display = "block";
  }
}

/*************************************************
 *  POLICY DETAILS POPUP
 *************************************************/
function openPolicyDetails(policy) {
  document.getElementById("pdTitle").innerText = policy.name;

  document.getElementById("pdBody").innerHTML = `
    <b>Policy ID:</b> ${policy.policyId || "-"}<br><br>
    <b>Minimum Age:</b> ${policy.minAge ?? "N/A"}<br>
    <b>Minimum Income:</b> ${policy.minIncome ?? "N/A"}<br><br>
    <b>Registration Link:</b><br>
    <a href="${policy.description}" target="_blank" style="color:#3b82f6;">
      🔗 Open Policy Portal
    </a>
  `;

  document.getElementById("policyDetailModal").style.display = "flex";
}

function closePolicyDetails() {
  document.getElementById("policyDetailModal").style.display = "none";
}

/*************************************************
 *  INITIAL SETUP
 *************************************************/
document.addEventListener("DOMContentLoaded", async () => {
  // Hide dashboards initially
  document.getElementById("adminDash").style.display = "none";
  document.getElementById("citizenDash").style.display = "none";

  // Seed admin (won’t recreate if already exists)
  try {
    await fetch("/api/admin/seed");
  } catch (e) {
    console.error("Admin seed error:", e);
  }
});
