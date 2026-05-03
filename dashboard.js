const db2 = firebase.firestore();
firebase.auth().onAuthStateChanged(async user => {
    if (!user) return window.location.href = "login.html";
    document.getElementById("welcomeText").textContent = "Welcome, " + (user.displayName || user.email);

    const doc = await db2.collection("users").doc(user.uid).get();
    const role = doc.exists ? doc.data().role : "user";
    if (role === "admin") document.getElementById("adminLink").style.display = "inline-flex";
});
