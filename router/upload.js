const express = require("express");
const { ObjectId } = require("mongodb");
const multer = require("multer");
const { db } = require("../db");
const uploadRouter = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    let fileType = "";
    if (file.mimetype === "image/jpeg") {
      fileType = ".jpg";
    }

    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileName = file.fieldname + "-" + uniqueSuffix + fileType;
    req["fileName"] = fileName;
    req["filePath"] = `https://backendtodolist.onrender.com/upload/${fileName}`;
    // req["filePath"] = `http://localhost:5000/upload/${fileName}`;
    cb(null, fileName);
  },
});
const upload = multer({ storage: storage });
const cpUpload = upload.fields([{ name: "avatar", maxCount: 1 }]);

uploadRouter.post("/upload", cpUpload, async (req, res) => {
  const path = req["filePath"];
  const id = req.headers.id;
  const filter = {
    _id: new ObjectId(id),
  };

  const updateDoc = {
    $set: {
      avatar: path,
    },
  };

  if (path) {
    const respond = await db.users.insertOne({ avatar: path });
    const respondUpdateAvatar = await db.users.updateOne(filter, updateDoc);
    if (respondUpdateAvatar.modifiedCount > 0 && respond.acknowledged) {
      console.log("respond", respond);
      res.status(201).json(respond);
    }
  } else {
    res.status(500).json("Can Please upload a file!");
  }
});
uploadRouter.get("/avatar", async (req, res) => {
  const id = req.headers.id;
  const respond = await db.users.find({ _id: new ObjectId(id) }).toArray();

  res.status(200).json({ avatar: respond[0].avatar });
});

module.exports = uploadRouter;
