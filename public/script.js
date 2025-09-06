const WEBHOOK_URL = "o3u4rjk9yv5ree7agi9bjbc283xo8a8o@hook.eu2.make.com"; // Make.com webhook

async function generateReport() {
  const note = document.getElementById("noteInput").value;
  const photoInput = document.getElementById("photoInput");
  const reportBox = document.getElementById("reportBox");

  let photoURL = "";
  if (photoInput.files && photoInput.files[0]) {
    const reader = new FileReader();
    reader.onload = e => {
      document.getElementById("photoPreview").innerHTML = `<img src="${e.target.result}" />`;
      photoURL = e.target.result; // base64 data URL
    };
    reader.readAsDataURL(photoInput.files[0]);
  }

  reportBox.innerHTML = "<p>Generating report...</p>";

  try {
    // 🔑 Call your backend route (not Google API directly)
    const response = await fetch("/api/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: `Classify this civic issue and generate bilingual (English + Hindi) report. Note: ${note}`
      })
    });

    const data = await response.json();

    // ✅ Use backend response shape
    const text = data.output || "No report generated.";

    reportBox.innerHTML = `<p>${text.replace(/\n/g, "<br>")}</p>`;

    // Update Send buttons
    document.getElementById("sendButtons").style.display = "flex";
    document.getElementById("smsButton").href = `sms:+911234567890?body=${encodeURIComponent(text)}`;
    document.getElementById("waButton").href = `https://wa.me/?text=${encodeURIComponent(text)}`;

    // 🔴 Send to Google Sheets via Make.com webhook
    fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        note: note,
        report: text,
        photoURL: photoURL
      })
    });
  } catch (err) {
    reportBox.innerHTML = "<p>Error generating report.</p>";
    console.error(err);
  }
}
