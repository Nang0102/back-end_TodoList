const express = require("express");
const { db } = require("../db");
const filterRouter = express.Router();

filterRouter.get("/", async (req, res) => {
  const textFilter = await db.texts.find({}).toArray();
  return res.status(200).json(textFilter);
});

module.exports = filterRouter;
