const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Builds a multer instance that stores files under uploads/<folder>/
const makeUploader = (folder) => {
  const dest = path.join(__dirname, "..", "uploads", folder);
  fs.mkdirSync(dest, { recursive: true });

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, dest),
    filename: (req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${unique}${path.extname(file.originalname)}`);
    },
  });

  const fileFilter = (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|gif/;
    const ok = allowed.test(path.extname(file.originalname).toLowerCase());
    if (ok) return cb(null, true);
    cb(new Error("Only image files (jpg, png, webp, gif) are allowed"));
  };

  return multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
};

module.exports = { productUpload: makeUploader("products"), categoryUpload: makeUploader("categories") };
