const db = firebase.firestore();

function showMessage(text, type = "error") {
  const el = document.getElementById("message");

  if (!el) {
    alert(text);
    return;
  }

  el.className = "message " + type;
  el.textContent = text;
}

function clearMessage() {
  const el = document.getElementById("message");

  if (!el) return;

  el.className = "message";
  el.textContent = "";
}

function setLoginLoading(isLoading) {
  const btn = document.getElementById("loginBtn");

  if (!btn) return;

  if (isLoading) {
    btn.disabled = true;
    btn.classList.add("loading");
    btn.innerHTML = `Logging in <span class="spinner"></span>`;
  } else {
    btn.disabled = false;
    btn.classList.remove("loading");
    btn.innerHTML = "Login";
  }
}

async function getUserRole(uid) {
  const doc = await db.collection("users").doc(uid).get();

  if (!doc.exists) return "user";

  return doc.data().role || "user";
}

async function registerUser() {
  const fullName = document.getElementById("fullName").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  clearMessage();

  if (!fullName || !email || !password || !confirmPassword) {
    return showMessage("Please complete all fields.");
  }

  if (password.length < 6) {
    return showMessage("Password must be at least 6 characters.");
  }

  if (password !== confirmPassword) {
    return showMessage("Passwords do not match.");
  }

  try {
    const cred = await firebase.auth().createUserWithEmailAndPassword(email, password);

    await cred.user.updateProfile({
      displayName: fullName
    });

    await db.collection("users").doc(cred.user.uid).set({
      fullName,
      email,
      role: "user",
      createdAt: new Date().toISOString()
    });

    showMessage("User account created. Redirecting...", "success");

    setTimeout(function() {
      window.location.href = "dashboard.html";
    }, 700);

  } catch (err) {
    showMessage(err.message);
  }
}

async function loginByRole() {
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  clearMessage();

  if (!email || !password) {
    showMessage("Please enter email and password.");
    return;
  }

  setLoginLoading(true);

  try {
    const userCred = await firebase.auth().signInWithEmailAndPassword(email, password);
    const user = userCred.user;

    const role = await getUserRole(user.uid);

    if (role === "admin") {
      window.location.href = "admin.html";
    } else {
      window.location.href = "dashboard.html";
    }

  } catch (error) {
    showMessage(error.message);
    setLoginLoading(false);
  }
}

// Backwards compatibility in case old buttons call old function names
async function loginUser() {
  return loginByRole();
}

async function loginUserOnly() {
  return loginByRole();
}

async function loginAdmin() {
  return loginByRole();
}

function logoutUser() {
  firebase.auth().signOut().then(function() {
    localStorage.removeItem("privacyAccepted");
    window.location.href = "login.html";
  });
}