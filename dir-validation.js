const path = require("path")
const fs = require("fs")

exports.dirValidation = () => {
  const baseDir = path.join(__dirname, "public", "upload");

  // Daftar folder yang harus ada
  const requiredFolders = [
    path.join(baseDir, "image"),
    path.join(baseDir, "image-300"),
    path.join(baseDir, "image-600"),
    path.join(baseDir, "image-1000"),
    path.join(baseDir, "text"),
  ];

  // Periksa dan buat folder yang belum ada
  requiredFolders.forEach((folder) => {
    const fullPath = path.resolve(folder);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`Folder ${fullPath} telah dibuat.`);
    } else {
      console.log(`Folder ${fullPath} sudah ada.`);
    }
  });
};
