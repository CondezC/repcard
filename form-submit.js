// Direct single-form submission.
// The old second/specimen card step has been removed.
// This overrides goToSecondForm() from index.js and saves the current form directly to Firestore.

function isCanvasBlankSubmit(canvas) {
    if (!canvas) return true;

    const blank = document.createElement("canvas");
    blank.width = canvas.width;
    blank.height = canvas.height;

    return canvas.toDataURL("image/png") === blank.toDataURL("image/png");
}

function getValue(id) {
    return document.getElementById(id)?.value.trim() || "";
}

function showSubmitMessage(message, type = "error") {
    if (typeof showPopup === "function") {
        showPopup(message, type);
    } else {
        alert(message);
    }
}

async function goToSecondForm() {
    const submitButton = document.querySelector(".primary-btn");
    const originalText = submitButton ? submitButton.textContent : "";

    try {
        const user = firebase.auth().currentUser;

        if (!user) {
            window.location.href = "login.html";
            return;
        }

        const requiredFields = [
            "employerName",
            "employerId",
            "address",
            "telephone",
            "certName",
            "ssNumber",
            "employerName2"
        ];

        for (const id of requiredFields) {
            const el = document.getElementById(id);

            if (!el || !el.value.trim()) {
                showSubmitMessage("Please fill out all required fields.", "error");
                if (el) el.focus();
                return;
            }
        }

        const ssNumber = getValue("ssNumber");

        if (!/^\d{2}-\d{7}-\d{1}$/.test(ssNumber)) {
            showSubmitMessage("SS Number must follow this format: 00-0000000-0", "error");
            document.getElementById("ssNumber")?.focus();
            return;
        }

        const photoInput = document.getElementById("photoInput");
        const photoPreview = document.getElementById("photoPreview");

        if (!photoInput || !photoInput.files || photoInput.files.length === 0) {
            showSubmitMessage("Please upload a 1x1 photo.", "error");
            return;
        }

        const specimenCanvas = document.getElementById("specimenSignature1");
        const employerCanvas = document.getElementById("employerSignature");

        if (isCanvasBlankSubmit(specimenCanvas)) {
            showSubmitMessage("Please add specimen signature.", "error");
            return;
        }

        if (isCanvasBlankSubmit(employerCanvas)) {
            showSubmitMessage("Please add employer/owner signature.", "error");
            return;
        }

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = "SUBMITTING...";
        }

        const data = {
            userId: user.uid,
            userEmail: user.email || "",
            userName: user.displayName || "",

            employerName: getValue("employerName"),
            employerId: getValue("employerId"),
            address: getValue("address"),
            telephone: getValue("telephone"),

            certName: getValue("certName"),
            ssNumber: ssNumber,

            // Specimen full name input was removed from the form.
            // Use certName for compatibility with older admin/my-submissions code.
            specimenName1: getValue("certName"),
            employerName2: getValue("employerName2"),

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

        showSubmitMessage("Application submitted successfully. Please wait for admin approval.", "success");

        setTimeout(function () {
            window.location.href = "my-submissions.html";
        }, 1200);

    } catch (error) {
        console.error("Submit error:", error);
        showSubmitMessage("Failed to submit application: " + error.message, "error");
    } finally {
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = originalText || "SUBMIT APPLICATION";
        }
    }
}