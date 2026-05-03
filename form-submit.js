// Direct single-form submission.
// The old second/specimen card step has been removed.
// This overrides goToSecondForm() from index.js and saves the current form directly to Firestore.

async function goToSecondForm() {
    const submitButton = document.querySelector(".primary-btn");
    const originalText = submitButton ? submitButton.textContent : "";

    try {
        const user = firebase.auth().currentUser;
        if (!user) {
            window.location.href = "login.html";
            return;
        }

        if (typeof validateFirstForm === "function" && !validateFirstForm()) {
            if (typeof showPopup === "function") {
                showPopup("Please complete all required fields before submitting.", "error");
            } else {
                alert("Please complete all required fields before submitting.");
            }
            return;
        }

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = "SUBMITTING...";
        }

        const specimenCanvas = document.getElementById("specimenSignature1");
        const employerCanvas = document.getElementById("employerSignature");
        const photoPreview = document.getElementById("photoPreview");

        const data = {
            userId: user.uid,
            userEmail: user.email || "",
            userName: user.displayName || "",

            employerName: document.getElementById("employerName")?.value || "",
            employerId: document.getElementById("employerId")?.value || "",
            address: document.getElementById("address")?.value || "",
            telephone: document.getElementById("telephone")?.value || "",

            certName: document.getElementById("certName")?.value || "",
            ssNumber: document.getElementById("ssNumber")?.value || "",

            specimenName1: document.getElementById("specimenName1")?.value || "",
            employerName2: document.getElementById("employerName2")?.value || "",

            photo: photoPreview && photoPreview.src && photoPreview.src !== "#" ? photoPreview.src : "",
            specimenSignature1: specimenCanvas ? specimenCanvas.toDataURL("image/png") : "",
            employerSignature: employerCanvas ? employerCanvas.toDataURL("image/png") : "",

            status: "pending",
            rejectionReason: "",
            timestamp: new Date().toISOString(),
            formType: "company-representative-authorization-card"
        };

        const dbSubmit = firebase.firestore();
        const docRef = dbSubmit.collection("sss-submissions").doc();

        data.submissionId = docRef.id;

        await docRef.set(data);
        localStorage.removeItem("form1AutoSave");
        localStorage.removeItem("firstFormData");
        localStorage.removeItem("form2AutoSave");

        if (typeof showPopup === "function") {
            showPopup("Application submitted successfully. Please wait for admin approval.", "success");
        } else {
            alert("Application submitted successfully.");
        }

        setTimeout(function () {
            window.location.href = "my-submissions.html";
        }, 1200);

    } catch (error) {
        console.error("Submit error:", error);
        if (typeof showPopup === "function") {
            showPopup("Failed to submit application: " + error.message, "error");
        } else {
            alert("Failed to submit application: " + error.message);
        }
    } finally {
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = originalText || "SUBMIT APPLICATION";
        }
    }
}
