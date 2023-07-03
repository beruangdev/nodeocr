const copyButton = document.querySelector(".button-copy");

async function copyUploadResponse() {
  const uploadResponseTextElement =
    document.getElementById("uploadResponseText");
  try {
    await navigator.clipboard.writeText(uploadResponseTextElement.textContent);
    copyButton.textContent = "Copied...";
    setInterval(() => {
      copyButton.textContent = "Copy";
    }, 1000);
  } catch (err) {
    console.error("Copy to clipboard failed:", err);
  }
}

// Find the "Copy" button and attach a click event listener to it
if (copyButton) {
  copyButton.addEventListener("click", copyUploadResponse);
}
