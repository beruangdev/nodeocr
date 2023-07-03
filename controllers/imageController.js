const path = require("path");
const fs = require("fs");
const { createWorker } = require("tesseract.js");
const sharp = require("sharp");
const THUMBNAIL_SIZES = [300, 600, 1000];
exports.getImageList = (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const perPage = parseInt(req.query.perPage) || 10;
  const imageUploadPath = process.env.IMAGE_UPLOAD_PATH;

  try {
    const imageFiles = fs.readdirSync(imageUploadPath)
      .filter(file => /\.(jpg|jpeg|png)$/i.test(file)); // Filter only JPG and PNG files

    const totalCount = imageFiles.length;
    const lastPage = Math.ceil(totalCount / perPage);

    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;

    // Sort files in descending order based on birthtime
    const sortedImageFiles = imageFiles.sort((a, b) => {
      const filePathA = path.join(imageUploadPath, a);
      const filePathB = path.join(imageUploadPath, b);

      return fs.statSync(filePathB).birthtime - fs.statSync(filePathA).birthtime;
    });

    const paginatedImageFiles = sortedImageFiles.slice(startIndex, endIndex);

    const images = paginatedImageFiles.map((file, index) => {
      const filePath = path.join(imageUploadPath, file);

      return new Promise((resolve, reject) => {
        fs.stat(filePath, (err, fileStats) => {
          if (err) {
            reject(err);
          } else {
            const thumbnails = {};
            THUMBNAIL_SIZES.forEach(thumbnailSize => {
              const thumbnailPath = path.join(`${imageUploadPath}-${thumbnailSize}`, file);
              thumbnails[thumbnailSize] = `${req.protocol}://${req.get('host')}/upload/image-${thumbnailSize}/${file}`;
            });

            resolve({
              id: index + 1,
              filename: file,
              url: `${req.protocol}://${req.get('host')}/upload/image/${file}`,
              metadata: {
                size: fileStats.size,
                created_at: fileStats.birthtime,
              },
              thumbnails,
            });
          }
        });
      });
    });

    Promise.all(images)
      .then(data => {
        res.json({
          currentPage: page,
          perPage: perPage,
          total: totalCount,
          lastPage: lastPage,
          data: data,
        });
      })
      .catch(error => {
        res.status(500).json({ error: 'Failed to read image information.' });
      });
  } catch (error) {
    res.status(500).json({ error: 'Failed to read image folder.' });
  }
};

exports.uploadImage = async (req, res) => {
  let files = [];

  if (req.file) {
    files.push(req.file);
  } else if (req.files.file && req.files.file.length > 0) {
    files = req.files.file;
  } else {
    return res.status(400).json({ error: "No image found in the request." });
  }

  const imageUploadPromises = files.map(async (file) => {
    const imagePath = file.path;
    const imageFileName = file.filename;
    const text = await recognizeText(imagePath);

    let thumbnailWorks = [];
    THUMBNAIL_SIZES.forEach((THUMBNAIL_SIZE) => {
      thumbnailWorks.push(
        resizeImage(THUMBNAIL_SIZE, imageFileName, imagePath)
      );
    });
    await Promise.all(thumbnailWorks);

    saveTextToFile(imageFileName, text);

    return { imageFileName, text };
  });

  try {
    const imageUploadResults = await Promise.all(imageUploadPromises);

    // Check if the number of images exceeds 1000
    const imageFiles = fs.readdirSync(process.env.IMAGE_UPLOAD_PATH);
    if (imageFiles.length > 1000) {
      deleteOldestImage(imageFiles);
    }

    res.json({
      message: "Image uploaded successfully.",
      uploads: imageUploadResults,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to upload image." });
  }
};

function deleteOldestImage(imageFiles) {
  // Sort the image files by modified date in ascending order
  const sortedFiles = imageFiles
    .map((file) => {
      const filePath = path.join(process.env.IMAGE_UPLOAD_PATH, file);
      const { mtime } = fs.statSync(filePath);
      return { file, mtime };
    })
    .sort((a, b) => a.mtime - b.mtime);

  // Delete the oldest image file
  const oldestFile = sortedFiles[0];
  const oldestFilePath = path.join(
    process.env.IMAGE_UPLOAD_PATH,
    oldestFile.file
  );
  fs.unlinkSync(oldestFilePath);
}

async function recognizeText(imagePath) {
  const worker = await createWorker({
    logger: (tesseractEvent) => {
    console.log("🚀 ~ file: imageController.js:130 ~ recognizeText ~ tesseractEvent:", tesseractEvent)

    },
  });
  await worker.loadLanguage("eng");
  await worker.initialize("eng");
  const {
    data: { text },
  } = await worker.recognize(imagePath);
  await worker.terminate();
  return text;
}

function saveTextToFile(fileName, text) {
  const textPath = path.join(process.env.TEXT_UPLOAD_PATH, `${fileName}.txt`);
  fs.writeFileSync(textPath, text);
}

async function resizeImage(size = 300, originalname, filePath) {
  return await new Promise((resolve, reject) => {
    sharp(filePath)
      .resize(size, null)
      .toFile(
        `${process.env.IMAGE_UPLOAD_PATH}-${size}/${originalname}`,
        (err, resizeImage) => {
          if (err) {
            reject(err);
          } else {
            resolve(resizeImage);
          }
        }
      );
  });
}

exports.deleteImage = (req, res) => {
  const imageName = req.params.imageName;
  const imagePath = path.join(process.env.IMAGE_UPLOAD_PATH, imageName);
  const thumbnailPaths = THUMBNAIL_SIZES.map((size) =>
    path.join(`${process.env.IMAGE_UPLOAD_PATH}-${size}`, imageName)
  );

  const textFilePath = path.join(
    process.env.TEXT_UPLOAD_PATH,
    `${imageName}.txt`
  );

  try {
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath); // Delete the original image
    } else {
      return res.status(404).json({ error: "Image not found." });
    }

    thumbnailPaths.forEach((thumbnailPath) => {
      if (fs.existsSync(thumbnailPath)) {
        fs.unlinkSync(thumbnailPath); // Delete the thumbnails
      }
    });

    if (fs.existsSync(textFilePath)) {
      fs.unlinkSync(textFilePath); // Delete the associated text file
    }

    res.json({ message: "Image and associated files deleted successfully." });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Failed to delete image and associated files." });
  }
};
