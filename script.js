const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY"; // 🔑 Replace with your key

async function generateReport() {
  const note = document.getElementById("noteInput").value;
  const photoInput = document.getElementById("photoInput");
  const reportBox = document.getElementById("reportBox");

  // Show photo preview
  if (photoInput.files && photoInput.files[0]) {
    const reader = new FileReader();
    reader.onload = e => {
      document.getElementById("photoPreview").innerHTML = `<img src="${e.target.result}" />`;
    };
    reader.readAsDataURL(photoInput.files[0]);
  }

  reportBox.innerHTML = "<p>Generating report...</p>";

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            role: "user",
            parts: [{
              text: `Classify this civic issue from photo/note and generate a short bilingual report (English + Hindi). Note: ${note}`
            }]
          }]
        })
      }
    );

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "No report generated.";

    reportBox.innerHTML = `<p>${text.replace(/\n/g, "<br>")}</p>`;

    // Update Send buttons
    document.getElementById("sendButtons").style.display = "flex";
    document.getElementById("smsButton").href = `sms:+911234567890?body=${encodeURIComponent(text)}`;
    document.getElementById("waButton").href = `https://wa.me/?text=${encodeURIComponent(text)}`;

  } catch (err) {
    reportBox.innerHTML = "<p>Error generating report. Check API key.</p>";
    console.error(err);
  }
}
