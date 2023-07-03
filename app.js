require("dotenv").config();
const { dirValidation } = require("./dir-validation.js");
dirValidation();

const express = require("express");
const multer = require("multer");
const path = require("path");
const app = express();
const CronJob = require("cron").CronJob;

const baseDir = __dirname;
process.env.IMAGE_UPLOAD_PATH = path.join(baseDir, "public", "upload", "image");
process.env.TEXT_UPLOAD_PATH = path.join(baseDir, "public", "upload", "text");

const imageController = require("./controllers/imageController");
const translateController = require("./controllers/translateController");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, process.env.IMAGE_UPLOAD_PATH);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

app.use(express.static("public"));
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.json({ extended: true }));

app.get("/", (req, res) => {
  const indexPath = path.join(__dirname, "index.html");
  res.sendFile(indexPath);
});

app.post("/api/translate", translateController.postTranslate);
app.get("/api/image", imageController.getImageList);
app.post(
  "/api/image",
  upload.fields([{ name: "file" }, { name: "files" }]),
  imageController.uploadImage
);

// Buat cron job
const job = new CronJob(
  "0 0 0 * * *",
  function () {
    // Kode yang akan dieksekusi oleh cron job
    console.log("Cron job berjalan pada pukul 00:00 WIB!");
  },
  null,
  true,
  "Asia/Jakarta"
);

// Mulai cron job
job.start();

module.exports = app;
