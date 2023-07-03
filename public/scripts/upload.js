const dropArea = document.getElementById("dropArea");
const uploadProgressContainer = document.getElementById(
  "uploadProgressContainer"
);
const fileInput = document.getElementById("image");

// Prevent default drag behaviors
dropArea.addEventListener("dragenter", (e) => {
  e.preventDefault();
  dropArea.classList.add("border-blue-500");
});

dropArea.addEventListener("dragover", (e) => {
  e.preventDefault();
});

dropArea.addEventListener("dragleave", (e) => {
  e.preventDefault();
  dropArea.classList.remove("border-blue-500");
});

dropArea.addEventListener("drop", (e) => {
  e.preventDefault();
  dropArea.classList.remove("border-blue-500");

  const files = e.dataTransfer.files;
  fileInput.files = files;

  uploadFiles(files);
});

// Upload files when file input changes
fileInput.addEventListener("change", () => {
  const files = fileInput.files;
  uploadFiles(files);
});

// Function to upload files
const uploadFiles = (files) => {
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const formData = new FormData();
    formData.append("file", file);

    const progressWrapper = document.createElement("div");
    progressWrapper.classList.add(
      "flex",
      "items-center",
      "justify-between",
      "mt-4"
    );

    const progressFilenameWrapper = document.createElement("div");
    progressFilenameWrapper.classList.add("flex", "flex-col", "flex-1", "mr-5");

    const fileName = document.createElement("p");
    fileName.textContent = file.name;
    fileName.classList.add("text-sm", "opacity-80", "mb-1.5");

    const uploadProgress = document.createElement("progress");
    uploadProgress.value = 0;
    uploadProgress.max = 100;
    uploadProgress.classList.add("rounded-lg", "w-full", "h-2");

    const closeButton = document.createElement("button");
    closeButton.textContent = "Close";
    closeButton.classList.add(
      "bg-red-500",
      "text-white",
      "py-2",
      "px-4",
      "rounded-lg",
      "hidden"
    );

    progressFilenameWrapper.appendChild(fileName);
    progressFilenameWrapper.appendChild(uploadProgress);
    progressWrapper.appendChild(progressFilenameWrapper);
    progressWrapper.appendChild(closeButton);

    uploadProgressContainer.appendChild(progressWrapper);

    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (event) => {
      const { loaded, total } = event;
      const percentage = (loaded / total) * 100;

      uploadProgress.value = percentage;
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const responseJson = JSON.parse(xhr.responseText);
        const formattedJson = JSON.stringify(responseJson, null, 2);
        // Perform actions with the response data
      } else {
        const errorText = document.createElement("p");
        errorText.textContent = `Upload failed with error: ${xhr.status} ${xhr.statusText}`;
        errorText.classList.add("text-red-500");

        progressWrapper.appendChild(errorText);
      }

      closeButton.classList.remove("hidden");
    });

    xhr.addEventListener("error", (error) => {
      console.error(error);
      const errorText = document.createElement("p");
      errorText.textContent = "Upload failed!";
      errorText.classList.add("text-red-500");

      progressWrapper.appendChild(errorText);

      closeButton.classList.remove("hidden");
    });

    closeButton.addEventListener("click", () => {
      progressWrapper.remove();
      checkUploadComplete();
    });

    xhr.open("POST", "/api/image");
    xhr.send(formData);
  }
};

const checkUploadComplete = () => {
  const uploadProgressWrappers =
    uploadProgressContainer.querySelectorAll(".mt-4");

  if (uploadProgressWrappers.length === 0) {
    fileInput.value = null;
  }
};
