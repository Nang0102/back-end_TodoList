const express = require("express");
const multer = require("multer");
const uploadRouter = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
    console.log("file1", file);
  },
  filename: function (req, file, cb) {
    let fileType = "";
    if (file.mimetype === "image/jpeg") {
      fileType = ".jpg";
    }
    console.log("file", file);
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + fileType);
  },
});
const upload = multer({ storage: storage });
const cpUpload = upload.fields([{ name: "avatar", maxCount: 1 }]);

uploadRouter.post("/", cpUpload, async (req, res) => {
  res.status(201).json("File uploaded");
});

module.exports = uploadRouter;
