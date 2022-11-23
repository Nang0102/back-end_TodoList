const express = require("express");
const groupRouter = express.Router();
const { ObjectId } = require("mongodb");
const { db } = require("../db");

groupRouter.get("/", async (req, res) => {
  const groups = await db.groups.find({}).toArray();
  res.status(200).json(groups);
});
groupRouter.post("/", async (req, res) => {
  const { name, listUserEmail } = req.body;
  if (!name || name == "") {
    res.json("Please enter your group name!");
  }
  const respond = await db.groups.insertOne({ name });
  res.status(200).json(respond);
});

module.exports = groupRouter;
