const fs = require("fs-extra");
const path = require("path");
deleteAllImages()
function deleteAllImages() {
  const imageUploadPath = path.join(__dirname, "/public/upload/image");
  const imageUploadPath300 = path.join(__dirname, "/public/upload/image-300");
  const imageUploadPath600 = path.join(__dirname, "/public/upload/image-600");
  const imageUploadPath1000 = path.join(__dirname, "/public/upload/image-1000");
  const imageUploadPathText = path.join(__dirname, "/public/upload/text");

  try {
    fs.emptyDirSync(imageUploadPath);
    fs.emptyDirSync(imageUploadPath300);
    fs.emptyDirSync(imageUploadPath600);
    fs.emptyDirSync(imageUploadPath1000);
    fs.emptyDirSync(imageUploadPathText);
    console.log({ message: "All images deleted successfully." });
  } catch (error) {
    console.log({ error: "Failed to delete images." });
  }
}
