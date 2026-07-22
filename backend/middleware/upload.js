const multer = require("multer");
const path = require("path");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

// Builds a multer instance that stores uploads in Cloudinary under
// sharanee/<folder>/. With CloudinaryStorage, file.path is the hosted
// image URL (https://res.cloudinary.com/...) and file.filename is the
// Cloudinary public_id.
const makeUploader = (folder) => {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: `sharanee/${folder}`,
      allowed_formats: ["jpg", "jpeg", "png", "webp", "gif"],
      transformation: [{ width: 1200, height: 1600, crop: "limit" }],
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

module.exports = {
  productUpload: makeUploader("products"),
  categoryUpload: makeUploader("categories"),
};